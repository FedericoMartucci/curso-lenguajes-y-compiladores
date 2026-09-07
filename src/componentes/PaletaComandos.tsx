import { useEffect, useMemo, useRef, useState } from 'react'
import { LECCIONES } from '../lib/curso.ts'
import { SEMANAS } from '../lib/plan.ts'
import type { Ruta } from '../lib/router.ts'
import { TODOS_LOS_EJERCICIOS } from '../lib/ejercicios.ts'
import type { TipoEjercicio } from '../tipos/ejercicios.ts'

interface Item {
  clave: string
  seccion: string
  icono: string
  titulo: string
  sub: string
  /** Texto contra el que se busca. */
  busca: string
  ruta: Ruta
}

interface Props {
  abierta: boolean
  cerrar: () => void
  ir: (r: Ruta) => void
}

const ACCIONES: Item[] = [
  { clave: 'a:hoy', seccion: 'Ir a', icono: '→', titulo: 'Hoy', sub: 'Qué te toca esta semana', busca: 'hoy inicio panel', ruta: { v: 'inicio' } },
  { clave: 'a:plan', seccion: 'Ir a', icono: '→', titulo: 'Plan de estudio', sub: 'Las 16 semanas de la cursada', busca: 'plan semanas cronograma', ruta: { v: 'plan' } },
  { clave: 'a:ejerc', seccion: 'Ir a', icono: '→', titulo: 'Ejercitación', sub: 'Preguntas con repetición espaciada', busca: 'ejercitar preguntas repaso flashcards', ruta: { v: 'ejercitar' } },
  { clave: 'a:sandbox', seccion: 'Ir a', icono: '→', titulo: 'Sandbox', sub: 'Ejercicios que se validan ejecutándose', busca: 'sandbox validar ejercicios', ruta: { v: 'sandbox' } },
  { clave: 'a:examen', seccion: 'Ir a', icono: '→', titulo: 'Modo examen', sub: 'Tanda cronometrada con puntaje', busca: 'examen parcial simulacro cronometrado', ruta: { v: 'examen' } },
  { clave: 'a:mesa', seccion: 'Ir a', icono: '→', titulo: 'Mesa de trabajo', sub: 'Símbolos, bloc y árboles', busca: 'mesa borrador arbol simbolos', ruta: { v: 'mesa' } },
  { clave: 'a:practicas', seccion: 'Ir a', icono: '→', titulo: 'Enunciados', sub: 'Las 6 prácticas de la cátedra', busca: 'practicas enunciados consignas', ruta: { v: 'practicas' } },
  { clave: 'a:clases', seccion: 'Ir a', icono: '→', titulo: 'Clases grabadas', sub: 'Transcripciones', busca: 'clases transcripciones grabadas audio', ruta: { v: 'clases' } },
  { clave: 'a:ajustes', seccion: 'Ir a', icono: '→', titulo: 'Ajustes y cuenta', sub: 'Tema, ritmo, progreso', busca: 'ajustes cuenta tema oscuro ritmo', ruta: { v: 'ajustes' } }
]

/** Código corto de cada solapa, para ubicar el ejercicio de un vistazo en la lista. */
const CODIGO: Record<TipoEjercicio, string> = {
  er: 'ER', lex: 'LEX', glc: 'GLC', parsing: 'SLR', gci: 'GCI', asm: 'ASM'
}

