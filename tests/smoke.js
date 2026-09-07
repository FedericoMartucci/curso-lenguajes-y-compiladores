/* Smoke test: renderiza cada ruta de la app a string para detectar errores de runtime
   en los componentes (props faltantes, datos mal formados, etc.).
   Uso:  node tests/smoke.js  */

// stubs mínimos del navegador (renderToString no ejecuta efectos, pero sí los initializers de estado)
const store = {}
globalThis.window = {
  location: { hash: '#/inicio' },
  addEventListener() {}, removeEventListener() {},
  matchMedia: () => ({ matches: false }),
  scrollTo() {},
  HTMLTextAreaElement: { prototype: {} },
  HTMLInputElement: { prototype: {} }
}
globalThis.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v) }
}
globalThis.document = { documentElement: { setAttribute() {}, removeAttribute() {} } }
globalThis.requestAnimationFrame = (f) => f()

const React = (await import('react')).default
const { renderToString } = await import('react-dom/server')
const App = (await import('../src/App.jsx')).default

const rutas = [
  '#/inicio', '#/l/0.1', '#/l/6.4', '#/l/15.2',
  '#/ejercitar', '#/sandbox', '#/mesa',
  '#/transcripciones', '#/transcripciones/c1',
  '#/practicas', '#/practicas/p1',
  '#/banco', '#/buscar/SLR'
]

let fallos = 0
for (const r of rutas) {
  globalThis.window.location.hash = r
  try {
    const html = renderToString(React.createElement(App))
    if (!html || html.length < 200) { console.log(`  ✗ ${r}: render vacío o sospechosamente corto`); fallos++ }
  } catch (e) {
    console.log(`  ✗ ${r}: ${e.message}`)
    fallos++
  }
}

if (fallos === 0) console.log(`✓ OK — las ${rutas.length} rutas renderizan sin errores.`)
else { console.log(`✗ ${fallos} ruta(s) con errores.`); process.exit(1) }
