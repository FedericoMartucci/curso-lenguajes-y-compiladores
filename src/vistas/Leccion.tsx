import { useEffect, useRef } from 'react'
import { LECCIONES, LECCION_POR_ID, BANCO } from '../lib/curso.ts'
import { semanaDeModulo } from '../lib/plan.ts'
import { useProgreso } from '../lib/progreso.tsx'
import type { Ruta } from '../lib/router.ts'
import Cabecera from './Cabecera.tsx'
import Enlace from '../componentes/Enlace.tsx'
import Boton from '../ui/Boton.tsx'
import Pill, { BadgeLeccion } from '../ui/Pill.tsx'
import NoEncontrado from './NoEncontrado.tsx'

interface Props { id: string; ir: (r: Ruta) => void }

export default function Leccion({ id, ir }: Props) {
  const l = LECCION_POR_ID[id]
  const { leida, marcarLeida } = useProgreso()
  const cuerpo = useRef<HTMLDivElement>(null)

  // las tablas de la teoría scrollean en su propio contenedor: el body nunca en horizontal
  useEffect(() => {
    cuerpo.current?.querySelectorAll('table').forEach((t) => {
      if (t.parentElement?.classList.contains('tabla-scroll')) return
      const caja = document.createElement('div')
      caja.className = 'tabla-scroll'
      t.replaceWith(caja)
      caja.appendChild(t)
    })
  }, [id])

  if (!l) return <NoEncontrado ir={ir} que={`la lección ${id}`} />

  const prev = LECCIONES[l.ix - 1]
  const next = LECCIONES[l.ix + 1]
  const sem = semanaDeModulo(l.mod.id)
  const yaLeida = leida(l.id)
  const preguntas = BANCO.filter((q) => q.lid === l.id)

  return (
    <>
      <Cabecera
        migas={
          <>
            <Enlace a={{ v: 'plan' }} ir={ir}>Módulo {l.mod.id} · {l.mod.titulo}</Enlace>
            {sem && <><span>·</span><span>se ve en la semana {sem}</span></>}
          </>
        }
        titulo={<><span style={{ color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '0.7em' }}>{l.id}</span>{' '}{l.titulo}</>}
        meta={
          <>
            {(l.badges ?? []).map((b, i) => <BadgeLeccion key={i} badge={b} />)}
            {l.aho && <Pill tono="neutra" mono>{l.aho}</Pill>}
            {preguntas.length > 0 && <Pill tono="neutra">{preguntas.length} preguntas</Pill>}
          </>
        }
        acciones={
          <Boton
            variante={yaLeida ? 'secondary' : 'primary'}
            onClick={() => marcarLeida(l.id, !yaLeida)}
          >
            {yaLeida ? '✓ Leída' : 'Marcar como leída'}
          </Boton>
        }
      />

      <div className="prosa" ref={cuerpo} dangerouslySetInnerHTML={{ __html: l.html || '' }} />

      {l.artifact && (
        <div className="artefacto">
          <div className="artefacto__hd">
            <span>visualizador · {l.artifactTitle || 'interactivo'}</span>
            <a href={l.artifact} target="_blank" rel="noopener noreferrer">abrir en otra pestaña ↗</a>
          </div>
          <iframe
            src={l.artifact} style={{ height: (l.artifactH || 620) + 'px' }}
            loading="lazy" title={l.artifactTitle || 'Visualizador interactivo'}
          />
        </div>
      )}

      {preguntas.length > 0 && (
        <section style={{ marginTop: 'var(--s7)' }} aria-labelledby="h-preg">
          <h3 id="h-preg" style={{ fontSize: 'var(--fs-xl)' }}>Preguntas de esta lección</h3>
          <p style={{ fontSize: 'var(--fs-base)', color: 'var(--ink-3)', margin: 'var(--s1) 0 var(--s4)' }}>
            Respondé de memoria antes de abrir. Para que vuelvan solas cuando corresponde,{' '}
            <Enlace a={{ v: 'ejercitar' }} ir={ir}>practicalas en Ejercitación</Enlace>.
          </p>
          {(l.qa ?? []).map((p, i) => (
            <details key={i} className="qa">
              <summary><span className="qn">{i + 1}</span><span>{p.q}</span></summary>
              <div className="qa__resp">
                <span className="etiqueta-resp">respuesta</span>
                <div dangerouslySetInnerHTML={{ __html: p.a }} />
              </div>
            </details>
          ))}
        </section>
      )}

      <nav className="pager" aria-label="Lecciones contiguas">
        {prev
          ? <Enlace a={{ v: 'leccion', id: prev.id }} ir={ir}>
              <span className="dir">‹ anterior</span>
              <span className="lt">{prev.id} · {prev.titulo}</span>
            </Enlace>
          : <span style={{ flex: 1 }} />}
        {next
          ? <Enlace a={{ v: 'leccion', id: next.id }} ir={ir} className="nx">
              <span className="dir">siguiente ›</span>
              <span className="lt">{next.id} · {next.titulo}</span>
            </Enlace>
          : <span style={{ flex: 1 }} />}
      </nav>
    </>
  )
}
