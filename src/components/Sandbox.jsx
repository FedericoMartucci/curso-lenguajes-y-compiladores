import React, { useState, useRef, useMemo } from 'react'
import { ER_EJ } from '../data/ejercicios/er.js'
import { LEX_EJ } from '../data/ejercicios/lexicas.js'
import { GLC_EJ } from '../data/ejercicios/glc.js'
import { decorar, agrupar } from '../data/ejercicios/meta.js'
import { testER, buildRegex, parseConjuntos } from '../engines/regex.js'
import { testGLC, parseGrammar, earleyAccepts, tokenize } from '../engines/earley.js'
import { testAccionCodigo, codigoModelo, ATTR_LABEL } from '../engines/accionLexica.js'
import { useLocalStorage } from '../lib/hooks.js'
import CodeEditor from './CodeEditor.jsx'
import { TabParsing, TabGCI, TabASM, PARSING, GCI, ASM } from './SandboxAvanzado.jsx'

const muestra = (s) => (s === '' ? '⟨vacío⟩' : String(s).length > 46 ? String(s).slice(0, 46) + '…' : String(s))

const ER = decorar(ER_EJ, 'er')
const LEX = decorar(LEX_EJ, 'lex')
const GLC = decorar(GLC_EJ, 'glc')

const PLANTILLA_ACCION = `ACCION LEXICA
{
  if (  )
      return TOKEN;
  else
      error("fuera de cota");
}`

