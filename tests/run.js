/* Suite de verificación del banco de ejercicios.
   Comprueba que la respuesta MODELO de cada ejercicio acepte todo su set de aceptación
   y rechace todo su set de rechazo. Si un modelo falla, el ejercicio está mal planteado.
   Uso:  npm test   */

import { ER_EJ } from '../src/data/ejercicios/er.js'
import { LEX_EJ } from '../src/data/ejercicios/lexicas.js'
import { GLC_EJ } from '../src/data/ejercicios/glc.js'
import { testER } from '../src/engines/regex.js'
import { testAccionLexica } from '../src/engines/lexica.js'
import { testGLC } from '../src/engines/earley.js'

let fails = 0
let casos = 0

function report(tag, id, titulo, r) {
  if (r.error) { console.log(`  ✗ [${tag} ${id}] error al compilar: ${r.error}`); fails++; return }
  const bad = r.casos.filter((c) => !c.pass)
  casos += r.casos.length
  if (bad.length) {
    fails++
    console.log(`  ✗ [${tag} ${id}] ${titulo}`)
    bad.forEach((c) => {
      const s = String(c.s).length > 40 ? String(c.s).slice(0, 40) + '…' : String(c.s)
      console.log(`      ${c.esperado ? 'debía ACEPTAR' : 'debía RECHAZAR'}: ${JSON.stringify(s)}`)
    })
  }
}

console.log('Expresiones regulares…')
ER_EJ.forEach((e) => report('ER', e.id, e.t, testER(e.m, e.cj, e.ac, e.rc)))

console.log('Acciones léxicas…')
LEX_EJ.forEach((e) => report('LEX', e.id, e.t, testAccionLexica(e.mER, e.cj, e.atr, e.op, e.cota, e.tests)))

console.log('Gramáticas…')
GLC_EJ.forEach((e) => report('GLC', e.id, e.t, testGLC(e.m, e.ac, e.rc)))

const total = ER_EJ.length + LEX_EJ.length + GLC_EJ.length
console.log('')
if (fails === 0) {
  console.log(`✓ OK — ${total} ejercicios (${ER_EJ.length} ER, ${LEX_EJ.length} acciones léxicas, ${GLC_EJ.length} GLC) y ${casos} casos de prueba: todos los modelos validan.`)
  process.exit(0)
} else {
  console.log(`✗ ${fails} ejercicio(s) con problemas de ${total}.`)
  process.exit(1)
}
