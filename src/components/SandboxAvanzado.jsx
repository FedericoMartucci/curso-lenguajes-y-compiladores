import React, { useState, useMemo } from 'react'
import { PARSING_EJ } from '../data/ejercicios/parsing.js'
import { GCI_EJ } from '../data/ejercicios/gci.js'
import { ASM_EJ } from '../data/ejercicios/asm.js'
import { decorar } from '../data/ejercicios/meta.js'
import { parseGrammar } from '../engines/earley.js'
import { tablaSLR, validarConjuntos, reglasNumeradas, textoItem, textoAccion, FIN } from '../engines/parsing.js'
import { testIntermedia } from '../engines/polaca.js'
import { testAssembler } from '../engines/coprocesador.js'

export const PARSING = decorar(PARSING_EJ, 'parsing')
export const GCI = decorar(GCI_EJ, 'gci')
export const ASM = decorar(ASM_EJ, 'asm')

const setTxt = (s) => [...s].sort().join(', ') || '∅'

/* ================= Parsing (Práctica 3) ================= */
export function TabParsing({ hechos, marcar, Selector }) {
  const [id, setId] = useState(PARSING[0].id)
  const e = PARSING.find((x) => x.id === id)
  const [prim, setPrim] = useState('')
  const [sig, setSig] = useState('')
  const [esSLR, setEsSLR] = useState('')
  const [res, setRes] = useState(null)

  const info = useMemo(() => {
    try { return tablaSLR(parseGrammar(e.gramatica)) } catch { return null }
  }, [e])

  const elegir = (n) => { setId(n); setPrim(''); setSig(''); setEsSLR(''); setRes(null) }

  const validar = () => {
    if (e.pedir === 'conflictos') {
      if (!esSLR) { setRes({ error: 'Elegí si la gramática es SLR o no.' }); return }
      const correcto = info.esSLR ? 'si' : 'no'
      const ok = esSLR === correcto
      setRes({ tipo: 'conflictos', ok, correcto, conflictos: info.conflictos })
      if (ok) marcar('parsing', e.id)
      return
    }
    const partes = []
    if (e.pedir === 'primeros' || e.pedir === 'ambos') partes.push(['primeros', validarConjuntos(prim, e.gramatica, 'primeros')])
    if (e.pedir === 'siguientes' || e.pedir === 'ambos') partes.push(['siguientes', validarConjuntos(sig, e.gramatica, 'siguientes')])
    const ok = partes.every(([, r]) => r.ok)
    setRes({ tipo: 'conjuntos', ok, partes })
    if (ok) marcar('parsing', e.id)
  }

  return (
    <div className="card">
      <Selector lista={PARSING} id={id} onPick={elegir} hechos={hechos} tipo="parsing" />
      <div className="consigna">{e.c}</div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
        Nivel: {e.nivel}
        {hechos['parsing:' + e.id] && <span className="hechoflag"> · ya resuelto ✓</span>}
      </p>

      <label className="fld">Gramática del ejercicio</label>
      <pre>{e.gramatica}</pre>

      {e.pedir === 'conflictos' ? (
        <>
          <label className="fld">¿La gramática es SLR? (¿la tabla queda sin conflictos?)</label>
          <select value={esSLR} onChange={(ev) => setEsSLR(ev.target.value)} style={{ width: 260 }}>
            <option value="">Elegí una opción…</option>
            <option value="si">Sí, no hay conflictos</option>
            <option value="no">No, hay conflictos</option>
          </select>
        </>
      ) : (
        <>
          {(e.pedir === 'primeros' || e.pedir === 'ambos') && (
            <>
              <label className="fld">PRIMEROS — un no terminal por línea, por ejemplo: <code>E = id, cte</code></label>
              <textarea rows={4} value={prim} onChange={(ev) => setPrim(ev.target.value)} placeholder={'E = id, cte\nT = id, cte'} />
            </>
          )}
          {(e.pedir === 'siguientes' || e.pedir === 'ambos') && (
            <>
              <label className="fld">SIGUIENTES — usá <code>$</code> para el fin de la entrada</label>
              <textarea rows={4} value={sig} onChange={(ev) => setSig(ev.target.value)} placeholder={'E = $, +\nT = $, +, *'} />
            </>
          )}
        </>
      )}

      <div className="row"><div style={{ flex: 0 }}><button className="btn pri" onClick={validar}>Validar</button></div></div>

      {res?.error && <div className="errbox">{res.error}</div>}

      {res?.tipo === 'conjuntos' && (
        <>
          <div className={'verdict ' + (res.ok ? 'ok' : 'bad')}>
            {res.ok ? '✓ ¡Correcto! Los conjuntos coinciden.' : '✗ Todavía no: mirá las filas en rojo.'}
          </div>
          {res.partes.map(([cual, r]) => (
            <div key={cual}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '10px 0 4px', textTransform: 'uppercase', letterSpacing: '.04em' }}>{cual}</p>
              {r.error && <div className="errbox">{r.error}</div>}
              {r.filas?.map((f) => (
                <div key={f.nt} className={'caso ' + (f.pass ? 'pass' : 'fail')}>
                  <span className="ico">{f.pass ? '✓' : '✗'}</span>
                  <span>{f.nt} = {setTxt(new Set(f.puesto))}</span>
                  <span className="exp">
                    {f.pass ? 'correcto'
                      : !f.cargado ? 'no lo cargaste'
                      : <>correcto: {setTxt(new Set(f.esperado))}{f.faltan.length ? ` · faltan: ${f.faltan.join(', ')}` : ''}{f.sobran.length ? ` · sobran: ${f.sobran.join(', ')}` : ''}</>}
                  </span>
                </div>
              ))}
              {!!r.extra?.length && <div className="errbox">Estos no son no terminales de la gramática: {r.extra.join(', ')}</div>}
            </div>
          ))}
        </>
      )}

      {res?.tipo === 'conflictos' && (
        <>
          <div className={'verdict ' + (res.ok ? 'ok' : 'bad')}>
            {res.ok ? '✓ ¡Correcto!' : `✗ No: la respuesta correcta es "${res.correcto === 'si' ? 'sí, no hay conflictos' : 'no, hay conflictos'}".`}
          </div>
          {!!res.conflictos.length && (
            <div>
              <p style={{ fontSize: 13, margin: '10px 0 4px' }}>Conflictos encontrados:</p>
              {res.conflictos.map((c, i) => (
                <div key={i} className="caso fail">
                  <span className="ico">✗</span>
                  <span>estado {c.estado}, símbolo {c.simbolo}</span>
                  <span className="exp">{c.clase} · {c.acciones.map(textoAccion).join(' / ')}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <details className="modelo">
        <summary>Ver la solución completa (gramática aumentada, conjuntos, estados y tabla SLR)</summary>
        {info ? <SolucionParsing info={info} /> : <p className="hint">No pude procesar la gramática.</p>}
      </details>
    </div>
  )
}

function SolucionParsing({ info }) {
  const g = info.gAumentada
  const noTerm = info.noTerminales.filter((A) => A !== g.start)
  return (
    <div style={{ overflowX: 'auto' }}>
      <p style={{ fontSize: 13, margin: '10px 0 4px' }}><b>Gramática aumentada</b></p>
      <pre>{reglasNumeradas(g).join('\n')}</pre>

      <p style={{ fontSize: 13, margin: '10px 0 4px' }}><b>Primeros y siguientes</b></p>
      <table className="tablaslr">
        <thead><tr><th>No terminal</th><th>PRIMEROS</th><th>SIGUIENTES</th></tr></thead>
        <tbody>
          {noTerm.map((A) => (
            <tr key={A}><td>{A}</td><td>{setTxt(info.primeros[A])}</td><td>{setTxt(info.siguientes[A])}</td></tr>
          ))}
        </tbody>
      </table>

      <p style={{ fontSize: 13, margin: '14px 0 4px' }}><b>Estados (ítems LR(0))</b> — {info.estados.length} estados</p>
      <pre>{info.estados.map((its, i) => `I${i}:\n` + its.map((it) => '   ' + textoItem(g, it)).join('\n')).join('\n')}</pre>

      <p style={{ fontSize: 13, margin: '14px 0 4px' }}><b>Tabla SLR</b> — D = desplazar, R = reducir por regla</p>
      <table className="tablaslr">
        <thead>
          <tr>
            <th>Estado</th>
            {info.cols.map((t) => <th key={t}>{t}</th>)}
            {noTerm.map((A) => <th key={A} className="ir">{A}</th>)}
          </tr>
        </thead>
        <tbody>
          {info.estados.map((_, i) => (
            <tr key={i}>
              <td><b>{i}</b></td>
              {info.cols.map((t) => {
                const a = info.accion[i][t]
                const conf = a && a.length > 1
                return <td key={t} className={conf ? 'conf' : ''}>{a ? a.map(textoAccion).join(' / ') : ''}</td>
              })}
              {noTerm.map((A) => <td key={A} className="ir">{info.irA[i][A] ?? ''}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="hint">
        {info.esSLR
          ? 'No hay conflictos: la gramática es SLR.'
          : `Hay ${info.conflictos.length} conflicto(s), marcados en rojo. La gramática no es SLR.`}
        {' '}La columna <code>{FIN}</code> es el fin de la entrada.
      </p>
    </div>
  )
}

/* ================= GCI (Prácticas 4 y 5) ================= */
export function TabGCI({ hechos, marcar, Selector }) {
  const [id, setId] = useState(GCI[0].id)
  const e = GCI.find((x) => x.id === id)
  const [txt, setTxt] = useState('')
  const [res, setRes] = useState(null)

  const elegir = (n) => { setId(n); setTxt(''); setRes(null) }
  const validar = () => {
    const r = testIntermedia(txt, e.casos, e.modo)
    setRes(r)
    if (r.ok) marcar('gci', e.id)
  }

  return (
    <div className="card">
      <Selector lista={GCI} id={id} onPick={elegir} hechos={hechos} tipo="gci" />
      <div className="consigna">{e.c}</div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
        Nivel: {e.nivel} · notación: {e.modo === 'tercetos' ? 'tercetos' : 'polaca inversa'} · se valida ejecutando tu código
        {hechos['gci:' + e.id] && <span className="hechoflag"> · ya resuelto ✓</span>}
      </p>

      <label className="fld">Programa a traducir</label>
      <pre>{e.programa}</pre>

      <label className="fld">
        {e.modo === 'tercetos'
          ? 'Tus tercetos (uno por línea, con el formato [11] (op, arg1, arg2) )'
          : 'Tu polaca inversa (celdas separadas por espacios, numeradas desde 1)'}
      </label>
      <textarea rows={e.modo === 'tercetos' ? 6 : 3} value={txt} onChange={(ev) => setTxt(ev.target.value)}
        placeholder={e.modo === 'tercetos' ? '[11] (*, b, c)\n[12] (+, a, [11])\n[13] (:=, z, [12])' : 'a b + z :='} />

      <div className="row"><div style={{ flex: 0 }}><button className="btn pri" onClick={validar}>Ejecutar y validar</button></div></div>

      {res && (
        <>
          <div className={'verdict ' + (res.ok ? 'ok' : 'bad')}>
            {res.ok ? '✓ ¡Correcta! Da el resultado esperado en todos los casos.' : '✗ Todavía no: mirá los casos en rojo.'}
          </div>
          {res.resultados.map((r, i) => (
            <div key={i} className={'caso ' + (r.pass ? 'pass' : 'fail')}>
              <span className="ico">{r.pass ? '✓' : '✗'}</span>
              <span>{Object.entries(r.inicial || {}).map(([k, v]) => `${k}=${v}`).join(' ') || 'sin valores iniciales'}</span>
              <span className="exp">
                {r.error
                  ? r.error
                  : (r.detalles || []).map((d) => `${d.variable}: esperado ${d.esperado}, obtenido ${d.obtenido ?? '—'}`).join(' · ')}
              </span>
            </div>
          ))}
        </>
      )}

      <details className="modelo">
        <summary>Ver respuesta modelo</summary>
        <pre>{e.m}</pre>
        <p className="hint">
          Es una solución posible. Como la validación es por ejecución, cualquier otra que dé los mismos
          resultados también es correcta.
        </p>
      </details>

      <p className="hint">
        Convención: operandos y operadores separados por espacios · asignación <code>:=</code> ·
        saltos <code>BF</code> (por falso) y <code>BI</code> (incondicional), con la celda destino en la
        posición siguiente al salto · las celdas se numeran desde 1.
      </p>
    </div>
  )
}

/* ================= Assembler (Práctica 6) ================= */
export function TabASM({ hechos, marcar, Selector }) {
  const [id, setId] = useState(ASM[0].id)
  const e = ASM.find((x) => x.id === id)
  const [txt, setTxt] = useState(ASM[0].plantilla)
  const [res, setRes] = useState(null)

  const elegir = (n) => { const x = ASM.find((k) => k.id === n); setId(n); setTxt(x.plantilla); setRes(null) }
  const validar = () => {
    const r = testAssembler(txt, e.casos)
    setRes(r)
    if (r.ok) marcar('asm', e.id)
  }

  return (
    <div className="card">
      <Selector lista={ASM} id={id} onPick={elegir} hechos={hechos} tipo="asm" />
      <div className="consigna">{e.c}</div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
        Nivel: {e.nivel} · se ejecuta en un simulador del coprocesador
        {hechos['asm:' + e.id] && <span className="hechoflag"> · ya resuelto ✓</span>}
      </p>

      <label className="fld">Tu código Assembler (completá el segmento .CODE)</label>
      <textarea rows={16} value={txt} onChange={(ev) => setTxt(ev.target.value)} />

      <div className="row"><div style={{ flex: 0 }}><button className="btn pri" onClick={validar}>Ejecutar y validar</button></div></div>

      {res && (
        <>
          <div className={'verdict ' + (res.ok ? 'ok' : 'bad')}>
            {res.ok ? '✓ ¡Correcto! El coprocesador deja los valores esperados.' : '✗ Todavía no: mirá los casos en rojo.'}
          </div>
          {res.resultados.map((r, i) => (
            <div key={i} className={'caso ' + (r.pass ? 'pass' : 'fail')}>
              <span className="ico">{r.pass ? '✓' : '✗'}</span>
              <span>{Object.entries(r.inicial || {}).map(([k, v]) => `${k}=${v}`).join(' ')}</span>
              <span className="exp">
                {r.error ? r.error
                  : (r.detalles || []).map((d) => `${d.variable}: esperado ${d.esperado}, obtenido ${d.obtenido ?? '—'}`).join(' · ')}
              </span>
            </div>
          ))}
        </>
      )}

      <details className="modelo">
        <summary>Ver respuesta modelo</summary>
        <pre>{e.m}</pre>
      </details>

      <p className="hint">
        Recordá: <code>FADD/FSUB/FMUL/FDIV</code> hacen <code>ST(1) := ST(1) op ST(0)</code> y después
        <code>pop</code>, así que el orden en que cargás importa. <code>FSTP</code> guarda y saca de la pila;
        <code>FST</code> guarda sin sacar. 🎯 El coprocesador no puede hacer <code>FLD</code> de una constante
        literal: declarala en el <code>.DATA</code>.
      </p>
    </div>
  )
}
