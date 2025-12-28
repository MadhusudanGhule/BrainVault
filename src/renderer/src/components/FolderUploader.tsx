import React from 'react'

export type FileNode = {
  name: string
  path?: string
  isDirectory?: boolean
  children?: FileNode[]
}

function addToTree(root: FileNode[], relPath: string, fullPath: string) {
  const parts = relPath.split('/').filter(Boolean)
  let nodeList = root
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    let node = nodeList.find(n => n.name === part)
    if (!node) {
      node = { name: part, isDirectory: i < parts.length - 1, path: i === parts.length - 1 ? fullPath : undefined, children: [] }
      nodeList.push(node)
    }
    nodeList = node.children = node.children ?? []
  }
}

export default function FolderUploader({ onTree }: { onTree: (tree: FileNode[]) => void }) {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const tree: FileNode[] = []
    files.forEach(f => {
      // webkitRelativePath contains the folder structure when using webkitdirectory
      const rel = // @ts-ignore
        f.webkitRelativePath || f.relativePath || f.name
      addToTree(tree, rel, (f as any).path ?? rel)
    })
    onTree(tree)
  }

  return (
    <input
      type="file"
      // allows folder upload and nested files
      //@ts-ignore
      webkitdirectory="true"
      multiple
      onChange={onChange}
      style={{ display: 'none' }}
      id="folder-upload-input"
    />
  )
}