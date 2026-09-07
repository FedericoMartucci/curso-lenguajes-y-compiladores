import { CURSO } from '../data/curso.ts'
import type {
  Curso, Modulo, Leccion, LeccionPlana, Badge, TipoPregunta, PreguntaBanco
} from '../tipos/curso.ts'

/** Todas las lecciones en orden, con referencia a su módulo y su índice global. */
export const LECCIONES: LeccionPlana[] = (() => {
  const out: LeccionPlana[] = []
  CURSO.modulos.forEach((m: Modulo) => m.lecciones.forEach((l: Leccion) => out.push({ ...l, mod: m, ix: out.length })))
  return out
})()

export const LECCION_POR_ID: Record<string, LeccionPlana | undefined> =
  Object.fromEntries(LECCIONES.map((l) => [l.id, l]))

export interface ProgresoCurso {
  total: number
  dictadas: number
  pct: number
}

/** Cobertura del CONTENIDO, no del alumno. Solo se usa en la vista de créditos del curso. */
export function coberturaContenido(): ProgresoCurso {
  const total = LECCIONES.length
  const dictadas = LECCIONES.filter((l) => l.estado === 'dictada').length
  return { total, dictadas, pct: total ? Math.round((dictadas / total) * 100) : 0 }
}

/** Clasifica una pregunta del banco por tipo, para los filtros de ejercitación. */
export function clasificar(q: string, badges?: Badge[]): TipoPregunta {
  const t = (q || '').toLowerCase()
  if (t.includes('v/f') || t.includes('verdadero o falso')) return 'vf'
  if ((badges || []).includes('⚙️')) return 'practico'
  if (/^(resolvé|escribí|definí|construí|calculá|dá los|dá la|traducí|aplic|factoriz|eliminá|reescrib|dibujá|derivá|hacé|pasá|armá|mostralo|relacioná)/i.test(q || '')) return 'practico'
  return 'desarrollar'
}

/** Banco plano de preguntas con su procedencia. */
export const BANCO: PreguntaBanco[] = (() => {
  const out: PreguntaBanco[] = []
  LECCIONES.forEach((l) => {
    (l.qa || []).forEach((p, idx) => {
      out.push({
        qid: `${l.id}#${idx}`,
        modId: l.mod.id, modT: l.mod.titulo,
        lid: l.id, lt: l.titulo,
        q: p.q, a: p.a,
        tipo: clasificar(p.q, l.badges)
      })
    })
  })
  return out
})()

export const TIPO_LABEL: Record<TipoPregunta, string> = {
  vf: 'Verdadero / Falso',
  practico: 'Práctico',
  desarrollar: 'Desarrollar'
}

const sinEtiquetas = (h: string | undefined): string => (h || '').replace(/<[^>]+>/g, ' ')

/** Búsqueda simple sobre título, id, referencia y texto de la lección. */
export function buscarLecciones(term: string): LeccionPlana[] {
  const t = (term || '').toLowerCase().trim()
  if (t.length < 2) return []
  return LECCIONES.filter((l) => {
    const hay = `${l.id} ${l.titulo} ${l.aho || ''} ${sinEtiquetas(l.html)} ${(l.qa || []).map((q) => q.q + ' ' + sinEtiquetas(q.a)).join(' ')}`.toLowerCase()
    return hay.includes(t)
  })
}

export { CURSO }
export type { Curso, Modulo, Leccion, LeccionPlana, PreguntaBanco, TipoPregunta }
