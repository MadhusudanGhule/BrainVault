import React, { useState, useEffect } from 'react'
import { FileNode } from '../global'

function getFileIcon(fileName: string, isDirectory: boolean): string {
  if (isDirectory) return '📁'
  
  const ext = (fileName.split('.').pop() || '').toLowerCase()
  
  // Images
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext)) {
    return '🖼️'
  }
  // PDFs and documents
  if (ext === 'pdf') return '📄'
  if (['doc', 'docx'].includes(ext)) return '📝'
  if (['xls', 'xlsx'].includes(ext)) return '📊'
  if (['ppt', 'pptx'].includes(ext)) return '📽️'
  // Research papers and academic
  if (['tex', 'bib'].includes(ext)) return '📚'
  // Code files
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'go', 'rs', 'rb', 'php'].includes(ext)) {
    return '💻'
  }
  // Markdown and text
  if (['md', 'txt', 'rtf'].includes(ext)) return '📄'
  // Data files
  if (['json', 'xml', 'yaml', 'yml', 'csv'].includes(ext)) return '📋'
  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '📦'
  
  return '📄'
}

export default function FileTree({ 
  tree, 
  onFileClick 
}: { 
  tree: FileNode[] | undefined
  onFileClick: (path: string) => void 
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  // Auto-expand root folders on mount (only first level)
  useEffect(() => {
    if (tree && Array.isArray(tree)) {
      const newExpanded = new Set<string>()
      // Auto-expand only root level directories initially
      for (const node of tree) {
        if (node.isDirectory) {
          newExpanded.add(node.path)
        }
      }
      setExpanded(newExpanded)
    }
  }, [tree])

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expanded)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpanded(newExpanded)
  }

  const renderNode = (node: FileNode, depth: number = 0): React.ReactNode => {
    const isExpanded = expanded.has(node.path)
    const hasChildren = node.children && Array.isArray(node.children) && node.children.length > 0
    const icon = getFileIcon(node.name, node.isDirectory || false)

    return (
      <div key={node.path} className="file-tree-node">
        <div
          className={`file-tree-item ${node.isDirectory ? 'directory' : 'file'}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (node.isDirectory) {
              toggleExpand(node.path)
            } else {
              onFileClick(node.path)
            }
          }}
        >
          <span className="file-tree-icon">
            {node.isDirectory ? (isExpanded ? '📂' : '📁') : icon}
          </span>
          <span className="file-tree-name" title={node.path}>{node.name}</span>
        </div>
        {node.isDirectory && isExpanded && hasChildren && node.children && (
          <div className="file-tree-children">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (!tree || !Array.isArray(tree) || tree.length === 0) {
    return (
      <div className="file-tree-empty">
        <p>No files loaded</p>
        <p style={{ fontSize: '12px', color: '#666' }}>Click "Open Folder" to get started</p>
      </div>
    )
  }

  return (
    <div className="file-tree">
      {tree.map(node => renderNode(node))}
    </div>
  )
}
