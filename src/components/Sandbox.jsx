import React, { useState, useRef } from 'react'
import { ER_EJ } from '../data/ejercicios/er.js'
import { LEX_EJ } from '../data/ejercicios/lexicas.js'
import { GLC_EJ } from '../data/ejercicios/glc.js'
import { testER, buildRegex, parseConjuntos } from '../engines/regex.js'
import { testAccionLexica, ATRIBUTOS, OPERADORES, attrValue, cmp } from '../engines/lexica.js'
import { testGLC, parseGrammar, earleyAccepts, tokenize } from '../engines/earley.js'

const muestra = (s) => (s === '' ? '⟨vacío⟩' : String(s).length > 46 ? String(s).slice(0, 46) + '…' : String(s))

function Casos({ resultado, extra }) {
  if (!resultado) return null
  if (resultado.error) return <div className="errbox">Error al compilar: {resultado.error}</div>
  const todo = resultado.casos.concat(extra || [])
  return (
    <div>
      <div className={'verdict ' + (resultado.ok ? 'ok' : 'bad')}>
        {resultado.ok
          ? '✓ ¡Correcta! Acepta y rechaza todo lo esperado.'
          : '✗ Todavía no: mirá los casos en rojo.'}
      </div>
      {todo.map((c, i) => (
        <div key={i} className={'caso ' + (c.pass ? 'pass' : 'fail')}>
          <span className="ico">{c.pass ? '✓' : '✗'}</span>
          <span>{muestra(c.s)}</span>
          <span className="exp">
            {c.libre
              ? (c.obtenido ? 'la acepta' : 'la rechaza')
              : <>{c.esperado ? 'debe aceptar' : 'debe rechazar'}{c.detalle ? ' · ' + c.detalle : (c.pass ? '' : (c.obtenido ? ' — la acepta' : ' — la rechaza'))}</>}
          </span>
        </div>
      ))}
    </div>
  )
}

function Selector({ lista, idx, setIdx }) {
  return (
    <>
      <label className="fld">Ejercicio</label>
      <select value={idx} onChange={(e) => setIdx(Number(e.target.value))} style={{ width: '100%' }}>
        {lista.map((e, i) => <option key={e.id} value={i}>{e.t} — {e.fuente}</option>)}
      </select>
    </>
  )
}

const TECLAS = ['{', '}', '(', ')', '|', '*', '+', '?', '[', ']', '"', '-', '.', 'ε', '->']

function Teclado({ target, value, setValue }) {
  const insertar = (t) => {
    const el = target.current
    const ini = el && el.selectionStart != null ? el.selectionStart : value.length
    const fin = el && el.selectionEnd != null ? el.selectionEnd : value.length
    setValue(value.slice(0, ini) + t + value.slice(fin))
    requestAnimationFrame(() => {
      if (el) { el.focus(); el.selectionStart = el.selectionEnd = ini + t.length }
    })
  }
  return (
    <div className="keys">
      {TECLAS.map((k) => <button key={k} type="button" onClick={() => insertar(k)}>{k}</button>)}
    </div>
  )
}

