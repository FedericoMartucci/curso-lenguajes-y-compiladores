import { useState, useCallback, useMemo } from 'react'
import { GCI } from '../../lib/ejercicios.ts'
import { testIntermedia } from '../../engines/polaca.ts'
import { testArbol, parseArbol, inOrden, postOrden } from '../../engines/arbol.ts'
import { useProgreso } from '../../lib/progreso.tsx'
import type { ResultadoEjecucion } from '../../tipos/motores.ts'
import type { ModoGCI } from '../../tipos/ejercicios.ts'
import type { Ruta } from '../../lib/router.ts'
import { EncabezadoEjercicio, TrasResolver, useBorrador } from './marco.tsx'
import { CasosEjecucion } from '../../componentes/Casos.tsx'
import { Escalones, Escalon } from '../../componentes/Escalones.tsx'
import ArbolSVG from '../../componentes/ArbolSVG.tsx'
import Campo from '../../ui/Campo.tsx'
import Boton from '../../ui/Boton.tsx'
import Icono from '../../ui/Icono.tsx'
import Pill from '../../ui/Pill.tsx'

/* Los enunciados de la cátedra piden la misma sentencia en varias notaciones a la vez
   ("Representar la sentencia … en polaca inversa, en árbol sintáctico y en tercetos"),
   así que el ejercicio se resuelve cuando pasan TODAS las que pide. */

const ETIQUETA: Record<ModoGCI, string> = {
  polaca: 'Polaca inversa',
  arbol: 'Árbol sintáctico',
  tercetos: 'Tercetos'
}

const NOTA: Record<ModoGCI, string> = {
  polaca: 'celdas separadas por espacios, numeradas desde 1',
  arbol: 'nodo(hijo, hijo); las hojas son etiquetas sueltas',
  tercetos: 'uno por línea, formato [11] (op, arg1, arg2)'
}

const PLACEHOLDER: Record<ModoGCI, string> = {
  polaca: 'operando operando operador …',
  arbol: 'nodo(hijo, hijo)',
  tercetos: '[10] (op, arg1, arg2)'
}

const FILAS: Record<ModoGCI, number> = { polaca: 4, arbol: 4, tercetos: 9 }

const AYUDA: Record<ModoGCI, React.ReactNode> = {
  polaca: (
    <>Asignación <code>:=</code> · saltos <code>BF</code> (por falso) y <code>BI</code> (incondicional),
    con la celda destino en la posición siguiente al salto.</>
  ),
  arbol: (
    <>Recorrer el árbol <b>in-orden</b> tiene que devolverte el programa original, y <b>post-orden</b> la
    polaca. No lleva saltos ni etiquetas. Para encadenar sentencias usá un nodo conector <code>M</code>.</>
  ),
  tercetos: (
    <>Cada terceto se numera y se referencia con <code>[n]</code>. Una hoja suelta se escribe{' '}
    <code>[10] (b, _, _)</code>.</>
  )
}

