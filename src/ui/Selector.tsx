import { useState, useRef, useEffect, useId, useCallback } from 'react'
import Icono from './Icono.tsx'

/* Dropdown propio.

   El `<select>` nativo abre una lista dibujada por el sistema operativo: en macOS sale con
   otra tipografía, otro tamaño y un resaltado azul que no pertenece a ningún sistema visual.
   Es el caso de "las partes que no dibujaste también son parte del diseño".

   Se comporta como un combobox de verdad: teclado completo, foco devuelto al cerrar, y
   `aria-activedescendant` para que el lector de pantalla anuncie la opción marcada. */

export interface OpcionSelector<T extends string | number> {
  valor: T
  etiqueta: string
  /** Segunda línea, opcional. */
  detalle?: string
}

interface Props<T extends string | number> {
  valor: T
  opciones: OpcionSelector<T>[]
  onCambio: (v: T) => void
  /** Se anuncia al lector de pantalla; no se dibuja. */
  etiqueta: string
  ancho?: number | string
}

export default function Selector<T extends string | number>({
  valor, opciones, onCambio, etiqueta, ancho
}: Props<T>) {
  const [abierto, setAbierto] = useState(false)
  const [marcada, setMarcada] = useState(() => Math.max(0, opciones.findIndex((o) => o.valor === valor)))
  const caja = useRef<HTMLDivElement>(null)
  const disparador = useRef<HTMLButtonElement>(null)
  const lista = useRef<HTMLUListElement>(null)
  const id = useId()

  const actual = opciones.find((o) => o.valor === valor) ?? opciones[0]

  const cerrar = useCallback((devolverFoco = true) => {
    setAbierto(false)
    if (devolverFoco) disparador.current?.focus()
  }, [])

  const elegir = useCallback((i: number) => {
    const o = opciones[i]
    if (!o) return
    onCambio(o.valor)
    cerrar()
  }, [opciones, onCambio, cerrar])

  // al abrir, la marcada arranca en la seleccionada
  useEffect(() => {
    if (abierto) setMarcada(Math.max(0, opciones.findIndex((o) => o.valor === valor)))
  }, [abierto, opciones, valor])

  // cerrar al hacer clic afuera
  useEffect(() => {
    if (!abierto) return
    const on = (e: MouseEvent) => {
      if (!caja.current?.contains(e.target as Node)) cerrar(false)
    }
    document.addEventListener('mousedown', on)
    return () => document.removeEventListener('mousedown', on)
  }, [abierto, cerrar])

  // mantener la marcada a la vista
  useEffect(() => {
    if (!abierto) return
    lista.current?.querySelector<HTMLElement>('[data-marcada="true"]')
      ?.scrollIntoView({ block: 'nearest' })
  }, [abierto, marcada])

  const teclas = (e: React.KeyboardEvent) => {
    if (!abierto) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setAbierto(true) }
      return
    }
    if (e.key === 'Escape') { e.preventDefault(); cerrar(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setMarcada((i) => Math.min(opciones.length - 1, i + 1)); return }
    if (e.key === 'ArrowUp') { e.preventDefault(); setMarcada((i) => Math.max(0, i - 1)); return }
    if (e.key === 'Home') { e.preventDefault(); setMarcada(0); return }
    if (e.key === 'End') { e.preventDefault(); setMarcada(opciones.length - 1); return }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegir(marcada); return }
    if (e.key === 'Tab') { cerrar(false); return }
    // escribir una letra salta a la primera opción que empieza así
    if (e.key.length === 1) {
      const i = opciones.findIndex((o) => o.etiqueta.toLowerCase().startsWith(e.key.toLowerCase()))
      if (i >= 0) setMarcada(i)
    }
  }

  return (
    <div className="selector" ref={caja} style={ancho ? { width: ancho } : undefined}>
      <button
        ref={disparador} type="button" className="selector__disparador"
        aria-haspopup="listbox" aria-expanded={abierto} aria-label={etiqueta}
        aria-controls={abierto ? id : undefined}
        onClick={() => setAbierto((v) => !v)} onKeyDown={teclas}
      >
        <span className="selector__valor">{actual?.etiqueta ?? ''}</span>
        <Icono nombre="chevron" tam={13} className="selector__flecha" />
      </button>

      {abierto && (
        <ul
          ref={lista} id={id} className="selector__lista" role="listbox"
          aria-label={etiqueta}
          aria-activedescendant={`${id}-${marcada}`}
          tabIndex={-1} onKeyDown={teclas}
        >
          {opciones.map((o, i) => (
            <li
              key={String(o.valor)} id={`${id}-${i}`} role="option"
              aria-selected={o.valor === valor}
              data-marcada={i === marcada ? 'true' : undefined}
              className="selector__opcion"
              onMouseEnter={() => setMarcada(i)}
              onClick={() => elegir(i)}
            >
              <span className="selector__check">
                {o.valor === valor && <Icono nombre="check" tam={13} />}
              </span>
              <span className="selector__texto">
                <span>{o.etiqueta}</span>
                {o.detalle && <span className="selector__detalle">{o.detalle}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
