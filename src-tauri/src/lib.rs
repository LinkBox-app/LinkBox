use serde::Serialize;
use std::fs::create_dir_all;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State};
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

const API_HOST: &str = "127.0.0.1";
const API_PORT: u16 = 7032;
const SIDECAR_NAME: &str = "linkbox-server";

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct RuntimeConfig {
    api_base_url: String,
    is_desktop: bool,
}

struct RuntimeState(Mutex<RuntimeConfig>);

enum BackendChild {
    Dev(Child),
    Sidecar(CommandChild),
}

struct BackendState(Mutex<Option<BackendChild>>);

#[tauri::command]
fn get_runtime_config(state: State<'_, RuntimeState>) -> Result<RuntimeConfig, String> {
    state
        .0
        .lock()
        .map(|config| config.clone())
        .map_err(|_| "failed to read runtime config".to_string())
}

fn build_runtime_config() -> RuntimeConfig {
    RuntimeConfig {
        api_base_url: format!("http://{API_HOST}:{API_PORT}"),
        is_desktop: true,
    }
}

fn app_data_dir(app: &AppHandle) -> Result<PathBuf, Box<dyn std::error::Error>> {
    let data_dir = app.path().app_data_dir()?;
    create_dir_all(&data_dir)?;
    Ok(data_dir)
}

fn sidecar_args(data_dir: &PathBuf) -> Vec<String> {
    vec![
        "--host".into(),
        API_HOST.into(),
        "--port".into(),
        API_PORT.to_string(),
        "--data-dir".into(),
        data_dir.to_string_lossy().into_owned(),
    ]
}

fn bundled_sidecar_path() -> Option<PathBuf> {
    let executable = std::env::current_exe().ok()?;
    let executable_dir = executable.parent()?;
    let sidecar_name = if cfg!(target_os = "windows") {
        format!("{SIDECAR_NAME}.exe")
    } else {
        SIDECAR_NAME.to_string()
    };
    let candidate = executable_dir.join(sidecar_name);

    candidate.exists().then_some(candidate)
}

fn start_backend(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let data_dir = app_data_dir(app)?;
    let args = sidecar_args(&data_dir);

    let backend_child = if let Some(sidecar_path) = bundled_sidecar_path() {
        let child = Command::new(sidecar_path)
            .args(&args)
            .stdin(Stdio::null())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .spawn()?;

        BackendChild::Dev(child)
    } else if cfg!(debug_assertions) {
        let project_root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("..");
        let server_entry = project_root.join("server").join("main.py");

        let child = Command::new("python3")
            .arg(server_entry)
            .args(&args)
            .current_dir(project_root)
            .stdin(Stdio::null())
            .stdout(Stdio::inherit())
            .stderr(Stdio::inherit())
            .spawn()?;

        BackendChild::Dev(child)
    } else {
        let (_rx, child) = app.shell().sidecar(SIDECAR_NAME)?.args(args).spawn()?;
        BackendChild::Sidecar(child)
    };

    let runtime_config = build_runtime_config();

    if let Ok(mut state) = app.state::<RuntimeState>().0.lock() {
        *state = runtime_config;
    }

    if let Ok(mut state) = app.state::<BackendState>().0.lock() {
        *state = Some(backend_child);
    }

    Ok(())
}

fn stop_backend(app: &AppHandle) {
    let backend_state = app.state::<BackendState>();
    let Ok(mut state) = backend_state.0.lock() else {
        return;
    };

    let Some(child) = state.take() else {
        return;
    };

    match child {
        BackendChild::Dev(mut process) => {
            let _ = process.kill();
            let _ = process.wait();
        }
        BackendChild::Sidecar(process) => {
            let _ = process.kill();
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let context = tauri::generate_context!();

    tauri::Builder::default()
        .manage(RuntimeState(Mutex::new(build_runtime_config())))
        .manage(BackendState(Mutex::new(None)))
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_runtime_config])
        .setup(|app| {
            start_backend(app.handle())?;
            Ok(())
        })
        .build(context)
        .expect("error while building tauri application")
        .run(|app, event| {
            if matches!(event, tauri::RunEvent::Exit | tauri::RunEvent::ExitRequested { .. }) {
                stop_backend(app);
            }
        });
}
