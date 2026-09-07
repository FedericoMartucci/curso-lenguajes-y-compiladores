import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/* `vite dev` no sabe nada de las funciones de Vercel: en producción /api/corregir lo sirve
   la plataforma, pero en local sería un 404 y la corrección con IA no se podría probar sin
   `vercel dev`. Este plugin monta el mismo handler sobre el server de desarrollo, así que
   `npm run dev` da la app entera. No toca el build: sólo existe en `configureServer`. */
function apiEnDesarrollo(): Plugin {
  return {
    name: 'lyc:api-en-desarrollo',
    apply: 'serve',
    configureServer(server) {
      /* Vite sólo pasa a la app las variables con prefijo VITE_, y con razón. La función
         lee `process.env`, que en dev viene del shell y no del .env.local, así que sin
         esto el fallback de desarrollo no existiría. Sólo las de Azure, sólo en `serve`. */
      const entorno = loadEnv(server.config.mode, process.cwd(), 'AZURE_')
      for (const [k, v] of Object.entries(entorno)) process.env[k] ??= v

      server.middlewares.use('/api/corregir', (req, res) => {
        const trozos: Buffer[] = []
        req.on('data', (c: Buffer) => trozos.push(c))
        req.on('end', () => {
          void (async () => {
            try {
              const { default: handler } = await server.ssrLoadModule('/api/corregir.ts') as {
                default: (r: Request) => Promise<Response>
              }
              const cuerpo = Buffer.concat(trozos)
              const pedido = new Request('http://local/api/corregir', {
                method: req.method ?? 'POST',
                headers: req.headers as Record<string, string>,
                body: cuerpo.length ? cuerpo : null
              })
              const r = await handler(pedido)
              res.statusCode = r.status
              r.headers.forEach((v, k) => res.setHeader(k, v))
              res.end(await r.text())
            } catch (e) {
              res.statusCode = 500
              res.setHeader('content-type', 'application/json')
              res.end(JSON.stringify({ error: 'La función falló en desarrollo: ' + String(e) }))
            }
          })()
        })
      })
    }
  }
}

/* base '/' porque ahora hay rutas reales servidas por Vercel con rewrite a index.html. */
export default defineConfig({
  plugins: [
    react(),
    apiEnDesarrollo(),
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
