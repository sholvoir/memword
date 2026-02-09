import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '',
  publicDir: false,
  build: {
    target: 'esnext',
    outDir: '../memword-server/html/static',
    assetsDir: '',
    rollupOptions: {
      input: 'lib/worker.ts',
      output: {
        entryFileNames: '[name].js'
      }
    }
  }
})
