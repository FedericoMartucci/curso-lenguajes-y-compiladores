/* Verifica los pares de color del sistema contra tokens.css leyendo el archivo de verdad,
   no una copia. Existe porque tres versiones seguidas de --ok-bg/--bad-bg quedaron a 1.01:1
   entre sí: cada una pasaba el contraste de TEXTO y ninguna se podía skimear, porque el par
   se separaba en tono y no en luminancia. Un número de contraste de texto no ve ese error.  */

import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('../src/estilos/tokens.css', import.meta.url), 'utf8')

/** Extrae los tokens de un bloque `selector { ... }` empezando en el índice dado. */
function bloque(desde: number): Record<string, string> {
  const abre = css.indexOf('{', desde)
  const cierra = css.indexOf('\n}', abre)
  const cuerpo = css.slice(abre + 1, cierra)
  const salida: Record<string, string> = {}
  for (const m of cuerpo.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})/g)) salida[m[1]!] = m[2]!.toLowerCase()
  return salida
}

const claro = bloque(css.indexOf(':root {'))
const oscuro = bloque(css.indexOf("html[data-theme='dark']"))
const oscuroMedia = bloque(css.indexOf("html:not([data-theme='light'])"))

function canal(c: number) {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}
function luminancia(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  return 0.2126 * canal((n >> 16) & 255) + 0.7152 * canal((n >> 8) & 255) + 0.0722 * canal(n & 255)
}
function contraste(a: string, b: string) {
  const [x, y] = [luminancia(a), luminancia(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

let fallas = 0
let corridos = 0

function exigir(tema: string, que: string, a: string, b: string, piso: number, t: Record<string, string>) {
  corridos++
  const [ca, cb] = [t[a], t[b]]
  if (!ca || !cb) { console.error(`  ✗ ${tema}: falta el token ${!ca ? a : b}`); fallas++; return }
  const r = contraste(ca, cb)
  if (r < piso) {
    console.error(`  ✗ ${tema}: ${que} — ${a} vs ${b} = ${r.toFixed(2)}:1, se pedía ${piso}:1`)
    fallas++
  }
}

for (const [tema, t] of [['claro', claro], ['oscuro', oscuro]] as const) {
  const fondos = ['--canvas', '--surface', '--sunken']

  // Texto: 4.5:1 contra CUALQUIER superficie donde pueda caer, no contra la más cómoda.
  for (const tinta of ['--ink', '--ink-2', '--ink-3']) {
    for (const f of fondos) exigir(tema, 'texto sobre superficie', tinta, f, 4.5, t)
  }
  // --ink e --ink-2 también aterrizan sobre los tintes semánticos (la comilla de un caso que
  // falla, la meta de una tarjeta activa). --ink-3 NO: no llega sobre --bad-bg ni --accent-bg,
  // así que queda reservado a las tres superficies neutras. Si hace falta gris sobre un tinte,
  // es --ink-2; esta comprobación existe para que no se cuele --ink-3 de nuevo.
  const tintes = ['--ok-bg', '--bad-bg', '--warn-bg', '--accent-bg', '--purple-bg']
  for (const tinta of ['--ink', '--ink-2']) {
    for (const f of tintes) exigir(tema, 'texto neutro sobre tinte semántico', tinta, f, 4.5, t)
  }
  for (const [tinta, fondo] of [['--ok', '--ok-bg'], ['--bad', '--bad-bg'], ['--warn', '--warn-bg'], ['--accent', '--accent-bg'], ['--purple', '--purple-bg']]) {
    exigir(tema, 'texto semántico sobre su tinte', tinta!, fondo!, 4.5, t)
  }
  for (const f of fondos) exigir(tema, 'acento sobre superficie', '--accent', f, 4.5, t)
  exigir(tema, 'texto sobre el acento sólido', '--accent-ink', '--accent', 4.5, t)

  // Oposiciones: tienen que separarse en LUMINANCIA. Esto es lo que el contraste de texto no ve.
  exigir(tema, 'pasa y falla se distinguen en escala de grises', '--ok-bg', '--bad-bg', 1.2, t)
  for (const f of fondos) exigir(tema, 'el ítem seleccionado se despega del fondo', '--accent-bg', f, 1.15, t)
  for (const f of fondos) exigir(tema, 'la revisión con IA se despega del fondo', '--purple-bg', f, 1.15, t)

  // Bordes y deshabilitado.
  for (const f of fondos) exigir(tema, 'borde de campo (WCAG 1.4.11)', '--borde-campo', f, 3, t)
  for (const f of fondos) exigir(tema, 'texto deshabilitado sigue siendo perceptible', '--ink-off', f, 3, t)
  exigir(tema, '--ink-off se distingue de --ink-2', '--ink-off', '--ink-2', 1.35, t)
}

// La paleta oscura está escrita dos veces (data-theme y prefers-color-scheme). Si se separan,
// el tema del sistema y el tema elegido a mano dejan de ser el mismo tema.
for (const k of Object.keys(oscuro)) {
  corridos++
  if (oscuroMedia[k] !== oscuro[k]) {
    console.error(`  ✗ ${k} difiere entre los dos bloques oscuros: ${oscuro[k]} vs ${oscuroMedia[k] ?? 'ausente'}`)
    fallas++
  }
}
for (const k of Object.keys(oscuroMedia)) {
  if (!(k in oscuro)) { console.error(`  ✗ ${k} está en el bloque de media pero no en data-theme`); fallas++ }
}

if (fallas) { console.error(`\ncontraste: ${fallas} fallas de ${corridos} comprobaciones`); process.exit(1) }
console.log(`contraste: ${corridos} comprobaciones, sin fallas`)
