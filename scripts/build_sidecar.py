from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SIDECAR_RESOURCE_DIR = ROOT / "src-tauri" / "resources" / "sidecar"
SERVER_DIR = ROOT / "server"
LOCAL_PYINSTALLER = ROOT / ".venv-desktop" / "bin" / "pyinstaller"
PYINSTALLER_CONFIG_DIR = ROOT / ".pyinstaller"


def parse_args() -> argparse.Namespace:
    return argparse.ArgumentParser(
        description="Build the Python sidecar in onedir mode for Tauri resources."
    ).parse_args()


def copy_artifacts(dist_dir: Path) -> Path:
    built_dir = dist_dir / "linkbox-server"
    target_dir = SIDECAR_RESOURCE_DIR
    if target_dir.exists():
        shutil.rmtree(target_dir)

    target_dir.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(built_dir, target_dir)
    executable_name = "linkbox-server.exe" if sys.platform == "win32" else "linkbox-server"
    executable_path = target_dir / executable_name
    executable_path.chmod(0o755)
    return target_dir


def main() -> int:
    parse_args()
    pyinstaller = str(LOCAL_PYINSTALLER) if LOCAL_PYINSTALLER.exists() else shutil.which("pyinstaller")
    if not pyinstaller:
        print("PyInstaller is not installed. Run `.venv-desktop/bin/pip install pyinstaller` first.")
        return 1

    dist_dir = SERVER_DIR / "dist"

    command = [
        pyinstaller,
        "--noconfirm",
        "--clean",
        "--onedir",
        "--name",
        "linkbox-server",
        "main.py",
    ]

    env = dict(os.environ)
    env["PYINSTALLER_CONFIG_DIR"] = str(PYINSTALLER_CONFIG_DIR)

    subprocess.run(command, cwd=SERVER_DIR, check=True, env=env)
    target_path = copy_artifacts(dist_dir)

    print(f"Built sidecar (onedir): {target_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
