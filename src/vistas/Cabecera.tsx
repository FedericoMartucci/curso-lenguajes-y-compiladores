import type { ReactNode } from 'react'

interface Props {
  migas?: ReactNode
  titulo: ReactNode
  bajada?: ReactNode
  meta?: ReactNode
  acciones?: ReactNode
}

/** Cabecera de vista. Misma estructura en todas las pantallas: migas, título, bajada, meta. */
export default function Cabecera({ migas, titulo, bajada, meta, acciones }: Props) {
  return (
    <header className="cabecera">
      {migas && <div className="cabecera__migas">{migas}</div>}
      <div className="cabecera__fila">
        <h1>{titulo}</h1>
        {acciones && <div className="cabecera__acciones">{acciones}</div>}
      </div>
      {bajada && <p className="cabecera__bajada">{bajada}</p>}
      {meta && <div className="cabecera__meta">{meta}</div>}
    </header>
  )
}
