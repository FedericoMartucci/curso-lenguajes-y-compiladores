import { CURSO } from '../data/curso.js'

/** Todas las lecciones en orden, con referencia a su módulo y su índice global. */
export const LECCIONES = (() => {
  const out = []
  CURSO.modulos.forEach((m) => m.lecciones.forEach((l) => out.push({ ...l, mod: m, ix: out.length })))
  return out
})()

export const LECCION_POR_ID = Object.fromEntries(LECCIONES.map((l) => [l.id, l]))

export function progresoCurso() {
  const total = LECCIONES.length
  const dictadas = LECCIONES.filter((l) => l.estado === 'dictada').length
  return { total, dictadas, pct: total ? Math.round((dictadas / total) * 100) : 0 }
}

/** Clasifica una pregunta del banco por tipo, para los filtros de ejercitación. */
export function clasificar(q, badges) {
  const t = (q || '').toLowerCase()
  if (t.includes('v/f') || t.includes('verdadero o falso')) return 'vf'
  if ((badges || []).includes('⚙️')) return 'practico'
  if (/^(resolvé|escribí|definí|construí|calculá|dá los|dá la|traducí|aplic|factoriz|eliminá|reescrib|dibujá|derivá|hacé|pasá|armá|mostralo|relacioná)/i.test(q || '')) return 'practico'
  return 'desarrollar'
}

/** Banco plano de preguntas con su procedencia. */
export const BANCO = (() => {
  const out = []
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

export const TIPO_LABEL = { vf: 'Verdadero / Falso', practico: 'Práctico', desarrollar: 'Desarrollar' }

/** Búsqueda simple sobre título, id, referencia y texto de la lección. */
export function buscarLecciones(term) {
  const t = (term || '').toLowerCase().trim()
  if (t.length < 2) return []
  const strip = (h) => (h || '').replace(/<[^>]+>/g, ' ')
  return LECCIONES.filter((l) => {
    const hay = `${l.id} ${l.titulo} ${l.aho || ''} ${strip(l.html)} ${(l.qa || []).map((q) => q.q + ' ' + strip(q.a)).join(' ')}`.toLowerCase()
    return hay.includes(t)
  })
}

export { CURSO }
