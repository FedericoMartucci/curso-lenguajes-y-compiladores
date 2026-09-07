import { useState, useMemo, useCallback } from 'react'
import { PARSING } from '../../lib/ejercicios.ts'
import { parseGrammar } from '../../engines/earley.ts'
import { tablaSLR, validarConjuntos, reglasNumeradas, textoItem, textoAccion, FIN } from '../../engines/parsing.ts'
import { useProgreso } from '../../lib/progreso.tsx'
import type { InfoSLR, ResultadoConjuntos, Conflicto } from '../../tipos/motores.ts'
import type { Ruta } from '../../lib/router.ts'
import { EncabezadoEjercicio, useBorrador } from './marco.tsx'
import Campo from '../../ui/Campo.tsx'
import Boton from '../../ui/Boton.tsx'

const setTxt = (s: Iterable<string> | undefined) => [...(s ?? [])].sort().join(', ') || '∅'

type Resultado =
  | { tipo: 'conjuntos'; ok: boolean; partes: [string, ResultadoConjuntos][] }
  | { tipo: 'conflictos'; ok: boolean; correcto: 'si' | 'no'; conflictos: Conflicto[] }
  | { tipo: 'error'; mensaje: string }

export default function PanelParsing({ id, ir }: { id: string; ir: (r: Ruta) => void }) {
  const e = PARSING.find((x) => x.id === id) ?? (PARSING[0] as typeof PARSING[number])
  const { registrarIntento } = useProgreso()
  const [campos, set] = useBorrador('parsing', e.id, { prim: '', sig: '', esSLR: '' })
  const [res, setRes] = useState<Resultado | null>(null)

  const info = useMemo<InfoSLR | null>(() => {
    try { return tablaSLR(parseGrammar(e.gramatica)) } catch { return null }
  }, [e])

  const prim = campos.prim ?? ''
  const sig = campos.sig ?? ''
  const esSLR = campos.esSLR ?? ''

  const validar = useCallback(() => {
    if (!info) { setRes({ tipo: 'error', mensaje: 'No pude procesar la gramática del ejercicio.' }); return }
    if (e.pedir === 'conflictos') {
      if (!esSLR) { setRes({ tipo: 'error', mensaje: 'Elegí si la gramática es SLR o no.' }); return }
      const correcto: 'si' | 'no' = info.esSLR ? 'si' : 'no'
      const ok = esSLR === correcto
      setRes({ tipo: 'conflictos', ok, correcto, conflictos: info.conflictos })
      registrarIntento('parsing', e.id, ok)
      return
    }
    const partes: [string, ResultadoConjuntos][] = []
    if (e.pedir === 'primeros' || e.pedir === 'ambos') partes.push(['primeros', validarConjuntos(prim, e.gramatica, 'primeros')])
    if (e.pedir === 'siguientes' || e.pedir === 'ambos') partes.push(['siguientes', validarConjuntos(sig, e.gramatica, 'siguientes')])
    const ok = partes.every(([, r]) => r.ok)
    setRes({ tipo: 'conjuntos', ok, partes })
    registrarIntento('parsing', e.id, ok)
  }, [info, e, prim, sig, esSLR, registrarIntento])

  const pideConjuntos = e.pedir !== 'conflictos'

  return (
    <div>
      <EncabezadoEjercicio
        tipo="parsing" e={e} casos={info?.estados.length ?? 0} lista={PARSING} ir={ir}
        extra={
          <div className="honestidad">
            <span aria-hidden="true">=</span>
            <p>
              <b>Acá no hay respuesta guardada:</b> los conjuntos y la tabla los calcula el motor a partir
              de esta gramática, así que la corrección siempre coincide con el enunciado.
            </p>
          </div>
        }
      />

      <div className="campos">
        <div>
          <p className="campo__label">Gramática del ejercicio</p>
          <pre>{e.gramatica}</pre>
        </div>

        {pideConjuntos ? (
          <>
            {(e.pedir === 'primeros' || e.pedir === 'ambos') && (
              <Campo label="PRIMEROS" nota="un no terminal por línea" ayuda={<>Por ejemplo: <code>E = id, cte</code></>}>
                {(p) => (
                  <textarea {...p} className="control" rows={4} value={prim}
                            placeholder={'E = id, cte\nT = id, cte'}
                            onChange={(ev) => set('prim', ev.target.value)}
                            onKeyDown={(ev) => { if ((ev.metaKey || ev.ctrlKey) && ev.key === 'Enter') validar() }} />
                )}
              </Campo>
            )}
            {(e.pedir === 'siguientes' || e.pedir === 'ambos') && (
              <Campo label="SIGUIENTES" nota="usá $ para el fin de la entrada">
                {(p) => (
                  <textarea {...p} className="control" rows={4} value={sig}
                            placeholder={'E = $, +\nT = $, +, *'}
                            onChange={(ev) => set('sig', ev.target.value)}
                            onKeyDown={(ev) => { if ((ev.metaKey || ev.ctrlKey) && ev.key === 'Enter') validar() }} />
                )}
              </Campo>
            )}
          </>
        ) : (
          <Campo label="¿La gramática es SLR?" ayuda="Es decir: ¿la tabla queda sin conflictos?">
            {(p) => (
              <select {...p} className="control control--sans" style={{ maxWidth: 300 }}
                      value={esSLR} onChange={(ev) => set('esSLR', ev.target.value)}>
                <option value="">Elegí una opción…</option>
                <option value="si">Sí, no hay conflictos</option>
                <option value="no">No, hay conflictos</option>
              </select>
            )}
          </Campo>
        )}
      </div>

      <div className="acciones">
        <Boton variante="primary" onClick={validar} tecla="⌘↵">Validar</Boton>
      </div>

      {res?.tipo === 'error' && <div className="errbox" role="alert">{res.mensaje}</div>}

      {res?.tipo === 'conjuntos' && (
        <>
          <p className={'veredicto veredicto--' + (res.ok ? 'ok' : 'bad')} role="status">
            <span aria-hidden="true">{res.ok ? '✓' : '✗'}</span>
            {res.ok ? 'Correcto. Los conjuntos coinciden.' : 'Todavía no: mirá las filas en rojo.'}
          </p>
          {res.partes.map(([cual, r]) => (
            <div key={cual} style={{ marginTop: 'var(--s4)' }}>
              <p className="campo__label">{cual}</p>
              {r.error && <div className="errbox">{r.error}</div>}
              <div className="casos">
                {r.filas?.map((f) => (
                  <div key={f.nt} className={'caso caso--' + (f.pass ? 'pass' : 'fail')}>
                    <span className="caso__ico" aria-hidden="true">{f.pass ? '✓' : '✗'}</span>
                    <span className="caso__s">{f.nt} = {setTxt(f.puesto)}</span>
                    <span className="caso__exp">
                      {f.pass ? 'correcto'
                        : !f.cargado ? 'no lo cargaste'
                        : <>
                            correcto: {setTxt(f.esperado)}
                            {f.faltan.length ? ` · faltan ${f.faltan.join(', ')}` : ''}
                            {f.sobran.length ? ` · sobran ${f.sobran.join(', ')}` : ''}
                          </>}
                    </span>
                  </div>
                ))}
              </div>
              {!!r.extra?.length && (
                <div className="errbox">Estos no son no terminales de la gramática: {r.extra.join(', ')}</div>
              )}
            </div>
          ))}
        </>
      )}

      {res?.tipo === 'conflictos' && (
        <>
          <p className={'veredicto veredicto--' + (res.ok ? 'ok' : 'bad')} role="status">
            <span aria-hidden="true">{res.ok ? '✓' : '✗'}</span>
            {res.ok ? 'Correcto.' : `No: la respuesta es "${res.correcto === 'si' ? 'sí, no hay conflictos' : 'no, hay conflictos'}".`}
          </p>
          {!!res.conflictos.length && (
            <div className="casos">
              {res.conflictos.map((c, i) => (
                <div key={i} className="caso caso--fail">
                  <span className="caso__ico" aria-hidden="true">✗</span>
                  <span className="caso__s">estado {c.estado}, símbolo {c.simbolo}</span>
                  <span className="caso__exp">{c.clase} · {c.acciones.map(textoAccion).join(' / ')}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <details style={{ marginTop: 'var(--s5)' }}>
        <summary style={{ cursor: 'pointer', color: 'var(--accent)', fontSize: 'var(--fs-base)' }}>
          Ver la solución completa: gramática aumentada, conjuntos, estados y tabla SLR
        </summary>
        {info ? <Solucion info={info} /> : <p style={{ color: 'var(--ink-3)' }}>No pude procesar la gramática.</p>}
      </details>
    </div>
  )
}

function Solucion({ info }: { info: InfoSLR }) {
  const g = info.gAumentada
  const noTerm = info.noTerminales.filter((A) => A !== g.start)
  return (
    <div style={{ marginTop: 'var(--s4)' }}>
      <p className="campo__label">Gramática aumentada</p>
      <pre>{reglasNumeradas(g).join('\n')}</pre>

      <p className="campo__label" style={{ marginTop: 'var(--s4)' }}>Primeros y siguientes</p>
      <div className="scroll-x">
        <table className="tabla-slr">
          <thead><tr><th>No terminal</th><th>PRIMEROS</th><th>SIGUIENTES</th></tr></thead>
          <tbody>
            {noTerm.map((A) => (
              <tr key={A}>
                <td>{A}</td>
                <td>{setTxt(info.primeros[A])}</td>
                <td>{setTxt(info.siguientes[A])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="campo__label" style={{ marginTop: 'var(--s4)' }}>
        Estados (ítems LR(0)) — {info.estados.length} estados
      </p>
      <pre>{info.estados.map((its, i) => `I${i}:\n` + its.map((it) => '   ' + textoItem(g, it)).join('\n')).join('\n')}</pre>

      <p className="campo__label" style={{ marginTop: 'var(--s4)' }}>
        Tabla SLR — D = desplazar, R = reducir por regla
      </p>
      <div className="scroll-x">
        <table className="tabla-slr">
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
                  const a = info.accion[i]?.[t]
                  const conf = a && a.length > 1
                  return <td key={t} className={conf ? 'conf' : ''}>{a ? a.map(textoAccion).join(' / ') : ''}</td>
                })}
                {noTerm.map((A) => <td key={A} className="ir">{info.irA[i]?.[A] ?? ''}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink-3)', marginTop: 'var(--s3)' }}>
        {info.esSLR
          ? 'No hay conflictos: la gramática es SLR.'
          : `Hay ${info.conflictos.length} conflicto(s), marcados en rojo. La gramática no es SLR.`}
        {' '}La columna <code>{FIN}</code> es el fin de la entrada.
      </p>
    </div>
  )
}
