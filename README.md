# BrainVault

**Your private, AI-powered second brain.**

## Dev

1. Install dependencies: `npm install`
2. Run dev: `npm run dev`
   - This runs: Vite (renderer) + `tsc --watch` for Electron main & `electron` when the renderer is ready.
3. Build: `npm run build` (runs `build:main`, `vite build`, then `electron-builder`)

## MVP Features
- Open folder and list `.md` files
- Markdown editor with split preview
- Autosave to disk (debounced)
- Basic AI IPC stub (`ai:ask`) — replace with Ollama / OpenAI in `src/main/main.ts`

## Notes & Next steps
- The AI integration is a stub: swap `ipcMain.handle('ai:ask', ...)` to call Ollama (local) or OpenAI securely.
- Add indexing (SQLite or local index) for fast search and implement global search (Cmd+K).
- Add tests and packaging configurations (icons, code signing) before release.
