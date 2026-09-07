import { useState, useMemo, useCallback, useEffect } from 'react'
import { semana as semanaDe } from '../lib/plan.ts'
import { armarEvaluacion, evaluarEstado } from '../lib/evaluacion.ts'
import { useProgreso } from '../lib/progreso.tsx'
import { useBanco } from '../lib/contenido.ts'
import { LECCIONES, TIPO_LABEL } from '../lib/curso.ts'
import type { Ruta } from '../lib/router.ts'
import Cabecera from './Cabecera.tsx'
import Enlace from '../componentes/Enlace.tsx'
import Boton from '../ui/Boton.tsx'
import Pill from '../ui/Pill.tsx'
import Icono from '../ui/Icono.tsx'
import { Barra } from '../ui/Progreso.tsx'
import { SkeletonTarjeta } from '../ui/Cargando.tsx'
import Responder from '../componentes/Responder.tsx'
import NoEncontrado from './NoEncontrado.tsx'

/* Rendir para cerrar la semana.

   Mezcla lo que la app puede medir de dos formas distintas, y lo dice: las preguntas se
   autoevalúan —es lo que hace toda la app— y los ejercicios los valida el motor de verdad. */

export default function Evaluacion({ n, ir }: { n: number; ir: (r: Ruta) => void }) {
  const { progreso, cerrarSemana, calificar } = useProgreso()
  const { banco, cargando } = useBanco()
  const sem = semanaDe(n)

  const ev = useMemo(() => armarEvaluacion(n, progreso), [n, progreso])
  const [notas, setNotas] = useState<Record<string, boolean>>({})
  const [pos, setPos] = useState(0)
  const [revelada, setRevelada] = useState(false)

  const estado = evaluarEstado(ev, notas)
  const preguntas = useMemo(
    () => ev.preguntas.map((qid) => banco.find((q) => q.qid === qid)).filter(Boolean),
    [ev.preguntas, banco]
  )
  const actual = preguntas[pos]

  const responder = useCallback((sabida: boolean) => {
    const q = actual
    if (!q) return
    setNotas((x) => ({ ...x, [q.qid]: sabida }))
    // la evaluación también alimenta la repetición espaciada: no es un modo aparte
    calificar(q.qid, sabida ? 'bien' : 'mal')
    setRevelada(false)
    setPos((p) => p + 1)
  }, [actual, calificar])

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
      if (e.metaKey || e.ctrlKey || e.altKey || !actual) return
      if (!revelada && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); setRevelada(true); return }
      if (revelada && (e.key === '1' || e.key === '3')) { e.preventDefault(); responder(e.key === '3') }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [actual, revelada, responder])

  if (n < 1 || n > 16) return <NoEncontrado ir={ir} que={`la semana ${n}`} />

  const migas = (
    <>
      <Enlace a={{ v: 'plan' }} ir={ir}>Plan de estudio</Enlace>
      <span>·</span>
      <span>Semana {sem.n} {sem.cuando}</span>
    </>
  )

  /* ---------- semanas sin nada que rendir ---------- */
  if (ev.sinContenido) {
    return (
      <>
        <Cabecera migas={migas} titulo={`Semana ${n}`} bajada={sem.tema} />
        <div className="panel">
          <p className="panel__titulo">Esta semana no tiene nada que rendir</p>
          <p style={{ color: 'var(--ink-2)', marginBottom: 'var(--s5)' }}>
            {sem.nota ?? 'No trae teoría nueva ni libera prácticas.'} Podés cerrarla directamente.
          </p>
          <Boton variante="primary" onClick={() => { cerrarSemana(n); ir({ v: 'plan' }) }}>
            Cerrar la semana {n}
            <Icono nombre="flecha" tam={15} />
          </Boton>
        </div>
      </>
    )
  }

  if (cargando) {
    return <><Cabecera migas={migas} titulo={`Evaluación de la semana ${n}`} /><SkeletonTarjeta /></>
  }

  /* ---------- terminó la tanda ---------- */
  const terminada = pos >= preguntas.length

  return (
    <>
      <Cabecera
        migas={migas}
        titulo={`Evaluación de la semana ${n}`}
        bajada={
          <>Para cerrar la semana hay que rendir lo que se vio en ella. Las preguntas las calificás
          vos, como en toda la app; los ejercicios los valida el motor ejecutándolos.</>
        }
      />

      {/* ---------- requisitos ---------- */}
      <section className="requisitos" aria-label="Requisitos para cerrar la semana">
        <div className={'requisito' + (estado.preguntasOk ? ' requisito--ok' : '')}>
          <Icono nombre={estado.preguntasOk ? 'check' : 'libro'} tam={16} />
          <div>
            <p className="requisito__t">
              {estado.sabidas} de {ev.minimo} preguntas sabidas
            </p>
            <p className="requisito__sub">
              Entran {ev.preguntas.length} de los módulos {sem.modulos.join(' y ')} · las calificás vos
            </p>
          </div>
          <Barra valor={ev.minimo ? Math.min(1, estado.sabidas / ev.minimo) : 1}
                 tono={estado.preguntasOk ? 'ok' : 'acento'} />
        </div>

        {ev.ejercicios.map((r) => (
          <div key={r.practica} className={'requisito' + (r.cumple ? ' requisito--ok' : '')}>
            <Icono nombre={r.cumple ? 'check' : 'consola'} tam={16} />
            <div>
              <p className="requisito__t">
                {r.resueltos} de {r.necesarios} ejercicios de la Práctica {r.practica}
              </p>
              <p className="requisito__sub">
                {r.titulo} · los valida el motor, no vos
              </p>
            </div>
            {r.cumple
              ? <Barra valor={1} tono="ok" />
              : <Enlace a={{ v: 'sandbox', tipo: r.tipos[0] }} ir={ir} className="btn btn--secondary btn--sm">
                  Ir a resolver
                </Enlace>}
          </div>
        ))}
      </section>

      {/* ---------- el drill ---------- */}
      {!terminada && actual && (
        <div className="drill" style={{ marginTop: 'var(--s6)' }}>
          <div className="drill__barra">
            <Barra valor={pos / preguntas.length} etiqueta="Avance de la evaluación" />
            <span className="drill__cuenta">{pos + 1} / {preguntas.length}</span>
          </div>

          <article className="tarjeta">
            <div className="tarjeta__meta">
              <Pill tono="neutra">{TIPO_LABEL[actual.tipo]}</Pill>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--ink-3)' }}>
                Módulo {actual.modId} · {actual.lt}
              </span>
            </div>
            <div className="tarjeta__q" dangerouslySetInnerHTML={{ __html: actual.q }} />

            <Responder clave={actual.qid} modelo={actual.a} revelada={revelada} consigna={actual.q} ir={ir}
                       filas={actual.tipo === 'practico' ? 6 : 3} />

            {!revelada ? (
              <div className="tira" style={{ marginTop: 'var(--s5)' }}>
                <Boton variante="primary" onClick={() => setRevelada(true)} tecla="espacio">
                  Mostrar la respuesta
                </Boton>
              </div>
            ) : (
              <>
                <div className="tarjeta__resp">
                  <span className="etiqueta-resp">respuesta</span>
                  <div dangerouslySetInnerHTML={{ __html: actual.a }} />
                </div>
                <div className="calificar">
                  <button type="button" className="btn btn--md btn--mal" onClick={() => responder(false)}>
                    No la sabía <small>1</small>
                  </button>
                  <button type="button" className="btn btn--md btn--bien" onClick={() => responder(true)}>
                    La sabía <small>3</small>
                  </button>
                </div>
              </>
            )}
          </article>
        </div>
      )}

      {/* ---------- cierre ---------- */}
      {terminada && (
        <div className="panel" style={{ marginTop: 'var(--s6)' }}>
          <p className="panel__titulo">
            {estado.aprobada ? `Aprobaste la semana ${n}` : 'Todavía no'}
          </p>
          <p style={{ color: 'var(--ink-2)', marginBottom: 'var(--s5)' }}>
            {estado.aprobada
              ? 'Podés cerrarla y pasar a la siguiente.'
              : !estado.preguntasOk
                ? `Sabías ${estado.sabidas} de las ${ev.preguntas.length}, y hacen falta ${ev.minimo}. Repasá los módulos de la semana y volvé a intentar: las preguntas son las mismas.`
                : 'Te faltan ejercicios de la práctica que libera esta semana.'}
          </p>
          <div className="tira">
            {estado.aprobada ? (
              <Boton variante="primary" onClick={() => { cerrarSemana(n); ir({ v: 'plan' }) }}>
                Cerrar la semana {n}
                <Icono nombre="flecha" tam={15} />
              </Boton>
            ) : (
              <>
                <Boton variante="primary" onClick={() => { setNotas({}); setPos(0); setRevelada(false) }}>
                  Volver a intentar
                </Boton>
                <Enlace a={{ v: 'plan' }} ir={ir}>Volver al plan</Enlace>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
