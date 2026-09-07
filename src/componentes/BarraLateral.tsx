import { useMemo, useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { CURSO, LECCIONES } from '../lib/curso.ts'
import type { Parcial } from '../tipos/curso.ts'
import type { Ruta } from '../lib/router.ts'
import { useProgreso } from '../lib/progreso.tsx'
import { semana as semanaDe } from '../lib/plan.ts'
import { useEscape } from '../lib/hooks.ts'
import Enlace from './Enlace.tsx'
import { Barra } from '../ui/Progreso.tsx'
import EstadoSync from './EstadoSync.tsx'

interface Props {
  ruta: Ruta
  ir: (r: Ruta) => void
  abierta: boolean
  cerrar: () => void
  abrirPaleta: () => void
  /** Cuántas preguntas tocan hoy, para el aviso de Ejercitación. */
  vencidas: number
  resueltos: number
  totalEjercicios: number
}

type FiltroParcial = 'todo' | 'I' | 'II'

const enParcial = (p: Parcial, f: FiltroParcial): boolean =>
  f === 'todo' || p === f || p === 'I y II'

export default function BarraLateral({
  ruta, ir, abierta, cerrar, abrirPaleta, vencidas, resueltos, totalEjercicios
}: Props) {
  const { progreso, leida } = useProgreso()
  const [filtro, setFiltro] = useState<FiltroParcial>('todo')
  const ref = useRef<HTMLElement>(null)

  const leccionActiva = ruta.v === 'leccion' ? ruta.id : null
  const modActivo = leccionActiva ? LECCIONES.find((l) => l.id === leccionActiva)?.mod.id : undefined

  const [abiertos, setAbiertos] = useState<Set<number>>(() => new Set(modActivo !== undefined ? [modActivo] : []))
  useEffect(() => {
    if (modActivo !== undefined) setAbiertos((s) => (s.has(modActivo) ? s : new Set(s).add(modActivo)))
  }, [modActivo])

  useEscape(abierta, cerrar)

  // el drawer atrapa el foco: en mobile no se puede tabular al fondo mientras está abierto
  useEffect(() => {
    if (!abierta || !ref.current) return
    const primero = ref.current.querySelector<HTMLElement>('a, button')
    primero?.focus()
  }, [abierta])

  const sem = semanaDe(progreso.semana)
  const leidasSemana = useMemo(() => {
    const ids = LECCIONES.filter((l) => sem.modulos.includes(l.mod.id)).map((l) => l.id)
    const hechas = ids.filter((id) => leida(id)).length
    return { hechas, total: ids.length }
  }, [sem, progreso.leidas]) // eslint-disable-line react-hooks/exhaustive-deps

  const pctSemana = leidasSemana.total ? leidasSemana.hechas / leidasSemana.total : 1

  return (
    <aside className="lateral" data-abierta={abierta ? 'true' : 'false'} ref={ref} aria-label="Navegación del curso">
      <div className="lateral__fijo">
        <Enlace a={{ v: 'inicio' }} ir={ir} className="marca">
          <h1>Lenguajes y Compiladores</h1>
          <p>UNLaM · 1124/3663</p>
        </Enlace>

        <Enlace a={{ v: 'plan' }} ir={ir} className="semana-chip">
          <span className="semana-chip__top">
            <span className="semana-chip__n">Semana {sem.n}</span>
            <span className="semana-chip__pct">
              {leidasSemana.total ? `${leidasSemana.hechas}/${leidasSemana.total}` : sem.clase}
            </span>
          </span>
          <span className="semana-chip__tema">{sem.tema}</span>
          <Barra valor={pctSemana} tono={pctSemana >= 1 ? 'ok' : 'acento'} />
        </Enlace>

        <button type="button" className="buscador-btn" onClick={abrirPaleta}>
          <span aria-hidden="true">⌕</span>
          <span className="buscador-btn__t">Buscar…</span>
          <kbd>⌘K</kbd>
        </button>
      </div>

      <div className="lateral__scroll">
        <nav className="nav">
          <NavLink a={{ v: 'inicio' }} ir={ir} activo={ruta.v === 'inicio'}>Hoy</NavLink>
          <NavLink a={{ v: 'plan' }} ir={ir} activo={ruta.v === 'plan'}>Plan de estudio</NavLink>

          <div className="nav__grupo"><h2>Practicar</h2></div>
          <NavLink a={{ v: 'ejercitar' }} ir={ir} activo={ruta.v === 'ejercitar'}
                   aviso={vencidas > 0 ? String(vencidas) : undefined}>
            Ejercitación
          </NavLink>
          <NavLink a={{ v: 'sandbox' }} ir={ir} activo={ruta.v === 'sandbox'}
                   cuenta={`${resueltos}/${totalEjercicios}`}>
            Sandbox
          </NavLink>
          <NavLink a={{ v: 'examen' }} ir={ir} activo={ruta.v === 'examen'}>Modo examen</NavLink>

          <div className="nav__grupo"><h2>Material</h2></div>
          <NavLink a={{ v: 'practicas' }} ir={ir} activo={ruta.v === 'practicas'}>Enunciados</NavLink>
          <NavLink a={{ v: 'clases' }} ir={ir} activo={ruta.v === 'clases'}>Clases grabadas</NavLink>
          <NavLink a={{ v: 'mesa' }} ir={ir} activo={ruta.v === 'mesa'}>Mesa de trabajo</NavLink>

          <div className="nav__grupo">
            <h2>Teoría</h2>
          </div>
          <div className="arbol__filtros" role="group" aria-label="Filtrar módulos por parcial">
            {(['todo', 'I', 'II'] as FiltroParcial[]).map((f) => (
              <button
                key={f} type="button" className="chip"
                aria-pressed={filtro === f}
                onClick={() => setFiltro(f)}
              >
                {f === 'todo' ? 'Todo' : 'Parcial ' + f}
              </button>
            ))}
          </div>

          {CURSO.modulos.filter((m) => enParcial(m.parcial, filtro)).map((m) => {
            const abierto = abiertos.has(m.id)
            const hechas = m.lecciones.filter((l) => leida(l.id)).length
            const completo = hechas === m.lecciones.length
            return (
              <div key={m.id}>
                <button
                  type="button"
                  className={'mod' + (completo ? ' mod--completo' : '')}
                  aria-expanded={abierto}
                  onClick={() => setAbiertos((s) => {
                    const n = new Set(s)
                    if (n.has(m.id)) n.delete(m.id); else n.add(m.id)
                    return n
                  })}
                >
                  <span className="mod__flecha" aria-hidden="true">▶</span>
                  <span className="mod__n">{m.id}</span>
                  <span className="mod__t">{m.titulo}</span>
                  <span className="mod__cuenta">{hechas}/{m.lecciones.length}</span>
                </button>
                {abierto && m.lecciones.map((l) => (
                  <Enlace
                    key={l.id} a={{ v: 'leccion', id: l.id }} ir={ir}
                    className="les" activo={leccionActiva === l.id}
                    alNavegar={cerrar}
                  >
                    <span className="les__n">{l.id}</span>
                    <span className="les__t">{l.titulo}</span>
                    {leida(l.id) && <span className="les__tick" aria-label="leída">✓</span>}
                  </Enlace>
                ))}
              </div>
            )
          })}
        </nav>
      </div>

      <div className="lateral__pie">
        <Enlace a={{ v: 'ajustes' }} ir={ir} className="nav__link" activo={ruta.v === 'ajustes'}
                style={{ flex: 1 }}>
          <span className="nav__link__texto">Ajustes y cuenta</span>
        </Enlace>
        <EstadoSync />
      </div>
    </aside>
  )
}

function NavLink(
  { a, ir, activo, children, cuenta, aviso }:
  { a: Ruta; ir: (r: Ruta) => void; activo: boolean; children: ReactNode; cuenta?: string; aviso?: string }
) {
  return (
    <Enlace a={a} ir={ir} className="nav__link" activo={activo}>
      <span className="nav__link__texto">{children}</span>
      {aviso && <span className="nav__link__aviso" title="preguntas que tocan hoy">{aviso}</span>}
      {cuenta && <span className="nav__link__cuenta">{cuenta}</span>}
    </Enlace>
  )
}
