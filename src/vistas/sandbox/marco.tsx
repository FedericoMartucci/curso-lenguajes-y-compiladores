/* Piezas compartidas por las seis solapas del sandbox: el índice de ejercicios,
   la cabecera de un ejercicio y el hook que guarda el borrador. */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import type { TipoEjercicio, Decorado, EjercicioBase } from '../../tipos/ejercicios.ts'
import { agrupar, numeroVisible } from '../../lib/ejercicios.ts'
import { useProgreso } from '../../lib/progreso.tsx'
import type { Ruta } from '../../lib/router.ts'
import Enlace from '../../componentes/Enlace.tsx'
import Pill from '../../ui/Pill.tsx'
import Boton from '../../ui/Boton.tsx'
import Icono from '../../ui/Icono.tsx'

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
              const num = numeroVisible(e.num)
              return (
                <Enlace
                  key={e.id} a={{ v: 'sandbox', tipo, ej: e.id }} ir={ir}
                  className={'sb__ej' + (num ? '' : ' sb__ej--sin-num')} activo={e.id === actual}
                >
                  {num && <span className="sb__ej__num" title={num}>{num}</span>}
                  <span className="sb__ej__t">{e.t}</span>
                  {resuelto(tipo, e.id) && <Icono nombre="check" tam={13} titulo="resuelto" className="sb__ej__tick" />}
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
          <Pill tono="neutra" mono>{e.grupo}{numeroVisible(e.num) ? ` · ${e.num}` : ''}</Pill>
          <Pill tono={e.nivel === 'difícil' ? 'aviso' : 'neutra'}>{e.nivel}</Pill>
          <Pill tono="neutra">{casos} {casos === 1 ? 'caso' : 'casos'}</Pill>
          {resuelto(tipo, e.id) && <Pill tono="ok"><Icono nombre="check" tam={12} />resuelto</Pill>}
          {!resuelto(tipo, e.id) && est && est.intentos > 0 && (
            <Pill tono="neutra">{est.intentos} {est.intentos === 1 ? 'intento' : 'intentos'}</Pill>
          )}
        </div>
        <div className="tira" style={{ gap: 'var(--s2)' }}>
          <Boton tamaño="sm" variante="ghost" disabled={!prev}
                 onClick={() => prev && ir({ v: 'sandbox', tipo, ej: prev.id })}>
            <Icono nombre="chevron" tam={13} style={{ transform: 'rotate(180deg)' }} />anterior
          </Boton>
          <Boton tamaño="sm" variante="ghost" disabled={!next}
                 onClick={() => next && ir({ v: 'sandbox', tipo, ej: next.id })}>
            siguiente<Icono nombre="chevron" tam={13} />
          </Boton>
        </div>
      </div>

      <h3 style={{ fontSize: 'var(--fs-xl)', marginBottom: 'var(--s3)' }}>{e.t}</h3>
      <p className="consigna">{e.c}</p>
      {e.nota && (
        <div className="honestidad">
          <Icono nombre="libro" tam={16} />
          <p><b>Qué valida y qué no:</b> {e.nota}</p>
        </div>
      )}
      {extra}
    </>
  )
}

/* ---------- después de resolver ---------- */

interface TrasResolverProps {
  /** true solo cuando la validación que se acaba de correr pasó. */
  ok: boolean
  tipo: TipoEjercicio
  actual: string
  lista: Decorado<EjercicioBase>[]
  ir: (r: Ruta) => void
}

/** El paso natural después de un ✓ es el ejercicio siguiente, no volver al índice. */
export function TrasResolver({ ok, tipo, actual, lista, ir }: TrasResolverProps) {
  const { resuelto } = useProgreso()
  if (!ok) return null

  const ix = lista.findIndex((x) => x.id === actual)
  // el siguiente sin resolver, o simplemente el siguiente si ya están todos
  const pendiente = lista.slice(ix + 1).find((x) => !resuelto(tipo, x.id))
  const siguiente = pendiente ?? lista[ix + 1]
  const quedan = lista.filter((x) => !resuelto(tipo, x.id)).length

  if (!siguiente) {
    return (
      <div className="tras-resolver">
        <p>Terminaste todos los ejercicios de esta solapa.</p>
      </div>
    )
  }

  return (
    <div className="tras-resolver">
      <div>
        <p className="tras-resolver__t">Sigue: {siguiente.t}</p>
        <p className="tras-resolver__sub">
          {quedan === 0 ? 'No queda ninguno pendiente' : `${quedan} ${quedan === 1 ? 'pendiente' : 'pendientes'} en esta solapa`}
        </p>
      </div>
      <Boton variante="primary" onClick={() => ir({ v: 'sandbox', tipo, ej: siguiente.id })}>
        Siguiente ejercicio
        <Icono nombre="flecha" tam={15} />
      </Boton>
    </div>
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

  const [campos, setCampos] = useState<Record<string, string>>(
    () => ({ ...inicial, ...(ejercicio(tipo, id)?.borrador ?? {}) })
  )
  // solo se persiste después de la primera edición real. Montar un ejercicio y no tocarlo
  // no tiene que dejar rastro: si no, se crean entradas de ejercicios nunca intentados.
  const tocado = useRef(false)

  // al cambiar de ejercicio se recarga lo suyo, no lo del anterior
  useEffect(() => {
    tocado.current = false
    setCampos({ ...inicial, ...(ejercicio(tipo, id)?.borrador ?? {}) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, id])

  // se persiste con retraso: no escribe en cada tecla
  useEffect(() => {
    if (!tocado.current) return
    const t = setTimeout(() => guardarBorrador(tipo, id, campos), 600)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campos, tipo, id])

  const set = useCallback((campo: string, valor: string) => {
    tocado.current = true
    setCampos((c) => ({ ...c, [campo]: valor }))
  }, [])

  const limpiar = useCallback(() => {
    tocado.current = true
    setCampos({ ...inicial })
  }, [inicial])

  return [campos, set, limpiar]
}
