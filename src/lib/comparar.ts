/* Comparar la respuesta escrita contra el modelo.

   La honestidad de esto es el punto delicado del proyecto. Hay dos casos y NO son lo mismo:

   1. **Verificable.** Si la respuesta es una gramática, una expresión regular o una polaca,
      hay un motor que la puede correr. Ahí sí se dice "correcta" o "incorrecta", y se dice
      por qué. Es el mismo estándar del sandbox.

   2. **No verificable.** Si la respuesta es prosa ("¿por qué SIGUIENTE(A) no alcanza?"),
      ningún motor la puede juzgar sin un modelo de lenguaje, y la app anda sin conexión.
      Ahí NO se dice si está bien: se muestra tu respuesta al lado del modelo y se marcan
      los conceptos del modelo que aparecen en la tuya, como AYUDA para que te califiques.
      Decir "correcta" ahí sería exactamente la promesa que el proyecto no se permite. */

import { parseGrammar, earleyAccepts, tokenize } from '../engines/earley.ts'
import type { Gramatica } from '../tipos/motores.ts'

export type ClaseComparacion = 'verificada' | 'asistida'

export interface Concepto {
  termino: string
  presente: boolean
}

export interface Comparacion {
  clase: ClaseComparacion
  /** Sólo en 'verificada': si la respuesta es correcta. */
  ok?: boolean
  /** Explicación en palabras. */
  detalle: string
  /** Sólo en 'asistida': conceptos del modelo y si aparecen en tu texto. */
  conceptos?: Concepto[]
}

const norm = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const ENTIDADES: Record<string, string> = {
  '&lt;': '<', '&gt;': '>', '&amp;': '&', '&quot;': '"', '&#39;': "'", '&nbsp;': ' '
}

