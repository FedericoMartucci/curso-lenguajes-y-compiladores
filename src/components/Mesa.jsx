import React, { useState, useRef, useMemo } from 'react'

const CATS = {
  'Gramáticas': ['→', '⇒', 'ε', 'λ', '|', '·', '$', '⊢', 'α', 'β', 'γ', '₀', '₁', '₂', '₃'],
  'SLR / ítems': ['•', 'D', 'R', 'G', 'acc', '→', '$', '[', ']'],
  'GCI · polaca · tercetos': [':=', '[', ']', '(', ')', ',', '@', '@aux', '*', '+', '−', '/', 'BF', 'BI', 'CMP'],
  'Coprocesador': ['FLD', 'FILD', 'FST', 'FSTP', 'FADD', 'FSUB', 'FMUL', 'FDIV', 'FCOMP', 'FSTSW AX', 'SAHF', 'FFREE', 'ST(0)', 'ST(1)', 'dd']
}

const PLANTILLAS = {
  'tabla SLR':
    '       | id  cte  +   *   :=  $  | E   T   F\n' +
    '-------+-----------------------+-----------\n' +
    '  0    |                       |\n' +
    '  1    |                       |\n' +
    '  2    |                       |\n',
  'traza LR':
    'PILA                | ENTRADA              | ACCION\n' +
    '--------------------+----------------------+--------\n' +
    '0                   | id := id * cte $     |\n' +
    '                    |                      |\n',
  'tercetos':
    '[11] (          ,        ,        )\n' +
    '[12] (          ,        ,        )\n' +
    '[13] (          ,        ,        )\n',
  'esqueleto ASM':
    '.MODEL LARGE\n.386\n.STACK 200h\n.DATA\n    @aux1 dd ?\n    _cte  dd ?\n.CODE\n' +
    '    MOV AX, @DATA\n    MOV DS, AX\n    MOV ES, AX\n\n    FFREE\n    MOV AX, 4C00H\n    INT 21H\nEND\n',
  'primeros/siguientes':
    'No terminal | PRIMERO          | SIGUIENTE\n' +
    '------------+------------------+------------------\n' +
    '            |                  |\n'
}

/* ---- parser de la notación nodo(hijo, hijo) ---- */
function parseArbol(s) {
  let i = 0
  function nodo() {
    while (i < s.length && /\s/.test(s[i])) i++
    let lab = ''
    while (i < s.length && '(),'.indexOf(s[i]) < 0) { lab += s[i++] }
    lab = lab.trim()
    const n = { label: lab || '·', children: [] }
    while (i < s.length && /\s/.test(s[i])) i++
    if (s[i] === '(') {
      i++
      for (;;) {
        n.children.push(nodo())
        while (i < s.length && /\s/.test(s[i])) i++
        if (s[i] === ',') { i++; continue }
        if (s[i] === ')') { i++; break }
        if (i >= s.length) break
      }
    }
    return n
  }
  return nodo()
}

function Arbol({ texto }) {
  const svg = useMemo(() => {
    let root
    try { root = parseArbol(texto) } catch { return null }
    let hoja = 0, maxD = 0
    ;(function lay(n, d) {
      n.d = d; maxD = Math.max(maxD, d)
      if (!n.children.length) n.x = hoja++
      else { n.children.forEach((c) => lay(c, d + 1)); n.x = (n.children[0].x + n.children[n.children.length - 1].x) / 2 }
    })(root, 0)
    const gx = 78, gy = 74, mx = 36, my = 28
    const W = Math.max(hoja, 1) * gx, H = (maxD + 1) * gy
    const lineas = [], nodos = []
    ;(function draw(n, k) {
      const x = mx + n.x * gx, y = my + n.d * gy
      n.children.forEach((c, ci) => {
        const cx = mx + c.x * gx, cy = my + c.d * gy
        lineas.push(<line key={k + '-l' + ci} x1={x} y1={y + 8} x2={cx} y2={cy - 14} stroke="var(--border-strong)" strokeWidth="1" />)
        draw(c, k + '-' + ci)
      })
      const w = Math.max(28, n.label.length * 8.5 + 14)
      const esHoja = !n.children.length
      nodos.push(
        <g key={k}>
          <rect x={x - w / 2} y={y - 14} width={w} height={26} rx="6"
            fill={esHoja ? 'var(--bg-accent)' : 'var(--surface-2)'}
            stroke={esHoja ? 'var(--text-accent)' : 'var(--border-strong)'} strokeWidth="1" />
          <text x={x} y={y + 4} textAnchor="middle" fontSize="13"
            fill={esHoja ? 'var(--text-accent)' : 'var(--text-primary)'}>{n.label}</text>
        </g>
      )
    })(root, 'r')
    return <svg viewBox={`0 0 ${W + mx} ${H + my}`} width={W + mx} height={H + my}>{lineas}{nodos}</svg>
  }, [texto])
  return <div className="treebox">{svg || <p style={{ padding: 12, color: 'var(--text-muted)' }}>No pude leer la notación. Revisá los paréntesis.</p>}</div>
}

