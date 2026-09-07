interface BarraProps {
  /** 0 a 1. */
  valor: number
  tono?: 'acento' | 'ok'
  alta?: boolean
  /** Descripción para lector de pantalla. Si falta, la barra queda decorativa. */
  etiqueta?: string
}

/** Mide siempre al alumno, nunca al contenido. */
export function Barra({ valor, tono = 'acento', alta = false, etiqueta }: BarraProps) {
  const pct = Math.round(Math.max(0, Math.min(1, valor)) * 100)
  return (
    <div
      className={`barra${tono === 'ok' ? ' barra--ok' : ''}${alta ? ' barra--alta' : ''}`}
      role={etiqueta ? 'progressbar' : undefined}
      aria-valuenow={etiqueta ? pct : undefined}
      aria-valuemin={etiqueta ? 0 : undefined}
      aria-valuemax={etiqueta ? 100 : undefined}
      aria-label={etiqueta}
    >
      <i style={{ ['--avance' as string]: pct / 100 }} />
    </div>
  )
}

interface AnilloProps {
  valor: number
  tamaño?: number
  grosor?: number
  etiqueta?: string
}

export function Anillo({ valor, tamaño = 40, grosor = 4, etiqueta }: AnilloProps) {
  const pct = Math.max(0, Math.min(1, valor))
  const r = (tamaño - grosor) / 2
  const c = 2 * Math.PI * r
  return (
    <svg
      className="anillo" width={tamaño} height={tamaño} viewBox={`0 0 ${tamaño} ${tamaño}`}
      role={etiqueta ? 'img' : 'presentation'} aria-label={etiqueta}
    >
      <circle className="pista" cx={tamaño / 2} cy={tamaño / 2} r={r} strokeWidth={grosor} />
      <circle
        className="avance" cx={tamaño / 2} cy={tamaño / 2} r={r} strokeWidth={grosor}
        strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
      />
    </svg>
  )
}
