import { useState, useMemo, useEffect, useCallback } from 'react'
import { CURSO, BANCO, TIPO_LABEL } from '../lib/curso.ts'
import type { PreguntaBanco, TipoPregunta } from '../tipos/curso.ts'
import type { Calificacion } from '../tipos/progreso.ts'
import { useProgreso } from '../lib/progreso.tsx'
import { vencida, textoProximoRepaso } from '../lib/srs.ts'
import type { Ruta } from '../lib/router.ts'
import Cabecera from './Cabecera.tsx'
import Enlace from '../componentes/Enlace.tsx'
import Boton from '../ui/Boton.tsx'
import Pill from '../ui/Pill.tsx'
import { Barra } from '../ui/Progreso.tsx'

type Modo = 'vencidas' | 'todas' | 'nuevas'

const MODOS: { id: Modo; label: string; ayuda: string }[] = [
  { id: 'vencidas', label: 'Toca hoy', ayuda: 'Las que la repetición espaciada pone para hoy. Es el modo por defecto y el que rinde.' },
  { id: 'nuevas', label: 'Sin ver', ayuda: 'Preguntas que nunca calificaste.' },
  { id: 'todas', label: 'Todas', ayuda: 'El banco completo, sin filtrar por vencimiento.' }
]

const mezclar = <T,>(arr: T[]): T[] => {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j] as T, a[i] as T]
  }
  return a
}

