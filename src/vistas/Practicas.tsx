import { ENUNCIADOS } from '../data/enunciados.ts'
import { SEMANAS } from '../lib/plan.ts'
import { SOLAPAS } from '../lib/ejercicios.ts'
import type { Ruta } from '../lib/router.ts'
import type { TipoEjercicio } from '../tipos/ejercicios.ts'
import Cabecera from './Cabecera.tsx'
import Enlace from '../componentes/Enlace.tsx'
import Pill from '../ui/Pill.tsx'
import NoEncontrado from './NoEncontrado.tsx'

/** 'p3' -> 3 */
const numero = (id: string): number => Number(id.replace(/\D/g, ''))

/** Qué solapas del sandbox cubren cada práctica, según el plan. */
function solapasDe(n: number): TipoEjercicio[] {
  return SEMANAS.flatMap((s) => s.libera).filter((p) => p.n === n).flatMap((p) => p.tipos)
}

interface Props { id?: string; ir: (r: Ruta) => void }

export default function Practicas({ id, ir }: Props) {
  if (!id) {
    return (
      <>
        <Cabecera
          titulo="Enunciados de práctica"
          bajada="Las seis prácticas de la cátedra, tal cual las da. Los ejercicios que el sandbox puede corregir solo están enlazados desde cada una."
        />
        <div className="rejilla" style={{ gap: 'var(--s2)' }}>
          {ENUNCIADOS.map((e) => {
            const n = numero(e.id)
            const tipos = solapasDe(n)
            const sem = SEMANAS.find((s) => s.libera.some((p) => p.n === n))
            return (
              <Enlace key={e.id} a={{ v: 'practicas', id: e.id }} ir={ir} className="mat">
                <span className="mat__cuerpo">
                  <span className="mat__t">{e.titulo}</span>
                  <span className="mat__sub">
                    {e.tag} · {e.lineas.length} líneas
                    {sem && ` · se libera en la semana ${sem.n}`}
                  </span>
                </span>
                {tipos.length > 0 && (
                  <Pill tono="ok">
                    {tipos.reduce((a, t) => a + (SOLAPAS.find((s) => s.tipo === t)?.total ?? 0), 0)} ejercicios validables
                  </Pill>
                )}
                <span aria-hidden="true" style={{ color: 'var(--ink-3)' }}>→</span>
              </Enlace>
            )
          })}
        </div>
      </>
    )
  }

  const e = ENUNCIADOS.find((x) => x.id === id)
  if (!e) return <NoEncontrado ir={ir} que={`el enunciado ${id}`} />

  const n = numero(e.id)
  const tipos = solapasDe(n)

  return (
    <>
      <Cabecera
        migas={<><Enlace a={{ v: 'practicas' }} ir={ir}>Enunciados</Enlace><span>·</span><span>{e.tag}</span></>}
        titulo={e.titulo}
      />

      {tipos.length > 0 && (
        <div className="panel" style={{ marginBottom: 'var(--s5)' }}>
          <p className="panel__titulo">Resolvelos con corrección automática</p>
          <p style={{ color: 'var(--ink-2)', marginBottom: 'var(--s4)', fontSize: 'var(--fs-md)' }}>
            El sandbox tiene estos ejercicios cargados con sus casos de prueba: escribís tu respuesta y se
            valida ejecutándose.
          </p>
          <div className="tira">
            {tipos.map((t) => {
              const s = SOLAPAS.find((x) => x.tipo === t)
              if (!s) return null
              return (
                <Enlace key={t} a={{ v: 'sandbox', tipo: t }} ir={ir} className="btn btn--secondary btn--md">
                  {s.etiqueta} · {s.total} ejercicios
                </Enlace>
              )
            })}
          </div>
        </div>
      )}

      <div className="scroll-x">
        <pre style={{ whiteSpace: 'pre-wrap' }}>{e.lineas.join('\n')}</pre>
      </div>
    </>
  )
}
