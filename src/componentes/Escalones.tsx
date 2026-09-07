import type { ReactNode } from 'react'
import Icono from '../ui/Icono.tsx'

/* Ayuda escalonada por costo. Antes había un solo <details> que entregaba la respuesta
   completa —en parsing, 3539px de solución— de un clic. La pista es lo que permite
   destrabarse sin quemar el ejercicio. */

interface EscalonProps {
  titulo: string
  /** Lo que se pierde al abrirlo, dicho antes de abrirlo. */
  costo?: string
  children: ReactNode
}

export function Escalon({ titulo, costo, children }: EscalonProps) {
  return (
    <details className="escalon">
      <summary>
        <Icono nombre="chevron" tam={13} className="ico--gira" />
        {titulo}
        {costo && <span className="escalon__costo">{costo}</span>}
      </summary>
      <div className="escalon__cuerpo">{children}</div>
    </details>
  )
}

export function Escalones({ children }: { children: ReactNode }) {
  return <div className="escalones">{children}</div>
}
