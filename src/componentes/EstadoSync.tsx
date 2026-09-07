import { useProgreso } from '../lib/progreso.tsx'

const CUANDO = (t: number): string => {
  const s = Math.round((Date.now() - t) / 1000)
  if (s < 60) return 'recién'
  if (s < 3600) return `hace ${Math.round(s / 60)} min`
  return `hace ${Math.round(s / 3600)} h`
}

/** Una línea sobre dónde está guardado tu progreso. Sin ella, "se guarda solo" es una
    promesa que el usuario no puede verificar. */
export default function EstadoSync({ detallado = false }: { detallado?: boolean }) {
  const { sync, sincronizarAhora } = useProgreso()

  const [clase, texto] =
    sync.fase === 'sincronizando' ? ['sync', 'guardando…'] :
    sync.fase === 'al-dia' ? ['', detallado ? `guardado en tu cuenta ${CUANDO(sync.cuando)}` : 'guardado'] :
    sync.fase === 'error' ? ['error', detallado ? sync.mensaje : 'sin guardar'] :
    ['local', detallado ? 'solo en este navegador' : 'local']

  return (
    <span className="sync">
      <span className={'sync__punto' + (clase ? ' sync__punto--' + clase : '')} aria-hidden="true" />
      <span>{texto}</span>
      {sync.fase === 'error' && (
        <button
          type="button"
          onClick={sincronizarAhora}
          style={{ background: 'none', border: 0, color: 'var(--accent)', padding: 0, textDecoration: 'underline' }}
        >
          reintentar
        </button>
      )}
    </span>
  )
}