/* ---------- piezas compartidas ---------- */
function Casos({ resultado, extra }) {
  if (!resultado) return null
  if (resultado.error) return <div className="errbox">{resultado.error}</div>
  const todo = resultado.casos.concat(extra || [])
  return (
    <div>
      <div className={'verdict ' + (resultado.ok ? 'ok' : 'bad')}>
        {resultado.ok ? '✓ ¡Correcta! Acepta y rechaza todo lo esperado.' : '✗ Todavía no: mirá los casos en rojo.'}
      </div>
      {!!(resultado.avisos || []).length && (
        <div className="avisos">
          La validación pasó, pero fijate en la forma:
          <ul>{resultado.avisos.map((a, i) => <li key={i}>{a}</li>)}</ul>
        </div>
      )}
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

function Selector({ lista, id, onPick, hechos, tipo }) {
  const grupos = useMemo(() => agrupar(lista), [lista])
  const hechosN = lista.filter((e) => hechos[tipo + ':' + e.id]).length
  const pct = lista.length ? Math.round((hechosN / lista.length) * 100) : 0
  return (
    <>
      <label className="fld">Ejercicio</label>
      <select value={id} onChange={(e) => onPick(e.target.value)} style={{ width: '100%' }}>
        {grupos.map((g) => (
          <optgroup key={g.nombre} label={g.nombre}>
            {g.items.map((e) => (
              <option key={e.id} value={e.id}>
                {(hechos[tipo + ':' + e.id] ? '✓ ' : '') + `${g.nombre} · ${e.num} — ${e.t}`}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <div className="trazo">
        <span>{hechosN} de {lista.length} resueltos</span>
        <div className="barra"><div style={{ width: pct + '%' }} /></div>
        <span>{pct}%</span>
      </div>
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
    requestAnimationFrame(() => { if (el) { el.focus(); el.selectionStart = el.selectionEnd = ini + t.length } })
  }
  return <div className="keys">{TECLAS.map((k) => <button key={k} type="button" onClick={() => insertar(k)}>{k}</button>)}</div>
}

/* ---------- Expresiones regulares ---------- */
function TabER({ hechos, marcar }) {
  const [id, setId] = useState(ER[0].id)
  const e = ER.find((x) => x.id === id)
  const [cj, setCj] = useState(e.cj)
  const [er, setEr] = useState('')
  const [res, setRes] = useState(null)
  const [propia, setPropia] = useState('')
  const [extra, setExtra] = useState([])
  const erRef = useRef(null)

  const elegir = (nuevo) => {
    const x = ER.find((k) => k.id === nuevo)
    setId(nuevo); setCj(x.cj); setEr(''); setRes(null); setPropia(''); setExtra([])
  }
  const validar = () => {
    setExtra([])
    const r = testER(er, cj, e.ac, e.rc)
    setRes(r)
    if (r.ok) marcar('er', e.id)
  }
  const probarPropia = () => {
    try {
      const rx = buildRegex(er, parseConjuntos(cj))
      const ok = rx.test(propia)
      setExtra([{ s: propia, obtenido: ok, pass: ok, libre: true }])
      if (!res) setRes(testER(er, cj, e.ac, e.rc))
    } catch (err) { setRes({ ok: false, casos: [], error: 'Error al compilar: ' + err.message }) }
  }

  return (
    <div className="card">
      <Selector lista={ER} id={id} onPick={elegir} hechos={hechos} tipo="er" />
      <div className="consigna">{e.c}</div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
        Nivel: {e.nivel} · {e.ac.length + e.rc.length} casos de prueba
        {hechos['er:' + e.id] && <span className="hechoflag"> · ya resuelto ✓</span>}
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
        <pre>{'CONJUNTO\n' + (e.cj || '(ninguno)') + '\n\nTOKEN     EXP. REG.\n' + e.m}</pre>
        <p className="hint">Puede haber varias expresiones equivalentes correctas: lo que importa es que acepte y rechace lo que corresponde.</p>
      </details>

      <p className="hint">
        Notación: <code>{'{NOMBRE}'}</code> referencia un conjunto · <code>[0-9]</code> clase de caracteres ·
        <code>"texto"</code> literal exacto · operadores <code>* + ? | ( )</code> · concatenar es escribir seguido.
      </p>
    </div>
  )
}

/* ---------- Acciones léxicas ---------- */
function TabLex({ hechos, marcar }) {
  const [id, setId] = useState(LEX[0].id)
  const e = LEX.find((x) => x.id === id)
  const [cj, setCj] = useState(e.cj)
  const [er, setEr] = useState('')
  const [codigo, setCodigo] = useState(PLANTILLA_ACCION)
  const [res, setRes] = useState(null)
  const erRef = useRef(null)

  const elegir = (nuevo) => {
    const x = LEX.find((k) => k.id === nuevo)
    setId(nuevo); setCj(x.cj); setEr(''); setCodigo(PLANTILLA_ACCION); setRes(null)
  }

  const validar = () => {
    let rx
    try { rx = buildRegex(er, parseConjuntos(cj)) }
    catch (err) { setRes({ ok: false, casos: [], error: 'Error en la expresión regular: ' + err.message }); return }
    const r = testAccionCodigo(rx, codigo, e.tests)
    setRes(r)
    if (r.ok) marcar('lex', e.id)
  }

  return (
    <div className="card">
      <Selector lista={LEX} id={id} onPick={elegir} hechos={hechos} tipo="lex" />
      <div className="consigna">{e.c}</div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
        Nivel: {e.nivel} · {e.tests.length} casos, incluidos los valores límite
        {hechos['lex:' + e.id] && <span className="hechoflag"> · ya resuelto ✓</span>}
      </p>

      <label className="fld">Conjuntos</label>
      <textarea rows={3} value={cj} onChange={(ev) => setCj(ev.target.value)} />

      <label className="fld">Expresión regular del token — la FORMA</label>
      <input ref={erRef} type="text" style={{ width: '100%' }} value={er} onChange={(ev) => setEr(ev.target.value)} />
      <Teclado target={erRef} value={er} setValue={setEr} />

      <label className="fld">Acción léxica — la COTA. Escribila como código:</label>
      <CodeEditor value={codigo} onChange={setCodigo} rows={8} />
      <div className="leyenda">
        <span><b className="tk-kw">palabras clave</b></span>
        <span><b className="tk-attr">atributo del lexema</b></span>
        <span><b className="tk-num">números</b></span>
        <span><b className="tk-op">comparadores</b></span>
        <span><b className="tk-str">textos</b></span>
      </div>
      <p className="hint">
        Atributos que entiendo: <code>valor</code>, <code>valor absoluto</code>, <code>longitud</code>,{' '}
        <code>longitud sin comillas</code>, <code>cantidad de guiones bajos</code>, <code>cantidad de guiones medios</code>.
        También <code>len(yytext)</code>, <code>val()</code> o <code>abs(valor)</code>. Podés combinar con <code>and</code> / <code>or</code>.
      </p>

      <div className="row">
        <div style={{ flex: 0 }}><button className="btn pri" onClick={validar}>Validar</button></div>
      </div>

      <Casos resultado={res} />

      <details className="modelo">
        <summary>Ver respuesta modelo</summary>
        <pre>{'ER:  ' + e.mER + '\n\n' + codigoModelo(e.atr, e.op, e.cota)}</pre>
        <p className="hint">
          La expresión regular reconoce la forma; la acción léxica valida la cota. Un lexema con forma correcta
          pero fuera de cota se rechaza <b>en la acción</b>, en tiempo de compilación (etapa léxica).
        </p>
      </details>
    </div>
  )
}

/* ---------- Gramáticas ---------- */
function TabGLC({ hechos, marcar }) {
  const [id, setId] = useState(GLC[0].id)
  const e = GLC.find((x) => x.id === id)
  const [gr, setGr] = useState('')
  const [res, setRes] = useState(null)
  const [propia, setPropia] = useState('')
  const [extra, setExtra] = useState([])
  const grRef = useRef(null)

  const elegir = (nuevo) => { setId(nuevo); setGr(''); setRes(null); setPropia(''); setExtra([]) }
  const validar = () => {
    setExtra([])
    const r = testGLC(gr, e.ac, e.rc)
    setRes(r)
    if (r.ok) marcar('glc', e.id)
  }
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
      <Selector lista={GLC} id={id} onPick={elegir} hechos={hechos} tipo="glc" />
      <div className="consigna">{e.c}</div>
      {e.nota && <div className="notaval"><b>Ojo con este ejercicio:</b> {e.nota}</div>}
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
        Nivel: {e.nivel} · {e.ac.length + e.rc.length} cadenas de prueba
        {hechos['glc:' + e.id] && <span className="hechoflag"> · ya resuelto ✓</span>}
      </p>

      <p className="hint" style={{ marginTop: 10 }}>
        Debe <b>aceptar</b>: {e.ac.map((s, i) => <code key={i} style={{ marginRight: 6 }}>{muestra(s)}</code>)}<br />
        Debe <b>rechazar</b>: {e.rc.map((s, i) => <code key={i} style={{ marginRight: 6 }}>{muestra(s)}</code>)}
      </p>

      <label className="fld">
        Gramática (una regla por línea: <code>NoTerminal -&gt; símbolos | alternativa</code>. Usá ε para vacío.
        El primer no terminal es el símbolo distinguido.)
      </label>
      <textarea ref={grRef} rows={7} value={gr} onChange={(ev) => setGr(ev.target.value)} placeholder={'S -> ( S ) S | ε'} />
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
    </div>
  )
}

/* ---------- contenedor ---------- */
export default function Sandbox() {
  const [tab, setTab] = useState('er')
  const [hechos, setHechos] = useLocalStorage('lyc-sandbox', {})
  const marcar = (tipo, id) => setHechos((h) => ({ ...h, [tipo + ':' + id]: true }))

  const total = ER.length + LEX.length + GLC.length + PARSING.length + GCI.length + ASM.length
  const resueltos = Object.values(hechos).filter(Boolean).length
  const cuenta = (tipo, lista) => lista.filter((e) => hechos[tipo + ':' + e.id]).length

  return (
    <>
      <div className="crumbs">Herramienta · autoevaluación</div>
      <h2 className="title">Sandbox validable</h2>
      <p style={{ color: 'var(--text-secondary)' }}>
        Escribí tu respuesta en la notación del parcial y la <b>valido de verdad</b>: la corro contra ejemplos
        que deben aceptarse y otros que deben rechazarse, incluidos los casos borde.
      </p>

      <div className="trazo" style={{ margin: '10px 0 16px' }}>
        <span>Progreso general: {resueltos} de {total}</span>
        <div className="barra"><div style={{ width: Math.round((resueltos / total) * 100) + '%' }} /></div>
        {resueltos > 0 && (
          <button className="btn" style={{ padding: '3px 8px', fontSize: 11 }}
            onClick={() => { if (confirm('¿Borrar el progreso del sandbox?')) setHechos({}) }}>reiniciar</button>
        )}
      </div>

      <div className="tabs">
        <button className={'tab' + (tab === 'er' ? ' on' : '')} onClick={() => setTab('er')}>
          Expresiones regulares ({cuenta('er', ER)}/{ER.length})
        </button>
        <button className={'tab' + (tab === 'lex' ? ' on' : '')} onClick={() => setTab('lex')}>
          Acciones léxicas ({cuenta('lex', LEX)}/{LEX.length})
        </button>
        <button className={'tab' + (tab === 'glc' ? ' on' : '')} onClick={() => setTab('glc')}>
          Gramáticas ({cuenta('glc', GLC)}/{GLC.length})
        </button>
        <button className={'tab' + (tab === 'parsing' ? ' on' : '')} onClick={() => setTab('parsing')}>
          Parsing SLR ({cuenta('parsing', PARSING)}/{PARSING.length})
        </button>
        <button className={'tab' + (tab === 'gci' ? ' on' : '')} onClick={() => setTab('gci')}>
          Código intermedio ({cuenta('gci', GCI)}/{GCI.length})
        </button>
        <button className={'tab' + (tab === 'asm' ? ' on' : '')} onClick={() => setTab('asm')}>
          Assembler ({cuenta('asm', ASM)}/{ASM.length})
        </button>
      </div>

      {tab === 'er' && <TabER hechos={hechos} marcar={marcar} />}
      {tab === 'lex' && <TabLex hechos={hechos} marcar={marcar} />}
      {tab === 'glc' && <TabGLC hechos={hechos} marcar={marcar} />}
      {tab === 'parsing' && <TabParsing hechos={hechos} marcar={marcar} Selector={Selector} />}
      {tab === 'gci' && <TabGCI hechos={hechos} marcar={marcar} Selector={Selector} />}
      {tab === 'asm' && <TabASM hechos={hechos} marcar={marcar} Selector={Selector} />}
    </>
  )
}