/* ---------------- Expresiones regulares ---------------- */
function TabER() {
  const [idx, setIdx] = useState(0)
  const e = ER_EJ[idx]
  const [cj, setCj] = useState(e.cj)
  const [er, setEr] = useState('')
  const [res, setRes] = useState(null)
  const [propia, setPropia] = useState('')
  const [extra, setExtra] = useState([])
  const erRef = useRef(null)

  const cambiar = (i) => { setIdx(i); setCj(ER_EJ[i].cj); setEr(''); setRes(null); setPropia(''); setExtra([]) }
  const validar = () => { setExtra([]); setRes(testER(er, cj, e.ac, e.rc)) }
  const probarPropia = () => {
    try {
      const rx = buildRegex(er, parseConjuntos(cj))
      const ok = rx.test(propia)
      setExtra([{ s: propia, obtenido: ok, pass: ok, libre: true }])
      if (!res) setRes(testER(er, cj, e.ac, e.rc))
    } catch (err) { setRes({ ok: false, casos: [], error: err.message }) }
  }

  return (
    <div className="card">
      <Selector lista={ER_EJ} idx={idx} setIdx={cambiar} />
      <div className="consigna">{e.c}</div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
        Nivel: {e.nivel} · {e.ac.length + e.rc.length} casos de prueba
      </p>

      <label className="fld">Conjuntos (uno por línea: NOMBRE  definición)</label>
      <textarea rows={3} value={cj} onChange={(ev) => setCj(ev.target.value)} />

      <label className="fld">Expresión regular del token</label>
      <input ref={erRef} type="text" style={{ width: '100%' }} value={er}
        onChange={(ev) => setEr(ev.target.value)} placeholder="Ej: {DIGITO1}{DIGITO}{DIGITO}{DIGITO}" />
      <Teclado target={erRef} value={er} setValue={setEr} />

      <div className="row">
        <div style={{ flex: 0 }}><button className="btn pri" onClick={validar}>Validar</button></div>
        <div><input type="text" placeholder="probar una cadena propia" value={propia}
          onChange={(ev) => setPropia(ev.target.value)} style={{ width: '100%' }} /></div>
        <div style={{ flex: 0 }}><button className="btn" onClick={probarPropia}>probar</button></div>
      </div>

      <Casos resultado={res} extra={extra} />

      <details className="modelo">
        <summary>Ver respuesta modelo</summary>
        <pre>{'CONJUNTO\n' + (e.cj || '(ninguno)') + '\n\nTOKEN     EXP. REG.\n' + e.t + '\n' + e.m}</pre>
        <p className="hint">Puede haber varias expresiones equivalentes correctas: lo que importa es que acepte y rechace lo que corresponde.</p>
      </details>

      <p className="hint">
        Notación: <code>{'{NOMBRE}'}</code> referencia un conjunto · <code>[0-9]</code> clase de caracteres ·
        <code>"texto"</code> literal exacto · operadores <code>* + ? | ( )</code> · concatenar es escribir seguido.
        Los espacios se ignoran.
      </p>
    </div>
  )
}

