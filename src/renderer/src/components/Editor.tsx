import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

export default function Editor({ filePath }: { filePath: string }) {
  const [content, setContent] = useState('')
  const [lastSaved, setLastSaved] = useState<number | null>(null)

  useEffect(() => {
    let mounted = true
    window.api.readFile(filePath).then(text => { if (mounted) setContent(text) })
    return () => { mounted = false }
  }, [filePath])

  useEffect(() => {
    const t = setTimeout(() => {
      window.api.writeFile(filePath, content)
      setLastSaved(Date.now())
    }, 500)
    return () => clearTimeout(t)
  }, [content, filePath])

  return (
    <div className="editor-split">
      <textarea className="editor" value={content} onChange={e => setContent(e.target.value)} />
      <div className="preview">
        <ReactMarkdown>{content}</ReactMarkdown>
        <div className="saved">{lastSaved ? `Saved ${new Date(lastSaved).toLocaleTimeString()}` : 'Not saved yet'}</div>
      </div>
    </div>
  )
}
