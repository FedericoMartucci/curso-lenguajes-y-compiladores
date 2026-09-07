import React, { useState, useMemo } from 'react'
import { CURSO, LECCIONES, LECCION_POR_ID, BANCO, buscarLecciones, progresoCurso } from '../lib/curso.js'
import { TRANSCRIPCIONES } from '../data/transcripciones.js'
import { ENUNCIADOS } from '../data/enunciados.js'
import { ER_EJ } from '../data/ejercicios/er.js'
import { LEX_EJ } from '../data/ejercicios/lexicas.js'
import { GLC_EJ } from '../data/ejercicios/glc.js'

const badgeEl = (b, i) => {
  if (b === '🎯') return <span key={i} className="badge tgt">🎯 parcial</span>
  if (b === '📘') return <span key={i} className="badge aho">📘 Aho</span>
  if (b === '⚙️') return <span key={i} className="badge work">⚙️ taller</span>
  return null
}

/* ---------------- Inicio ---------------- */
export function Inicio({ navigate }) {
  const { total, dictadas, pct } = progresoCurso()
  const preguntas = BANCO.length
  const ejercicios = ER_EJ.length + LEX_EJ.length + GLC_EJ.length
  return (
    <>
      <div className="crumbs">Curso completo · sin conexión</div>
      <h2 className="title">Lenguajes y Compiladores</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '60ch' }}>
        Todo el material del curso sobre el libro de Aho y los apuntes de la cátedra, con ejercitación
        y un sandbox que valida tus respuestas de verdad. Tu progreso se guarda en este navegador.
      </p>

      <div className="hprog">
        <div className="lab"><span>Avance del curso — lecciones en profundidad</span><span>{dictadas}/{total} · {pct}%</span></div>
        <div className="progbar"><div className="progfill" style={{ width: pct + '%' }} /></div>
      </div>

      <div className="home-grid">
        <div className="stat"><div className="v">{total}</div><div className="l">lecciones</div></div>
        <div className="stat"><div className="v">{preguntas}</div><div className="l">preguntas</div></div>
        <div className="stat"><div className="v">{ejercicios}</div><div className="l">ejercicios validables</div></div>
        <div className="stat"><div className="v">{TRANSCRIPCIONES.length}</div><div className="l">clases transcriptas</div></div>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        Referencias: <span className="badge tgt">🎯 entra al parcial</span>{' '}
        <span className="badge aho">📘 profundidad Aho</span>{' '}
        <span className="badge work">⚙️ taller</span>
      </p>

      <h3 style={{ fontSize: 16, fontWeight: 500, marginTop: '1.5rem' }}>Módulos</h3>
      {CURSO.modulos.map((m) => (
        <div key={m.id} className="modcard" onClick={() => navigate('#/l/' + m.lecciones[0].id)}>
          <h4>{m.id}. {m.titulo}{' '}
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 12 }}>
              · {m.lecciones.length} lecciones · Parcial {m.parcial}
            </span>
          </h4>
          <p>{m.resumen}</p>
        </div>
      ))}
    </>
  )
}