/* ---------------- Acciones léxicas ---------------- */
function TabLex() {
  const [idx, setIdx] = useState(0)
  const e = LEX_EJ[idx]
  const [cj, setCj] = useState(e.cj)
  const [er, setEr] = useState('')
  const [atr, setAtr] = useState('valor')
  const [op, setOp] = useState('<=')
  const [cota, setCota] = useState('')
  const [res, setRes] = useState(null)
  const erRef = useRef(null)

  const cambiar = (i) => {
    setIdx(i); setCj(LEX_EJ[i].cj); setEr(''); setAtr('valor'); setOp('<='); setCota(''); setRes(null)
  }
  const validar = () => {
    if (cota === '') { setRes({ ok: false, casos: [], error: 'Indicá la cota.' }); return }
    setRes(testAccionLexica(er, cj, atr, op, parseFloat(cota), e.tests))
  }

  return (
    <div className="card">
      <Selector lista={LEX_EJ} idx={idx} setIdx={cambiar} />
      <div className="consigna">{e.c}</div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
        Nivel: {e.nivel} · {e.tests.length} casos, incluidos los valores límite
      </p>

      <label className="fld">Conjuntos</label>
      <textarea rows={3} value={cj} onChange={(ev) => setCj(ev.target.value)} />

      <label className="fld">Expresión regular del token (la FORMA)</label>
      <input ref={erRef} type="text" style={{ width: '100%' }} value={er} onChange={(ev) => setEr(ev.target.value)} />
      <Teclado target={erRef} value={er} setValue={setEr} />

      <label className="fld">Acción léxica — condición que debe cumplir el lexema (la COTA)</label>
      <div className="row">
        <div>
          <select value={atr} onChange={(ev) => setAtr(ev.target.value)} style={{ width: '100%' }}>
            {ATRIBUTOS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </div>
        <div style={{ flex: 0, minWidth: 80 }}>
          <select value={op} onChange={(ev) => setOp(ev.target.value)} style={{ width: '100%' }}>
            {OPERADORES.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div><input type="number" step="any" placeholder="cota" value={cota}
          onChange={(ev) => setCota(ev.target.value)} style={{ width: '100%' }} /></div>
        <div style={{ flex: 0 }}><button className="btn pri" onClick={validar}>Validar</button></div>
      </div>

      <Casos resultado={res} />

      <details className="modelo">
        <summary>Ver respuesta modelo</summary>
        <pre>{`ER:  ${e.mER}

ACCION LEXICA
{
  if ( ${ATRIBUTOS.find((a) => a.id === e.atr)?.label} ${e.op} ${e.cota} )
      return TOKEN;
  else
      error("fuera de cota");
}`}</pre>
      </details>

      <p className="hint">
        La <b>expresión regular</b> reconoce la forma; la <b>acción léxica</b> valida la cota. Un lexema con forma
        correcta pero fuera de cota se rechaza en la acción, en tiempo de compilación (etapa léxica).
      </p>
    </div>
  )
}

/* ---------------- Gramáticas ---------------- */
function TabGLC() {
  const [idx, setIdx] = useState(0)
  const e = GLC_EJ[idx]
  const [gr, setGr] = useState('')
  const [res, setRes] = useState(null)
  const [propia, setPropia] = useState('')
  const [extra, setExtra] = useState([])
  const grRef = useRef(null)

  const cambiar = (i) => { setIdx(i); setGr(''); setRes(null); setPropia(''); setExtra([]) }
  const validar = () => { setExtra([]); setRes(testGLC(gr, e.ac, e.rc)) }
  const probarPropia = () => {
    try {
      const g = parseGrammar(gr)
      if (!g.start) throw new Error('Escribí al menos una regla')
      const ok = earleyAccepts(g, tokenize(propia))
      setExtra([{ s: propia, obtenido: ok, pass: ok, libre: true }])
      if (!res) setRes(testGLC(gr, e.ac, e.rc))
    } catch (err) { setRes({ ok: false, casos: [], error: err.message }) }
  }

  return (
    <div className="card">
      <Selector lista={GLC_EJ} idx={idx} setIdx={cambiar} />
      <div className="consigna">{e.c}</div>
      {e.nota && <div className="notaval"><b>Ojo con este ejercicio:</b> {e.nota}</div>}
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
        Nivel: {e.nivel} · {e.ac.length + e.rc.length} cadenas de prueba
      </p>

      <p className="hint" style={{ marginTop: 10 }}>
        Debe <b>aceptar</b>: {e.ac.map((s, i) => <code key={i} style={{ marginRight: 6 }}>{muestra(s)}</code>)}<br />
        Debe <b>rechazar</b>: {e.rc.map((s, i) => <code key={i} style={{ marginRight: 6 }}>{muestra(s)}</code>)}
      </p>

      <label className="fld">
        Gramática (una regla por línea: <code>NoTerminal -&gt; símbolos | alternativa</code>. Usá ε para vacío.
        El primer no terminal es el símbolo distinguido.)
      </label>
      <textarea ref={grRef} rows={7} value={gr} onChange={(ev) => setGr(ev.target.value)}
        placeholder={'S -> ( S ) S | ε'} />
      <Teclado target={grRef} value={gr} setValue={setGr} />

      <div className="row">
        <div style={{ flex: 0 }}><button className="btn pri" onClick={validar}>Validar</button></div>
        <div><input type="text" placeholder="probar una cadena (tokens separados por espacios)" value={propia}
          onChange={(ev) => setPropia(ev.target.value)} style={{ width: '100%' }} /></div>
        <div style={{ flex: 0 }}><button className="btn" onClick={probarPropia}>probar</button></div>
      </div>

      <Casos resultado={res} extra={extra} />

      <details className="modelo">
        <summary>Ver respuesta modelo</summary>
        <pre>{e.m}</pre>
      </details>

      <p className="hint">
        Los símbolos van separados por espacios. Todo símbolo que aparezca a la izquierda de una regla es
        no terminal; el resto son terminales (id, cte, +, ( …). El validador comprueba qué cadenas acepta y
        rechaza tu gramática.
      </p>
    </div>
  )
}

export default function Sandbox() {
  const [tab, setTab] = useState('er')
  return (
    <>
      <div className="crumbs">Herramienta · autoevaluación</div>
      <h2 className="title">Sandbox validable</h2>
      <p style={{ color: 'var(--text-secondary)' }}>
        Escribí tu respuesta en la notación del parcial y la <b>valido de verdad</b>: la corro contra ejemplos
        que deben aceptarse y otros que deben rechazarse, incluidos los casos borde.
      </p>
      <div className="tabs">
        <button className={'tab' + (tab === 'er' ? ' on' : '')} onClick={() => setTab('er')}>
          Expresiones regulares ({ER_EJ.length})
        </button>
        <button className={'tab' + (tab === 'lex' ? ' on' : '')} onClick={() => setTab('lex')}>
          Acciones léxicas ({LEX_EJ.length})
        </button>
        <button className={'tab' + (tab === 'glc' ? ' on' : '')} onClick={() => setTab('glc')}>
          Gramáticas ({GLC_EJ.length})
        </button>
      </div>
      {tab === 'er' && <TabER />}
      {tab === 'lex' && <TabLex />}
      {tab === 'glc' && <TabGLC />}
    </>
  )
}
