import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import { initAuth, registerUser, loginUser, getCurrentUser, logoutUser } from './auth'

let mainWindow: BrowserWindow | null = null
console.log('Loading URL:', process.env.VITE_DEV_SERVER_URL)
// Store current folder state
let currentFileTree: FileNode[] = []


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

app.whenReady().then(async () => {
  await initAuth()                 // <- initialize user store
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
ipcMain.handle('auth:register', async (_e, username: string, password: string) => {
  try { return await registerUser(username, password) }
  catch (err: any) { throw new Error(err?.message || String(err)) }
})
ipcMain.handle('auth:login', async (_e, username: string, password: string) => {
  try { return await loginUser(username, password) }
  catch (err: any) { throw new Error(err?.message || String(err)) }
})
ipcMain.handle('auth:get-current-user', async () => {
  return await getCurrentUser()
})
ipcMain.handle('auth:logout', async () => {
  return await logoutUser()
})
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})


let currentFolderPath: string | null = null
// IPC: open folder
ipcMain.handle('dialog:openFolder', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  if (result.canceled || result.filePaths.length === 0) return null
  const folderPath = result.filePaths[0]
  // read folder tree recursively
  const tree = await readDirTree(folderPath)
  // Update current folder state for AI context
  
 
  currentFolderPath = folderPath
  currentFileTree = tree
  return { folderPath, tree }

  
})

async function readDirTree(dir: string): Promise<any[]> {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true })
  return Promise.all(dirents.map(async d => {
    const res = path.join(dir, d.name)
    if (d.isDirectory()) {
      return { name: d.name, path: res, isDirectory: true, children: await readDirTree(res) }
    }
    return { name: d.name, path: res, isDirectory: false }
  }))
}

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
import { buildContextPrompt, FileNode } from './search'



ipcMain.handle('ai:ask', async (_event, prompt: string, folderPath?: string, fileTree?: FileNode[]) => {
  try {
    // Update current folder state if provided
    if (folderPath && fileTree) {
      currentFolderPath = folderPath
      currentFileTree = fileTree
    }
    
    // Build context-aware prompt if we have files
    let enhancedPrompt = prompt
    if (currentFileTree.length > 0) {
      enhancedPrompt = await buildContextPrompt(currentFileTree, prompt)
    }
    
    if (process.env.USE_OLLAMA === '1') {
      return await askLocalOllama(enhancedPrompt)
    }
    if (process.env.OPENAI_API_KEY) {
      return await askOpenAI(enhancedPrompt)
    }
    return `AI stub replying to: ${prompt}\n\n(Note: No AI provider configured. Set USE_OLLAMA=1 or OPENAI_API_KEY to enable AI features.)`
  } catch (err: any) {
    return `AI error: ${err?.message || String(err)}`
  }
})


// main process (example)
ipcMain.handle('pick-folder', async () => {
  const { filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory', 'multiSelections'] })
  return filePaths
})

ipcMain.handle('read-dir-tree', async (_, root: string) => {
  async function walk(dir: string): Promise<any[]> {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true })
    return Promise.all(dirents.map(async d => {
      const res = path.join(dir, d.name)
      if (d.isDirectory()) return { name: d.name, path: res, isDirectory: true, children: await walk(res) }
      return { name: d.name, path: res, isDirectory: false }
    }))
  }
  return walk(root)
})