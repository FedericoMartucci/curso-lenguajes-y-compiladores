import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { CURSO, TIPO_LABEL } from '../lib/curso.ts'
import { useBanco } from '../lib/contenido.ts'
import type { PreguntaBanco } from '../tipos/curso.ts'
import type { Ruta } from '../lib/router.ts'
import { useProgreso } from '../lib/progreso.tsx'
import Cabecera from './Cabecera.tsx'
import Enlace from '../componentes/Enlace.tsx'
import Boton from '../ui/Boton.tsx'
import Pill from '../ui/Pill.tsx'
import { Barra } from '../ui/Progreso.tsx'
import Responder from '../componentes/Responder.tsx'
import Selector from '../ui/Selector.tsx'
import Icono from '../ui/Icono.tsx'

type Alcance = 'I' | 'II' | 'todo'

const MODULOS_PARCIAL: Record<Alcance, (m: number) => boolean> = {
  I: (m) => m <= 7 || m === 15,
  II: (m) => (m >= 8 && m <= 13) || m === 15,
  todo: () => true
}

const CONFIG: Record<Alcance, { titulo: string; preguntas: number; minutos: number }> = {
  I: { titulo: 'Parcial I', preguntas: 15, minutos: 40 },
  II: { titulo: 'Parcial II', preguntas: 15, minutos: 40 },
  todo: { titulo: 'Final', preguntas: 25, minutos: 70 }
}

const mezclar = <T,>(a: T[]): T[] => {
  const x = a.slice()
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[x[i], x[j]] = [x[j] as T, x[i] as T]
  }
  return x
}

const reloj = (s: number): string => {
  const m = Math.floor(Math.max(0, s) / 60)
  const seg = Math.max(0, s) % 60
  return `${m}:${String(seg).padStart(2, '0')}`
}

type Fase = 'listo' | 'corriendo' | 'terminado'

