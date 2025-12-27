import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import fs from 'fs'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html'))
  }

}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// IPC: open folder
ipcMain.handle('dialog:openFolder', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  if (result.canceled || result.filePaths.length === 0) return null
  const folderPath = result.filePaths[0]
  // read folder list of md files
  const files = fs.readdirSync(folderPath)
    .filter(f => f.endsWith('.md'))
    .map(f => ({ name: f, path: path.join(folderPath, f) }))
  return { folderPath, files }
})

// IPC: read file
ipcMain.handle('file:read', async (_event, filePath: string) => {
  const content = fs.readFileSync(filePath, 'utf8')
  return content
})

// IPC: write file
ipcMain.handle('file:write', async (_event, filePath: string, content: string) => {
  fs.writeFileSync(filePath, content, 'utf8')
  return true
})

// IPC: ai ask
import { askLocalOllama, askOpenAI } from './ai'

ipcMain.handle('ai:ask', async (_event, prompt: string) => {
  try {
    if (process.env.USE_OLLAMA === '1') {
      return await askLocalOllama(prompt)
    }
    if (process.env.OPENAI_API_KEY) {
      return await askOpenAI(prompt)
    }
    return `AI stub replying to: ${prompt}`
  } catch (err: any) {
    return `AI error: ${err?.message || String(err)}`
  }
})
