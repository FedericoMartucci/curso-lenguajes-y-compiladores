import { useMemo } from 'react'
import { SEMANAS } from '../lib/plan.ts'
import { LECCIONES } from '../lib/curso.ts'
import { useProgreso } from '../lib/progreso.tsx'
import type { Ruta } from '../lib/router.ts'
import Cabecera from './Cabecera.tsx'
import Enlace from '../componentes/Enlace.tsx'
import Boton from '../ui/Boton.tsx'
import Pill from '../ui/Pill.tsx'
import { Barra } from '../ui/Progreso.tsx'

const ETIQUETA_CLASE: Record<string, string> = {
  teoria: 'clase con teoría',
  consultas: 'clase de consultas',
  parcial: 'parcial',
  feriado: 'feriado',
  cierre: 'cierre'
}

export default function Plan({ ir }: { ir: (r: Ruta) => void }) {
  const { progreso, leida, irASemana, cerrarSemana, abrirSemana, setRitmo } = useProgreso()

  const porSemana = useMemo(() => SEMANAS.map((s) => {
    const lecciones = LECCIONES.filter((l) => s.modulos.includes(l.mod.id))
    const hechas = lecciones.filter((l) => leida(l.id)).length
    return { s, lecciones, hechas }
  }), [progreso.leidas]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Cabecera
        titulo="Plan de estudio"
        bajada={
          <>
            Las 16 semanas del cronograma de la cátedra, con la teoría de cada una y la práctica que
            queda disponible. El orden es el de la cursada, no el del libro: por eso Tipos de datos
            cae en la semana 12, que es cuando se ve en clase.
          </>
        }
        meta={
          <>
            <Pill tono="acento">Semana activa: {progreso.semana}</Pill>
            <label className="campo__label" style={{ marginBottom: 0, gap: 'var(--s2)' }}>
              <span>Ritmo</span>
              <select
                className="control control--sans" style={{ width: 'auto', height: 28 }}
                value={progreso.ritmo} onChange={(e) => setRitmo(Number(e.target.value))}
                aria-label="Lecciones por día"
              >
                {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? 'lección' : 'lecciones'} por día</option>
                ))}
              </select>
            </label>
          </>
        }
      />

      <div className="honestidad" style={{ marginBottom: 'var(--s6)' }}>
        <span aria-hidden="true">↔</span>
        <p>
          <b>El plan sugiere, nunca bloquea.</b> Todas las lecciones y todos los ejercicios están
          siempre abiertos: si el profe nombra algo de la semana 12 en la semana 4, entrás igual.
          Avanzás de semana cuando vos la cerrás, no cuando pasa el tiempo.
        </p>
      </div>

      <div className="plan">
        {porSemana.map(({ s, lecciones, hechas }) => {
          const activa = s.n === progreso.semana
          const cerrada = progreso.cerradas.includes(s.n)
          const pct = lecciones.length ? hechas / lecciones.length : 0
          return (
            <article
              key={s.n}
              className={
                'sem' + (activa ? ' sem--activa' : '') + (cerrada && !activa ? ' sem--cerrada' : '') +
                (s.clase === 'parcial' ? ' sem--hito' : '')
              }
              aria-current={activa ? 'step' : undefined}
            >
              <div className="sem__n">
                S{s.n}
                <span className="sem__cuando">{s.cuando}</span>
              </div>

              <div>
                <h3 className="sem__tema">{s.tema}</h3>
                {s.hito && <p className="sem__detalle"><b>{s.hito}</b></p>}
                {s.nota && <p className="sem__detalle">{s.nota}</p>}

                {lecciones.length > 0 && (
                  <>
                    <p className="sem__detalle" style={{ marginTop: 'var(--s3)' }}>
                      {lecciones.length} lecciones · {s.modulos.length === 1 ? 'módulo' : 'módulos'} {s.modulos.join(' y ')}
                    </p>
                    <div style={{ maxWidth: 320, marginTop: 'var(--s2)' }}>
                      <Barra valor={pct} tono={pct >= 1 ? 'ok' : 'acento'} etiqueta={`Semana ${s.n}`} />
                    </div>
                  </>
                )}

                <div className="sem__tags">
                  <Pill tono="neutra">{ETIQUETA_CLASE[s.clase]}</Pill>
                  {s.libera.map((p) => (
                    <Enlace key={p.n} a={{ v: 'sandbox', tipo: p.tipos[0] }} ir={ir} style={{ textDecoration: 'none' }}>
                      <Pill tono="ok">libera Práctica {p.n}</Pill>
                    </Enlace>
                  ))}
                  {lecciones.length > 0 && (
                    <Pill tono={hechas === lecciones.length ? 'ok' : 'neutra'} mono>
                      {hechas}/{lecciones.length} leídas
                    </Pill>
                  )}
                </div>

                {lecciones.length > 0 && (
                  <details style={{ marginTop: 'var(--s3)' }}>
                    <summary style={{ fontSize: 'var(--fs-sm)', color: 'var(--accent)', cursor: 'pointer' }}>
                      Ver las {lecciones.length} lecciones
                    </summary>
                    <div className="hoy__meta">
                      {lecciones.map((l) => (
                        <Enlace key={l.id} a={{ v: 'leccion', id: l.id }} ir={ir} className="meta-item">
                          <span className="meta-item__n">{l.id}</span>
                          <span className="meta-item__cuerpo">
                            <span className="meta-item__t">{l.titulo}</span>
                          </span>
                          {leida(l.id) && <span style={{ color: 'var(--ok)' }} aria-label="leída">✓</span>}
                        </Enlace>
                      ))}
                    </div>
                  </details>
                )}
              </div>

              <div className="sem__acciones">
                {activa
                  ? <Boton tamaño="sm" variante="primary" onClick={() => cerrarSemana(s.n)}>
                      Cerrar la semana {s.n}
                    </Boton>
                  : <Boton tamaño="sm" variante="secondary" onClick={() => irASemana(s.n)}>
                      Estudiar esta semana
                    </Boton>}
                {cerrada && (
                  <Boton tamaño="sm" variante="ghost" onClick={() => abrirSemana(s.n)}>Reabrir</Boton>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
