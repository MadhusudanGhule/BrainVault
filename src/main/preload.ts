import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  readFile: (filePath: string) => ipcRenderer.invoke('file:read', filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke('file:write', filePath, content),
  askAI: (prompt: string, folderPath?: string, fileTree?: any) => ipcRenderer.invoke('ai:ask', prompt, folderPath, fileTree),
  readDirTree: (root: string) => ipcRenderer.invoke('read-dir-tree', root),
})
