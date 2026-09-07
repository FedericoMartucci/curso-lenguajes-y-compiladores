import { useState, useMemo } from 'react'
import { TRANSCRIPCIONES } from '../data/transcripciones.ts'
import type { Ruta } from '../lib/router.ts'
import Cabecera from './Cabecera.tsx'
import Enlace from '../componentes/Enlace.tsx'
import Campo from '../ui/Campo.tsx'
import Pill from '../ui/Pill.tsx'
import NoEncontrado from './NoEncontrado.tsx'
import Icono from '../ui/Icono.tsx'

interface Props { id?: string; ir: (r: Ruta) => void }

export default function Clases({ id, ir }: Props) {
  if (!id) {
    return (
      <>
        <Cabecera
          titulo="Clases grabadas"
          bajada="Las clases transcriptas, en párrafos y con buscador. Es la teoría en las palabras del profesor, que muchas veces explica algo distinto de como lo dice el libro."
        />
        <div className="rejilla" style={{ gap: 'var(--s2)' }}>
          {TRANSCRIPCIONES.map((t) => (
            <Enlace key={t.id} a={{ v: 'clases', id: t.id }} ir={ir} className="mat">
              <span className="mat__cuerpo">
                <span className="mat__t">{t.titulo}</span>
                <span className="mat__sub">{t.tag} · {t.parrafos.length} párrafos</span>
              </span>
              <Icono nombre="flecha" tam={15} style={{ color: 'var(--ink-3)' }} />
            </Enlace>
          ))}
        </div>
      </>
    )
  }
  return <Clase id={id} ir={ir} />
}

function Clase({ id, ir }: { id: string; ir: (r: Ruta) => void }) {
  const [filtro, setFiltro] = useState('')
  const t = TRANSCRIPCIONES.find((x) => x.id === id)

  const parrafos = useMemo(() => {
    if (!t) return []
    const q = filtro.trim().toLowerCase()
    return q ? t.parrafos.filter((p) => p.toLowerCase().includes(q)) : t.parrafos
  }, [t, filtro])

  if (!t) return <NoEncontrado ir={ir} que={`la clase ${id}`} />

  const resaltar = (p: string) => {
    const q = filtro.trim()
    if (!q) return p
    const i = p.toLowerCase().indexOf(q.toLowerCase())
    if (i < 0) return p
    return <>{p.slice(0, i)}<mark>{p.slice(i, i + q.length)}</mark>{p.slice(i + q.length)}</>
  }

  return (
    <>
      <Cabecera
        migas={<><Enlace a={{ v: 'clases' }} ir={ir}>Clases grabadas</Enlace><span>·</span><span>{t.tag}</span></>}
        titulo={t.titulo}
        meta={<Pill tono="neutra">{t.parrafos.length} párrafos</Pill>}
      />

      <div style={{ maxWidth: 480, marginBottom: 'var(--s6)' }}>
        <Campo
          label="Buscar en esta clase"
          nota={filtro.trim() ? `${parrafos.length} de ${t.parrafos.length}` : undefined}
        >
          {(p) => (
            <input
              {...p} type="search" className="control control--sans" value={filtro}
              placeholder="por ejemplo: mango, backpatching, coprocesador"
              onChange={(e) => setFiltro(e.target.value)}
            />
          )}
        </Campo>
      </div>

      <div className="prosa">
        {parrafos.length
          ? parrafos.map((p, i) => <p key={i}>{resaltar(p)}</p>)
          : <p style={{ color: 'var(--ink-3)' }}>Ningún párrafo de esta clase menciona “{filtro}”.</p>}
      </div>
    </>
  )
}
