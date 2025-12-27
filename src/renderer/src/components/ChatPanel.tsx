import React, { useState } from 'react'

export default function ChatPanel({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ from: 'user'|'ai', text: string }[]>([])
  const [loading, setLoading] = useState(false)

  async function send() {
    if (!input.trim()) return
    setMessages(m => [...m, { from: 'user', text: input }])
    setLoading(true)
    try {
      const res = await window.api.askAI(input)
      setMessages(m => [...m, { from: 'ai', text: res }])
    } finally { setLoading(false); setInput('') }
  }

  return (
    <div style={{width:360,background:'#051018',padding:12,borderLeft:'1px solid rgba(255,255,255,0.03)',display:'flex',flexDirection:'column'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <strong>Chat</strong>
        <button onClick={onClose}>Close</button>
      </div>
      <div style={{flex:1,overflow:'auto',marginTop:8}}>
        {messages.map((m, i) => <div key={i} style={{marginBottom:8}}><div style={{fontSize:12,color:'#9aa6b2'}}>{m.from}</div><div style={{background:m.from==='ai'?'#071019':'#062430',padding:8,borderRadius:6}}>{m.text}</div></div>)}
      </div>
      <div style={{display:'flex',gap:8,marginTop:8}}>
        <input value={input} onChange={e=>setInput(e.target.value)} style={{flex:1,padding:8}} placeholder="Ask something about this note..." />
        <button onClick={send} disabled={loading}>{loading ? '...' : 'Send'}</button>
      </div>
    </div>
  )
}
