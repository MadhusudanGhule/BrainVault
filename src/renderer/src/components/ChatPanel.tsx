import React, { useState } from 'react'
import { useAppSelector } from '../store/hooks'

export default function ChatPanel({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ from: 'user'|'ai', text: string }[]>([])
  const [loading, setLoading] = useState(false)
  const folderPath = useAppSelector(s => s.files.folderPath)
  const fileTree = useAppSelector(s => s.files.fileTree)

  async function send() {
    if (!input.trim()) return
    setMessages(m => [...m, { from: 'user', text: input }])
    setLoading(true)
    try {
      // Pass folder context so AI can search through user's files
      const res = await window.api.askAI(input, folderPath || undefined, fileTree.length > 0 ? fileTree : undefined)
      setMessages(m => [...m, { from: 'ai', text: res }])
    } catch (err: any) {
      setMessages(m => [...m, { from: 'ai', text: `Error: ${err?.message || String(err)}` }])
    } finally { 
      setLoading(false)
      setInput('') 
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <strong>Chat</strong>
        <button className="btn-secondary" onClick={onClose}>Close</button>
      </div>
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            {folderPath ? (
              <>
                <p>💬 Ask questions about your notes!</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>
                  Try: "Summarize my notes about X" or "What did I write about Y?"
                </p>
              </>
            ) : (
              <>
                <p>Start a conversation...</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>
                  Open a folder to enable AI-powered search through your files
                </p>
              </>
            )}
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`chat-message ${m.from}`}>
              <div className="chat-message-label">{m.from === 'ai' ? 'AI' : 'You'}</div>
              <div className="chat-message-content">{m.text}</div>
            </div>
          ))
        )}
        {loading && (
          <div className="chat-message ai">
            <div className="chat-message-label">AI</div>
            <div className="chat-message-content">
              {folderPath ? '🔍 Searching through your notes...' : 'Thinking...'}
            </div>
          </div>
        )}
      </div>
      <div className="chat-input-container">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && !loading && send()}
          className="chat-input"
          placeholder={folderPath ? "Ask about your notes... (e.g., 'Summarize my notes about X')" : "Open a folder first to ask about your notes..."} 
          disabled={loading}
        />
        <button 
          className="btn-primary" 
          onClick={send} 
          disabled={loading || !input.trim()}
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  )
}