/* ---------------- Lección ---------------- */
export function Leccion({ id, navigate }) {
  const l = LECCION_POR_ID[id]
  if (!l) return <p style={{ color: 'var(--text-muted)' }}>No encontré esa lección.</p>
  const prev = LECCIONES[l.ix - 1]
  const next = LECCIONES[l.ix + 1]
  return (
    <>
      <div className="crumbs">Módulo {l.mod.id} · {l.mod.titulo}</div>
      <h2 className="title">{l.id} — {l.titulo}</h2>
      <div className="meta">
        <span className={'pill ' + (l.estado === 'dictada' ? 'dictada' : 'resumen')}>
          {l.estado === 'dictada' ? 'clase completa' : 'resumen + referencia'}
        </span>
        {(l.badges || []).map(badgeEl)}
        {l.aho && <span className="badge">{l.aho}</span>}
      </div>

      <div className="content" dangerouslySetInnerHTML={{ __html: l.html || '' }} />

      {l.artifact && (
        <div className="artifact-card">
          <div className="hd">
            <span>visualizador · {l.artifactTitle || 'interactivo'}</span>
            <a href={l.artifact} target="_blank" rel="noopener noreferrer">abrir en pestaña ↗</a>
          </div>
          <iframe src={l.artifact} style={{ height: (l.artifactH || 620) + 'px' }} loading="lazy" title="visualizador" />
        </div>
      )}

      {!!(l.qa || []).length && (
        <>
          <h3 style={{ fontSize: 17, fontWeight: 500, marginTop: '1.8rem' }}>Preguntas para practicar</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: -2 }}>Resolvé de memoria antes de abrir la respuesta.</p>
          {l.qa.map((p, i) => (
            <details key={i} className="qa">
              <summary><span className="qn">{i + 1}</span><span>{p.q}</span></summary>
              <div className="ans">
                <span className="modlab">respuesta</span>
                <div dangerouslySetInnerHTML={{ __html: p.a }} />
              </div>
            </details>
          ))}
        </>
      )}

      <div className="pager">
        {prev
          ? <button onClick={() => navigate('#/l/' + prev.id)}><div className="dir">‹ anterior</div><div className="lt">{prev.id} {prev.titulo}</div></button>
          : <button disabled />}
        {next
          ? <button className="nx" onClick={() => navigate('#/l/' + next.id)}><div className="dir">siguiente ›</div><div className="lt">{next.id} {next.titulo}</div></button>
          : <button className="nx" disabled />}
      </div>
    </>
  )
}

/* ---------------- Banco de preguntas ---------------- */
export function Banco({ navigate }) {
  return (
    <>
      <div className="crumbs">Todas las preguntas del curso</div>
      <h2 className="title">Banco de preguntas</h2>
      <p style={{ color: 'var(--text-secondary)' }}>
        Las {BANCO.length} preguntas agrupadas por módulo. Para practicar con autoevaluación, usá <a onClick={() => navigate('#/ejercitar')}>Ejercitación</a>.
      </p>
      {CURSO.modulos.map((m) => {
        const qs = BANCO.filter((x) => x.modId === m.id)
        if (!qs.length) return null
        return (
          <div key={m.id}>
            <h3 style={{ fontSize: 16, fontWeight: 500, marginTop: '1.6rem' }}>
              {m.id}. {m.titulo}{' '}
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>· {qs.length} preguntas</span>
            </h3>
            {qs.map((x) => (
              <details key={x.qid} className="qa">
                <summary><span className="qn">{x.lid}</span><span>{x.q}</span></summary>
                <div className="ans">
                  <span className="modlab">respuesta</span>
                  <div dangerouslySetInnerHTML={{ __html: x.a }} />
                  <p style={{ marginTop: 8 }}><a onClick={() => navigate('#/l/' + x.lid)}>→ ir a la lección {x.lid}</a></p>
                </div>
              </details>
            ))}
          </div>
        )
      })}
    </>
  )
}

/* ---------------- Buscar ---------------- */
export function Buscar({ term, navigate }) {
  const res = useMemo(() => buscarLecciones(term), [term])
  const hl = (s) => {
    const i = s.toLowerCase().indexOf(term.toLowerCase())
    if (i < 0) return s
    return <>{s.slice(0, i)}<mark>{s.slice(i, i + term.length)}</mark>{s.slice(i + term.length)}</>
  }
  return (
    <>
      <div className="crumbs">Búsqueda</div>
      <h2 className="title">“{term}”</h2>
      <p style={{ color: 'var(--text-secondary)' }}>{res.length} resultado{res.length === 1 ? '' : 's'}.</p>
      {res.map((l) => (
        <div key={l.id} className="modcard" onClick={() => navigate('#/l/' + l.id)}>
          <h4>{l.id} · {hl(l.titulo)}</h4>
          <p>Módulo {l.mod.id} · {l.mod.titulo}{l.aho ? ' · ' + l.aho : ''}</p>
        </div>
      ))}
      {!res.length && <p style={{ color: 'var(--text-muted)' }}>Sin coincidencias. Probá con otra palabra (ej. “SLR”, “polaca”, “coprocesador”).</p>}
    </>
  )
}

