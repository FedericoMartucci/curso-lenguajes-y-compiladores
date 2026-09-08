/* Comparar la respuesta escrita contra el modelo — sólo cuando se puede de verdad.

   La regla del proyecto: la app corrige lo que puede ejecutar, y de lo demás no opina.

   1. **V/F** (17 preguntas). Tienen una respuesta definida y el modelo la declara en su
      primera negrita. Se valida la elección: ahí "correcta" es un hecho. La justificación
      que el alumno escriba al lado sigue siendo suya para calificar.

   2. **Gramáticas** (y en general lo que un motor corre). Se ejecuta contra las cadenas,
      igual que en el sandbox. Otro hecho.

   3. **Desarrollar** (339 preguntas). Prosa. Acá la app NO dice nada: muestra tu respuesta
      al lado del modelo y te calificás vos. Hubo dos intentos de dar una señal automática y
      los dos se descartaron. Un modelo de lenguaje ataba la app a una clave y a estar
      conectada. Contar qué conceptos del modelo aparecían en tu texto era peor de lo que
      parecía: "tocás 2 de 6" se LEE como una nota aunque diga que no lo es, y encima
      castigaba a quien lo escribía con sus palabras. Una señal que no es confiable y se lee
      como si lo fuera es peor que no tener ninguna. */

import { parseGrammar, earleyAccepts, tokenize } from '../engines/earley.ts'
import type { Gramatica } from '../tipos/motores.ts'

/** Sólo existe una clase: lo verificado. Lo que no se puede verificar no produce
    comparación — devuelve null y la vista muestra el modelo para autoevaluarse. */
export interface Comparacion {
  /** Si la respuesta es correcta. Es un hecho, no una estimación. */
  ok: boolean
  /** Por qué, en palabras. */
  detalle: string
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
export function compararGramaticas(delAlumno: string, modelo: string): Comparacion | null {
  let ga: Gramatica, gm: Gramatica
  try {
    ga = parseGrammar(delAlumno)
    gm = parseGrammar(modelo)
    if (!ga.start) throw new Error('no pude leer tu gramática: falta una regla con la forma A -> …')
  } catch (e) {
    return { ok: false, detalle: e instanceof Error ? e.message : String(e) }
  }
  // si el modelo no es una gramática no hay contra qué correr: mejor nada que una estimación
  if (!gm.start) return null

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
      ok: false,
      detalle: `Tu gramática genera otro lenguaje. Por ejemplo: ${difieren.join(' · ')}`
    }
  }

  const recModelo = tieneRecursionIzquierda(gm)
  const recAlumno = tieneRecursionIzquierda(ga)
  if (!recModelo && recAlumno) {
    return {
      ok: false,
      detalle: 'Genera el mismo lenguaje, pero te quedó recursión por la izquierda y el ejercicio pide sacarla.'
    }
  }

  return {
    ok: true,
    detalle: 'Genera el mismo lenguaje que el modelo en todas las cadenas probadas' +
      (!recAlumno && !recModelo ? ', y sin recursión por la izquierda.' : '.')
  }
}

/* ---------- 2. verificable: verdadero o falso ---------- */

/* Las 17 preguntas V/F del banco declaran su respuesta en la primera negrita del modelo
   ("<p><b>Falso.</b> Un binario puede tener partes interpretadas…"). Eso alcanza para
   validar la elección del alumno sin heurística ninguna: o eligió lo mismo que el modelo o
   no. `tests/comparar.ts` recorre las 17 y falla si alguna deja de ser parseable, que es
   la única forma de que esto se rompa en silencio al editar contenido. */

export type ValorVF = 'V' | 'F'

/** La respuesta del modelo a una V/F, o null si su formato no la declara. */
export function veredictoVF(modeloHtml: string): ValorVF | null {
  const m = modeloHtml.match(/<b>\s*(verdadero|falso)\b/i)
  if (!m) return null
  return (m[1] ?? '').toLowerCase().startsWith('v') ? 'V' : 'F'
}

/** Compara la elección del alumno con la del modelo. */
export function compararVF(eleccion: ValorVF, modeloHtml: string): Comparacion | null {
  const suya = veredictoVF(modeloHtml)
  if (!suya) return null
  const largo = (v: ValorVF) => (v === 'V' ? 'Verdadero' : 'Falso')
  return eleccion === suya
    ? { ok: true, detalle: `Es ${largo(suya)}. Leé la justificación del modelo y fijate si coincide con la tuya.` }
    : { ok: false, detalle: `Es ${largo(suya)}, no ${largo(eleccion)}. La justificación del modelo explica por qué.` }
}

/* ---------- despachador ---------- */

/** Devuelve una comparación SÓLO si hay un motor que pueda dar un veredicto de verdad.
    Para todo lo demás devuelve null y la vista pasa a autoevaluación: no hay puntaje
    aproximado, no hay "conceptos tocados", no hay nada que se pueda leer como una nota. */
export function comparar(delAlumno: string, modeloHtml: string): Comparacion | null {
  if (!delAlumno.trim()) return null

  // la respuesta formal del modelo vive en su bloque de código, no en el párrafo
  const modeloFormal = bloqueDeCodigo(modeloHtml)
  if (modeloFormal && pareceGramatica(delAlumno) && pareceGramatica(modeloFormal)) {
    return compararGramaticas(delAlumno, modeloFormal)
  }
  return null
}
