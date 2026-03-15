# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A personal productivity suite hosted on GitHub Pages at **sen666.cn**. Three self-contained single-page apps built with vanilla HTML/CSS/JavaScript — no frameworks, no build tools, no dependencies.

## Development

No build step. Edit HTML files directly and push to GitHub. To preview locally, open any `.html` file in a browser.

Deployment is automatic via GitHub Pages on push to the default branch.

## Architecture

Each app is a single HTML file with all CSS and JS embedded inline:

- **index.html** — 储物系统 (Storage Cabinet): virtual box/item organizer with search and long-press interactions
- **keep.html** — 我的便签 (Notes): Google Keep-style color-coded sticky notes
- **task.html** — 我的目标 (Goals): task tracker with SVG progress ring visualization

### Data Flow

Three-layer persistence, identical across all apps:

1. **JS variables** (runtime) → `saveData()` writes to both layers below
2. **localStorage** (per-app keys: `storageSystemData`, `keepNotesData`, `taskGoalsData`)
3. **Cloud sync** (optional) — GitHub API or JSONBin.io, configured via `syncConfig` in localStorage

Each app stores its cloud data in a corresponding JSON file: `storage-data.json`, `notes.json`, `goals.json`. GitHub sync uses Base64-encoded content with SHA-based conflict prevention.

### Shared Patterns

All three apps duplicate these utilities (not shared via imports):

- `safeBase64Encode()` / `safeBase64Decode()` — Unicode-safe Base64 for GitHub API
- `syncData()` / `syncWithGitHub()` / `syncWithJSONBin()` — cloud sync framework
- Sync status indicator UI (offline → syncing → synced → error)
- `prompt()`-based sync configuration dialogs with token masking
- Toast notifications, modals, search/filter, responsive grids

## Conventions

- All UI text is in Chinese (Simplified)
- No external libraries — everything is vanilla JS
- Each HTML file is fully self-contained (no shared CSS/JS files)
- Mobile-first responsive design with iOS Safari compatibility handling
- JSON data files in the repo root are updated by the apps via GitHub API sync
