import React, { useEffect, useRef, useState } from 'react'
import EditorMonaco, { useMonaco } from '@monaco-editor/react'
import './editor.css'

function getLanguageFromPath(filePath: string | null): string {
  if (!filePath) return 'plaintext'
  const ext = (filePath.split('.').pop() || '').toLowerCase()
  
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
    'sh': 'shell',
    'bash': 'shell',
    'zsh': 'shell',
    'ps1': 'powershell',
    'sql': 'sql',
    'html': 'html',
    'htm': 'html',
    'xml': 'xml',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'toml': 'toml',
    'ini': 'ini',
    'md': 'markdown',
    'txt': 'plaintext',
    'log': 'plaintext',
    'csv': 'plaintext',
  }
  
  return languageMap[ext] || 'plaintext'
}

function getFileType(filePath: string | null): 'text' | 'image' | 'pdf' | 'other' | 'none' {
  if (!filePath) return 'none'
  const ext = (filePath.split('.').pop() || '').toLowerCase()
  
  const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico']
  if (imageExts.includes(ext)) return 'image'
  if (ext === 'pdf') return 'pdf'
  
  const textExts = ['md', 'txt', 'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'scala', 'sh', 'bash', 'sql', 'html', 'htm', 'xml', 'css', 'scss', 'sass', 'less', 'json', 'yaml', 'yml', 'toml', 'ini', 'log', 'csv', 'rtf']
  if (textExts.includes(ext)) return 'text'
  
  return 'other'
}

export default function Editor({ filePath }: { filePath?: string | null }) {
  const [content, setContent] = useState('')
  const [lastSaved, setLastSaved] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fileType, setFileType] = useState<'text' | 'image' | 'pdf' | 'other' | 'none'>('none')
  const monaco = useMonaco()
  const saveTimer = useRef<NodeJS.Timeout | null>(null)

  // Setup Monaco theme
  useEffect(() => {
    if (!monaco) return

    monaco.editor.defineTheme('brainvault-green', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '008000', fontStyle: 'italic' },
        { token: 'keyword', foreground: '006600', fontStyle: 'bold' },
        { token: 'string', foreground: '00aa00' },
        { token: 'number', foreground: '009900' },
        { token: 'type', foreground: '006600' },
        { token: 'class', foreground: '006600', fontStyle: 'bold' },
        { token: 'function', foreground: '008800' },
        { token: 'variable', foreground: '007700' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#004d00',
        'editorLineNumber.foreground': '#00aa00',
        'editorLineNumber.activeForeground': '#006600',
        'editor.selectionBackground': '#e6ffe6',
        'editor.lineHighlightBackground': '#f0fff0',
        'editorCursor.foreground': '#00aa00',
        'editorWhitespace.foreground': '#d4e6d4',
        'editorIndentGuide.background': '#e6ffe6',
        'editorIndentGuide.activeBackground': '#b3ffb3',
        'editor.selectionHighlightBackground': '#d4f4d4',
        'editor.wordHighlightBackground': '#e6ffe6',
        'editor.wordHighlightStrongBackground': '#ccffcc',
      }
    })
  }, [monaco])

  // Load file content
  useEffect(() => {
    let mounted = true
    if (!filePath) {
      setContent('')
      setFileType('none')
      setIsLoading(false)
      return
    }

    const type = getFileType(filePath)
    setFileType(type)

    if (type === 'image' || type === 'pdf' || type === 'other') {
      setContent('')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    window.api.readFile(filePath)
      .then(text => {
        if (!mounted) return
        setContent(text ?? '')
        setIsLoading(false)
      })
      .catch(err => {
        console.error('readFile failed', err)
        if (mounted) {
          setContent('')
          setIsLoading(false)
        }
      })

    return () => { mounted = false }
  }, [filePath])

  // Auto-save functionality (only for text files)
  useEffect(() => {
    if (!filePath || !content || fileType !== 'text') return

    // Clear existing timer
    if (saveTimer.current) {
      clearTimeout(saveTimer.current)
    }

    // Set new timer for auto-save (2 seconds after last change)
    saveTimer.current = setTimeout(() => {
      window.api.writeFile(filePath, content)
        .then(() => {
          setLastSaved(Date.now())
        })
        .catch(err => {
          console.error('writeFile failed', err)
        })
    }, 2000)

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current)
      }
    }
  }, [content, filePath, fileType])

  const language = getLanguageFromPath(filePath || null)
  const fileName = filePath ? filePath.split(/[/\\]/).pop() : 'Untitled'

  // Render image viewer
  if (fileType === 'image') {
    return (
      <div className="editor-container">
        <div className="editor-header">
          <span className="editor-filename">{fileName}</span>
          <span className="editor-file-type">🖼️ Image</span>
        </div>
        <div className="editor-wrapper image-viewer">
          <img 
            src={`file://${filePath}`} 
            alt={fileName}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              objectFit: 'contain',
              display: 'block',
              margin: 'auto'
            }} 
          />
        </div>
      </div>
    )
  }

  // Render PDF viewer placeholder
  if (fileType === 'pdf') {
    return (
      <div className="editor-container">
        <div className="editor-header">
          <span className="editor-filename">{fileName}</span>
          <span className="editor-file-type">📄 PDF Document</span>
        </div>
        <div className="editor-wrapper pdf-viewer">
          <div className="pdf-placeholder">
            <div className="pdf-icon">📄</div>
            <h3>PDF Document</h3>
            <p>{fileName}</p>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '16px' }}>
              PDF viewing is available. You can ask the AI to analyze this PDF by asking questions in the chat panel.
            </p>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
              The AI can search and analyze the content of PDF files when you ask questions.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Render other file types
  if (fileType === 'other') {
    return (
      <div className="editor-container">
        <div className="editor-header">
          <span className="editor-filename">{fileName}</span>
          <span className="editor-file-type">📄 Binary File</span>
        </div>
        <div className="editor-wrapper">
          <div className="editor-loading">
            <p>This file type cannot be displayed in the editor.</p>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
              You can still ask the AI about this file in the chat panel.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Render text editor
  return (
    <div className="editor-container">
      <div className="editor-header">
        <span className="editor-filename">{fileName}</span>
        {lastSaved && (
          <span className="editor-saved-indicator">
            Saved {new Date(lastSaved).toLocaleTimeString()}
          </span>
        )}
      </div>
      <div className="editor-wrapper">
        {isLoading ? (
          <div className="editor-loading">Loading...</div>
        ) : (
          <EditorMonaco
            height="100%"
            language={language}
            theme="brainvault-green"
            value={content}
            onChange={(v) => setContent(v ?? '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace',
              lineHeight: 22,
              tabSize: 2,
              insertSpaces: true,
              wordWrap: 'on',
              smoothScrolling: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              formatOnPaste: true,
              formatOnType: true,
              renderWhitespace: 'selection',
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              bracketPairColorization: { enabled: true },
              guides: {
                indentation: true,
                bracketPairs: true,
              },
            }}
          />
        )}
      </div>
    </div>
  )
}
