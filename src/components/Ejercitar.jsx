import React, { useState, useMemo, useEffect } from 'react'
import { CURSO, BANCO, TIPO_LABEL } from '../lib/curso.js'
import { useLocalStorage } from '../lib/hooks.js'

const barajar = (arr) => {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

export default function Ejercitar({ navigate }) {
  const [progreso, setProgreso] = useLocalStorage('lyc-ejerc', {})
  const [tipo, setTipo] = useState('todos')
  const [mod, setMod] = useState('todos')
  const [soloRepasar, setSoloRepasar] = useState(false)
  const [pos, setPos] = useState(0)
  const [revelada, setRevelada] = useState(false)
  const [semilla, setSemilla] = useState(0)

  const mazo = useMemo(() => {
    let b = BANCO.filter((x) =>
      (tipo === 'todos' || x.tipo === tipo) &&
      (mod === 'todos' || String(x.modId) === String(mod))
    )
    if (soloRepasar) b = b.filter((x) => progreso[x.qid] === 'repasar')
    return barajar(b)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, mod, soloRepasar, semilla])

  useEffect(() => { setPos(0); setRevelada(false) }, [tipo, mod, soloRepasar, semilla])

  const marcar = (estado) => {
    const c = mazo[pos]
    if (c) setProgreso((p) => ({ ...p, [c.qid]: estado }))
    setPos((n) => n + 1)
    setRevelada(false)
  }

  const modulos = CURSO.modulos.filter((m) => BANCO.some((x) => x.modId === m.id))
  const sabidas = mazo.filter((x) => progreso[x.qid] === 'known').length
  const paraRepasar = BANCO.filter((x) => progreso[x.qid] === 'repasar').length

  const filtros = (
    <div className="filters">
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tipo:</span>
      {['todos', 'vf', 'desarrollar', 'practico'].map((t) => (
        <button key={t} className={'chip' + (tipo === t ? ' on' : '')} onClick={() => setTipo(t)}>
          {t === 'todos' ? 'Todos' : TIPO_LABEL[t]}
        </button>
      ))}
      <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>Módulo:</span>
      <select value={mod} onChange={(e) => setMod(e.target.value)}>
        <option value="todos">Todos</option>
        {modulos.map((m) => <option key={m.id} value={m.id}>{m.id} · {m.titulo}</option>)}
      </select>
      <button className={'chip' + (soloRepasar ? ' on' : '')} onClick={() => setSoloRepasar((v) => !v)}>
        Solo a repasar ({paraRepasar})
      </button>
    </div>
  )

  if (!mazo.length) {
    return (
      <>
        <div className="crumbs">Práctica activa</div>
        <h2 className="title">Ejercitación</h2>
        {filtros}
        <p style={{ color: 'var(--text-muted)' }}>No hay preguntas con ese filtro.</p>
      </>
    )
  }

  if (pos >= mazo.length) {
    return (
      <>
        <div className="crumbs">Práctica activa</div>
        <h2 className="title">Ejercitación</h2>
        {filtros}
        <div className="ejcard">
          <h3 style={{ fontSize: 18, fontWeight: 500, margin: '0 0 8px' }}>¡Terminaste la tanda!</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Recorriste {mazo.length} preguntas. Marcaste {sabidas} como sabidas y quedan {paraRepasar} para repasar.
          </p>
          <div className="ejbtns">
            <button className="pri" onClick={() => setSemilla((s) => s + 1)}>Otra tanda ↻</button>
            {paraRepasar > 0 && <button onClick={() => { setSoloRepasar(true); setSemilla((s) => s + 1) }}>Solo las de repasar</button>}
          </div>
        </div>
      </>
    )
  }

  const c = mazo[pos]
  const estado = progreso[c.qid]
  const respondidas = mazo.filter((x) => progreso[x.qid]).length

  return (
    <>
      <div className="crumbs">Práctica activa</div>
      <h2 className="title">Ejercitación</h2>
      <p style={{ color: 'var(--text-secondary)' }}>
        Resolvé de memoria, revelá la respuesta y autoevaluate. Lo que marques para repasar vuelve a aparecer.
      </p>
      {filtros}

      <div className="ejprog"><div style={{ width: Math.round((pos / mazo.length) * 100) + '%' }} /></div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
        <span>Pregunta {pos + 1} de {mazo.length}</span>
        <span>{respondidas} respondidas · {estado ? (estado === 'known' ? 'sabida' : 'a repasar') : 'nueva'}</span>
      </div>

      <div className="ejcard">
        <div className="ejmeta">
          <span className={'ejtype ' + c.tipo}>{TIPO_LABEL[c.tipo]}</span>
          <span>Módulo {c.modId} · {c.lt}</span>
          <a onClick={() => navigate('#/l/' + c.lid)} style={{ fontSize: 12 }}>ver la lección →</a>
        </div>
        <div className="ejq">{c.q}</div>

        {(c.tipo === 'practico' || c.tipo === 'vf') && (
          <div className="ejtools">
            Para resolverlo sin papel: <a onClick={() => navigate('#/mesa')}>Mesa de trabajo</a>
            {' · '}<a onClick={() => navigate('#/sandbox')}>Sandbox validable</a>
          </div>
        )}

        {!revelada ? (
          <div className="ejbtns">
            <button className="pri" onClick={() => setRevelada(true)}>Mostrar respuesta</button>
            <button onClick={() => { setPos((n) => n + 1); setRevelada(false) }}>Saltar →</button>
          </div>
        ) : (
          <>
            <div className="ejans">
              <span className="modlab">respuesta</span>
              <div dangerouslySetInnerHTML={{ __html: c.a }} />
            </div>
            <div className="ejbtns">
              <button className="ok" onClick={() => marcar('known')}>La sabía ✓</button>
              <button className="rev" onClick={() => marcar('repasar')}>Repasar ↻</button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
