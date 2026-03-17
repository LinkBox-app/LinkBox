# LinkBox
<img src=./misc/img/icon.png >

English | [中文说明](./README_CN.md)

LinkBox is an AI-assisted bookmark manager packaged as a cross-platform desktop app with Tauri. It combines a React frontend, a FastAPI backend, and a bundled Python sidecar so the app can be distributed on macOS, Windows, and Linux.

## Highlights

- Save links with AI-generated titles, summaries, and tags
- Browse resources by tag and manage them in a local library
- Chat with an AI assistant to explore or retrieve saved resources
- Run in single-user local mode by default
- Ship as desktop bundles through Tauri
- Switch the UI between Simplified Chinese and English

## Tech Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion
- Desktop shell: Tauri v2
- Backend: FastAPI, SQLAlchemy, Pydantic
- AI integration: OpenAI-compatible API via `openai`, `langchain`, and `langchain-openai`
- Database: SQLite by default, MySQL supported through environment variables

## Project Structure

```text
.
├── web/          # React frontend
├── server/       # FastAPI backend
├── src-tauri/    # Tauri desktop shell
├── scripts/      # Build helpers, including sidecar packaging
└── .github/      # CI/CD workflows
```

## Requirements

- Node.js 20+
- Python 3.13 recommended
- Rust stable toolchain

For Linux desktop builds, you also need the usual Tauri system dependencies such as `libwebkit2gtk`, `libappindicator`, `librsvg`, and `patchelf`.


## Local Development

Install dependencies:

```bash
npm ci
npm ci --prefix web
python3 -m venv .venv-desktop
.venv-desktop/bin/pip install -r server/requirements.txt pyinstaller
```

Run the desktop app in development mode:

```bash
npm run tauri:dev
```

This starts:

- the Vite dev server for the frontend
- the Tauri desktop shell
- the Python backend, launched automatically by the desktop app

## Build Desktop Bundles Locally

Build the Python sidecar first:

```bash
npm run build:sidecar
```

Then build desktop bundles:

```bash
npm run tauri:build
```

Current bundle targets:

- macOS: `dmg`
- Windows: `nsis`, `msi`
- Linux: `AppImage`, `deb`

## CI/CD Release Flow

GitHub Actions is configured to build and publish desktop releases automatically.

Workflow file:

- [.github/workflows/release.yml](./.github/workflows/release.yml)

Triggers:

- push a tag like `v0.1.0`
- run the workflow manually with a `release_tag`

The workflow:

- installs Node, Python, and Rust
- builds the Python sidecar with `scripts/build_sidecar.py`
- builds Tauri bundles for all three platforms
- uploads release artifacts to GitHub Releases

## Notes

- The desktop app prefers the bundled sidecar when available.
- The backend binds to `127.0.0.1` by default in desktop mode.
- AI settings can be changed from the Settings page and are stored locally.
- The current release workflow produces unsigned binaries; macOS notarization and Windows signing can be added later for public distribution.

## Version

This document reflects the `v0.1.x` desktop MVP.
