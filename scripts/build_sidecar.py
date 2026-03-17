from __future__ import annotations

import platform
import shutil
import subprocess
import sys
import os
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SRC_TAURI = ROOT / "src-tauri"
BINARIES_DIR = SRC_TAURI / "binaries"
SERVER_DIR = ROOT / "server"
LOCAL_PYINSTALLER = ROOT / ".venv-desktop" / "bin" / "pyinstaller"
PYINSTALLER_CONFIG_DIR = ROOT / ".pyinstaller"


def host_tuple() -> str:
    result = subprocess.run(
        ["rustc", "--print", "host-tuple"],
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


def binary_name() -> str:
    suffix = ".exe" if platform.system().lower().startswith("win") else ""
    return f"linkbox-server-{host_tuple()}{suffix}"


def main() -> int:
    pyinstaller = str(LOCAL_PYINSTALLER) if LOCAL_PYINSTALLER.exists() else shutil.which("pyinstaller")
    if not pyinstaller:
        print("PyInstaller is not installed. Run `.venv-desktop/bin/pip install pyinstaller` first.")
        return 1

    BINARIES_DIR.mkdir(parents=True, exist_ok=True)
    dist_dir = SERVER_DIR / "dist"

    command = [
        pyinstaller,
        "--noconfirm",
        "--clean",
        "--onefile",
        "--name",
        "linkbox-server",
        "main.py",
    ]

    env = dict(os.environ)
    env["PYINSTALLER_CONFIG_DIR"] = str(PYINSTALLER_CONFIG_DIR)

    subprocess.run(command, cwd=SERVER_DIR, check=True, env=env)

    built_binary = dist_dir / ("linkbox-server.exe" if sys.platform == "win32" else "linkbox-server")
    target_binary = BINARIES_DIR / binary_name()
    shutil.copy2(built_binary, target_binary)
    target_binary.chmod(0o755)

    print(f"Built sidecar: {target_binary}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
