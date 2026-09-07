/* Smoke test: renderiza cada ruta de la app a string para detectar errores de runtime en los
   componentes (props faltantes, datos mal formados, imports rotos). No reemplaza a un test de
   interacción: solo garantiza que ninguna pantalla explota al montarse.
   Se ejecuta bundleado con esbuild porque tiene JSX.  Uso:  npm run smoke  */

/* ---------- stubs mínimos del navegador ----------
   renderToString no corre efectos, pero sí los inicializadores de estado, que leen
   localStorage, matchMedia y location. */
const guardado: Record<string, string> = {}

interface VentanaFalsa {
  location: { pathname: string; search: string; hash: string }
  addEventListener(): void
  removeEventListener(): void
  matchMedia(): { matches: boolean; addEventListener(): void; removeEventListener(): void }
  scrollTo(): void
  setTimeout: typeof setTimeout
  clearTimeout: typeof clearTimeout
  setInterval: typeof setInterval
  clearInterval: typeof clearInterval
}

const ventana: VentanaFalsa = {
  location: { pathname: '/', search: '', hash: '' },
  addEventListener() {}, removeEventListener() {},
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  scrollTo() {},
  setTimeout, clearTimeout, setInterval, clearInterval
}

const g = globalThis as unknown as Record<string, unknown>
g.window = ventana
g.location = ventana.location
g.history = { pushState() {}, replaceState() {} }
g.localStorage = {
  getItem: (k: string) => (k in guardado ? guardado[k] : null),
  setItem: (k: string, v: string) => { guardado[k] = String(v) },
  removeItem: (k: string) => { delete guardado[k] }
}
g.matchMedia = ventana.matchMedia
g.document = {
  documentElement: { setAttribute() {}, removeAttribute() {}, getAttribute: () => null },
  getElementById: () => null,
  createElement: () => ({ className: '', appendChild() {}, replaceWith() {} }),
  title: ''
}
g.requestAnimationFrame = (f: () => void) => { f(); return 0 }

const React = (await import('react')).default
const { renderToString } = await import('react-dom/server')
const App = (await import('../src/App.tsx')).default

/* Toda ruta que la app pueda servir, incluida una inexistente. */
const RUTAS = [
  '/',
  '/plan',
  '/leccion/0.1', '/leccion/6.4', '/leccion/15.2',
  '/leccion/no-existe',
  '/ejercitar',
  '/examen',
  '/sandbox',
  '/sandbox/er', '/sandbox/er/p1-1a',
  '/sandbox/lex', '/sandbox/glc',
  '/sandbox/parsing', '/sandbox/gci', '/sandbox/asm',
  '/mesa',
  '/practicas', '/practicas/p1', '/practicas/p6',
  '/clases', '/clases/c1',
  '/ajustes',
  '/una/ruta/que/no/existe'
]

let fallos = 0
for (const r of RUTAS) {
  ventana.location.pathname = r
  ventana.location.search = ''
  try {
    const html = renderToString(React.createElement(App))
    if (!html || html.length < 200) {
      console.log(`  ✗ ${r}: render vacío o sospechosamente corto (${html.length} chars)`)
      fallos++
    }
  } catch (e) {
    console.log(`  ✗ ${r}: ${e instanceof Error ? e.message : String(e)}`)
    fallos++
  }
}

if (fallos === 0) console.log(`✓ OK — las ${RUTAS.length} rutas renderizan sin errores.`)
else { console.log(`✗ ${fallos} ruta(s) con errores.`); process.exit(1) }
