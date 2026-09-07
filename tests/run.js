/* Suite de verificación del banco de ejercicios.
   Comprueba que la respuesta MODELO de cada ejercicio acepte todo su set de aceptación
   y rechace todo su set de rechazo. Si un modelo falla, el ejercicio está mal planteado.
   Uso:  npm test   */

import { ER_EJ } from '../src/data/ejercicios/er.js'
import { LEX_EJ } from '../src/data/ejercicios/lexicas.js'
import { GLC_EJ } from '../src/data/ejercicios/glc.js'
import { testER, buildRegex, parseConjuntos } from '../src/engines/regex.js'
import { testAccionLexica } from '../src/engines/lexica.js'
import { testGLC } from '../src/engines/earley.js'
import { testAccionCodigo, codigoModelo } from '../src/engines/accionLexica.js'
import { decorar } from '../src/data/ejercicios/meta.js'
import { PARSING_EJ } from '../src/data/ejercicios/parsing.js'
import { GCI_EJ } from '../src/data/ejercicios/gci.js'
import { ASM_EJ } from '../src/data/ejercicios/asm.js'
import { parseGrammar } from '../src/engines/earley.js'
import { tablaSLR } from '../src/engines/parsing.js'
import { testIntermedia } from '../src/engines/polaca.js'
import { testAssembler } from '../src/engines/coprocesador.js'

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

console.log('Acciones léxicas (condición estructurada)…')
LEX_EJ.forEach((e) => report('LEX', e.id, e.t, testAccionLexica(e.mER, e.cj, e.atr, e.op, e.cota, e.tests)))

console.log('Acciones léxicas (pseudocódigo escrito)…')
LEX_EJ.forEach((e) => {
  let rx
  try { rx = buildRegex(e.mER, parseConjuntos(e.cj)) }
  catch (err) { console.log(`  ✗ [COD ${e.id}] ER inválida: ${err.message}`); fails++; return }
  report('COD', e.id, e.t, testAccionCodigo(rx, codigoModelo(e.atr, e.op, e.cota), e.tests))
})

console.log('Gramáticas…')
GLC_EJ.forEach((e) => report('GLC', e.id, e.t, testGLC(e.m, e.ac, e.rc)))

console.log('Parsing SLR…')
PARSING_EJ.forEach((e) => {
  try {
    const g = parseGrammar(e.gramatica)
    if (!g.start) throw new Error('gramática vacía')
    const t = tablaSLR(g)
    if (!t.estados.length) throw new Error('no se generaron estados')
    casos += 1
  } catch (err) { console.log(`  ✗ [SLR ${e.id}] ${err.message}`); fails++ }
})

console.log('Código intermedio (ejecución)…')
GCI_EJ.forEach((e) => {
  const r = testIntermedia(e.m, e.casos, e.modo)
  casos += e.casos.length
  if (!r.ok) {
    fails++
    console.log(`  ✗ [GCI ${e.id}] ${e.t}`)
    r.resultados.filter((x) => !x.pass).forEach((x) =>
      console.log('      ' + (x.error || JSON.stringify((x.detalles || []).filter((d) => !d.pass)))))
  }
})

console.log('Assembler (coprocesador)…')
ASM_EJ.forEach((e) => {
  const r = testAssembler(e.m, e.casos)
  casos += e.casos.length
  if (!r.ok) {
    fails++
    console.log(`  ✗ [ASM ${e.id}] ${e.t}`)
    r.resultados.filter((x) => !x.pass).forEach((x) =>
      console.log('      ' + (x.error || JSON.stringify((x.detalles || []).filter((d) => !d.pass)))))
  }
})

console.log('Metadatos (numeración y agrupación)…')
;[['er', ER_EJ], ['lex', LEX_EJ], ['glc', GLC_EJ], ['parsing', PARSING_EJ], ['gci', GCI_EJ], ['asm', ASM_EJ]].forEach(([tipo, lista]) => {
  decorar(lista, tipo).forEach((e) => {
    if (e.grupo === 'Otros') { console.log(`  ✗ [META ${tipo}:${e.id}] sin grupo ni número asignados`); fails++ }
  })
})

const total = ER_EJ.length + LEX_EJ.length + GLC_EJ.length + PARSING_EJ.length + GCI_EJ.length + ASM_EJ.length
console.log('')
if (fails === 0) {
  console.log(`✓ OK — ${total} ejercicios (${ER_EJ.length} ER, ${LEX_EJ.length} acciones léxicas, ${GLC_EJ.length} GLC, ${PARSING_EJ.length} parsing, ${GCI_EJ.length} GCI, ${ASM_EJ.length} Assembler) y ${casos} casos de prueba: todos los modelos validan.`)
  process.exit(0)
} else {
  console.log(`✗ ${fails} ejercicio(s) con problemas de ${total}.`)
  process.exit(1)
}
