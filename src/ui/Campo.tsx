import { useId } from 'react'
import type { ReactNode } from 'react'

interface Props {
  label: ReactNode
  /** Anotación al margen del label: unidades, formato esperado, cantidad. */
  nota?: ReactNode
  /** Ayuda permanente. El error la reemplaza; nunca se apilan. */
  ayuda?: ReactNode
  error?: string | null
  children: (props: { id: string; 'aria-describedby': string | undefined; 'aria-invalid': boolean }) => ReactNode
}

/** Label + control + ayuda/error como una sola pieza, para que la relación quede en el DOM
    y no solo en la posición visual. */
export default function Campo({ label, nota, ayuda, error, children }: Props) {
  const id = useId()
  const idPie = `${id}-pie`
  const hayPie = Boolean(error || ayuda)
  return (
    <div className="campo">
      <label className="campo__label" htmlFor={id}>
        <span>{label}</span>
        {nota && <em>{nota}</em>}
      </label>
      {children({
        id,
        'aria-describedby': hayPie ? idPie : undefined,
        'aria-invalid': Boolean(error)
      })}
      {hayPie && (
        <p className={'campo__pie' + (error ? ' campo__pie--error' : '')} id={idPie} role={error ? 'alert' : undefined}>
          {error || ayuda}
        </p>
      )}
    </div>
  )
}
