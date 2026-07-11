# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A Tauri v2 desktop app with a React + TypeScript frontend (Vite) and a Rust backend. This is currently the unmodified `create-tauri-app` scaffold (react-ts template) — the frontend/backend "bridge" pattern described below is the convention to follow as real features are added.

## Commands

- `npm run dev` — run the Vite dev server only (frontend, browser-based, no Tauri window).
- `npm run tauri dev` — run the full desktop app (starts Vite dev server and opens the native Tauri window). Use this to actually exercise the app, since Rust commands are only reachable from within the Tauri webview.
- `npm run build` — type-checks with `tsc` then builds the frontend with Vite (`dist/`). Run this to check frontend compile errors.
- `npm run tauri build` — produces the full native app bundle (invokes the Rust build too).
- Rust backend (`src-tauri/`): standard `cargo build` / `cargo check` / `cargo test` work from within `src-tauri/`, or use `npm run tauri build` for the full pipeline.
- No test suite or linter is currently configured in this repo.

## Architecture

- `src/` — React frontend. `main.tsx` mounts `App.tsx` into `#root`. Application UI logic lives here.
- `src-tauri/src/lib.rs` — Rust backend. `#[tauri::command]` functions defined here (e.g. `greet`) are registered in `tauri::generate_handler![...]` inside `run()` and become callable from the frontend.
- `src-tauri/src/main.rs` — thin binary entry point that just calls `test_tauri_lib::run()`; almost all backend logic belongs in `lib.rs`, not here.
- Frontend calls Rust commands via `invoke("command_name", { args })` from `@tauri-apps/api/core` (see `src/App.tsx`). New backend functionality follows this pattern: add a `#[tauri::command]` fn in `lib.rs`, register it in `generate_handler![...]`, then call it from React with `invoke`.
- `src-tauri/capabilities/default.json` — Tauri v2 permission system. Any new Tauri plugin or restricted API must have its permission added to the `permissions` array here, or calls will fail at runtime with a permission error.
- `src-tauri/tauri.conf.json` — app-level config: window settings, dev server URL (`http://localhost:1420`, fixed port required by `vite.config.ts`), bundle/icon settings, CSP.
- Dev server is pinned to port 1420 (`strictPort: true` in `vite.config.ts`) because `tauri.conf.json` points `devUrl` at it — don't change one without the other.
