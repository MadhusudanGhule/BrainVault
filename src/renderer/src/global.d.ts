export {}

declare global {
  interface Window {
    api: {
      openFolder: () => Promise<{ folderPath: string, files: { name: string, path: string }[] } | null>
      readFile: (filePath: string) => Promise<string>
      writeFile: (filePath: string, content: string) => Promise<boolean>
      askAI: (prompt: string) => Promise<string>
    }
  }
}
