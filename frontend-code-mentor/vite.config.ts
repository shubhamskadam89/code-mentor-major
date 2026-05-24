import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    sourcemap: false,
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        sidepanel: resolve(__dirname, 'src/popup/sidepanel.html'),
        content: resolve(__dirname, 'src/content/contentScript.ts'),
        contentSync: resolve(__dirname, 'src/content/contentSync.ts'),
        background: resolve(__dirname, 'src/background/background.ts'),
        dashboard: resolve(__dirname, 'src/dashboard/index.html')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    open: '/src/dashboard/index.html',
    port: 3000
  }
})