const desescapar = (s: string): string =>
  s.replace(/&(?:lt|gt|amp|quot|#39|nbsp);/g, (m) => ENTIDADES[m] ?? m)

const sinEtiquetas = (h: string): string => desescapar(h.replace(/<[^>]+>/g, ' '))

/** El bloque de código del modelo, si tiene uno. La respuesta formal vive ahí; el párrafo
    de alrededor es la explicación y mete ruido si se lo toma como parte de la gramática. */
function bloqueDeCodigo(html: string): string | null {
  const m = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i)
  if (!m) return null
  return desescapar((m[1] ?? '').replace(/<[^>]+>/g, '')).trim() || null
}

/* ---------- 1. verificable: la respuesta es una gramática ---------- */

/** ¿El texto parece una gramática BNF? Dos o más reglas con flecha. */
export function pareceGramatica(texto: string): boolean {
  const reglas = texto.split(/\n/).filter((l) => /->|→|::=/.test(l))
  return reglas.length >= 1 && Boolean(parseGrammar(texto).start)
}

/** ¿Hay recursión por la izquierda? A -> A α */
export function tieneRecursionIzquierda(g: Gramatica): boolean {
  return g.rules.some((r) => r.rhs[0] === r.lhs)
}

/** Cadenas de prueba derivadas de la propia gramática, para comparar dos gramáticas por
    lo que aceptan y no por cómo están escritas. */
function muestras(g: Gramatica, max = 40): string[][] {
  const out: string[][] = []
  const terminales = [...new Set(g.rules.flatMap((r) => r.rhs.filter((s) => !g.nts.has(s))))]
  const visto = new Set<string>()

  const expandir = (sec: string[], prof: number): void => {
    if (out.length >= max || prof > 6) return
    const i = sec.findIndex((s) => g.nts.has(s))
    if (i < 0) {
      const k = sec.join(' ')
      if (!visto.has(k)) { visto.add(k); out.push(sec) }
      return
    }
    for (const r of g.rules.filter((x) => x.lhs === sec[i])) {
      expandir([...sec.slice(0, i), ...r.rhs, ...sec.slice(i + 1)], prof + 1)
      if (out.length >= max) return
    }
  }
  if (g.start) expandir([g.start], 0)

  // algunas cadenas que NO deberían aceptarse, para que la comparación no sea sólo de aceptación
  terminales.slice(0, 3).forEach((t) => out.push([t, t, t]))
  return out
}

/** Compara dos gramáticas por el lenguaje que aceptan, no por su forma.
    Es la misma honestidad que el sandbox: se valida el lenguaje, no la forma del árbol. */
export function compararGramaticas(delAlumno: string, modelo: string): Comparacion {
  let ga: Gramatica, gm: Gramatica
  try {
    ga = parseGrammar(delAlumno)
    gm = parseGrammar(modelo)
    if (!ga.start) throw new Error('no pude leer tu gramática: falta una regla con la forma A -> …')
  } catch (e) {
    return { clase: 'verificada', ok: false, detalle: e instanceof Error ? e.message : String(e) }
  }
  if (!gm.start) return { clase: 'asistida', detalle: 'El modelo de esta pregunta no es una gramática.' }

  const pruebas = [...muestras(gm), ...muestras(ga)]
  const difieren: string[] = []
  for (const p of pruebas) {
    let a = false, m = false
    try { a = earleyAccepts(ga, p) } catch { a = false }
    try { m = earleyAccepts(gm, p) } catch { m = false }
    if (a !== m) {
      difieren.push(`${p.join(' ') || '⟨vacía⟩'} — el modelo la ${m ? 'acepta' : 'rechaza'} y la tuya la ${a ? 'acepta' : 'rechaza'}`)
      if (difieren.length >= 3) break
    }
  }

  if (difieren.length) {
    return {
      clase: 'verificada', ok: false,
      detalle: `Tu gramática genera otro lenguaje. Por ejemplo: ${difieren.join(' · ')}`
    }
  }

  const recModelo = tieneRecursionIzquierda(gm)
  const recAlumno = tieneRecursionIzquierda(ga)
  if (!recModelo && recAlumno) {
    return {
      clase: 'verificada', ok: false,
      detalle: 'Genera el mismo lenguaje, pero te quedó recursión por la izquierda y el ejercicio pide sacarla.'
    }
  }

  return {
    clase: 'verificada', ok: true,
    detalle: 'Genera el mismo lenguaje que el modelo en todas las cadenas probadas' +
      (!recAlumno && !recModelo ? ', y sin recursión por la izquierda.' : '.')
  }
}

/* ---------- 2. asistida: prosa ---------- */

const VACIAS = new Set([
  'para','porque','como','cuando','donde','cual','cuales','esto','esta','este','esos','esas',
  'todo','toda','todos','todas','pero','mas','muy','solo','sola','tiene','tienen','hace','hacen',
  'puede','pueden','entre','sobre','desde','hasta','antes','despues','siempre','nunca','tambien',
  'que','los','las','del','con','por','una','uno','sus','ser','son','esta','estan','hay','fue'
])

/* Un alumno que sabe no repite el modelo palabra por palabra: escribe "simplicidad del
   diseño" donde el modelo dice "sencillez de diseño", "parser" donde dice "sintáctico" y
   "espacios" donde dice "blancos". La primera versión comparaba por substring exacto y le
   daba 2 de 6 a un parafraseo fiel — o sea que le decía "te faltó" a alguien que lo sabía.
   Un comparador que castiga saber decirlo con tus palabras es peor que no tener ninguno.

   Se resuelve con dos cosas chicas y deterministas, sin modelo de lenguaje: raíces (para la
   flexión: plural, género, nominalizaciones) y una tabla de sinónimos acotada al vocabulario
   de ESTA materia. La tabla es corta a propósito: cada entrada es una equivalencia real de
   la cursada, no un diccionario general. Aflojar de más es el otro error posible, así que
   `tests/comparar.ts` mide las dos direcciones: que el parafraseo sume y que una respuesta
   sin contenido siga dando cero. */

/** Familias de términos que en esta materia significan lo mismo. */
const SINONIMOS: string[][] = [
  ['sintactico', 'parser', 'sintactica'],
  ['lexico', 'scanner', 'lexer', 'lexica'],
  ['blanco', 'espacio', 'tabulacion'],
  ['sencillez', 'simplicidad', 'sencillo', 'simple'],
  ['eficiencia', 'rendimiento', 'velocidad', 'rapidez'],
  ['portabilidad', 'portable'],
  ['cadena', 'string', 'palabra'],
  ['reducir', 'reduccion', 'reduce'],
  ['desplazar', 'desplazamiento', 'shift'],
  ['token', 'terminal'],
  ['lexema', 'texto'],
  ['derivacion', 'derivar'],
  ['ambigua', 'ambiguedad', 'ambiguo'],
  ['recursion', 'recursiva', 'recursivo'],
  ['tabla de simbolos', 'ts'],
  ['arbol', 'arbol sintactico'],
  ['pila', 'stack'],
  ['estado', 'nodo'],
  ['error', 'fallo', 'falla'],
  ['conjunto', 'set'],
  ['gramatica', 'produccion', 'regla'],
  ['optimizar', 'optimizacion', 'mejorar'],
  ['intermedio', 'intermedia'],
  ['ejecucion', 'ejecutar', 'corre', 'runtime'],
  ['compilacion', 'compilar', 'compilador'],
  ['interprete', 'interpretar', 'interpretacion']
]

/** Palabra -> índice de su familia, para preguntar equivalencia en O(1). */
const FAMILIA = new Map<string, number>()
SINONIMOS.forEach((fam, i) => fam.forEach((p) => FAMILIA.set(p, i)))

/** Raíz aproximada: saca la flexión más común del español. Conservadora a propósito —
    sobre-recortar junta palabras que no significan lo mismo y eso infla el puntaje. */
function raiz(p: string): string {
  const w = norm(p)
  if (w.length <= 4) return w
  const m = w.match(/^(.*?)(ciones|cion|idades|idad|mente|amos|aron|ando|iendo|ados|adas|ada|ado|ar|er|ir|es|as|os|a|o|s)$/)
  const r = m?.[1] ?? w
  return r.length >= 4 ? r : w
}

/** ¿Dos palabras cuentan como la misma idea? */
function equivalen(a: string, b: string): boolean {
  const [x, y] = [norm(a), norm(b)]
  if (x === y) return true
  const [fx, fy] = [FAMILIA.get(x), FAMILIA.get(y)]
  if (fx !== undefined && fx === fy) return true
  const [rx, ry] = [raiz(x), raiz(y)]
  return rx === ry && rx.length >= 4
}

const palabras = (s: string): string[] =>
  norm(sinEtiquetas(s)).split(/[^a-zñ0-9_]+/).filter(Boolean)

/** Términos con peso conceptual del modelo: lo que el autor marcó en negrita o en <code>.
    Sólo se rellena con palabras largas cuando el modelo marcó menos de dos: si el autor
    marcó los conceptos, ésos son los conceptos. Rellenar hasta seis metía ruido ("ensucia",
    "durante", "guarda") y lo contaba como si al alumno le hubiera faltado algo. */
function conceptosDelModelo(html: string): string[] {
  const marcados = [...html.matchAll(/<(?:b|strong|code)>(.*?)<\/(?:b|strong|code)>/gis)]
    // se recorta la puntuación de los bordes: el modelo escribe "<b>Falso.</b>" y el punto
    // no es parte del concepto
    .map((m) => sinEtiquetas(m[1] ?? '').trim().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N})]+$/gu, ''))
    .filter((t) => t.length > 1)

  const candidatos = [...marcados]
  if (marcados.length < 2) {
    candidatos.push(...palabras(html).filter((w) => w.length >= 6 && !VACIAS.has(w)))
  }

  const unicos: string[] = []
  for (const t of candidatos) {
    const k = norm(t)
    if (!k) continue
    // se descarta lo que ya está contenido en un concepto anterior: "saltee" sobra si ya
    // se listó "saltee demasiada entrada", y contarlos por separado infla el puntaje
    if (unicos.some((u) => { const n = norm(u); return n.includes(k) || k.includes(n) })) continue
    unicos.push(t)
    if (unicos.length >= 6) break
  }
  return unicos
}

