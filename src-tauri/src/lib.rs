use serde::Serialize;
use std::fs::create_dir_all;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use std::thread::sleep;
use std::time::{Duration, Instant};
use tauri::{AppHandle, Manager, State};
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

#[cfg(unix)]
use std::os::unix::process::CommandExt;

const API_HOST: &str = "127.0.0.1";
const API_PORT: u16 = 7032;
const SIDECAR_NAME: &str = "linkbox-server";
const BACKEND_SHUTDOWN_GRACE_PERIOD: Duration = Duration::from_secs(2);

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

fn configure_backend_command(command: &mut Command) {
    command
        .stdin(Stdio::null())
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit());

    #[cfg(unix)]
    command.process_group(0);
}

#[cfg(unix)]
fn signal_backend_process_tree(pid: u32, signal: libc::c_int) {
    let pid = pid as libc::pid_t;

    unsafe {
        if libc::killpg(pid, signal) != 0 {
            let _ = libc::kill(pid, signal);
        }
    }
}

#[cfg(windows)]
fn force_stop_backend_process_tree(pid: u32) {
    let _ = Command::new("taskkill")
        .args(["/PID", &pid.to_string(), "/T", "/F"])
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status();
}

fn stop_dev_backend(process: &mut Child) {
    let pid = process.id();

    #[cfg(unix)]
    signal_backend_process_tree(pid, libc::SIGTERM);

    #[cfg(windows)]
    force_stop_backend_process_tree(pid);

    let deadline = Instant::now() + BACKEND_SHUTDOWN_GRACE_PERIOD;
    loop {
        match process.try_wait() {
            Ok(Some(_)) => break,
            Ok(None) if Instant::now() < deadline => sleep(Duration::from_millis(100)),
            Ok(None) => {
                #[cfg(unix)]
                signal_backend_process_tree(pid, libc::SIGKILL);

                let _ = process.kill();
                let _ = process.wait();
                break;
            }
            Err(_) => {
                let _ = process.kill();
                break;
            }
        }
    }
}

fn stop_sidecar_backend(process: CommandChild) {
    let pid = process.pid();

    #[cfg(unix)]
    {
        signal_backend_process_tree(pid, libc::SIGTERM);
        sleep(BACKEND_SHUTDOWN_GRACE_PERIOD);
        signal_backend_process_tree(pid, libc::SIGKILL);
    }

    #[cfg(windows)]
    force_stop_backend_process_tree(pid);

    let _ = process.kill();
}

fn start_backend(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let data_dir = app_data_dir(app)?;
    let args = sidecar_args(&data_dir);

    let backend_child = if let Some(sidecar_path) = bundled_sidecar_path() {
        let mut command = Command::new(sidecar_path);
        command.args(&args);
        configure_backend_command(&mut command);
        let child = command.spawn()?;

        BackendChild::Dev(child)
    } else if cfg!(debug_assertions) {
        let project_root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("..");
        let server_entry = project_root.join("server").join("main.py");

        let mut command = Command::new("python3");
        command
            .arg(server_entry)
            .args(&args)
            .current_dir(project_root);
        configure_backend_command(&mut command);
        let child = command.spawn()?;

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
        BackendChild::Dev(mut process) => stop_dev_backend(&mut process),
        BackendChild::Sidecar(process) => stop_sidecar_backend(process),
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
            if matches!(
                event,
                tauri::RunEvent::Exit | tauri::RunEvent::ExitRequested { .. }
            ) {
                stop_backend(app);
            }
        });
}
