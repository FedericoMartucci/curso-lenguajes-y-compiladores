import { useState, useCallback } from 'react'
import { GCI } from '../../lib/ejercicios.ts'
import { testIntermedia } from '../../engines/polaca.ts'
import { useProgreso } from '../../lib/progreso.tsx'
import type { ResultadoEjecucion } from '../../tipos/motores.ts'
import type { Ruta } from '../../lib/router.ts'
import { EncabezadoEjercicio, TrasResolver, useBorrador } from './marco.tsx'
import { CasosEjecucion } from '../../componentes/Casos.tsx'
import { Escalones, Escalon } from '../../componentes/Escalones.tsx'
import Campo from '../../ui/Campo.tsx'
import Boton from '../../ui/Boton.tsx'
import Icono from '../../ui/Icono.tsx'

export default function PanelGCI({ id, ir }: { id: string; ir: (r: Ruta) => void }) {
  const e = GCI.find((x) => x.id === id) ?? (GCI[0] as typeof GCI[number])
  const { registrarIntento } = useProgreso()
  const [campos, set] = useBorrador('gci', e.id, { txt: '' })
  const [res, setRes] = useState<ResultadoEjecucion | null>(null)

  const txt = campos.txt ?? ''
  const tercetos = e.modo === 'tercetos'

  const validar = useCallback(() => {
    const r = testIntermedia(txt, e.casos, e.modo)
    setRes(r)
    registrarIntento('gci', e.id, r.ok)
  }, [txt, e, registrarIntento])

  return (
    <div>
      <EncabezadoEjercicio
        tipo="gci" e={e} casos={e.casos.length} lista={GCI} ir={ir}
        extra={
          <div className="honestidad">
            <Icono nombre="consola" tam={16} />
            <p>
              <b>Se valida ejecutando.</b> Tu {tercetos ? 'lista de tercetos' : 'polaca'} se corre con los
              valores iniciales de cada caso y se comparan las variables finales: cualquier solución que dé
              los mismos resultados pasa, aunque no coincida con el modelo.
            </p>
          </div>
        }
      />

      <div className="campos">
        <div>
          <p className="campo__label">Programa a traducir</p>
          <pre>{e.programa}</pre>
        </div>

        <Campo
          label={tercetos ? 'Tus tercetos' : 'Tu polaca inversa'}
          nota={tercetos ? 'uno por línea, formato [11] (op, arg1, arg2)' : 'celdas separadas por espacios, numeradas desde 1'}
          ayuda={
            tercetos
              ? undefined
              : <>Asignación <code>:=</code> · saltos <code>BF</code> (por falso) y <code>BI</code> (incondicional),
                 con la celda destino en la posición siguiente al salto.</>
          }
        >
          {(p) => (
            <textarea
              {...p} className="control" rows={tercetos ? 8 : 4} value={txt}
              placeholder={tercetos ? '[11] (*, b, c)\n[12] (+, a, [11])\n[13] (:=, z, [12])' : 'a b + z :='}
              onChange={(ev) => set('txt', ev.target.value)}
              onKeyDown={(ev) => { if ((ev.metaKey || ev.ctrlKey) && ev.key === 'Enter') validar() }}
            />
          )}
        </Campo>
      </div>

      <div className="acciones">
        <Boton variante="primary" onClick={validar} tecla="⌘↵" disabled={!txt.trim()}>Ejecutar y validar</Boton>
      </div>

      <CasosEjecucion resultado={res} />

      <TrasResolver ok={res?.ok === true} tipo="gci" actual={e.id} lista={GCI} ir={ir} />

      <Escalones>
        <Escalon titulo="Ver una respuesta modelo" costo="revela todo">
          <pre>{e.m}</pre>
        </Escalon>
      </Escalones>
    </div>
  )
}
