export {}

export type FileNode = {
  name: string
  path: string
  isDirectory: boolean
  children?: FileNode[]
}

declare global {
  interface Window {
    api: {
      openFolder: () => Promise<{ folderPath: string, tree: FileNode[] } | null>
      readFile: (filePath: string) => Promise<string>
      writeFile: (filePath: string, content: string) => Promise<boolean>
      askAI: (prompt: string, folderPath?: string, fileTree?: FileNode[]) => Promise<string>
      readDirTree: (root: string) => Promise<FileNode[]>
    }
  }
}
