import { useMemo } from 'react'
import type { InfoSLR } from '../tipos/motores.ts'
import type { CeldaTabla } from '../engines/parsing.ts'

/* La tabla SLR para llenar celda por celda, que es como se toma en el parcial.

   Saber dónde NO va nada es la mitad del ejercicio, así que las celdas vacías se corrigen
   igual que las llenas: una celda de más cuenta como error. */

interface Props {
  info: InfoSLR
  celdas: Record<string, string>
  setCelda: (clave: string, valor: string) => void
  /** Resultado de la última corrección, para pintar cada celda. */
  correccion: CeldaTabla[] | null
  /** Cuando está resuelta, se muestra en sólo lectura. */
  bloqueada?: boolean
}

export default function TablaSLR({ info, celdas, setCelda, correccion, bloqueada }: Props) {
  const noTerm = useMemo(
    () => info.noTerminales.filter((A) => A !== info.gAumentada.start),
    [info]
  )
  const estado = useMemo(() => {
    const m = new Map<string, CeldaTabla>()
    correccion?.forEach((c) => m.set(`${c.estado}:${c.simbolo}`, c))
    return m
  }, [correccion])

  return (
    <div className="scroll-x tabla-llenar__caja">
      <table className="tabla-slr tabla-llenar">
        <caption className="sr-only">
          Tabla SLR: acción para los terminales, ir a para los no terminales
        </caption>
        <thead>
          <tr>
            <th rowSpan={2} scope="col">Estado</th>
            <th colSpan={info.cols.length} scope="colgroup">ACCIÓN</th>
            <th colSpan={noTerm.length} scope="colgroup" className="ir">IR A</th>
          </tr>
          <tr>
            {info.cols.map((t) => <th key={t} scope="col">{t}</th>)}
            {noTerm.map((A) => <th key={A} scope="col" className="ir">{A}</th>)}
          </tr>
        </thead>
        <tbody>
          {info.estados.map((_, i) => (
            <tr key={i}>
              <th scope="row">{i}</th>
              {[...info.cols.map((t) => [t, false] as const), ...noTerm.map((A) => [A, true] as const)]
                .map(([simbolo, irA]) => {
                  const clave = `${i}:${simbolo}`
                  const c = estado.get(clave)
                  const marca = c ? (c.pass ? 'ok' : 'mal') : undefined
                  return (
                    <td key={simbolo} className={(irA ? 'ir' : '') + (marca ? ' celda--' + marca : '')}>
                      <input
                        type="text"
                        className="celda"
                        value={celdas[clave] ?? ''}
                        readOnly={bloqueada}
                        aria-label={`Estado ${i}, ${irA ? 'ir a' : 'acción'} ${simbolo}`}
                        aria-invalid={marca === 'mal'}
                        onChange={(e) => setCelda(clave, e.target.value)}
                        inputMode={irA ? 'numeric' : 'text'}
                      />
                      {marca === 'mal' && c && (
                        <span className="celda__esperada" title={c.esperada ? `va ${c.esperada}` : 'va vacía'}>
                          {c.esperada || '·'}
                        </span>
                      )}
                    </td>
                  )
                })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
