import { useState, useCallback } from 'react'
import { ASM } from '../../lib/ejercicios.ts'
import { testAssembler } from '../../engines/coprocesador.ts'
import { useProgreso } from '../../lib/progreso.tsx'
import type { ResultadoEjecucion } from '../../tipos/motores.ts'
import type { Ruta } from '../../lib/router.ts'
import { EncabezadoEjercicio, useBorrador } from './marco.tsx'
import { CasosEjecucion } from '../../componentes/Casos.tsx'
import Campo from '../../ui/Campo.tsx'
import Boton from '../../ui/Boton.tsx'

export default function PanelASM({ id, ir }: { id: string; ir: (r: Ruta) => void }) {
  const e = ASM.find((x) => x.id === id) ?? (ASM[0] as typeof ASM[number])
  const { registrarIntento } = useProgreso()
  const [campos, set, limpiar] = useBorrador('asm', e.id, { txt: e.plantilla })
  const [res, setRes] = useState<ResultadoEjecucion | null>(null)

  const txt = campos.txt ?? e.plantilla

  const validar = useCallback(() => {
    const r = testAssembler(txt, e.casos)
    setRes(r)
    registrarIntento('asm', e.id, r.ok)
  }, [txt, e, registrarIntento])

  return (
    <div>
      <EncabezadoEjercicio
        tipo="asm" e={e} casos={e.casos.length} lista={ASM} ir={ir}
        extra={
          <div className="honestidad">
            <span aria-hidden="true">▶</span>
            <p>
              <b>Corre en un simulador del 8087.</b> <code>FADD/FSUB/FMUL/FDIV</code> hacen{' '}
              <code>ST(1) := ST(1) op ST(0)</code> y después <code>pop</code>, así que el orden en que
              cargás importa. <code>FSTP</code> guarda y saca de la pila; <code>FST</code> guarda sin sacar.
              🎯 El coprocesador no puede hacer <code>FLD</code> de una constante literal: declarala en el{' '}
              <code>.DATA</code>.
            </p>
          </div>
        }
      />

      <div className="campos">
        <Campo label="Tu código Assembler" nota="completá el segmento .CODE">
          {(p) => (
            <textarea
              {...p} className="control" rows={16} value={txt}
              onChange={(ev) => set('txt', ev.target.value)}
              onKeyDown={(ev) => { if ((ev.metaKey || ev.ctrlKey) && ev.key === 'Enter') validar() }}
            />
          )}
        </Campo>
      </div>

      <div className="acciones">
        <Boton variante="primary" onClick={validar} tecla="⌘↵">Ejecutar y validar</Boton>
        <Boton variante="ghost" onClick={limpiar}>Volver a la plantilla</Boton>
      </div>

      <CasosEjecucion resultado={res} />

      <details style={{ marginTop: 'var(--s5)' }}>
        <summary style={{ cursor: 'pointer', color: 'var(--accent)', fontSize: 'var(--fs-base)' }}>
          Ver una respuesta modelo
        </summary>
        <pre style={{ marginTop: 'var(--s3)' }}>{e.m}</pre>
      </details>
    </div>
  )
}