export default function Mesa() {
  const [cat, setCat] = useState('Gramáticas')
  const [pad, setPad] = useState('')
  const [arbol, setArbol] = useState(':=(id1, +(*(id2, cte1), cte2))')
  const [dibujo, setDibujo] = useState(':=(id1, +(*(id2, cte1), cte2))')
  const padRef = useRef(null)
  const arbolRef = useRef(null)
  const [ultimo, setUltimo] = useState('pad')

  const insertar = (t) => {
    const esPad = ultimo === 'pad'
    const el = esPad ? padRef.current : arbolRef.current
    const val = esPad ? pad : arbol
    const set = esPad ? setPad : setArbol
    const ini = el && el.selectionStart != null ? el.selectionStart : val.length
    const fin = el && el.selectionEnd != null ? el.selectionEnd : val.length
    set(val.slice(0, ini) + t + val.slice(fin))
    requestAnimationFrame(() => { if (el) { el.focus(); el.selectionStart = el.selectionEnd = ini + t.length } })
  }

  return (
    <>
      <div className="crumbs">Herramienta</div>
      <h2 className="title">Mesa de trabajo</h2>
      <p style={{ color: 'var(--text-secondary)' }}>
        Teclado de símbolos, bloc monoespaciado para tablas y trazas, y constructor de árboles — para practicar sin papel.
      </p>

      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 500, margin: '0 0 8px', color: 'var(--text-secondary)' }}>Teclado de símbolos</h3>
        <div className="tabs">
          {Object.keys(CATS).map((c) => (
            <button key={c} className={'tab' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <div className="keys">
          {CATS[cat].map((s) => <button key={s} onClick={() => insertar(s)}>{s}</button>)}
        </div>
        <p className="hint">Se inserta donde tengas el cursor, en el bloc o en el campo del árbol (el último que hayas tocado).</p>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 500, margin: '0 0 8px', color: 'var(--text-secondary)' }}>
          Bloc monoespaciado — tablas SLR, trazas, polaca, tercetos
        </h3>
        <textarea ref={padRef} rows={12} value={pad} onFocus={() => setUltimo('pad')}
          onChange={(e) => setPad(e.target.value)}
          placeholder="Alineá acá una tabla SLR, una traza pila/entrada/acción, una polaca numerada o una lista de tercetos." />
        <div className="keys" style={{ marginTop: 10 }}>
          {Object.keys(PLANTILLAS).map((k) => (
            <button key={k} onClick={() => { setUltimo('pad'); setPad((v) => v + PLANTILLAS[k]) }}>{k}</button>
          ))}
          <button onClick={() => setPad('')}>limpiar</button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 500, margin: '0 0 8px', color: 'var(--text-secondary)' }}>
          Constructor de árbol de derivación
        </h3>
        <div className="row">
          <div style={{ flex: 1 }}>
            <input ref={arbolRef} type="text" value={arbol} onFocus={() => setUltimo('arbol')}
              onChange={(e) => setArbol(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div style={{ flex: 0 }}><button className="btn pri" onClick={() => setDibujo(arbol)}>dibujar</button></div>
        </div>
        <p className="hint">
          Escribí <code>nodo(hijo, hijo)</code>; las hojas son etiquetas sueltas. Ejemplos:{' '}
          {[':=(id1, +(*(id2, cte1), cte2))', 'E(E(T(F(id))), +, T(F(cte)))', 'if(cond(a, <, 3), asig(b, +(c,1)))'].map((ej, i) => (
            <a key={i} style={{ marginRight: 10 }} onClick={() => { setArbol(ej); setDibujo(ej) }}>ejemplo {i + 1}</a>
          ))}
        </p>
        <Arbol texto={dibujo} />
      </div>
    </>
  )
}
