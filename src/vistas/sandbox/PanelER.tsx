import { useState, useRef, useCallback } from 'react'
import { ER } from '../../lib/ejercicios.ts'
import { testER, buildRegex, parseConjuntos } from '../../engines/regex.ts'
import { useProgreso } from '../../lib/progreso.tsx'
import type { ResultadoCasos, CasoCorrido } from '../../tipos/motores.ts'
import type { Ruta } from '../../lib/router.ts'
import { EncabezadoEjercicio, useBorrador } from './marco.tsx'
import { Casos } from '../../componentes/Casos.tsx'
import Teclado from '../../componentes/Teclado.tsx'
import Campo from '../../ui/Campo.tsx'
import Boton from '../../ui/Boton.tsx'

export default function PanelER({ id, ir }: { id: string; ir: (r: Ruta) => void }) {
  const e = ER.find((x) => x.id === id) ?? (ER[0] as typeof ER[number])
  const { registrarIntento } = useProgreso()
  const [campos, set] = useBorrador('er', e.id, { cj: e.cj, er: '', propia: '' })
  const [res, setRes] = useState<ResultadoCasos | null>(null)
  const [extra, setExtra] = useState<CasoCorrido[]>([])
  const refEr = useRef<HTMLInputElement>(null)

  const cj = campos.cj ?? ''
  const er = campos.er ?? ''
  const propia = campos.propia ?? ''

  const validar = useCallback(() => {
    setExtra([])
    const r = testER(er, cj, e.ac, e.rc)
    setRes(r)
    registrarIntento('er', e.id, r.ok)
  }, [er, cj, e, registrarIntento])

  const probarPropia = () => {
    try {
      const rx = buildRegex(er, parseConjuntos(cj))
      const ok = rx.test(propia)
      setExtra([{ s: propia, obtenido: ok, pass: ok, libre: true }])
      if (!res) setRes(testER(er, cj, e.ac, e.rc))
    } catch (err) {
      setRes({ ok: false, casos: [], error: 'No compila: ' + (err instanceof Error ? err.message : String(err)) })
    }
  }

  return (
    <div>
      <EncabezadoEjercicio tipo="er" e={e} casos={e.ac.length + e.rc.length} lista={ER} ir={ir} />

      <div className="campos">
        <Campo
          label="Conjuntos"
          nota="uno por línea: NOMBRE  definición"
        >
          {(p) => <textarea {...p} className="control" rows={3} value={cj} onChange={(ev) => set('cj', ev.target.value)} />}
        </Campo>

        <Campo
          label="Expresión regular del token"
          ayuda={<>
            <code>{'{NOMBRE}'}</code> referencia un conjunto · <code>[0-9]</code> clase ·
            <code>"texto"</code> literal exacto · <code>* + ? | ( )</code> · concatenar es escribir seguido.
          </>}
          error={res?.error ?? null}
        >
          {(p) => (
            <>
              <input
                {...p} ref={refEr} type="text" className="control" value={er}
                placeholder="{DIGITO1}{DIGITO}{DIGITO}{DIGITO}"
                onChange={(ev) => set('er', ev.target.value)}
                onKeyDown={(ev) => { if ((ev.metaKey || ev.ctrlKey) && ev.key === 'Enter') validar() }}
              />
              <Teclado destino={refEr} valor={er} setValor={(v) => set('er', v)} />
            </>
          )}
        </Campo>
      </div>

      <div className="acciones">
        <Boton variante="primary" onClick={validar} tecla="⌘↵" disabled={!er.trim()}>Validar</Boton>
        <div style={{ display: 'flex', gap: 'var(--s2)', flex: 1, minWidth: 240 }}>
          <input
            type="text" className="control" value={propia} style={{ flex: 1 }}
            placeholder="probar una cadena tuya"
            onChange={(ev) => set('propia', ev.target.value)}
            onKeyDown={(ev) => { if (ev.key === 'Enter') probarPropia() }}
            aria-label="Probar una cadena propia"
          />
          <Boton onClick={probarPropia} disabled={!er.trim()}>Probar</Boton>
        </div>
      </div>

      <Casos resultado={res} extra={extra} />

      <details style={{ marginTop: 'var(--s5)' }}>
        <summary style={{ cursor: 'pointer', color: 'var(--accent)', fontSize: 'var(--fs-base)' }}>
          Ver una respuesta modelo
        </summary>
        <pre style={{ marginTop: 'var(--s3)' }}>{'CONJUNTO\n' + (e.cj || '(ninguno)') + '\n\nTOKEN     EXP. REG.\n' + e.m}</pre>
        <div className="honestidad">
          <span aria-hidden="true">≡</span>
          <p>
            <b>Puede haber varias correctas.</b> Lo que se valida es qué cadenas acepta y cuáles rechaza,
            no que tu expresión sea igual a esta.
          </p>
        </div>
      </details>
    </div>
  )
}
