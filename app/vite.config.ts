import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// SINGLE_FILE=1 inlines JS/CSS into index.html so the app can be deployed by
// uploading one file — no build step, no workflow, no asset paths.
const singleFile = process.env.SINGLE_FILE === '1'

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200,
    ...(singleFile
      ? {
          cssCodeSplit: false,
          assetsInlineLimit: 100_000_000,
          rollupOptions: {
            output: {
              inlineDynamicImports: true,
              entryFileNames: 'assets/app.js',
              chunkFileNames: 'assets/[name].js',
              assetFileNames: 'assets/[name][extname]',
            },
          },
        }
      : {}),
  },
})
