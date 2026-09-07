import { useState, useEffect, useRef } from 'react'
import type { ResultadoCasos, CasoCorrido, ResultadoEjecucion } from '../tipos/motores.ts'
import { mostrarCadena, porQueER, porQueVariable } from '../lib/diagnostico.ts'
import { useMenosMovimiento } from '../lib/hooks.ts'
import Icono from '../ui/Icono.tsx'

/* La superficie de resultados. Es donde el producto cumple —o no— su única promesa,
   así que tiene tres reglas propias:

   1. El veredicto se trae al viewport y recibe el foco. Antes nacía en y=931 con una
      ventana de 900: apretabas ⌘↵ y no pasaba nada visible.
   2. Los casos que pasan van colapsados. Acertar producía 20 filas verdes de 730px que
      había que scrollear para llegar al botón de seguir.
   3. Cada fallo dice POR QUÉ. La app tiene la expresión compilada y la cadena: puede decir
      "reconoce «123» y se corta ahí" en vez de repetir seis veces la misma frase. */

/** Trae el veredicto a la vista y le da el foco. Sin esto la validación es invisible. */
function useMostrarResultado(hayResultado: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  const menosMovimiento = useMenosMovimiento()

  useEffect(() => {
    if (!hayResultado || !ref.current) return
    ref.current.scrollIntoView({
      block: 'center',
      behavior: menosMovimiento ? 'auto' : 'smooth'
    })
    ref.current.focus({ preventScroll: true })
  }, [hayResultado, menosMovimiento])

  return ref
}

function Cadena({ s }: { s: string }) {
  const { texto, truncada } = mostrarCadena(s)
  return (
    <span className="caso__s" title={s}>
      <span className="caso__comillas" aria-hidden="true">«</span>
      {texto}
      {truncada && '…'}
      <span className="caso__comillas" aria-hidden="true">»</span>
    </span>
  )
}

function Fila({ caso, porQue }: { caso: CasoCorrido; porQue: string | null }) {
  // una prueba libre nunca es un fallo: el alumno preguntó algo y la app contestó
  const clase = caso.libre ? 'libre' : caso.pass ? 'pass' : 'fail'
  return (
    <div className={'caso caso--' + clase}>
      <Icono nombre={caso.libre ? 'flecha' : caso.pass ? 'check' : 'cruz'} tam={13} className="caso__ico" />
      <Cadena s={caso.s} />
      <span className="caso__exp">
        {caso.libre
          ? (caso.obtenido ? 'tu expresión la acepta' : 'tu expresión la rechaza')
          : porQue ?? (caso.esperado ? 'debe aceptarla' : 'debe rechazarla')}
      </span>
    </div>
  )
}

interface Props {
  resultado: ResultadoCasos | null
  extra?: CasoCorrido[]
  /** La expresión compilada, para poder diagnosticar por qué falla cada caso. */
  rx?: RegExp | null
}

export function Casos({ resultado, extra, rx }: Props) {
  const ref = useMostrarResultado(Boolean(resultado))
  const [verTodos, setVerTodos] = useState(false)

  if (!resultado) return null
  if (resultado.error) {
    return (
      <div className="errbox" role="alert" tabIndex={-1} ref={ref}>
        <Icono nombre="cruz" tam={14} />
        <span>{resultado.error}</span>
      </div>
    )
  }

  const fallan = resultado.casos.filter((c) => !c.pass)
  const pasan = resultado.casos.filter((c) => c.pass)
  const libres = extra ?? []

  return (
    <div>
      <p
        className={'veredicto veredicto--' + (resultado.ok ? 'ok' : 'bad')}
        role="status" tabIndex={-1} ref={ref}
      >
        <Icono nombre={resultado.ok ? 'check' : 'cruz'} tam={18} />
        {resultado.ok
          ? `Correcta. Acepta y rechaza los ${resultado.casos.length} casos.`
          : `Todavía no: ${fallan.length} de ${resultado.casos.length} ${fallan.length === 1 ? 'caso falla' : 'casos fallan'}.`}
      </p>

      {!!resultado.avisos?.length && (
        <div className="avisos">
          Valida bien, pero mirá la forma:
          <ul>{resultado.avisos.map((a, i) => <li key={i}>{a}</li>)}</ul>
        </div>
      )}

      {libres.length > 0 && (
        <div className="casos">
          {libres.map((c, i) => <Fila key={'libre' + i} caso={c} porQue={null} />)}
        </div>
      )}

      {fallan.length > 0 && (
        <div className="casos">
          {fallan.map((c, i) => <Fila key={i} caso={c} porQue={porQueER(c, rx ?? null)} />)}
        </div>
      )}

      {pasan.length > 0 && (
        <details className="casos-ok" open={verTodos} onToggle={(e) => setVerTodos(e.currentTarget.open)}>
          <summary>
            <Icono nombre="check" tam={13} />
            {pasan.length} {pasan.length === 1 ? 'caso pasa' : 'casos pasan'}
          </summary>
          <div className="casos">
            {pasan.map((c, i) => <Fila key={i} caso={c} porQue={null} />)}
          </div>
        </details>
      )}
    </div>
  )
}

/** Resultado de los ejercicios que se validan ejecutando (GCI y Assembler). */
export function CasosEjecucion({ resultado }: { resultado: ResultadoEjecucion | null }) {
  const ref = useMostrarResultado(Boolean(resultado))
  const [verTodos, setVerTodos] = useState(false)

  if (!resultado) return null

  const fallan = resultado.resultados.filter((r) => !r.pass)
  const pasan = resultado.resultados.filter((r) => r.pass)

  const fila = (r: typeof resultado.resultados[number], i: number) => (
    <div key={i} className={'caso caso--' + (r.pass ? 'pass' : 'fail')}>
      <Icono nombre={r.pass ? 'check' : 'cruz'} tam={13} className="caso__ico" />
      <span className="caso__s">
        {Object.entries(r.inicial).map(([k, v]) => `${k}=${v}`).join('  ') || 'sin valores iniciales'}
      </span>
      <span className="caso__exp">
        {r.error ?? (r.detalles ?? []).map(porQueVariable).join(' · ')}
      </span>
    </div>
  )

  return (
    <div>
      <p
        className={'veredicto veredicto--' + (resultado.ok ? 'ok' : 'bad')}
        role="status" tabIndex={-1} ref={ref}
      >
        <Icono nombre={resultado.ok ? 'check' : 'cruz'} tam={18} />
        {resultado.ok
          ? `Correcta. Da el resultado esperado en los ${resultado.resultados.length} casos.`
          : `Todavía no: ${fallan.length} de ${resultado.resultados.length} ${fallan.length === 1 ? 'caso falla' : 'casos fallan'}.`}
      </p>

      {fallan.length > 0 && <div className="casos">{fallan.map(fila)}</div>}

      {pasan.length > 0 && (
        <details className="casos-ok" open={verTodos} onToggle={(e) => setVerTodos(e.currentTarget.open)}>
          <summary>
            <Icono nombre="check" tam={13} />
            {pasan.length} {pasan.length === 1 ? 'caso pasa' : 'casos pasan'}
          </summary>
          <div className="casos">{pasan.map(fila)}</div>
        </details>
      )}
    </div>
  )
}
