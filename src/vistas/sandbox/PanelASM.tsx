import { useState, useCallback } from 'react'
import { ASM } from '../../lib/ejercicios.ts'
import { testAssembler } from '../../engines/coprocesador.ts'
import { useProgreso } from '../../lib/progreso.tsx'
import type { ResultadoEjecucion } from '../../tipos/motores.ts'
import type { Ruta } from '../../lib/router.ts'
import { EncabezadoEjercicio, TrasResolver, useBorrador } from './marco.tsx'
import { CasosEjecucion } from '../../componentes/Casos.tsx'
import { Escalones, Escalon } from '../../componentes/Escalones.tsx'
import Campo from '../../ui/Campo.tsx'
import Boton from '../../ui/Boton.tsx'
import CodeEditor from '../../componentes/CodeEditor.tsx'
import Icono from '../../ui/Icono.tsx'

export default function PanelASM({ id, ir }: { id: string; ir: (r: Ruta) => void }) {
  const e = ASM.find((x) => x.id === id) ?? (ASM[0] as typeof ASM[number])
  const { registrarIntento } = useProgreso()
  const [campos, set, limpiar] = useBorrador('asm', e.id, { txt: e.plantilla })
  const [res, setRes] = useState<ResultadoEjecucion | null>(null)
  // borraba 16 líneas de Assembler de un clic, en estilo ghost, pegado al primario
  const [confirmandoLimpiar, setConfirmandoLimpiar] = useState(false)

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
            <Icono nombre="consola" tam={16} />
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
            <CodeEditor {...p} value={txt} onChange={(v) => set('txt', v)} filas={16} onValidar={validar} />
          )}
        </Campo>
      </div>

      <div className="acciones">
        <Boton variante="primary" onClick={validar} tecla="⌘↵">Ejecutar y validar</Boton>
        {confirmandoLimpiar
          ? (
            <span className="confirmar">
              ¿Borrar tu código?
              <Boton tamaño="sm" variante="danger" onClick={() => { limpiar(); setConfirmandoLimpiar(false) }}>Sí, borrar</Boton>
              <Boton tamaño="sm" variante="ghost" onClick={() => setConfirmandoLimpiar(false)}>No</Boton>
            </span>
          )
          : <Boton variante="ghost" onClick={() => setConfirmandoLimpiar(true)}>Volver a la plantilla</Boton>}
      </div>

      <CasosEjecucion resultado={res} />

      <TrasResolver ok={res?.ok === true} tipo="asm" actual={e.id} lista={ASM} ir={ir} />

      <Escalones>
        <Escalon titulo="Ver una respuesta modelo" costo="revela todo">
          <pre>{e.m}</pre>
        </Escalon>
      </Escalones>
    </div>
  )
}
