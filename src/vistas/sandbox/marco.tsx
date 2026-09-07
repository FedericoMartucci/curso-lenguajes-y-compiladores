/* Piezas compartidas por las seis solapas del sandbox: el índice de ejercicios,
   la cabecera de un ejercicio y el hook que guarda el borrador. */

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { TipoEjercicio, Decorado, EjercicioBase } from '../../tipos/ejercicios.ts'
import { agrupar } from '../../lib/ejercicios.ts'
import { useProgreso } from '../../lib/progreso.tsx'
import type { Ruta } from '../../lib/router.ts'
import Enlace from '../../componentes/Enlace.tsx'
import Pill from '../../ui/Pill.tsx'
import Boton from '../../ui/Boton.tsx'

/* ---------- índice lateral: reemplaza al <select> de 32 opciones ---------- */

export type FiltroIndice = 'todos' | 'pendientes'

interface IndiceProps<E extends EjercicioBase> {
  tipo: TipoEjercicio
  lista: Decorado<E>[]
  actual: string
  ir: (r: Ruta) => void
}

export function IndiceEjercicios<E extends EjercicioBase>({ tipo, lista, actual, ir }: IndiceProps<E>) {
  const { resuelto } = useProgreso()
  const [filtro, setFiltro] = useState<FiltroIndice>('todos')

  const visibles = useMemo(
    () => (filtro === 'pendientes' ? lista.filter((e) => !resuelto(tipo, e.id)) : lista),
    [lista, filtro, tipo, resuelto]
  )
  const grupos = useMemo(() => agrupar(visibles), [visibles])
  const hechos = lista.filter((e) => resuelto(tipo, e.id)).length

  return (
    <aside className="sb__indice" aria-label="Ejercicios de esta solapa">
      <div className="sb__indice__hd">
        <span style={{ fontFamily: 'var(--mono)' }}>{hechos}/{lista.length}</span>
        <div className="segmentado" style={{ marginLeft: 'auto' }} role="group" aria-label="Filtrar ejercicios">
          <button type="button" aria-pressed={filtro === 'todos'} onClick={() => setFiltro('todos')}>Todos</button>
          <button type="button" aria-pressed={filtro === 'pendientes'} onClick={() => setFiltro('pendientes')}>Pendientes</button>
        </div>
      </div>
      <div className="sb__indice__lista">
        {grupos.length === 0 && (
          <p style={{ padding: 'var(--s4)', color: 'var(--ink-3)', fontSize: 'var(--fs-sm)' }}>
            Resolviste todos los de esta solapa.
          </p>
        )}
        {grupos.map((g) => (
          <div key={g.nombre}>
            <p className="sb__grupo">{g.nombre}</p>
            {g.items.map((e) => {
              // los números cortos ('1a', '4c') van en columna; los largos ('constante Float')
              // no entran y se leen mejor como prefijo del título
              const corto = e.num.length <= 7
              return (
                <Enlace
                  key={e.id} a={{ v: 'sandbox', tipo, ej: e.id }} ir={ir}
                  className="sb__ej" activo={e.id === actual}
                >
                  {corto && <span className="sb__ej__num">{e.num}</span>}
                  <span className="sb__ej__t">
                    {!corto && <span className="sb__ej__pref">{e.num} · </span>}
                    {e.t}
                  </span>
                  {resuelto(tipo, e.id) && <span className="sb__ej__tick" aria-label="resuelto">✓</span>}
                </Enlace>
              )
            })}
          </div>
        ))}
      </div>
    </aside>
  )
}

/* ---------- cabecera de un ejercicio ---------- */

interface EncabezadoProps {
  tipo: TipoEjercicio
  e: Decorado<EjercicioBase>
  /** Cuántos casos de prueba tiene, para decirlo antes de validar. */
  casos: number
  lista: Decorado<EjercicioBase>[]
  ir: (r: Ruta) => void
  extra?: ReactNode
}

export function EncabezadoEjercicio({ tipo, e, casos, lista, ir, extra }: EncabezadoProps) {
  const { resuelto, ejercicio } = useProgreso()
  const ix = lista.findIndex((x) => x.id === e.id)
  const prev = lista[ix - 1]
  const next = lista[ix + 1]
  const est = ejercicio(tipo, e.id)

  return (
    <>
      <div className="tira" style={{ justifyContent: 'space-between', marginBottom: 'var(--s3)' }}>
        <div className="tira" style={{ gap: 'var(--s2)' }}>
          <Pill tono="neutra" mono>{e.grupo} · {e.num}</Pill>
          <Pill tono={e.nivel === 'difícil' ? 'aviso' : 'neutra'}>{e.nivel}</Pill>
          <Pill tono="neutra">{casos} {casos === 1 ? 'caso' : 'casos'}</Pill>
          {resuelto(tipo, e.id) && <Pill tono="ok">✓ resuelto</Pill>}
          {!resuelto(tipo, e.id) && est && est.intentos > 0 && (
            <Pill tono="neutra">{est.intentos} {est.intentos === 1 ? 'intento' : 'intentos'}</Pill>
          )}
        </div>
        <div className="tira" style={{ gap: 'var(--s2)' }}>
          <Boton tamaño="sm" variante="ghost" disabled={!prev}
                 onClick={() => prev && ir({ v: 'sandbox', tipo, ej: prev.id })}>‹ anterior</Boton>
          <Boton tamaño="sm" variante="ghost" disabled={!next}
                 onClick={() => next && ir({ v: 'sandbox', tipo, ej: next.id })}>siguiente ›</Boton>
        </div>
      </div>

      <h3 style={{ fontSize: 'var(--fs-xl)', marginBottom: 'var(--s3)' }}>{e.t}</h3>
      <p className="consigna">{e.c}</p>
      {e.nota && (
        <div className="honestidad">
          <span aria-hidden="true">!</span>
          <p><b>Qué valida y qué no:</b> {e.nota}</p>
        </div>
      )}
      {extra}
    </>
  )
}

/* ---------- borrador por ejercicio ---------- */

/** Guarda lo que escribe el alumno por ejercicio, para que el refresh no se lo lleve.
    Devuelve los campos y un setter por campo. */
export function useBorrador(
  tipo: TipoEjercicio,
  id: string,
  inicial: Record<string, string>
): [Record<string, string>, (campo: string, valor: string) => void, () => void] {
  const { ejercicio, guardarBorrador } = useProgreso()
  const guardado = ejercicio(tipo, id)?.borrador

  const [campos, setCampos] = useState<Record<string, string>>(() => ({ ...inicial, ...guardado }))

  // al cambiar de ejercicio se recarga lo suyo, no lo del anterior
  useEffect(() => {
    setCampos({ ...inicial, ...(ejercicio(tipo, id)?.borrador ?? {}) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, id])

  // se persiste con retraso: no escribe localStorage en cada tecla
  useEffect(() => {
    const t = setTimeout(() => guardarBorrador(tipo, id, campos), 500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campos, tipo, id])

  const set = useCallback((campo: string, valor: string) => {
    setCampos((c) => ({ ...c, [campo]: valor }))
  }, [])

  const limpiar = useCallback(() => setCampos({ ...inicial }), [inicial])

  return [campos, set, limpiar]
}
