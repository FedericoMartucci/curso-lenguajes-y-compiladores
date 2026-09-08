/* Qué corrige la app y qué no.

   La regla es que sólo hay veredicto donde hay algo que ejecutar o algo declarado. Este
   test cuida las dos mitades: que lo verificable se verifique bien, y —lo que es más fácil
   de romper sin darse cuenta— que lo NO verificable no produzca ningún veredicto. Si
   alguien vuelve a agregar una señal aproximada para las preguntas de desarrollar, esto
   falla, y esa es toda su razón de ser. */

import { comparar, compararVF, veredictoVF } from '../src/lib/comparar.ts'
import { cargarBanco, clasificar } from '../src/lib/curso.ts'

let fallas = 0
const mal = (m: string) => { console.error('  ✗ ' + m); fallas++ }

/* ---------- 1. V/F: las 17 del banco, contra el banco de verdad ---------- */

const banco = await cargarBanco()
const vfs = banco.filter((p) => p.tipo === 'vf')
if (vfs.length < 15) mal(`se esperaban ~17 preguntas V/F en el banco y hay ${vfs.length}`)

let parseadas = 0
for (const p of vfs) {
  const suya = veredictoVF(p.a)
  if (!suya) { mal(`el modelo de una V/F no declara su respuesta: «${p.q.slice(0, 60)}…»`); continue }
  parseadas++
  // elegir lo mismo que el modelo es correcto; lo contrario, incorrecto. Sin puntos medios.
  const igual = compararVF(suya, p.a)
  const opuesto = compararVF(suya === 'V' ? 'F' : 'V', p.a)
  if (igual?.ok !== true) mal(`elegir lo mismo que el modelo no dio correcta: «${p.q.slice(0, 50)}…»`)
  if (opuesto?.ok !== false) mal(`elegir lo contrario no dio incorrecta: «${p.q.slice(0, 50)}…»`)
}

/* Una pregunta que no es V/F no puede ofrecer el control: sin respuesta declarada, null. */
if (veredictoVF('<p>El lexema es la secuencia de caracteres del fuente.</p>') !== null) {
  mal('veredictoVF inventó una respuesta en un modelo que no declara ninguna')
}
if (compararVF('V', '<p>Sin veredicto declarado.</p>') !== null) {
  mal('compararVF devolvió algo con un modelo que no declara respuesta')
}

/* ---------- 2. gramáticas: el motor las corre ---------- */

const igual = comparar('S -> a S | a', '<p>Modelo:</p><pre>S -> a S | a</pre>')
if (igual?.ok !== true) mal('una gramática idéntica al modelo no se verificó como correcta')

const otra = comparar('S -> b S | b', '<p>Modelo:</p><pre>S -> a S | a</pre>')
if (otra?.ok !== false) mal('una gramática de otro lenguaje no se marcó incorrecta')

const equivalente = comparar('S -> a S\nS -> a', '<p>Modelo:</p><pre>S -> a S | a</pre>')
if (equivalente?.ok !== true) mal('una gramática equivalente escrita distinto no se aceptó')

/* ---------- 3. desarrollar: NO se corrige, y esto es lo que más importa ---------- */

const PROSA = '<p>Aho da tres razones: <b>sencillez de diseño</b>, <b>eficiencia</b> y <b>portabilidad</b>.</p>'
for (const respuesta of [
  'las tres razones son sencillez de diseño, eficiencia y portabilidad',   // impecable
  'ni idea la verdad',                                                     // vacía
  'algo de compiladores'                                                   // irrelevante
]) {
  const r = comparar(respuesta, PROSA)
  if (r !== null) {
    mal(`una respuesta de desarrollar produjo un veredicto: ${JSON.stringify(r)}`)
  }
}

/* Que la clasificación siga mandando las V/F al camino verificable. */
if (clasificar('V/F justificando: «el léxico entrega la lista completa».') !== 'vf') {
  mal('una pregunta V/F dejó de clasificarse como vf')
}
if (clasificar('¿Por qué SIGUIENTE(A) no alcanza en SLR?') !== 'desarrollar') {
  mal('una pregunta de desarrollar se clasificó como otra cosa')
}

if (fallas) { console.error(`\ncomparar: ${fallas} fallas`); process.exit(1) }
console.log(`comparar: ${parseadas} preguntas V/F verificadas de punta a punta, más gramáticas y el corte de la prosa: sin fallas`)
