/* build.js — genera src/data/curso.ts a partir de los módulos en content/.
   content/mod-*.js es la ÚNICA fuente de verdad: cada archivo hace M.push({...})
   con un módulo completo (id, titulo, parcial, resumen, lecciones).
   Sigue siendo JS a propósito: los módulos de contenido se ejecutan en un vm de Node y son
   literales de HTML, así que compilarlos antes no agregaría seguridad de tipos real.
   El archivo que emite SÍ es TypeScript y tiene que cumplir el tipo `Curso`.
   Uso:  npm run data   (o  node build.js). `npm run build` lo corre antes de vite build. */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const dir = dirname(fileURLToPath(import.meta.url))

const files = readdirSync(join(dir, 'content')).filter((f) => f.endsWith('.js')).sort()
let mods = []
files.forEach((f) => {
  const ctx = { M: [] }
  vm.createContext(ctx)
  vm.runInContext(readFileSync(join(dir, 'content', f), 'utf8'), ctx)
  mods = mods.concat(ctx.M)
})
mods.sort((a, b) => a.id - b.id)

const problems = []
const seenLes = {}
const seenMod = {}
let total = 0, qa = 0, dic = 0
mods.forEach((m) => {
  if (m.titulo == null || m.parcial == null) problems.push('Módulo ' + m.id + ' sin titulo/parcial')
  if (seenMod[m.id]) problems.push('Módulo duplicado: ' + m.id)
  seenMod[m.id] = 1
  m.lecciones.forEach((l) => {
    if (seenLes[l.id]) problems.push('Lección duplicada: ' + l.id)
    seenLes[l.id] = 1
    total++
    qa += (l.qa || []).length
    if (l.estado === 'dictada') dic++
  })
})

mkdirSync(join(dir, 'src', 'data'), { recursive: true })
writeFileSync(
  join(dir, 'src', 'data', 'curso.ts'),
  '/* GENERADO por build.js a partir de content/. No editar a mano: se edita content/mod-*.js\n' +
  '   y se corre `npm run data`. Está commiteado a propósito para que el deploy no dependa\n' +
  '   de un paso extra. */\n' +
  "import type { Curso } from '../tipos/curso.ts'\n\n" +
  'export const CURSO: Curso = ' + JSON.stringify({ modulos: mods }) + '\n'
)

mods.forEach((m) => {
  const d = m.lecciones.filter((l) => l.estado === 'dictada').length
  const bar = '█'.repeat(Math.round((d / m.lecciones.length) * 10)).padEnd(10, '·')
  console.log('Mod ' + String(m.id).padStart(2) + ' [' + bar + '] ' + d + '/' + m.lecciones.length + '  ' + m.titulo)
})
console.log('---')
console.log('Módulos: ' + mods.length + ' | Lecciones: ' + total + ' (' + dic + ' en profundidad) | Preguntas: ' + qa)
if (problems.length) { console.log('PROBLEMAS:\n- ' + problems.join('\n- ')); process.exit(1) }
console.log('OK — src/data/curso.ts generado')