export default function Ejercitar({ ir }: { ir: (r: Ruta) => void }) {
  const { progreso, calificar, tarjeta } = useProgreso()
  const [modo, setModo] = useState<Modo>('vencidas')
  const [tipo, setTipo] = useState<TipoPregunta | 'todos'>('todos')
  const [mod, setMod] = useState<number | 'todos'>('todos')
  const [pos, setPos] = useState(0)
  const [revelada, setRevelada] = useState(false)
  const [semilla, setSemilla] = useState(0)
  const [hechas, setHechas] = useState(0)

  const mazo = useMemo(() => {
    const ahora = Date.now()
    let b = BANCO.filter((q) =>
      (tipo === 'todos' || q.tipo === tipo) &&
      (mod === 'todos' || q.modId === mod)
    )
    if (modo === 'vencidas') b = b.filter((q) => vencida(progreso.preguntas[q.qid], ahora))
    if (modo === 'nuevas') b = b.filter((q) => !progreso.preguntas[q.qid]?.vistas)
    return mezclar(b)
    // el mazo se arma una vez por tanda: no se rebaraja con cada calificación
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo, tipo, mod, semilla])

  useEffect(() => { setPos(0); setRevelada(false); setHechas(0) }, [modo, tipo, mod, semilla])

  const actual: PreguntaBanco | undefined = mazo[pos]

  const responder = useCallback((nota: Calificacion) => {
    if (!actual) return
    calificar(actual.qid, nota)
    setHechas((n) => n + 1)
    setPos((n) => n + 1)
    setRevelada(false)
  }, [actual, calificar])

  // Atajos: espacio revela; 1/2/3 califican; s salta.
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (!actual) return
      if (!revelada && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); setRevelada(true); return }
      if (revelada) {
        if (e.key === '1') { e.preventDefault(); responder('mal') }
        if (e.key === '2') { e.preventDefault(); responder('costo') }
        if (e.key === '3' || e.key === ' ') { e.preventDefault(); responder('bien') }
      }
      if (e.key.toLowerCase() === 's') { e.preventDefault(); setPos((n) => n + 1); setRevelada(false) }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [actual, revelada, responder])

  const modulos = CURSO.modulos.filter((m) => BANCO.some((q) => q.modId === m.id))
  const totalVencidas = BANCO.filter((q) => vencida(progreso.preguntas[q.qid])).length

  const filtros = (
    <div className="tira" style={{ gap: 'var(--s3)', marginBottom: 'var(--s5)' }}>
      <div className="segmentado" role="group" aria-label="Qué preguntas entran">
        {MODOS.map((m) => (
          <button key={m.id} type="button" aria-pressed={modo === m.id} title={m.ayuda}
                  onClick={() => setModo(m.id)}>
            {m.label}{m.id === 'vencidas' && totalVencidas > 0 ? ` · ${totalVencidas}` : ''}
          </button>
        ))}
      </div>
      <select className="control control--sans" style={{ width: 'auto', height: 28 }}
              value={tipo} onChange={(e) => setTipo(e.target.value as TipoPregunta | 'todos')}
              aria-label="Tipo de pregunta">
        <option value="todos">Todos los tipos</option>
        {(Object.keys(TIPO_LABEL) as TipoPregunta[]).map((t) => (
          <option key={t} value={t}>{TIPO_LABEL[t]}</option>
        ))}
      </select>
      <select className="control control--sans" style={{ width: 'auto', height: 28 }}
              value={String(mod)} onChange={(e) => setMod(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
              aria-label="Módulo">
        <option value="todos">Todos los módulos</option>
        {modulos.map((m) => <option key={m.id} value={m.id}>{m.id} · {m.titulo}</option>)}
      </select>
    </div>
  )

  const cabecera = (
    <Cabecera
      titulo="Ejercitación"
      bajada={
        <>
          Respondé de memoria, revelá y calificate honestamente. Cada pregunta vuelve según cuánto te
          costó: lo que fallás reaparece enseguida, lo que sabés se espacia. Con teclado:{' '}
          <kbd>espacio</kbd> revela, <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> califican.
        </>
      }
    />
  )

  if (!mazo.length) {
    return (
      <>
        {cabecera}
        {filtros}
        <div className="vacio">
          <h3>
            {modo === 'vencidas'
              ? 'Nada que repasar por ahora'
              : 'No hay preguntas con ese filtro'}
          </h3>
          <p>
            {modo === 'vencidas'
              ? 'Las preguntas van venciendo con el tiempo, así que esto se va a llenar solo. Si querés adelantar, cambiá a “Sin ver” o a “Todas”.'
              : 'Probá con otro módulo o con otro tipo de pregunta.'}
          </p>
          <div className="tira" style={{ justifyContent: 'center' }}>
            <Boton variante="primary" onClick={() => { setModo('nuevas'); setSemilla((s) => s + 1) }}>
              Ver preguntas sin calificar
            </Boton>
            <Boton onClick={() => ir({ v: 'sandbox' })}>Ir al sandbox</Boton>
          </div>
        </div>
      </>
    )
  }

  if (!actual) {
    return (
      <>
        {cabecera}
        {filtros}
        <div className="panel">
          <h3 className="panel__titulo">Tanda terminada</h3>
          <p style={{ color: 'var(--ink-2)', marginBottom: 'var(--s5)' }}>
            Pasaste por {mazo.length} {mazo.length === 1 ? 'pregunta' : 'preguntas'} y calificaste {hechas}.
            Quedan <b>{totalVencidas}</b> vencidas en total.
          </p>
          <div className="tira">
            <Boton variante="primary" onClick={() => setSemilla((s) => s + 1)}>Otra tanda</Boton>
            <Boton onClick={() => ir({ v: 'inicio' })}>Volver a Hoy</Boton>
          </div>
        </div>
      </>
    )
  }

  const t = tarjeta(actual.qid)

  return (
    <>
      {cabecera}
      {filtros}

      <div className="drill">
        <div className="drill__barra">
          <Barra valor={pos / mazo.length} etiqueta="Avance de la tanda" />
          <span className="drill__cuenta">{pos + 1} / {mazo.length}</span>
        </div>

        <article className="tarjeta">
          <div className="tarjeta__meta">
            <Pill tono={actual.tipo === 'practico' ? 'aviso' : actual.tipo === 'vf' ? 'acento' : 'neutra'}>
              {TIPO_LABEL[actual.tipo]}
            </Pill>
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--ink-3)' }}>
              Módulo {actual.modId} · {actual.lt}
            </span>
            <Enlace a={{ v: 'leccion', id: actual.lid }} ir={ir} style={{ fontSize: 'var(--fs-xs)', marginLeft: 'auto' }}>
              ver la lección →
            </Enlace>
          </div>

          <p className="tarjeta__q">{actual.q}</p>

          {!revelada ? (
            <div className="tira" style={{ marginTop: 'var(--s5)' }}>
              <Boton variante="primary" onClick={() => setRevelada(true)} tecla="espacio">
                Mostrar la respuesta
              </Boton>
              <Boton variante="ghost" onClick={() => { setPos((n) => n + 1); setRevelada(false) }} tecla="s">
                Saltar
              </Boton>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--ink-3)', marginLeft: 'auto' }}>
                {textoProximoRepaso(t)}
              </span>
            </div>
          ) : (
            <>
              <div className="tarjeta__resp">
                <span className="etiqueta-resp">respuesta</span>
                <div dangerouslySetInnerHTML={{ __html: actual.a }} />
              </div>
              <div className="calificar">
                <button type="button" className="btn btn--md btn--mal" onClick={() => responder('mal')}>
                  No me salió <small>vuelve en esta tanda · 1</small>
                </button>
                <button type="button" className="btn btn--md btn--costo" onClick={() => responder('costo')}>
                  Me costó <small>vuelve pronto · 2</small>
                </button>
                <button type="button" className="btn btn--md btn--bien" onClick={() => responder('bien')}>
                  La sabía <small>se espacia · 3</small>
                </button>
              </div>
            </>
          )}
        </article>
      </div>
    </>
  )
}