export default function Examen({ ir }: { ir: (r: Ruta) => void }) {
  const { calificar } = useProgreso()
  const { banco, cargando } = useBanco()
  const [alcance, setAlcance] = useState<Alcance>('I')
  const [fase, setFase] = useState<Fase>('listo')
  const [mazo, setMazo] = useState<PreguntaBanco[]>([])
  const [pos, setPos] = useState(0)
  const [revelada, setRevelada] = useState(false)
  const [notas, setNotas] = useState<Record<string, boolean>>({})
  const [restante, setRestante] = useState(0)
  const timer = useRef<number | undefined>(undefined)

  const cfg = CONFIG[alcance]

  const disponibles = useMemo(
    () => banco.filter((q) => MODULOS_PARCIAL[alcance](q.modId)),
    [alcance, banco]
  )

  const terminar = useCallback(() => {
    setFase('terminado')
    if (timer.current) window.clearInterval(timer.current)
  }, [])

  const arrancar = () => {
    setMazo(mezclar(disponibles).slice(0, cfg.preguntas))
    setPos(0); setRevelada(false); setNotas({})
    setRestante(cfg.minutos * 60)
    setFase('corriendo')
  }

  useEffect(() => {
    if (fase !== 'corriendo') return
    timer.current = window.setInterval(() => {
      setRestante((s) => {
        if (s <= 1) { terminar(); return 0 }
        return s - 1
      })
    }, 1000)
    return () => { if (timer.current) window.clearInterval(timer.current) }
  }, [fase, terminar])

  const responder = (bien: boolean) => {
    const q = mazo[pos]
    if (!q) return
    setNotas((n) => ({ ...n, [q.qid]: bien }))
    // el examen también alimenta la repetición espaciada: no es un modo aparte
    calificar(q.qid, bien ? 'bien' : 'mal')
    setRevelada(false)
    if (pos + 1 >= mazo.length) terminar()
    else setPos((p) => p + 1)
  }

  if (fase === 'listo') {
    return (
      <>
        <Cabecera
          titulo="Modo examen"
          bajada="Una tanda cronometrada que mezcla preguntas de todos los módulos que entran, como en el parcial. Al final te dice el puntaje y qué falló. Lo que respondas también cuenta para la repetición espaciada."
        />
        <div className="panel" style={{ maxWidth: 640 }}>
          <p className="campo__label">Qué entra</p>
          <div style={{ marginBottom: 'var(--s5)' }}>
            <Selector
              etiqueta="Alcance del examen" valor={alcance} ancho={260}
              onCambio={(v) => setAlcance(v as Alcance)}
              opciones={(['I', 'II', 'todo'] as Alcance[]).map((a) => ({
                valor: a, etiqueta: CONFIG[a].titulo,
                detalle: `${CONFIG[a].preguntas} preguntas · ${CONFIG[a].minutos} minutos`
              }))}
            />
          </div>

          <div className="rejilla rejilla--3" style={{ marginBottom: 'var(--s5)' }}>
            <div><div className="dato__v">{cfg.preguntas}</div><div className="dato__l">preguntas</div></div>
            <div><div className="dato__v">{cfg.minutos}′</div><div className="dato__l">de reloj</div></div>
            <div><div className="dato__v">{disponibles.length}</div><div className="dato__l">en el banco</div></div>
          </div>

          <Boton variante="primary" onClick={arrancar} cargando={cargando} disabled={!disponibles.length}>
            Empezar el {cfg.titulo.toLowerCase()}
          </Boton>
        </div>
      </>
    )
  }

  if (fase === 'terminado') {
    const respondidas = Object.keys(notas).length
    const bien = Object.values(notas).filter(Boolean).length
    const pct = respondidas ? bien / respondidas : 0
    const fallaron = mazo.filter((q) => notas[q.qid] === false)
    return (
      <>
        <Cabecera titulo="Resultado" migas={<span>{cfg.titulo}</span>} />
        <div className="panel" style={{ maxWidth: 720 }}>
          <div className="tira" style={{ justifyContent: 'space-between', marginBottom: 'var(--s4)' }}>
            <div>
              <div className="dato__v" style={{ fontSize: 'var(--fs-3xl)' }}>{bien} / {mazo.length}</div>
              <div className="dato__l">
                {respondidas < mazo.length && `respondiste ${respondidas}, se acabó el tiempo en el resto`}
              </div>
            </div>
            <Pill tono={pct >= 0.6 ? 'ok' : 'aviso'}>{Math.round(pct * 100)}%</Pill>
          </div>
          <Barra valor={pct} tono={pct >= 0.6 ? 'ok' : 'acento'} alta etiqueta="Puntaje" />

          {fallaron.length > 0 && (
            <>
              <p className="campo__label" style={{ marginTop: 'var(--s5)' }}>Lo que falló</p>
              <div className="hoy__meta" style={{ marginTop: 0 }}>
                {fallaron.map((q) => (
                  <Enlace key={q.qid} a={{ v: 'leccion', id: q.lid }} ir={ir} className="meta-item">
                    <span className="meta-item__n">{q.lid}</span>
                    <span className="meta-item__cuerpo">
                      <span className="meta-item__t">{q.q}</span>
                      <span className="meta-item__sub">Módulo {q.modId} · {q.lt}</span>
                    </span>
                    <Icono nombre="flecha" tam={14} className="meta-item__flecha" />
                  </Enlace>
                ))}
              </div>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink-3)', marginTop: 'var(--s3)' }}>
                Todas estas quedaron marcadas para repasar y van a volver a aparecer en Ejercitación.
              </p>
            </>
          )}

          <div className="tira" style={{ marginTop: 'var(--s5)' }}>
            <Boton variante="primary" onClick={() => setFase('listo')}>Otra tanda</Boton>
            <Boton onClick={() => ir({ v: 'ejercitar' })}>Ir a repasar lo que falló</Boton>
          </div>
        </div>
      </>
    )
  }

  const q = mazo[pos]
  if (!q) return null
  const poco = restante <= 60

  return (
    <>
      <Cabecera
        titulo={cfg.titulo}
        acciones={
          <div className="tira">
            <span className={'reloj' + (poco ? ' reloj--poco' : '')} role="timer" aria-live="off">
              <Icono nombre="reloj" tam={18} />
              {reloj(restante)}
            </span>
            <Boton variante="ghost" onClick={terminar}>Terminar</Boton>
          </div>
        }
      />

      <div className="drill">
        <div className="drill__barra">
          <Barra valor={pos / mazo.length} etiqueta="Avance del examen" />
          <span className="drill__cuenta">{pos + 1} / {mazo.length}</span>
        </div>

        <article className="tarjeta">
          <div className="tarjeta__meta">
            <Pill tono="neutra">{TIPO_LABEL[q.tipo]}</Pill>
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--ink-3)' }}>
              Módulo {q.modId} · {CURSO.modulos.find((m) => m.id === q.modId)?.titulo}
            </span>
          </div>
          <div className="tarjeta__q" dangerouslySetInnerHTML={{ __html: q.q }} />

          <Responder clave={q.qid} modelo={q.a} revelada={revelada} tipo={q.tipo}
                     filas={q.tipo === 'practico' ? 6 : 3} />

          {!revelada ? (
            <div className="tira" style={{ marginTop: 'var(--s5)' }}>
              <Boton variante="primary" onClick={() => setRevelada(true)}>Ver la respuesta</Boton>
            </div>
          ) : (
            <>
              <div className="tarjeta__resp">
                <span className="etiqueta-resp">respuesta</span>
                <div dangerouslySetInnerHTML={{ __html: q.a }} />
              </div>
              <div className="calificar">
                <button type="button" className="btn btn--md btn--mal" onClick={() => responder(false)}>No la tenía</button>
                <button type="button" className="btn btn--md btn--bien" onClick={() => responder(true)}>La respondí bien</button>
              </div>
            </>
          )}
        </article>
      </div>
    </>
  )
}
