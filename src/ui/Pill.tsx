import type { ReactNode } from 'react'
import type { Badge } from '../tipos/curso.ts'

export type TonoPill = 'neutra' | 'acento' | 'ok' | 'aviso' | 'aho'

interface Props {
  tono?: TonoPill
  mono?: boolean
  children: ReactNode
  titulo?: string
}

export default function Pill({ tono = 'neutra', mono = false, children, titulo }: Props) {
  return (
    <span className={`pill pill--${tono}${mono ? ' pill--mono' : ''}`} title={titulo}>
      {children}
    </span>
  )
}

/** Los tres badges del contenido. Llevan texto además del emoji: el color nunca informa solo. */
export function BadgeLeccion({ badge }: { badge: Badge }) {
  if (badge === '🎯') {
    return <Pill tono="acento" titulo="Este tema entra al parcial"><span aria-hidden="true">🎯</span>entra al parcial</Pill>
  }
  if (badge === '📘') {
    return <Pill tono="aho" titulo="Profundidad del libro de Aho, más allá de lo que toma la cátedra"><span aria-hidden="true">📘</span>profundidad Aho</Pill>
  }
  return <Pill tono="aviso" titulo="Ejercitación de taller"><span aria-hidden="true">⚙️</span>taller</Pill>
}
