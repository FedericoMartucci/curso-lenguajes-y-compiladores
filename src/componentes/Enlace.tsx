import type { AnchorHTMLAttributes, ReactNode } from 'react'
import type { Ruta } from '../lib/router.ts'
import { aHref, alClicNavegar } from '../lib/router.ts'

interface Props extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> {
  a: Ruta
  ir: (r: Ruta) => void
  activo?: boolean
  /** Efecto adicional al navegar: cerrar el drawer, cerrar la paleta. */
  alNavegar?: () => void
  children: ReactNode
}

/** Un <a> de verdad: llega con Tab, se abre en otra pestaña con ⌘, se copia el link.
    Solo intercepta el clic simple. Reemplaza a los <a onClick> sin href de la versión anterior. */
export default function Enlace({ a, ir, activo, alNavegar, children, ...resto }: Props) {
  return (
    <a
      {...resto}
      href={aHref(a)}
      aria-current={activo ? 'page' : undefined}
      onClick={(e) => alClicNavegar(e, () => { ir(a); alNavegar?.() })}
    >
      {children}
    </a>
  )
}
