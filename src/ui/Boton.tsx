import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type VarianteBoton = 'primary' | 'secondary' | 'ghost' | 'danger'
export type TamañoBoton = 'sm' | 'md'

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variante?: VarianteBoton
  tamaño?: TamañoBoton
  cargando?: boolean
  /** Atajo que dispara la misma acción. Se muestra dentro del botón: el atajo se aprende viéndolo. */
  tecla?: string
  children: ReactNode
  clase?: string
}

/** El único botón de la app. Cubre los siete estados: default, hover, focus, active,
    disabled, loading y —vía `aria-invalid` en el campo asociado— error. */
export default function Boton({
  variante = 'secondary', tamaño = 'md', cargando = false, tecla,
  children, clase, disabled, ...resto
}: Props) {
  return (
    <button
      {...resto}
      disabled={disabled || cargando}
      data-cargando={cargando ? 'true' : undefined}
      aria-busy={cargando || undefined}
      className={`btn btn--${variante} btn--${tamaño}${clase ? ' ' + clase : ''}`}
    >
      {cargando && <span className="btn__spinner" aria-hidden="true" />}
      {children}
      {tecla && !cargando && <span className="btn__tecla" aria-hidden="true">{tecla}</span>}
    </button>
  )
}
