import { useState, useRef, useMemo } from 'react'
import type { ReactElement } from 'react'
import Cabecera from './Cabecera.tsx'
import Boton from '../ui/Boton.tsx'

/* Mesa de trabajo: teclado de símbolos, bloc monoespaciado y constructor de árboles.
   Es el "papel" de la app: no valida nada, sirve para pensar. */

const CATEGORIAS: Record<string, string[]> = {
  'Gramáticas': ['→', '⇒', 'ε', 'λ', '|', '·', '$', '⊢', 'α', 'β', 'γ', '₀', '₁', '₂', '₃'],
  'SLR e ítems': ['•', 'D', 'R', 'G', 'acc', '→', '$', '[', ']'],
  'Polaca y tercetos': [':=', '[', ']', '(', ')', ',', '@', '@aux', '*', '+', '−', '/', 'BF', 'BI', 'CMP'],
  'Coprocesador': ['FLD', 'FILD', 'FST', 'FSTP', 'FADD', 'FSUB', 'FMUL', 'FDIV', 'FCOMP', 'FSTSW AX', 'SAHF', 'FFREE', 'ST(0)', 'ST(1)', 'dd']
}

const PLANTILLAS: Record<string, string> = {
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
interface Nodo {
  label: string
  children: Nodo[]
  d?: number
  x?: number
}

function parseArbol(s: string): Nodo {
  let i = 0
  function nodo(): Nodo {
    while (i < s.length && /\s/.test(s[i] as string)) i++
    let lab = ''
    while (i < s.length && '(),'.indexOf(s[i] as string) < 0) { lab += s[i++] }
    lab = lab.trim()
    const n: Nodo = { label: lab || '·', children: [] }
    while (i < s.length && /\s/.test(s[i] as string)) i++
    if (s[i] === '(') {
      i++
      for (;;) {
        n.children.push(nodo())
        while (i < s.length && /\s/.test(s[i] as string)) i++
        if (s[i] === ',') { i++; continue }
        if (s[i] === ')') { i++; break }
        if (i >= s.length) break
      }
    }
    return n
  }
  return nodo()
}

function Arbol({ texto }: { texto: string }) {
  const svg = useMemo(() => {
    let root: Nodo
    try { root = parseArbol(texto) } catch { return null }
    let hoja = 0, maxD = 0
    ;(function lay(n: Nodo, d: number) {
      n.d = d; maxD = Math.max(maxD, d)
      if (!n.children.length) n.x = hoja++
      else {
        n.children.forEach((c) => lay(c, d + 1))
        const primero = n.children[0] as Nodo
        const ultimo = n.children[n.children.length - 1] as Nodo
        n.x = ((primero.x ?? 0) + (ultimo.x ?? 0)) / 2
      }
    })(root, 0)

    const gx = 78, gy = 74, mx = 36, my = 28
    const W = Math.max(hoja, 1) * gx, H = (maxD + 1) * gy
    const lineas: ReactElement[] = []
    const nodos: ReactElement[] = []
    ;(function draw(n: Nodo, k: string) {
      const x = mx + (n.x ?? 0) * gx, y = my + (n.d ?? 0) * gy
      n.children.forEach((c, ci) => {
        const cx = mx + (c.x ?? 0) * gx, cy = my + (c.d ?? 0) * gy
        lineas.push(
          <line key={k + '-l' + ci} x1={x} y1={y + 8} x2={cx} y2={cy - 14}
                stroke="var(--hairline-strong)" strokeWidth="1" />
        )
        draw(c, k + '-' + ci)
      })
      const w = Math.max(28, n.label.length * 8.5 + 14)
      const esHoja = !n.children.length
      nodos.push(
        <g key={k}>
          <rect
            x={x - w / 2} y={y - 14} width={w} height={26} rx="6"
            fill={esHoja ? 'var(--accent-bg)' : 'var(--surface)'}
            stroke={esHoja ? 'var(--accent)' : 'var(--hairline-strong)'} strokeWidth="1"
          />
          <text x={x} y={y + 4} textAnchor="middle" fontSize="13"
                fill={esHoja ? 'var(--accent)' : 'var(--ink)'}>{n.label}</text>
        </g>
      )
    })(root, 'r')

    return (
      <svg viewBox={`0 0 ${W + mx} ${H + my}`} width={W + mx} height={H + my} role="img"
           aria-label="Árbol de derivación">
        {lineas}{nodos}
      </svg>
    )
  }, [texto])

  return (
    <div className="arbol-caja">
      {svg ?? <p style={{ padding: 'var(--s4)', color: 'var(--ink-3)' }}>No pude leer la notación. Revisá los paréntesis.</p>}
    </div>
  )
}

const EJEMPLOS = [
  ':=(id1, +(*(id2, cte1), cte2))',
  'E(E(T(F(id))), +, T(F(cte)))',
  'if(cond(a, <, 3), asig(b, +(c,1)))'
]

export default function Mesa() {
  const [cat, setCat] = useState<string>('Gramáticas')
  const [bloc, setBloc] = useState('')
  const [arbol, setArbol] = useState(EJEMPLOS[0] as string)
  const [dibujo, setDibujo] = useState(EJEMPLOS[0] as string)
  const refBloc = useRef<HTMLTextAreaElement>(null)
  const refArbol = useRef<HTMLInputElement>(null)
  const [ultimo, setUltimo] = useState<'bloc' | 'arbol'>('bloc')

  const insertar = (t: string) => {
    const esBloc = ultimo === 'bloc'
    const el = esBloc ? refBloc.current : refArbol.current
    const val = esBloc ? bloc : arbol
    const set = esBloc ? setBloc : setArbol
    const ini = el?.selectionStart ?? val.length
    const fin = el?.selectionEnd ?? val.length
    set(val.slice(0, ini) + t + val.slice(fin))
    requestAnimationFrame(() => {
      if (el) { el.focus(); el.selectionStart = el.selectionEnd = ini + t.length }
    })
  }

  return (
    <>
      <Cabecera
        titulo="Mesa de trabajo"
        bajada="El papel de la app: símbolos que no están en el teclado, un bloc monoespaciado para alinear tablas y trazas, y un constructor de árboles de derivación. Acá no se valida nada; es para pensar."
      />

      <section className="panel" aria-labelledby="h-teclado">
        <h3 id="h-teclado" className="panel__titulo">Teclado de símbolos</h3>
        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink-3)', marginBottom: 'var(--s3)' }}>
          Se inserta donde tengas el cursor, en el bloc o en el campo del árbol: el último que hayas tocado.
        </p>
        <div className="segmentado" role="group" aria-label="Categoría de símbolos" style={{ marginBottom: 'var(--s3)' }}>
          {Object.keys(CATEGORIAS).map((c) => (
            <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <div className="teclado">
          {(CATEGORIAS[cat] ?? []).map((s) => (
            <button key={s} type="button" onClick={() => insertar(s)} aria-label={`Insertar ${s}`}>{s}</button>
          ))}
        </div>
      </section>

      <section className="panel" style={{ marginTop: 'var(--s4)' }} aria-labelledby="h-bloc">
        <h3 id="h-bloc" className="panel__titulo">Bloc monoespaciado</h3>
        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink-3)', marginBottom: 'var(--s3)' }}>
          Para alinear una tabla SLR, una traza pila/entrada/acción, una polaca numerada o una lista de tercetos.
        </p>
        <textarea
          ref={refBloc} className="control" rows={12} value={bloc}
          onFocus={() => setUltimo('bloc')} onChange={(e) => setBloc(e.target.value)}
          placeholder="Alineá acá lo que estés armando."
          aria-label="Bloc de trabajo"
        />
        <div className="teclado" style={{ marginTop: 'var(--s3)' }}>
          {Object.keys(PLANTILLAS).map((k) => (
            <button key={k} type="button" onClick={() => { setUltimo('bloc'); setBloc((v) => v + PLANTILLAS[k]) }}>
              + {k}
            </button>
          ))}
          <button type="button" onClick={() => setBloc('')}>limpiar</button>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 'var(--s4)' }} aria-labelledby="h-arbol">
        <h3 id="h-arbol" className="panel__titulo">Constructor de árbol de derivación</h3>
        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink-3)', marginBottom: 'var(--s3)' }}>
          Escribí <code>nodo(hijo, hijo)</code>; las hojas son etiquetas sueltas. Ejemplos:{' '}
          {EJEMPLOS.map((ej, i) => (
            <button
              key={i} type="button"
              style={{ background: 'none', border: 0, color: 'var(--accent)', padding: 0, marginRight: 'var(--s3)', textDecoration: 'underline' }}
              onClick={() => { setArbol(ej); setDibujo(ej) }}
            >
              ejemplo {i + 1}
            </button>
          ))}
        </p>
        <div className="acciones" style={{ marginTop: 0 }}>
          <input
            ref={refArbol} type="text" className="control" value={arbol} style={{ flex: 1, minWidth: 240 }}
            onFocus={() => setUltimo('arbol')} onChange={(e) => setArbol(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') setDibujo(arbol) }}
            aria-label="Notación del árbol"
          />
          <Boton variante="primary" onClick={() => setDibujo(arbol)}>Dibujar</Boton>
        </div>
        <Arbol texto={dibujo} />
      </section>
    </>
  )
}
