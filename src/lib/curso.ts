/* Capa de acceso al contenido del curso.

   El índice (títulos, módulos, referencias) viaja en el bundle inicial porque lo necesita
   toda la navegación. El contenido de las lecciones —719 kB de HTML y respuestas— se carga
   con import() dinámico solo cuando alguien va a leer o a ejercitar. */

import { INDICE } from '../data/indice.ts'
import type {
  CursoIndice, ModuloIndice, LeccionIndice, LeccionPlana, CuerpoLeccion, ContenidoLecciones,
  Badge, TipoPregunta, PreguntaBanco
} from '../tipos/curso.ts'

export const CURSO: CursoIndice = INDICE

/** Todas las lecciones en orden, con referencia a su módulo y su índice global. */
export const LECCIONES: LeccionPlana[] = (() => {
  const out: LeccionPlana[] = []
  INDICE.modulos.forEach((m: ModuloIndice) =>
    m.lecciones.forEach((l: LeccionIndice) => out.push({ ...l, mod: m, ix: out.length }))
  )
  return out
})()

export const LECCION_POR_ID: Record<string, LeccionPlana | undefined> =
  Object.fromEntries(LECCIONES.map((l) => [l.id, l]))

export interface ProgresoCurso { total: number; dictadas: number; pct: number }

/** Cobertura del CONTENIDO, no del alumno. Solo se muestra en Ajustes. */
export function coberturaContenido(): ProgresoCurso {
  const total = LECCIONES.length
  const dictadas = LECCIONES.filter((l) => l.estado === 'dictada').length
  return { total, dictadas, pct: total ? Math.round((dictadas / total) * 100) : 0 }
}

/* ---------- carga diferida del contenido ---------- */

let cache: ContenidoLecciones | null = null
let enVuelo: Promise<ContenidoLecciones> | null = null

/** Carga el cuerpo de todas las lecciones. Se pide una sola vez y queda cacheado. */
export function cargarContenido(): Promise<ContenidoLecciones> {
  if (cache) return Promise.resolve(cache)
  if (!enVuelo) {
    enVuelo = import('../data/contenido.ts').then((m) => {
      cache = m.CONTENIDO
      return cache
    })
  }
  return enVuelo
}

/** El contenido si ya está en memoria. Sirve para renderizar sin parpadeo en la segunda visita. */
export const contenidoCargado = (): ContenidoLecciones | null => cache

export async function cargarLeccion(id: string): Promise<CuerpoLeccion | undefined> {
  const c = await cargarContenido()
  return c[id]
}

/* ---------- banco de preguntas ---------- */

/** Clasifica una pregunta del banco por tipo, para los filtros de ejercitación. */
export function clasificar(q: string, badges?: Badge[]): TipoPregunta {
  const t = (q || '').toLowerCase()
  if (t.includes('v/f') || t.includes('verdadero o falso')) return 'vf'
  if ((badges || []).includes('⚙️')) return 'practico'
  if (/^(resolvé|escribí|definí|construí|calculá|dá los|dá la|traducí|aplic|factoriz|eliminá|reescrib|dibujá|derivá|hacé|pasá|armá|mostralo|relacioná)/i.test(q || '')) return 'practico'
  return 'desarrollar'
}

/** Identificadores de todas las preguntas, sin cargar el contenido.
    El qid es `${idLeccion}#${indice}` y el índice conoce cuántas hay por lección. */
export const QIDS: { qid: string; lid: string; modId: number }[] = LECCIONES.flatMap((l) =>
  Array.from({ length: l.nq }, (_, i) => ({ qid: `${l.id}#${i}`, lid: l.id, modId: l.mod.id }))
)

export const TOTAL_PREGUNTAS = QIDS.length

let bancoCache: PreguntaBanco[] | null = null

/** Banco plano de preguntas con su procedencia. Requiere el contenido. */
export async function cargarBanco(): Promise<PreguntaBanco[]> {
  if (bancoCache) return bancoCache
  const contenido = await cargarContenido()
  const out: PreguntaBanco[] = []
  LECCIONES.forEach((l) => {
    const cuerpo = contenido[l.id]
    ;(cuerpo?.qa ?? []).forEach((p, idx) => {
      out.push({
        qid: `${l.id}#${idx}`,
        modId: l.mod.id, modT: l.mod.titulo,
        lid: l.id, lt: l.titulo,
        q: p.q, a: p.a,
        tipo: clasificar(p.q, l.badges)
      })
    })
  })
  bancoCache = out
  return out
}

export const bancoCargado = (): PreguntaBanco[] | null => bancoCache

/** Quita las etiquetas HTML. Los enunciados traen <code> y <b>: para buscar y para
    los lectores de pantalla hace falta el texto pelado. */
export const sinEtiquetas = (h: string): string =>
  (h || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()

export const TIPO_LABEL: Record<TipoPregunta, string> = {
  vf: 'Verdadero / Falso',
  practico: 'Práctico',
  desarrollar: 'Desarrollar'
}

export type {
  CursoIndice, ModuloIndice, LeccionIndice, LeccionPlana, CuerpoLeccion,
  PreguntaBanco, TipoPregunta
}
