import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { setFiles, setCurrentFile } from './store/slices/filesSlice'
import Editor from './components/Editor'
import ChatPanel from './components/ChatPanel'

function App() {
  const dispatch = useAppDispatch()
  const files = useAppSelector(s => s.files.files)
  const current = useAppSelector(s => s.files.currentFile)
  const [chatOpen, setChatOpen] = useState(false)

  async function openFolder() {
    const res = await window.api.openFolder()
    if (!res) return
    dispatch(setFiles(res.files))
    if (res.files.length > 0) dispatch(setCurrentFile(res.files[0].path))
  }

  return (
    <div className="app">
      <header className="header">
        <h1>BrainVault</h1>
        <div style={{display:'flex',gap:8}}>
          <button onClick={openFolder}>Open Folder</button>
          <button onClick={() => setChatOpen(s => !s)}>{chatOpen ? 'Close Chat' : 'Open Chat'}</button>
        </div>
      </header>
      <div className="layout">
        <aside className="sidebar">
          <h3>Files</h3>
          <ul>
            {files.map(f => (
              <li key={f.path} onClick={() => dispatch(setCurrentFile(f.path))}>{f.name}</li>
            ))}
          </ul>
        </aside>
        <main className="main">
          {current ? <Editor filePath={current} /> : <div className="empty">Open a folder to begin</div>}
        </main>
        {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}
      </div>
    </div>
  )
}

export default App
