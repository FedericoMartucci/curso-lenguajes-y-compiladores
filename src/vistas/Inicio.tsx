import { useMemo } from 'react'
import type { Ruta } from '../lib/router.ts'
import type { Hoy } from '../lib/hoy.ts'
import { calcularAvance, calcularPreparacion } from '../lib/hoy.ts'
import { numeroVisible } from '../lib/ejercicios.ts'
import { semanaDelCalendario, semana as semanaDe } from '../lib/plan.ts'
import { useProgreso } from '../lib/progreso.tsx'
import Enlace from '../componentes/Enlace.tsx'
import Cabecera from './Cabecera.tsx'
import Boton from '../ui/Boton.tsx'
import Icono from '../ui/Icono.tsx'
import { Barra } from '../ui/Progreso.tsx'

interface Props { ir: (r: Ruta) => void; hoy: Hoy }

export default function Inicio({ ir, hoy }: Props) {
  const { progreso, irASemana } = useProgreso()
  // sugerir, nunca imponer: si la cursada va por otra semana que la tuya, se dice y listo
  const segunCalendario = semanaDelCalendario()
  const desfasado = segunCalendario !== null && segunCalendario !== progreso.semana
  const avance = useMemo(() => calcularAvance(progreso), [progreso])
  // la semana del parcial es la razón de ser del producto y mostraba lo mismo que un martes
  const prep = useMemo(() => calcularPreparacion(progreso, progreso.semana), [progreso])
  const { semana, meta, pendientes, vencidas, vencidasTotal, deLaSemana, leidasSemana, semanaLista, pctSemana } = hoy

  const arranque = avance.leidas === 0 && avance.sabidas === 0 && avance.resueltos === 0

  return (
    <>
      <Cabecera
        migas={<><Enlace a={{ v: 'plan' }} ir={ir}>Semana {semana.n} {semana.cuando}</Enlace><span>·</span><span>{semana.tema}</span></>}
        titulo={arranque ? 'Empecemos' : 'Hoy'}
        bajada={
          arranque
            ? 'La app sigue el cronograma real de la cátedra: 16 semanas, y en cada una la teoría que se ve en clase y la práctica que ya podés resolver. Nada está bloqueado: el plan te dice qué conviene, no qué podés abrir.'
            : semana.nota ?? undefined
        }
      />

      {desfasado && segunCalendario !== null && (
        <div className="desfase">
          <Icono nombre="calendario" tam={16} />
          <p>
            Estás estudiando la <b>semana {progreso.semana}</b>. Según el cronograma, la cursada va
            por la <b>{segunCalendario}</b>: {semanaDe(segunCalendario).tema}.
          </p>
          <Boton tamaño="sm" onClick={() => irASemana(segunCalendario)}>
            Ir a la semana {segunCalendario}
          </Boton>
        </div>
      )}

      {semana.hito && (
        <div className="callout tgt" style={{ marginBottom: 'var(--s5)' }}>
          <span className="lab">Esta semana en la cursada</span>
          {semana.hito}
        </div>
      )}

      {/* ---------- semana de parcial: otra pantalla ---------- */}
      {prep && (
        <section aria-labelledby="h-prep">
          <h2 id="h-prep" style={{ fontSize: 'var(--fs-xl)', marginBottom: 'var(--s2)' }}>
            Parcial {prep.parcial} · qué tenés que llevar
          </h2>
          <p style={{ color: 'var(--ink-2)', marginBottom: 'var(--s4)', maxWidth: '68ch' }}>
            Entran {prep.modulosTexto}. Lo que cuenta no es haber leído: es llegar con las
            prácticas resueltas y validadas.
          </p>

          <div className="rejilla rejilla--3">
            {prep.practicas.map((pr) => {
              const listo = pr.hechos === pr.total
              return (
                <Enlace
                  key={pr.n} a={{ v: 'sandbox', tipo: pr.tipos[0] }} ir={ir}
                  className="panel dato"
                >
                  <span className="dato__v" style={{ color: listo ? 'var(--ok)' : undefined }}>
                    {pr.hechos}/{pr.total}
                  </span>
                  <span className="dato__l" style={{ marginBottom: 'var(--s3)' }}>
                    Práctica {pr.n} · {pr.titulo}
                  </span>
                  <Barra valor={pr.total ? pr.hechos / pr.total : 0} tono={listo ? 'ok' : 'acento'} />
                </Enlace>
              )
            })}
          </div>

          <div className="tira" style={{ marginTop: 'var(--s5)' }}>
            <Boton variante="primary" onClick={() => ir({ v: 'examen' })}>
              Simulacro cronometrado
              <Icono nombre="flecha" tam={15} />
            </Boton>
            {prep.faltanLeer.length > 0 && (
              <span style={{ fontSize: 'var(--fs-base)', color: 'var(--ink-2)' }}>
                Te faltan <b>{prep.faltanLeer.length}</b> de {prep.totalObjetivo} lecciones marcadas 🎯
              </span>
            )}
          </div>

          {prep.faltanLeer.length > 0 && (
            <div className="hoy__meta">
              {prep.faltanLeer.slice(0, 4).map((l) => (
                <Enlace key={l.id} a={{ v: 'leccion', id: l.id }} ir={ir} className="meta-item">
                  <span className="meta-item__n">{l.id}</span>
                  <span className="meta-item__cuerpo">
                    <span className="meta-item__t">{l.titulo}</span>
                    <span className="meta-item__sub">Módulo {l.mod.id} · {l.mod.titulo}</span>
                  </span>
                  <Icono nombre="flecha" tam={14} className="meta-item__flecha" />
                </Enlace>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ---------- la meta del día ---------- */}
      {!prep && (
      <section aria-labelledby="h-leer">
        <div className="tira" style={{ justifyContent: 'space-between', marginBottom: 'var(--s2)' }}>
          <h3 id="h-leer" style={{ fontSize: 'var(--fs-xl)' }}>
            {semanaLista ? 'Ya leíste todo lo de esta semana' : `Leer hoy · ${meta.length} ${meta.length === 1 ? 'lección' : 'lecciones'}`}
          </h3>
          {deLaSemana.length > 0 && (
            <span className="dato__l" style={{ fontFamily: 'var(--mono)' }}>
              {leidasSemana}/{deLaSemana.length} de la semana
            </span>
          )}
        </div>

        {deLaSemana.length > 0 && (
          <div className="hoy__barra">
            <Barra valor={pctSemana} tono={semanaLista ? 'ok' : 'acento'} etiqueta="Avance de lectura de la semana" />
          </div>
        )}

        {meta.length > 0 && (
          <div className="hoy__meta">
            {meta.map((l) => (
              <Enlace key={l.id} a={{ v: 'leccion', id: l.id }} ir={ir} className="meta-item">
                <span className="meta-item__n">{l.id}</span>
                <span className="meta-item__cuerpo">
                  <span className="meta-item__t">{l.titulo}</span>
                  <span className="meta-item__sub">
                    Módulo {l.mod.id} · {l.mod.titulo}{l.aho ? ' · ' + l.aho : ''}
                  </span>
                </span>
                {(l.badges ?? []).includes('🎯') && (
                  <span className="marca-tema" title="Este tema entra al parcial" aria-label="entra al parcial">🎯</span>
                )}
                <Icono nombre="flecha" tam={14} className="meta-item__flecha" />
              </Enlace>
            ))}
          </div>
        )}

        {semanaLista && deLaSemana.length > 0 && (
          <div className="panel panel--plano" style={{ marginTop: 'var(--s4)' }}>
            <p className="panel__titulo">Semana {semana.n} completa</p>
            <p style={{ color: 'var(--ink-2)', marginBottom: 'var(--s4)' }}>
              Leíste las {deLaSemana.length} lecciones. Para cerrarla hay una evaluación corta de sus
              módulos; si preferís, seguí afianzando con las preguntas y el sandbox antes de rendirla.
            </p>
            <div className="tira">
              <Boton variante="primary" onClick={() => ir({ v: 'evaluacion', n: semana.n })}>
                Rendir para cerrar la semana {semana.n}<Icono nombre="flecha" tam={14} />
              </Boton>
              <Enlace a={{ v: 'plan' }} ir={ir}>ver el plan completo</Enlace>
            </div>
          </div>
        )}

        {deLaSemana.length === 0 && (
          <div className="panel panel--plano">
            <p style={{ color: 'var(--ink-2)' }}>
              Esta semana no trae teoría nueva. {semana.nota ?? 'Es para repasar.'}
            </p>
          </div>
        )}
      </section>
      )}

      {/* ---------- repaso y práctica ---------- */}
      <div className="rejilla rejilla--2" style={{ marginTop: 'var(--s7)' }}>
        <section className="panel" aria-labelledby="h-repasar">
          <h3 id="h-repasar" className="panel__titulo">Repasar</h3>
          {vencidas.length > 0 ? (
            <>
              <p style={{ color: 'var(--ink-2)', marginBottom: 'var(--s4)' }}>
                <b>{vencidas.length}</b> {vencidas.length === 1 ? 'pregunta' : 'preguntas'} para hoy,
                de los temas que ya viste. Las que fallás vuelven antes.
                {vencidasTotal > vencidas.length && (
                  <> Hay {vencidasTotal} vencidas en total; van a ir saliendo de a poco.</>
                )}
              </p>
              <Boton variante="primary" onClick={() => ir({ v: 'ejercitar' })}>
                Empezar el repaso
                <Icono nombre="flecha" tam={15} />
              </Boton>
            </>
          ) : (
            <p style={{ color: 'var(--ink-2)' }}>
              No hay preguntas vencidas. Van a ir apareciendo a medida que leas lecciones y pase el tiempo:
              cada una vuelve según cuánto te costó.
            </p>
          )}
        </section>

        <section className="panel" aria-labelledby="h-practicar">
          <h3 id="h-practicar" className="panel__titulo">Resolver</h3>
          {pendientes.length > 0 ? (
            <>
              <p style={{ color: 'var(--ink-2)', marginBottom: 'var(--s4)' }}>
                Con la teoría que ya viste podés resolver <b>{pendientes.length}</b> ejercicios que todavía
                no tenés hechos. Se validan ejecutándose.
              </p>
              <div className="hoy__meta" style={{ marginTop: 0, marginBottom: 'var(--s4)' }}>
                {pendientes.slice(0, 3).map((e) => (
                  <Enlace key={e.tipo + e.id} a={{ v: 'sandbox', tipo: e.tipo, ej: e.id }} ir={ir} className="meta-item">
                    <span className="meta-item__cuerpo">
                      <span className="meta-item__t">{e.t}</span>
                      <span className="meta-item__sub">{e.etiquetaTipo} · {e.grupo}{numeroVisible(e.num) ? ` · ${e.num}` : ''}</span>
                    </span>
                    <Icono nombre="flecha" tam={14} className="meta-item__flecha" />
                  </Enlace>
                ))}
              </div>
              <Enlace a={{ v: 'sandbox' }} ir={ir} className="enlace-flecha">
                ver los {pendientes.length} pendientes<Icono nombre="flecha" tam={13} />
              </Enlace>
            </>
          ) : (
            <p style={{ color: 'var(--ink-2)' }}>
              Resolviste todo lo que se liberó hasta la semana {semana.n}. Las prácticas siguientes aparecen
              a medida que avanza el plan.
            </p>
          )}
        </section>
      </div>

      {/* ---------- avance global ---------- */}
      <section style={{ marginTop: 'var(--s7)' }} aria-labelledby="h-avance">
        <h3 id="h-avance" style={{ fontSize: 'var(--fs-xl)', marginBottom: 'var(--s4)' }}>Tu avance</h3>
        <div className="rejilla rejilla--3">
          <Dato v={`${avance.leidas}/${avance.totalLecciones}`} l="lecciones leídas"
                valor={avance.leidas / avance.totalLecciones} />
          <Dato v={`${avance.sabidas}/${avance.totalPreguntas}`} l="preguntas sabidas"
                valor={avance.sabidas / avance.totalPreguntas} />
          <Dato v={`${avance.resueltos}/${avance.totalEjercicios}`} l="ejercicios resueltos"
                valor={avance.resueltos / avance.totalEjercicios} />
        </div>
      </section>
    </>
  )
}

function Dato({ v, l, valor }: { v: string; l: string; valor: number }) {
  return (
    <div className="panel dato">
      <div className="dato__v">{v}</div>
      <div className="dato__l" style={{ marginBottom: 'var(--s3)' }}>{l}</div>
      <Barra valor={valor} tono={valor >= 1 ? 'ok' : 'acento'} />
    </div>
  )
}
