import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { setFileTree, setCurrentFile } from './store/slices/filesSlice'
import { FileNode } from './global'
import Editor from './components/Editor'
import FileTree from './components/FileTree'
import ChatPanel from './components/ChatPanel'
import { AuthForm } from './components/AuthForm'

function App() {
  const dispatch = useAppDispatch()
  const fileTree = useAppSelector(s => s.files.fileTree)
  const currentFile = useAppSelector(s => s.files.currentFile)
  const folderPath = useAppSelector(s => s.files.folderPath)
  const [chatOpen, setChatOpen] = useState(false)
  const [login, setLogin] = useState(false)
  async function openFolder() {
    const res = await window.api.openFolder()
    if (!res || !res.tree || !Array.isArray(res.tree)) return
    dispatch(setFileTree({ tree: res.tree, folderPath: res.folderPath }))
    // Find first file to open
    const findFirstFile = (nodes: FileNode[]): string | null => {
      if (!Array.isArray(nodes)) return null
      for (const node of nodes) {
        if (!node.isDirectory) return node.path
        if (node.children && Array.isArray(node.children)) {
          const found = findFirstFile(node.children)
          if (found) return found
        }
      }
      return null
    }
    const firstFile = findFirstFile(res.tree)
    if (firstFile) {
      dispatch(setCurrentFile(firstFile))
    }
  }

  const handleFileClick = (path: string) => {
    dispatch(setCurrentFile(path))
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1 className="app-title">BrainVault</h1>
          {folderPath && (
            <span className="folder-path">{folderPath}</span>
          )}
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={openFolder}>
            📁 Open Folder
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => setChatOpen(s => !s)}
          >
            {chatOpen ? '💬 Close Chat' : '💬 Open Chat'}
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => setLogin(s => !s)}
          >
            {login ? '👤 Madan' : '👤 Login'}
          </button>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h3>Explorer</h3>
          </div>
          <div className="sidebar-content">
            <FileTree tree={fileTree || []} onFileClick={handleFileClick} />
          </div>
        </aside>
        <main className="main">
          {currentFile ? (
            <Editor filePath={currentFile} />
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h2>Welcome to BrainVault</h2>
              <p>Open a folder to start editing files</p>
              <button className="btn-primary" onClick={openFolder}>
                Open Folder
              </button>
              <div className="auth-container">
                <AuthForm />
              </div>
            </div>
          )}
        </main>
        {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}
      </div>
    </div>
  )
}

export default App
