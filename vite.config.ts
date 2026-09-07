import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/* base '/' porque ahora hay rutas reales servidas por Vercel con rewrite a index.html. */
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'fonts/*.woff2', 'artifacts/*.html'],
      manifest: {
        name: 'Lenguajes y Compiladores · UNLaM',
        short_name: 'LyC',
        description: 'Teoría, plan de estudio y ejercicios que se corrigen ejecutándose.',
        lang: 'es-AR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#faf9f5',
        theme_color: '#2c5aa0',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icono-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icono-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icono-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // el chunk de la teoría pasa los 2 MB por defecto de workbox
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,woff2,svg,png}'],
        // el rewrite de Vercel manda todo a index.html; el SW hace lo mismo offline
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // La API de Supabase NUNCA se cachea: el progreso tiene que ser el real.
            // Sin red, el cliente falla y la app sigue con lo que hay en localStorage.
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkOnly'
          }
        ]
      },
      devOptions: { enabled: false }
    })
  ],
  base: '/',
  build: {
    outDir: 'dist',
    target: 'es2022',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        /* React y Supabase cambian de versión cada muchos meses; el código de la app,
           todo el tiempo. Separarlos hace que un deploy no invalide el caché de 400 kB
           de dependencias que el navegador ya tiene. */
        manualChunks: {
          react: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
})
