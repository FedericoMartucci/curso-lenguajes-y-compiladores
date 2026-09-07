import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' => el build funciona tanto servido por Vercel como abriendo dist/index.html local.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: 'dist', chunkSizeWarningLimit: 1500 }
})
