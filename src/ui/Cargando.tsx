/** Skeleton de lectura. Ocupa el lugar que va a ocupar el texto, para que no salte
    cuando llega. Nunca un spinner en medio del contenido. */
export function SkeletonProsa({ lineas = 10 }: { lineas?: number }) {
  return (
    <div className="skel-prosa" aria-busy="true" aria-label="Cargando el contenido">
      {Array.from({ length: lineas }, (_, i) => <div key={i} className="skel" />)}
    </div>
  )
}

export function SkeletonTarjeta() {
  return (
    <div className="tarjeta" aria-busy="true" aria-label="Cargando las preguntas">
      <div className="skel" style={{ height: 18, width: 160, marginBottom: 'var(--s4)' }} />
      <div className="skel" style={{ height: 26, marginBottom: 'var(--s2)' }} />
      <div className="skel" style={{ height: 26, width: '72%' }} />
    </div>
  )
}
