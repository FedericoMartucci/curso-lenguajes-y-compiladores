/* El comparador de respuestas escritas tiene dos formas de fallar y las dos importan:

   - Ser demasiado estricto: le dice "te faltó" a quien lo sabe pero lo escribió con sus
     palabras. Es el peor de los dos, porque el alumno confía y se corrige de menos.
   - Ser demasiado laxo: le da conceptos por tocados a quien escribió cualquier cosa. Ahí
     la ayuda deja de significar nada.

   Aflojar el matching arregla el primero y empeora el segundo, así que las dos direcciones
   se miden juntas: cada caso declara un piso Y un techo. Si alguien suma sinónimos a la
   tabla y de golpe la respuesta sin contenido puntúa, esto falla. */

import { comparar, compararProsa } from '../src/lib/comparar.ts'

const MODELO_TRES_RAZONES =
  '<p>Aho da tres. (1) <b>Sencillez de diseño</b>: el sintáctico no se ensucia con blancos ' +
  'ni comentarios. (2) <b>Eficiencia</b>: el escaneo carácter a carácter usa técnicas ' +
  'propias (búferes). (3) <b>Portabilidad</b>: las peculiaridades del alfabeto quedan ' +
  'aisladas en el léxico.</p>'

const MODELO_LEXEMA =
  '<p>El <b>lexema</b> es la secuencia concreta de caracteres del fuente. El <b>token</b> ' +
  'es la categoría. El <b>patrón</b> es la regla que describe qué lexemas forman el token.</p>'

interface Caso {
  nombre: string
  modelo: string
  alumno: string
  /** Fracción de conceptos tocados: [piso, techo]. */
  esperado: [number, number]
}

const CASOS: Caso[] = [
  { nombre: 'el modelo textual toca todo',
    modelo: MODELO_TRES_RAZONES,
    alumno: 'Sencillez de diseño, eficiencia y portabilidad: el sintáctico no se ensucia con blancos.',
    esperado: [1, 1] },

  { nombre: 'parafraseo fiel: sinónimos de la cursada',
    modelo: MODELO_TRES_RAZONES,
    alumno: 'son tres: la simplicidad del diseño, porque el parser no lidia con espacios ni ' +
            'comentarios; el rendimiento, ya que leer caracter por caracter permite buffers; ' +
            'y que sea portable, porque las rarezas del alfabeto quedan encerradas en el scanner',
    esperado: [1, 1] },

  { nombre: 'respuesta parcial: sabe una de las tres',
    modelo: MODELO_TRES_RAZONES,
    alumno: 'para que el parser sea mas simple de diseñar y no tenga que ver los comentarios',
    esperado: [0.2, 0.5] },

  { nombre: 'sin contenido: no puede puntuar',
    modelo: MODELO_TRES_RAZONES,
    alumno: 'porque si, es lo que dice el libro y en la clase lo explicaron asi',
    esperado: [0, 0] },

  { nombre: 'off-topic: habla de otra cosa de la materia',
    modelo: MODELO_TRES_RAZONES,
    alumno: 'la tabla SLR se arma con los items LR(0) y los conjuntos de siguientes',
    esperado: [0, 0.2] },

  { nombre: 'un concepto de dos palabras no se cumple con una sola',
    modelo: '<p>Se guarda en la <b>tabla de símbolos</b> durante el <b>análisis semántico</b>.</p>',
    alumno: 'eso se ve en la tabla SLR cuando haces el analisis de los items',
    esperado: [0, 0] },

  { nombre: 'flexión: plural y nominalización cuentan',
    modelo: MODELO_LEXEMA,
    alumno: 'los lexemas son los textos concretos, los tokens son las categorias y los patrones las reglas',
    esperado: [1, 1] }
]

let fallas = 0
for (const c of CASOS) {
  const r = compararProsa(c.alumno, c.modelo)
  const tot = r.conceptos?.length ?? 0
  const n = r.conceptos?.filter((x) => x.presente).length ?? 0
  const frac = tot ? n / tot : 0
  const [piso, techo] = c.esperado
  const ok = frac >= piso - 1e-9 && frac <= techo + 1e-9
  if (!ok) {
    fallas++
    console.error(`  ✗ ${c.nombre}: tocó ${n}/${tot} (${frac.toFixed(2)}), se esperaba entre ${piso} y ${techo}`)
    console.error('    ' + (r.conceptos ?? []).map((x) => (x.presente ? '✓' : '✗') + x.termino).join('  '))
  }
}

/* La prosa NUNCA puede decir si está bien: es la promesa del proyecto. */
const prosa = compararProsa('lo que sea', MODELO_LEXEMA)
if (prosa.clase !== 'asistida' || prosa.ok !== undefined) {
  console.error('  ✗ una comparación de prosa se declaró verificada o trajo un veredicto')
  fallas++
}

/* Una gramática sí se corre, y ahí el veredicto es un hecho. */
const gram = comparar('S -> a S | a', '<p>Modelo:</p><pre>S -> a S | a</pre>')
if (gram?.clase !== 'verificada' || gram.ok !== true) {
  console.error('  ✗ una gramática idéntica al modelo no se verificó como correcta:', JSON.stringify(gram))
  fallas++
}
const gramMal = comparar('S -> b S | b', '<p>Modelo:</p><pre>S -> a S | a</pre>')
if (gramMal?.clase !== 'verificada' || gramMal.ok !== false) {
  console.error('  ✗ una gramática de otro lenguaje no se marcó incorrecta:', JSON.stringify(gramMal))
  fallas++
}

if (fallas) { console.error(`\ncomparar: ${fallas} fallas`); process.exit(1) }
console.log(`comparar: ${CASOS.length + 3} comprobaciones, sin fallas`)
