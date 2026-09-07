import type { ResultadoCasos, CasoCorrido, ResultadoEjecucion } from '../tipos/motores.ts'
import Icono from '../ui/Icono.tsx'

const muestra = (s: string): string =>
  s === '' ? '⟨cadena vacía⟩' : s.length > 52 ? s.slice(0, 52) + '…' : s

/** Explica por qué un caso pasó o falló, en palabras y no solo con un color. */
function explicar(c: CasoCorrido): string {
  if (c.libre) return c.obtenido ? 'la acepta' : 'la rechaza'
  const debe = c.esperado ? 'debe aceptarla' : 'debe rechazarla'
  if (c.pass) return c.detalle ? `${debe} · ${c.detalle}` : debe
  return c.obtenido ? `${debe}, pero la acepta` : `${debe}, pero la rechaza`
}

interface Props {
  resultado: ResultadoCasos | null
  /** Cadenas que probó el alumno por su cuenta, sin resultado esperado. */
  extra?: CasoCorrido[]
}

export function Casos({ resultado, extra }: Props) {
  if (!resultado) return null
  if (resultado.error) return <div className="errbox" role="alert">{resultado.error}</div>

  const todo = resultado.casos.concat(extra ?? [])
  const fallan = todo.filter((c) => !c.pass && !c.libre).length

  return (
    <div>
      <p className={'veredicto veredicto--' + (resultado.ok ? 'ok' : 'bad')} role="status">
        <Icono nombre={resultado.ok ? 'check' : 'cruz'} tam={18} />
        {resultado.ok
          ? `Correcta. Acepta y rechaza los ${resultado.casos.length} casos.`
          : `Todavía no: ${fallan} de ${resultado.casos.length} ${fallan === 1 ? 'caso falla' : 'casos fallan'}.`}
      </p>

      {!!resultado.avisos?.length && (
        <div className="avisos">
          Valida bien, pero mirá la forma:
          <ul>{resultado.avisos.map((a, i) => <li key={i}>{a}</li>)}</ul>
        </div>
      )}

      <div className="casos">
        {/* los que fallan van primero: es lo que hay que mirar */}
        {[...todo].sort((a, b) => Number(a.pass) - Number(b.pass)).map((c, i) => (
          <div key={i} className={'caso caso--' + (c.pass ? 'pass' : 'fail')}>
            <Icono nombre={c.pass ? 'check' : 'cruz'} tam={13} className="caso__ico" />
            <span className="caso__s">{muestra(c.s)}</span>
            <span className="caso__exp">{explicar(c)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Resultado de los ejercicios que se validan ejecutando (GCI y Assembler). */
export function CasosEjecucion({ resultado }: { resultado: ResultadoEjecucion | null }) {
  if (!resultado) return null
  const fallan = resultado.resultados.filter((r) => !r.pass).length
  return (
    <div>
      <p className={'veredicto veredicto--' + (resultado.ok ? 'ok' : 'bad')} role="status">
        <Icono nombre={resultado.ok ? 'check' : 'cruz'} tam={18} />
        {resultado.ok
          ? `Correcta. Da el resultado esperado en los ${resultado.resultados.length} casos.`
          : `Todavía no: ${fallan} de ${resultado.resultados.length} ${fallan === 1 ? 'caso falla' : 'casos fallan'}.`}
      </p>
      <div className="casos">
        {[...resultado.resultados].sort((a, b) => Number(a.pass) - Number(b.pass)).map((r, i) => (
          <div key={i} className={'caso caso--' + (r.pass ? 'pass' : 'fail')}>
            <Icono nombre={r.pass ? 'check' : 'cruz'} tam={13} className="caso__ico" />
            <span className="caso__s">
              {Object.entries(r.inicial).map(([k, v]) => `${k}=${v}`).join('  ') || 'sin valores iniciales'}
            </span>
            <span className="caso__exp">
              {r.error
                ? r.error
                : (r.detalles ?? []).map((d) =>
                    d.pass
                      ? `${d.variable} = ${d.esperado}`
                      : `${d.variable}: esperaba ${d.esperado}, dio ${d.obtenido ?? '—'}`
                  ).join(' · ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