export default function PanelGCI({ id, ir }: { id: string; ir: (r: Ruta) => void }) {
  const e = GCI.find((x) => x.id === id) ?? (GCI[0] as typeof GCI[number])
  const { registrarIntento } = useProgreso()
  const notaciones = e.notaciones
  const [campos, set] = useBorrador('gci', e.id, Object.fromEntries(notaciones.map((n) => [n, ''])))
  const [activa, setActiva] = useState<ModoGCI>(notaciones[0] as ModoGCI)
  const [res, setRes] = useState<Partial<Record<ModoGCI, ResultadoEjecucion>>>({})

  const texto = campos[activa] ?? ''

  const correr = useCallback((n: ModoGCI, valor: string): ResultadoEjecucion =>
    n === 'arbol' ? testArbol(valor, e.casos) : testIntermedia(valor, e.casos, n)
  , [e])

  const validar = useCallback(() => {
    const r = correr(activa, campos[activa] ?? '')
    const todos = { ...res, [activa]: r }
    setRes(todos)
    // el ejercicio se marca resuelto cuando pasan todas las notaciones que pide el enunciado
    const completo = notaciones.every((n) => todos[n]?.ok)
    registrarIntento('gci', e.id, completo)
  }, [activa, campos, correr, e.id, notaciones, res, registrarIntento])

  const hechas = notaciones.filter((n) => res[n]?.ok).length
  const completo = hechas === notaciones.length

  // vista previa del árbol mientras se escribe: el error se ve antes de validar
  const previa = useMemo(() => {
    if (activa !== 'arbol' || !texto.trim()) return null
    try {
      const raiz = parseArbol(texto)
      return { raiz, inOrden: inOrden(raiz).join(' '), postOrden: postOrden(raiz).join(' '), error: null }
    } catch (err) {
      return { raiz: null, inOrden: '', postOrden: '', error: err instanceof Error ? err.message : String(err) }
    }
  }, [activa, texto])

  return (
    <div>
      <EncabezadoEjercicio
        tipo="gci" e={e} casos={e.casos.length} lista={GCI} ir={ir}
        extra={
          <div className="honestidad">
            <Icono nombre="consola" tam={16} />
            <p>
              <b>Se valida ejecutando.</b> Se corre tu notación con los valores iniciales de cada caso
              y se comparan las variables finales: cualquier solución que dé los mismos resultados pasa.
              {notaciones.length > 1 && ' Este ejercicio pide las tres notaciones y se marca resuelto cuando pasan todas.'}
            </p>
          </div>
        }
      />

      <div className="campos">
        <div>
          <p className="campo__label">Programa a traducir</p>
          <pre>{e.programa}</pre>
        </div>

        {notaciones.length > 1 && (
          <div className="notaciones" role="group" aria-label="Notación">
            {notaciones.map((n) => (
              <button
                key={n} type="button" className="notacion"
                aria-pressed={activa === n} onClick={() => setActiva(n)}
              >
                {res[n]?.ok && <Icono nombre="check" tam={13} />}
                {ETIQUETA[n]}
              </button>
            ))}
            <span className="notaciones__cuenta">{hechas} de {notaciones.length}</span>
          </div>
        )}

        <Campo label={ETIQUETA[activa]} nota={NOTA[activa]} ayuda={AYUDA[activa]}>
          {(p) => (
            <textarea
              {...p} className="control" rows={FILAS[activa]} value={texto}
              placeholder={PLACEHOLDER[activa]}
              onChange={(ev) => set(activa, ev.target.value)}
              onKeyDown={(ev) => { if ((ev.metaKey || ev.ctrlKey) && ev.key === 'Enter') validar() }}
            />
          )}
        </Campo>

        {activa === 'arbol' && previa && (
          <div className="previa-arbol">
            {previa.error
              ? <p className="previa-arbol__err">{previa.error}</p>
              : (
                <>
                  <div className="previa-arbol__lecturas">
                    <span><b>in-orden</b> (tiene que dar el programa): <code>{previa.inOrden}</code></span>
                    <span><b>post-orden</b> (es la polaca): <code>{previa.postOrden}</code></span>
                  </div>
                  {previa.raiz && <ArbolSVG raiz={previa.raiz} />}
                </>
              )}
          </div>
        )}
      </div>

      <div className="acciones">
        <Boton variante="primary" onClick={validar} tecla="⌘↵" disabled={!texto.trim()}>
          Ejecutar y validar
        </Boton>
        {notaciones.length > 1 && completo && <Pill tono="ok">las {notaciones.length} notaciones</Pill>}
      </div>

      <CasosEjecucion resultado={res[activa] ?? null} />

      <TrasResolver ok={completo} tipo="gci" actual={e.id} lista={GCI} ir={ir} />

      <Escalones>
        <Escalon titulo="Una pista" costo="no revela la respuesta">
          <p>
            Las tres notaciones dicen lo mismo de formas distintas: si tenés el árbol, recorrerlo
            post-orden te da la polaca, y cada nodo interno del árbol es un terceto. Empezá por la
            que te salga y derivá las otras dos.
          </p>
        </Escalon>
        <Escalon titulo="Ver una respuesta modelo" costo="revela todo">
          {notaciones.map((n) => (
            <div key={n} style={{ marginBottom: 'var(--s3)' }}>
              <p className="campo__label">{ETIQUETA[n]}</p>
              <pre>{e.m[n] ?? '(sin modelo)'}</pre>
            </div>
          ))}
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--ink-3)' }}>
            Es una solución posible. Como se valida por ejecución, cualquier otra que dé los mismos
            resultados también es correcta.
          </p>
        </Escalon>
      </Escalones>
    </div>
  )
}
