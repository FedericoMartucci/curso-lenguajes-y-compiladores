import { useState, useRef, useCallback } from 'react'
import { LEX } from '../../lib/ejercicios.ts'
import { buildRegex, parseConjuntos } from '../../engines/regex.ts'
import { testAccionCodigo, codigoModelo } from '../../engines/accionLexica.ts'
import { useProgreso } from '../../lib/progreso.tsx'
import type { ResultadoCasos } from '../../tipos/motores.ts'
import type { Ruta } from '../../lib/router.ts'
import { EncabezadoEjercicio, TrasResolver, useBorrador } from './marco.tsx'
import { Casos } from '../../componentes/Casos.tsx'
import Teclado from '../../componentes/Teclado.tsx'
import CodeEditor from '../../componentes/CodeEditor.tsx'
import Campo from '../../ui/Campo.tsx'
import Boton from '../../ui/Boton.tsx'
import { Escalones, Escalon } from '../../componentes/Escalones.tsx'
import Icono from '../../ui/Icono.tsx'

const PLANTILLA = `ACCION LEXICA
{
  if (  )
      return TOKEN;
  else
      error("fuera de cota");
}`

export default function PanelLex({ id, ir }: { id: string; ir: (r: Ruta) => void }) {
  const e = LEX.find((x) => x.id === id) ?? (LEX[0] as typeof LEX[number])
  const { registrarIntento } = useProgreso()
  const [campos, set] = useBorrador('lex', e.id, { cj: '', er: '', codigo: PLANTILLA })
  const [res, setRes] = useState<ResultadoCasos | null>(null)
  const refEr = useRef<HTMLInputElement>(null)

  const cj = campos.cj ?? ''
  const er = campos.er ?? ''
  const codigo = campos.codigo ?? PLANTILLA

  const validar = useCallback(() => {
    let rx: RegExp
    try { rx = buildRegex(er, parseConjuntos(cj)) }
    catch (err) {
      setRes({ ok: false, casos: [], error: 'La expresión regular no compila: ' + (err instanceof Error ? err.message : String(err)) })
      return
    }
    const r = testAccionCodigo(rx, codigo, e.tests)
    setRes(r)
    registrarIntento('lex', e.id, r.ok)
  }, [er, cj, codigo, e, registrarIntento])

  return (
    <div>
      <EncabezadoEjercicio
        tipo="lex" e={e} casos={e.tests.length} lista={LEX} ir={ir}
        extra={
          <div className="honestidad">
            <Icono nombre="libro" tam={16} />
            <p>
              <b>La ER reconoce la forma; la acción valida la cota.</b> Un lexema con forma correcta pero
              fuera de cota se rechaza en la acción, en tiempo de compilación. Los casos incluyen siempre
              la cota exacta y la cota más uno.
            </p>
          </div>
        }
      />

      <div className="campos">
        <Campo
          label="Conjuntos" nota="uno por línea"
          ayuda="Declarar los conjuntos es parte del ejercicio: la cátedra los pide en el bloque CONJUNTO."
        >
          {(p) => <textarea {...p} className="control" rows={3} value={cj} onChange={(ev) => set('cj', ev.target.value)} />}
        </Campo>

        <Campo label="Expresión regular del token" nota="la FORMA">
          {(p) => (
            <>
              <input
                {...p} ref={refEr} type="text" className="control" value={er}
                onChange={(ev) => set('er', ev.target.value)}
                onKeyDown={(ev) => { if ((ev.metaKey || ev.ctrlKey) && ev.key === 'Enter') validar() }}
              />
              <Teclado destino={refEr} valor={er} setValor={(v) => set('er', v)} />
            </>
          )}
        </Campo>

        <Campo
          label="Acción léxica" nota="la COTA, escrita como código"
          ayuda={<>
            Atributos que entiende: <code>valor</code>, <code>valor absoluto</code>, <code>longitud</code>,{' '}
            <code>longitud sin comillas</code>, <code>cantidad de guiones bajos</code>,{' '}
            <code>cantidad de guiones medios</code>. También <code>len(yytext)</code>, <code>val()</code> o{' '}
            <code>abs(valor)</code>. Se pueden combinar con <code>and</code> / <code>or</code>.
          </>}
          >
          {(p) => (
            <CodeEditor {...p} value={codigo} onChange={(v) => set('codigo', v)} filas={8} onValidar={validar} />
          )}
        </Campo>
      </div>

      <div className="leyenda" aria-hidden="true">
        <span><b className="tk-kw">palabras clave</b></span>
        <span><b className="tk-attr">atributo del lexema</b></span>
        <span><b className="tk-num">números</b></span>
        <span><b className="tk-op">comparadores</b></span>
        <span><b className="tk-str">textos</b></span>
      </div>

      <div className="acciones">
        <Boton variante="primary" onClick={validar} tecla="⌘↵" disabled={!er.trim()}>Validar</Boton>
      </div>

      <Casos resultado={res} />

      <TrasResolver ok={res?.ok === true} tipo="lex" actual={e.id} lista={LEX} ir={ir} />

      <Escalones>
        <Escalon titulo="Una pista" costo="no revela la respuesta">
          <p>La expresión regular reconoce la <b>forma</b>; la acción léxica valida la <b>cota</b>. Si fallan casos con forma válida, el problema está en la condición del if; si fallan casos con forma inválida, está en la expresión. Cada fila roja te dice cuál de las dos.</p>
        </Escalon>
        <Escalon titulo="Ver los conjuntos del modelo" costo="revela parte">
          <pre>{e.cj || '(este ejercicio no usa conjuntos)'}</pre>
        </Escalon>
        <Escalon titulo="Ver una respuesta modelo" costo="revela todo">
          <pre>{'ER:  ' + e.mER + '\n\n' + codigoModelo(e.atr, e.op, e.cota)}</pre>
        </Escalon>
      </Escalones>
    </div>
  )
}
