import { defineConfig } from 'vite'

// Use dynamic import for ESM-only plugins so `esbuild` doesn't try to require them.
export default defineConfig(async () => {
  const react = (await import('@vitejs/plugin-react')).default

  return {
    plugins: [react()],
    root: 'src/renderer',
    build: {
      outDir: '../../dist/renderer',
      emptyOutDir: true,
    },
    server: {
      port: 5173,
    }
  }
})