/** Normaliza para buscar sin tildes: "leccion" encuentra "lección". */
const norm = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export default function PaletaComandos({ abierta, cerrar, ir }: Props) {
  const dlg = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)

  const indice = useMemo<Item[]>(() => [
    ...ACCIONES,
    ...SEMANAS.map((s) => ({
      clave: 'w:' + s.n, seccion: 'Plan', icono: 'S' + s.n,
      titulo: `Semana ${s.n} — ${s.tema}`,
      sub: s.cuando,
      busca: norm(`semana ${s.n} ${s.tema} ${s.cuando} ${s.hito ?? ''}`),
      ruta: { v: 'plan' } as Ruta
    })),
    ...LECCIONES.map((l) => ({
      clave: 'l:' + l.id, seccion: 'Lecciones', icono: l.id,
      titulo: l.titulo,
      sub: `Módulo ${l.mod.id} · ${l.mod.titulo}${l.aho ? ' · ' + l.aho : ''}`,
      busca: norm(`${l.id} ${l.titulo} ${l.mod.titulo} ${l.aho ?? ''}`),
      ruta: { v: 'leccion', id: l.id } as Ruta
    })),
    ...TODOS_LOS_EJERCICIOS.map((e) => ({
      clave: `e:${e.tipo}:${e.id}`, seccion: 'Ejercicios', icono: CODIGO[e.tipo],
      titulo: e.t,
      sub: `${e.etiquetaTipo} · ${e.grupo} · ${e.num}`,
      busca: norm(`${e.t} ${e.grupo} ${e.num} ${e.fuente} ${e.etiquetaTipo} ${e.notacion ?? ''}`),
      ruta: { v: 'sandbox', tipo: e.tipo, ej: e.id } as Ruta
    }))
  ], [])

  const resultados = useMemo(() => {
    const t = norm(q.trim())
    if (!t) return indice.filter((i) => i.seccion === 'Ir a').slice(0, 8)
    const partes = t.split(/\s+/)
    return indice
      .filter((i) => partes.every((p) => i.busca.includes(p)))
      .slice(0, 40)
  }, [q, indice])

  useEffect(() => { setSel(0) }, [q])

  useEffect(() => {
    const d = dlg.current
    if (!d) return
    if (abierta && !d.open) { d.showModal(); setQ(''); requestAnimationFrame(() => input.current?.focus()) }
    if (!abierta && d.open) d.close()
  }, [abierta])

  const elegir = (i: Item | undefined) => {
    if (!i) return
    ir(i.ruta)
    cerrar()
  }

  // agrupar preservando el orden de aparición
  const grupos = useMemo(() => {
    const out: { nombre: string; items: Item[] }[] = []
    resultados.forEach((r) => {
      let g = out.find((x) => x.nombre === r.seccion)
      if (!g) { g = { nombre: r.seccion, items: [] }; out.push(g) }
      g.items.push(r)
    })
    return out
  }, [resultados])

  const plano = grupos.flatMap((g) => g.items)

  return (
    <dialog
      ref={dlg} className="dlg" aria-label="Buscar en el curso"
      onClose={cerrar}
      onClick={(e) => { if (e.target === dlg.current) cerrar() }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(plano.length - 1, s + 1)) }
        if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)) }
        if (e.key === 'Enter') { e.preventDefault(); elegir(plano[sel]) }
      }}
    >
      <div className="dlg__caja">
        <div className="paleta__campo">
          <span className="paleta__lupa" aria-hidden="true">⌕</span>
          <input
            ref={input} type="text" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Buscá una lección, un ejercicio o una semana…"
            aria-label="Buscar" autoComplete="off" spellCheck={false}
          />
          <kbd>esc</kbd>
        </div>

        <div className="paleta__lista">
          {plano.length === 0 && (
            <p style={{ padding: 'var(--s5)', color: 'var(--ink-3)', textAlign: 'center' }}>
              Sin resultados para “{q}”. Probá con <code>SLR</code>, <code>polaca</code> o <code>coprocesador</code>.
            </p>
          )}
          {grupos.map((g) => (
            <div key={g.nombre}>
              <p className="paleta__seccion">{g.nombre}</p>
              {g.items.map((i) => {
                const ix = plano.indexOf(i)
                return (
                  <button
                    key={i.clave} type="button" className="paleta__item"
                    data-sel={ix === sel ? 'true' : undefined}
                    onMouseEnter={() => setSel(ix)}
                    onClick={() => elegir(i)}
                  >
                    <span className="paleta__item__icono" aria-hidden="true">{i.icono}</span>
                    <span className="paleta__item__cuerpo">
                      <span className="paleta__item__titulo">{i.titulo}</span>
                      <span className="paleta__item__sub">{i.sub}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="paleta__pie">
          <span><kbd>↑</kbd><kbd>↓</kbd> moverse</span>
          <span><kbd>↵</kbd> abrir</span>
          <span><kbd>esc</kbd> cerrar</span>
        </div>
      </div>
    </dialog>
  )
}
