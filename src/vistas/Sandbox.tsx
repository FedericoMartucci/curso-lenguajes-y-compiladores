import { SOLAPAS, ER, LEX, GLC, PARSING, GCI, ASM, solapa } from '../lib/ejercicios.ts'
import type { TipoEjercicio, Decorado, EjercicioBase } from '../tipos/ejercicios.ts'
import { useProgreso } from '../lib/progreso.tsx'
import { practicasHasta, semanaDeTipo } from '../lib/plan.ts'
import type { Ruta } from '../lib/router.ts'
import Cabecera from './Cabecera.tsx'
import Enlace from '../componentes/Enlace.tsx'
import Pill from '../ui/Pill.tsx'
import { IndiceEjercicios } from './sandbox/marco.tsx'
import PanelER from './sandbox/PanelER.tsx'
import PanelLex from './sandbox/PanelLex.tsx'
import PanelGLC from './sandbox/PanelGLC.tsx'
import PanelParsing from './sandbox/PanelParsing.tsx'
import PanelGCI from './sandbox/PanelGCI.tsx'
import PanelASM from './sandbox/PanelASM.tsx'

const LISTAS: Record<TipoEjercicio, Decorado<EjercicioBase>[]> = {
  er: ER as unknown as Decorado<EjercicioBase>[],
  lex: LEX as unknown as Decorado<EjercicioBase>[],
  glc: GLC as unknown as Decorado<EjercicioBase>[],
  parsing: PARSING as unknown as Decorado<EjercicioBase>[],
  gci: GCI as unknown as Decorado<EjercicioBase>[],
  asm: ASM as unknown as Decorado<EjercicioBase>[]
}

const esTipo = (t: string | undefined): t is TipoEjercicio =>
  t === 'er' || t === 'lex' || t === 'glc' || t === 'parsing' || t === 'gci' || t === 'asm'

interface Props { ir: (r: Ruta) => void; tipo?: string; ej?: string }

export default function Sandbox({ ir, tipo, ej }: Props) {
  const { progreso, resuelto } = useProgreso()
  const t: TipoEjercicio = esTipo(tipo) ? tipo : 'er'
  const lista = LISTAS[t]
  const id = ej && lista.some((x) => x.id === ej) ? ej : (lista[0]?.id ?? '')
  const s = solapa(t)

  const liberados = new Set(practicasHasta(progreso.semana).flatMap((p) => p.tipos))
  const semanaSolapa = semanaDeTipo(t)

  return (
    <>
      <Cabecera
        titulo="Sandbox"
        bajada={
          <>
            Escribís tu respuesta en la notación del parcial y se valida de verdad: se compila, se
            reconoce o se ejecuta contra casos que deben aceptarse y otros que deben rechazarse,
            incluidos los del borde. Lo que escribís se guarda solo.
          </>
        }
      />

      <nav className="sb__solapas" aria-label="Tipos de ejercicio">
        {SOLAPAS.map((x) => {
          const hechos = LISTAS[x.tipo].filter((e) => resuelto(x.tipo, e.id)).length
          return (
            <Enlace
              key={x.tipo} a={{ v: 'sandbox', tipo: x.tipo }} ir={ir}
              className="sb__solapa" activo={x.tipo === t}
            >
              <strong>{x.etiqueta}</strong>
              <small>{hechos}/{x.total} · {x.practica}</small>
            </Enlace>
          )
        })}
      </nav>

      <div className="tira" style={{ justifyContent: 'space-between', margin: '0 0 var(--s5)', gap: 'var(--s4)' }}>
        <p style={{ color: 'var(--ink-2)', maxWidth: '78ch', fontSize: 'var(--fs-md)', lineHeight: 1.6 }}>
          {s.bajada}
        </p>
        {!liberados.has(t) && semanaSolapa !== null && (
          <Pill tono="aviso" titulo="El plan la ubica más adelante, pero podés resolverla cuando quieras">
            se ve en la semana {semanaSolapa}
          </Pill>
        )}
      </div>

      <div className="sb__layout">
        <IndiceEjercicios tipo={t} lista={lista} actual={id} ir={ir} />
        <div className="panel">
          {t === 'er' && <PanelER id={id} ir={ir} />}
          {t === 'lex' && <PanelLex id={id} ir={ir} />}
          {t === 'glc' && <PanelGLC id={id} ir={ir} />}
          {t === 'parsing' && <PanelParsing id={id} ir={ir} />}
          {t === 'gci' && <PanelGCI id={id} ir={ir} />}
          {t === 'asm' && <PanelASM id={id} ir={ir} />}
        </div>
      </div>
    </>
  )
}
