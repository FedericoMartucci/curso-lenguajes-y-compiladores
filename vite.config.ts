import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/* base '/' porque ahora hay rutas reales servidas por Vercel con rewrite a index.html.
   Ya no se abre el dist/ desde el sistema de archivos: la app necesita un servidor. */
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    target: 'es2022',
    chunkSizeWarningLimit: 900
  }
})