/** ¿El alumno tocó este concepto? Exige que estén sus palabras con peso —por raíz o por
    sinónimo—, no la frase textual. Un concepto de una sola palabra se cumple con esa. */
function conceptoPresente(termino: string, delAlumno: string[]): boolean {
  const claves = palabras(termino).filter((w) => w.length > 2 && !VACIAS.has(w))
  if (!claves.length) return false
  const halladas = claves.filter((c) => delAlumno.some((w) => equivalen(c, w))).length
  /* En un concepto de una o dos palabras se exigen TODAS: con la mitad, "tabla de símbolos"
     se lo llevaría quien escribió "tabla SLR", que no es lo mismo. Recién a partir de tres
     se perdona una, porque ahí la que falta suele ser accesoria. */
  return claves.length <= 2 ? halladas === claves.length : halladas / claves.length >= 0.67
}

export function compararProsa(delAlumno: string, modeloHtml: string): Comparacion {
  const mias = palabras(delAlumno)
  const conceptos = conceptosDelModelo(modeloHtml).map((termino) => ({
    termino,
    presente: conceptoPresente(termino, mias)
  }))
  const n = conceptos.filter((c) => c.presente).length
  return {
    clase: 'asistida',
    conceptos,
    detalle: conceptos.length
      ? `Tu respuesta toca ${n} de ${conceptos.length} conceptos del modelo. Esto NO es una corrección: es una ayuda para que te califiques.`
      : 'Compará tu respuesta con el modelo y calificate.'
  }
}

/* ---------- despachador ---------- */

/** Elige cómo comparar según lo que se pueda verificar de verdad. */
export function comparar(delAlumno: string, modeloHtml: string): Comparacion | null {
  if (!delAlumno.trim()) return null

  // la respuesta formal del modelo vive en su bloque de código, no en el párrafo
  const modeloFormal = bloqueDeCodigo(modeloHtml)
  if (modeloFormal && pareceGramatica(delAlumno) && pareceGramatica(modeloFormal)) {
    return compararGramaticas(delAlumno, modeloFormal)
  }
  return compararProsa(delAlumno, modeloHtml)
}