/* ---------------- Transcripciones ---------------- */
export function Transcripciones({ id, navigate }) {
  const [filtro, setFiltro] = useState('')
  if (!id) {
    return (
      <>
        <div className="crumbs">Material de clase</div>
        <h2 className="title">Transcripciones de clases</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Las clases grabadas y transcriptas, en párrafos y con buscador. La teoría en las palabras del profesor.
        </p>
        {TRANSCRIPCIONES.map((t) => (
          <div key={t.id} className="modcard" onClick={() => navigate('#/transcripciones/' + t.id)}>
            <h4>{t.titulo}</h4>
            <p>{t.tag} · {t.parrafos.length} párrafos</p>
          </div>
        ))}
      </>
    )
  }
  const t = TRANSCRIPCIONES.find((x) => x.id === id)
  if (!t) return <p style={{ color: 'var(--text-muted)' }}>No encontré esa transcripción.</p>
  const ps = filtro.trim() ? t.parrafos.filter((p) => p.toLowerCase().includes(filtro.toLowerCase())) : t.parrafos
  const hl = (p) => {
    if (!filtro.trim()) return p
    const i = p.toLowerCase().indexOf(filtro.toLowerCase())
    if (i < 0) return p
    return <>{p.slice(0, i)}<mark>{p.slice(i, i + filtro.length)}</mark>{p.slice(i + filtro.length)}</>
  }
  return (
    <>
      <div className="crumbs"><a onClick={() => navigate('#/transcripciones')}>Transcripciones</a> · {t.tag}</div>
      <h2 className="title">{t.titulo}</h2>
      <input type="search" placeholder="buscar en esta clase…" value={filtro} onChange={(e) => setFiltro(e.target.value)}
        style={{ width: '100%', height: 36, fontFamily: 'var(--font-sans)', fontSize: 14, marginBottom: 16 }} />
      <div style={{ fontSize: 15.5, lineHeight: 1.75 }}>
        {ps.length ? ps.map((p, i) => <p key={i} style={{ margin: '.7rem 0' }}>{hl(p)}</p>)
          : <p style={{ color: 'var(--text-muted)' }}>Sin coincidencias.</p>}
      </div>
    </>
  )
}

/* ---------------- Enunciados ---------------- */
export function Enunciados({ id, navigate }) {
  if (!id) {
    return (
      <>
        <div className="crumbs">Consignas oficiales</div>
        <h2 className="title">Enunciados de práctica</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Las 6 prácticas de la cátedra. Los ejercicios de expresiones regulares y gramáticas los podés
          resolver con validación automática en el <a onClick={() => navigate('#/sandbox')}>Sandbox</a>.
        </p>
        {ENUNCIADOS.map((e) => (
          <div key={e.id} className="modcard" onClick={() => navigate('#/practicas/' + e.id)}>
            <h4>{e.titulo}</h4><p>{e.tag}</p>
          </div>
        ))}
      </>
    )
  }
  const e = ENUNCIADOS.find((x) => x.id === id)
  if (!e) return <p style={{ color: 'var(--text-muted)' }}>No encontré ese enunciado.</p>
  return (
    <>
      <div className="crumbs"><a onClick={() => navigate('#/practicas')}>Enunciados</a> · {e.tag}</div>
      <h2 className="title">{e.titulo}</h2>
      {(e.id === 'p1' || e.id === 'p2') && (
        <div className="ejtools" style={{ marginBottom: 14 }}>
          Practicá estos ejercicios con validación automática en el <a onClick={() => navigate('#/sandbox')}>Sandbox</a>.
        </div>
      )}
      <pre style={{ whiteSpace: 'pre-wrap' }}>{e.lineas.join('\n')}</pre>
    </>
  )
}
