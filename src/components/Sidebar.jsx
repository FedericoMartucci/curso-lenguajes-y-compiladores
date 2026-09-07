import React from 'react'
import { CURSO, progresoCurso } from '../lib/curso.js'

const NAV = [
  ['#/inicio', 'Inicio'],
  ['#/ejercitar', 'Ejercitación'],
  ['#/sandbox', 'Sandbox validable'],
  ['#/mesa', 'Mesa de trabajo'],
  ['#/transcripciones', 'Transcripciones'],
  ['#/practicas', 'Enunciados de práctica'],
  ['#/banco', 'Banco de preguntas']
]

export default function Sidebar({ hash, navigate, open, setOpen, onToggleTheme, query, setQuery }) {
  const { total, dictadas, pct } = progresoCurso()
  const go = (to) => { navigate(to); setOpen(false) }
  const leccionActiva = hash.startsWith('#/l/') ? decodeURIComponent(hash.slice(4)) : null

  return (
    <aside className={'side' + (open ? ' open' : '')}>
      <div className="brand">
        <h1>Lenguajes y Compiladores</h1>
        <p>UNLaM · 1124/3663 · Aho 2ª ed.</p>
      </div>

      <div className="prog">
        <div className="progbar"><div className="progfill" style={{ width: pct + '%' }} /></div>
        <div className="progtext"><span>en profundidad</span><span>{dictadas}/{total} · {pct}%</span></div>
      </div>

      <div className="searchbox">
        <input
          type="search" placeholder="Buscar en el curso…" autoComplete="off"
          value={query} onChange={(e) => {
            const v = e.target.value
            setQuery(v)
            if (v.trim().length >= 2) navigate('#/buscar/' + encodeURIComponent(v.trim()))
            else if (hash.startsWith('#/buscar')) navigate('#/inicio')
          }}
        />
      </div>

      {NAV.map(([to, label]) => (
        <button key={to} className={'navlink' + (hash.startsWith(to) && !leccionActiva ? ' active' : '')} onClick={() => go(to)}>
          {label}
        </button>
      ))}

      <nav>
        {CURSO.modulos.map((m) => (
          <div key={m.id}>
            <div className="modtitle"><span>{m.id}. {m.titulo}</span><span>{m.parcial}</span></div>
            {m.lecciones.map((l) => (
              <button key={l.id} className={'les' + (leccionActiva === l.id ? ' active' : '')} onClick={() => go('#/l/' + l.id)}>
                <span className="n">{l.id}</span>
                <span>{l.titulo}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div style={{ padding: '16px 20px 4px' }}>
        <button className="iconbtn" style={{ width: '100%' }} onClick={onToggleTheme}>Cambiar tema</button>
      </div>
    </aside>
  )
}
