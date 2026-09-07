import { useState, useMemo, useCallback } from 'react'
import { PARSING } from '../../lib/ejercicios.ts'
import { parseGrammar } from '../../engines/earley.ts'
import {
  tablaSLR, validarConjuntos, validarAumentada, validarTabla,
  reglasNumeradas, textoItem, textoAccion, FIN
} from '../../engines/parsing.ts'
import type { ResultadoAumentada, ResultadoTabla, CeldaTabla } from '../../engines/parsing.ts'
import { useProgreso } from '../../lib/progreso.tsx'
import type { InfoSLR, ResultadoConjuntos, Conflicto } from '../../tipos/motores.ts'
import type { EtapaParsing } from '../../tipos/ejercicios.ts'
import type { Ruta } from '../../lib/router.ts'
import { EncabezadoEjercicio, TrasResolver, useBorrador } from './marco.tsx'
import { Escalones, Escalon } from '../../componentes/Escalones.tsx'
import TablaSLR from '../../componentes/TablaSLR.tsx'
import Campo from '../../ui/Campo.tsx'
import Boton from '../../ui/Boton.tsx'
import Icono from '../../ui/Icono.tsx'

/* El ejercicio de parsing se corrige por etapas, no de una.

   De la clase: "si cometen un error desde el principio, desde el armado del autómata, ese
   error se arrastra en todo el ejercicio y puede estar todo mal". Cerrar cada etapa antes de
   pasar a la siguiente es lo que evita descubrir a las dos horas que la tabla estaba mal
   porque la gramática aumentada tenía una regla de menos. */

const setTxt = (s: Iterable<string> | undefined) => [...(s ?? [])].sort().join(', ') || '∅'

const NOMBRE: Record<EtapaParsing, string> = {
  aumentada: 'Gramática aumentada',
  primeros: 'PRIMEROS',
  siguientes: 'SIGUIENTES',
  tabla: 'Tabla SLR',
  conflictos: '¿Es SLR?'
}

/* El verbo del botón por etapa. No se puede derivar del nombre con toLowerCase() porque
   PRIMEROS y SLR son siglas y quedaban en minúscula. */
const ACCION_BOTON: Record<EtapaParsing, string> = {
  aumentada: 'Corregir la gramática',
  primeros: 'Corregir PRIMEROS',
  siguientes: 'Corregir SIGUIENTES',
  tabla: 'Corregir la tabla',
  conflictos: 'Comprobar'
}

type Resultados = {
  aumentada?: ResultadoAumentada
  primeros?: ResultadoConjuntos
  siguientes?: ResultadoConjuntos
  tabla?: ResultadoTabla
  conflictos?: { ok: boolean; correcto: 'si' | 'no'; conflictos: Conflicto[] }
}

