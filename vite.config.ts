import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  root: '.', // Root at project level
  publicDir: 'public',
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist-examples',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'examples/index.html')
      }
    }
  }
})