export default function PanelParsing({ id, ir }: { id: string; ir: (r: Ruta) => void }) {
  const e = PARSING.find((x) => x.id === id) ?? (PARSING[0] as typeof PARSING[number])
  const { registrarIntento } = useProgreso()
  const etapas = e.etapas

  const info = useMemo<InfoSLR | null>(() => {
    try { return tablaSLR(parseGrammar(e.gramatica)) } catch { return null }
  }, [e])

  const [campos, set] = useBorrador('parsing', e.id, {
    aumentada: '', prim: '', sig: '', esSLR: '', tabla: '{}'
  })
  const [activa, setActiva] = useState<EtapaParsing>(etapas[0] as EtapaParsing)
  const [res, setRes] = useState<Resultados>({})

  // la tabla vive como JSON en el borrador para que sobreviva al refresh
  const celdas = useMemo<Record<string, string>>(() => {
    try { return JSON.parse(campos['tabla'] ?? '{}') as Record<string, string> }
    catch { return {} }
  }, [campos])

  const setCelda = useCallback((clave: string, valor: string) => {
    const nuevas = { ...celdas, [clave]: valor }
    if (!valor.trim()) delete nuevas[clave]
    set('tabla', JSON.stringify(nuevas))
  }, [celdas, set])

  const validar = useCallback(() => {
    const nuevo: Resultados = { ...res }
    switch (activa) {
      case 'aumentada':
        nuevo.aumentada = validarAumentada(campos['aumentada'] ?? '', e.gramatica); break
      case 'primeros':
        nuevo.primeros = validarConjuntos(campos['prim'] ?? '', e.gramatica, 'primeros'); break
      case 'siguientes':
        nuevo.siguientes = validarConjuntos(campos['sig'] ?? '', e.gramatica, 'siguientes'); break
      case 'tabla':
        nuevo.tabla = validarTabla(celdas, e.gramatica); break
      case 'conflictos': {
        if (!info) break
        const correcto: 'si' | 'no' = info.esSLR ? 'si' : 'no'
        nuevo.conflictos = {
          ok: (campos['esSLR'] ?? '') === correcto,
          correcto, conflictos: info.conflictos
        }
        break
      }
    }
    setRes(nuevo)
    const completo = etapas.every((x) => nuevo[x]?.ok)
    registrarIntento('parsing', e.id, completo)
  }, [activa, campos, celdas, e, etapas, info, res, registrarIntento])

  const listas = etapas.filter((x) => res[x]?.ok).length
  const completo = listas === etapas.length
  const puedeValidar =
    activa === 'aumentada' ? Boolean((campos['aumentada'] ?? '').trim())
    : activa === 'primeros' ? Boolean((campos['prim'] ?? '').trim())
    : activa === 'siguientes' ? Boolean((campos['sig'] ?? '').trim())
    : activa === 'conflictos' ? Boolean(campos['esSLR'])
    : true

  const noTerm = info ? info.noTerminales.filter((A) => A !== info.gAumentada.start) : []

  return (
    <div>
      <EncabezadoEjercicio
        tipo="parsing" e={e} casos={0} lista={PARSING} ir={ir}
        extra={
          <div className="honestidad">
            <Icono nombre="libro" tam={16} />
            <p>
              <b>Acá no hay respuesta guardada:</b> los conjuntos, los estados y la tabla los calcula
              el motor a partir de esta gramática, así que la corrección siempre coincide con el
              enunciado. Se corrige por etapas porque un error en la primera se arrastra a todas.
            </p>
          </div>
        }
      />

      <div className="campos">
        <div>
          <p className="campo__label">Gramática del ejercicio</p>
          <pre>{e.gramatica}</pre>
        </div>
      </div>

      <div className="etapas" role="group" aria-label="Etapas del ejercicio" style={{ marginTop: 'var(--s5)' }}>
        {etapas.map((x, i) => (
          <button
            key={x} type="button"
            className={'etapa' + (res[x]?.ok ? ' etapa--lista' : '')}
            aria-pressed={activa === x} onClick={() => setActiva(x)}
          >
            <span className="etapa__n">{i + 1}</span>
            {res[x]?.ok && <Icono nombre="check" tam={13} />}
            {NOMBRE[x]}
          </button>
        ))}
        <span className="etapas__cuenta">{listas} de {etapas.length}</span>
      </div>

      {/* ---------------- etapa 1: gramática aumentada ---------------- */}
      {activa === 'aumentada' && (
        <>
          <Campo
            label="Gramática aumentada"
            nota="una regla por línea, numeradas desde 0"
            ayuda={<>La regla 0 agrega un símbolo distinguido nuevo que deriva el original. El nombre
              es libre: la cátedra usa <code>S0</code>, el libro usa <code>S'</code>.</>}
          >
            {(p) => (
              <textarea
                {...p} className="control" rows={7} value={campos['aumentada'] ?? ''}
                placeholder={'0. S0 -> S\n1. …'}
                onChange={(ev) => set('aumentada', ev.target.value)}
                onKeyDown={(ev) => { if ((ev.metaKey || ev.ctrlKey) && ev.key === 'Enter') validar() }}
              />
            )}
          </Campo>
          {res.aumentada && <ResultadoReglas r={res.aumentada} />}
        </>
      )}

      {/* ---------------- etapas 2 y 3: conjuntos ---------------- */}
      {(activa === 'primeros' || activa === 'siguientes') && (
        <>
          <Campo
            label={activa === 'primeros' ? 'PRIMEROS' : 'SIGUIENTES'}
            nota="un no terminal por línea"
            ayuda={activa === 'siguientes'
              ? <>Usá <code>$</code> para el fin de la entrada. Arranca siempre en el del símbolo distinguido.</>
              : <>Por ejemplo: <code>E = id, cte</code></>}
          >
            {(p) => (
              <textarea
                {...p} className="control" rows={5}
                value={campos[activa === 'primeros' ? 'prim' : 'sig'] ?? ''}
                placeholder={'NoTerminal = terminal, terminal'}
                onChange={(ev) => set(activa === 'primeros' ? 'prim' : 'sig', ev.target.value)}
                onKeyDown={(ev) => { if ((ev.metaKey || ev.ctrlKey) && ev.key === 'Enter') validar() }}
              />
            )}
          </Campo>
          {res[activa] && <ResultadoConjuntosVista r={res[activa] as ResultadoConjuntos} />}
        </>
      )}

      {/* ---------------- etapa 4: la tabla ---------------- */}
      {activa === 'tabla' && info && (
        <>
          <p className="campo__label">
            Tabla SLR
            <em style={{ float: 'right', fontWeight: 400 }}>
              D5 desplazar a 5 · R3 reducir por la regla 3 · acc aceptar · vacío es vacío
            </em>
          </p>
          <TablaSLR
            info={info} celdas={celdas} setCelda={setCelda}
            correccion={res.tabla?.celdas ?? null}
            bloqueada={res.tabla?.ok}
          />
          {res.tabla && <ResumenTabla r={res.tabla} />}
        </>
      )}

      {/* ---------------- etapa 5: conflictos ---------------- */}
      {activa === 'conflictos' && (
        <>
          <Campo label="¿La gramática es SLR?" ayuda="Es decir: ¿la tabla queda sin conflictos?">
            {(p) => (
              <select {...p} className="control control--sans" style={{ maxWidth: 300 }}
                      value={campos['esSLR'] ?? ''} onChange={(ev) => set('esSLR', ev.target.value)}>
                <option value="">Elegí una opción…</option>
                <option value="si">Sí, no hay conflictos</option>
                <option value="no">No, hay conflictos</option>
              </select>
            )}
          </Campo>
          {res.conflictos && (
            <>
              <p className={'veredicto veredicto--' + (res.conflictos.ok ? 'ok' : 'bad')} role="status">
                <Icono nombre={res.conflictos.ok ? 'check' : 'cruz'} tam={18} />
                {res.conflictos.ok
                  ? 'Correcto.'
                  : `No: la respuesta es "${res.conflictos.correcto === 'si' ? 'sí, no hay conflictos' : 'no, hay conflictos'}".`}
              </p>
              {!!res.conflictos.conflictos.length && (
                <div className="casos">
                  {res.conflictos.conflictos.map((c, i) => (
                    <div key={i} className="caso caso--fail">
                      <Icono nombre="cruz" tam={13} className="caso__ico" />
                      <span className="caso__s">estado {c.estado}, símbolo {c.simbolo}</span>
                      <span className="caso__exp">{c.clase} · {c.acciones.map(textoAccion).join(' / ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      <div className="acciones">
        <Boton variante="primary" onClick={validar} tecla="⌘↵" disabled={!puedeValidar}>
          {ACCION_BOTON[activa]}
        </Boton>
      </div>

      <TrasResolver ok={completo} tipo="parsing" actual={e.id} lista={PARSING} ir={ir} />

      <Escalones>
        <Escalon titulo="Una pista" costo="no revela la respuesta">
          <p>
            PRIMEROS de un no terminal son los terminales con los que puede <b>empezar</b> lo que
            deriva. SIGUIENTES son los que pueden aparecer <b>justo después</b>; <code>$</code> arranca
            en el del símbolo distinguido, y un no terminal al final de una regla hereda los SIGUIENTES
            del de la izquierda. En la tabla, la reducción por una regla va en las columnas de los
            SIGUIENTES de su lado izquierdo: por eso los conjuntos van antes.
          </p>
        </Escalon>
        <Escalon titulo="Ver los estados (ítems LR(0))" costo="revela parte">
          {info
            ? <pre>{info.estados.map((its, i) => `I${i}:\n` + its.map((it) => '   ' + textoItem(info.gAumentada, it)).join('\n')).join('\n')}</pre>
            : <p style={{ color: 'var(--ink-3)' }}>No pude procesar la gramática.</p>}
        </Escalon>
        <Escalon titulo="Ver la solución completa" costo="revela todo">
          {info ? <Solucion info={info} noTerm={noTerm} /> : <p style={{ color: 'var(--ink-3)' }}>No pude procesar la gramática.</p>}
        </Escalon>
      </Escalones>
    </div>
  )
}

/* ---------- vistas de resultado por etapa ---------- */

function ResultadoReglas({ r }: { r: ResultadoAumentada }) {
  if (r.error) return <div className="errbox" role="alert"><Icono nombre="cruz" tam={14} /><span>{r.error}</span></div>
  const mal = r.filas.filter((f) => !f.pass)
  return (
    <div>
      <p className={'veredicto veredicto--' + (r.ok ? 'ok' : 'bad')} role="status">
        <Icono nombre={r.ok ? 'check' : 'cruz'} tam={18} />
        {r.ok
          ? `Correcta. Las ${r.filas.length} reglas están bien numeradas.`
          : `Todavía no: ${mal.length} de ${r.filas.length} ${r.filas.length === 1 ? 'regla' : 'reglas'}.`}
      </p>
      <div className="casos">
        {[...r.filas].sort((a, b) => Number(a.pass) - Number(b.pass)).map((f) => (
          <div key={f.n} className={'caso caso--' + (f.pass ? 'pass' : 'fail')}>
            <Icono nombre={f.pass ? 'check' : 'cruz'} tam={13} className="caso__ico" />
            <span className="caso__s">{f.n}. {f.puesta ?? '—'}</span>
            <span className="caso__exp">{f.pass ? 'correcta' : `${f.detalle} · va ${f.esperada}`}</span>
          </div>
        ))}
      </div>
      {!!r.sobran.length && (
        <div className="errbox"><Icono nombre="cruz" tam={14} />
          <span>Sobran reglas: {r.sobran.join(' · ')}</span></div>
      )}
    </div>
  )
}

function ResultadoConjuntosVista({ r }: { r: ResultadoConjuntos }) {
  if (r.error) return <div className="errbox" role="alert"><Icono nombre="cruz" tam={14} /><span>{r.error}</span></div>
  const mal = r.filas.filter((f) => !f.pass)
  return (
    <div>
      <p className={'veredicto veredicto--' + (r.ok ? 'ok' : 'bad')} role="status">
        <Icono nombre={r.ok ? 'check' : 'cruz'} tam={18} />
        {r.ok ? 'Correcto. Los conjuntos coinciden.' : `Todavía no: ${mal.length} de ${r.filas.length}.`}
      </p>
      <div className="casos">
        {[...r.filas].sort((a, b) => Number(a.pass) - Number(b.pass)).map((f) => (
          <div key={f.nt} className={'caso caso--' + (f.pass ? 'pass' : 'fail')}>
            <Icono nombre={f.pass ? 'check' : 'cruz'} tam={13} className="caso__ico" />
            <span className="caso__s">{f.nt} = {setTxt(f.puesto)}</span>
            <span className="caso__exp">
              {f.pass ? 'correcto'
                : !f.cargado ? 'no lo cargaste'
                : <>va {setTxt(f.esperado)}
                    {f.faltan.length ? ` · faltan ${f.faltan.join(', ')}` : ''}
                    {f.sobran.length ? ` · sobran ${f.sobran.join(', ')}` : ''}</>}
            </span>
          </div>
        ))}
      </div>
      {!!r.extra?.length && (
        <div className="errbox"><Icono nombre="cruz" tam={14} />
          <span>Estos no son no terminales de la gramática: {r.extra.join(', ')}</span></div>
      )}
    </div>
  )
}

function ResumenTabla({ r }: { r: ResultadoTabla }) {
  if (r.error) return <div className="errbox" role="alert"><Icono nombre="cruz" tam={14} /><span>{r.error}</span></div>
  const mal = r.celdas.filter((c) => !c.pass).length
  return (
    <p className={'veredicto veredicto--' + (r.ok ? 'ok' : 'bad')} role="status">
      <Icono nombre={r.ok ? 'check' : 'cruz'} tam={18} />
      {r.ok
        ? `Correcta. Las ${r.total} celdas coinciden, incluidas las que van vacías.`
        : <>Todavía no: {mal} {mal === 1 ? 'celda' : 'celdas'} mal
            {r.faltan > 0 && <> · {r.faltan} sin cargar</>}
            {r.deMas > 0 && <> · {r.deMas} que tendrían que estar vacías</>}
          </>}
    </p>
  )
}

function Solucion({ info, noTerm }: { info: InfoSLR; noTerm: string[] }) {
  const g = info.gAumentada
  return (
    <div>
      <p className="campo__label">Gramática aumentada</p>
      <pre>{reglasNumeradas(g).join('\n')}</pre>

      <p className="campo__label" style={{ marginTop: 'var(--s4)' }}>Primeros y siguientes</p>
      <div className="scroll-x">
        <table className="tabla-slr">
          <thead><tr><th>No terminal</th><th>PRIMEROS</th><th>SIGUIENTES</th></tr></thead>
          <tbody>
            {noTerm.map((A) => (
              <tr key={A}><td>{A}</td><td>{setTxt(info.primeros[A])}</td><td>{setTxt(info.siguientes[A])}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="campo__label" style={{ marginTop: 'var(--s4)' }}>Tabla SLR</p>
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
                  return <td key={t} className={a && a.length > 1 ? 'conf' : ''}>{a ? a.map(textoAccion).join(' / ') : ''}</td>
                })}
                {noTerm.map((A) => <td key={A} className="ir">{info.irA[i]?.[A] ?? ''}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink-3)', marginTop: 'var(--s3)' }}>
        {info.esSLR ? 'No hay conflictos: la gramática es SLR.'
          : `Hay ${info.conflictos.length} conflicto(s), marcados en rojo. La gramática no es SLR.`}
        {' '}La columna <code>{FIN}</code> es el fin de la entrada.
      </p>
    </div>
  )
}
