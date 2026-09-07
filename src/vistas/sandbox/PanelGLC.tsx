import { useState, useRef, useCallback } from 'react'
import { GLC } from '../../lib/ejercicios.ts'
import { testGLC, parseGrammar, earleyAccepts, tokenize } from '../../engines/earley.ts'
import { useProgreso } from '../../lib/progreso.tsx'
import type { ResultadoCasos, CasoCorrido } from '../../tipos/motores.ts'
import type { Ruta } from '../../lib/router.ts'
import { EncabezadoEjercicio, TrasResolver, useBorrador } from './marco.tsx'
import { Casos } from '../../componentes/Casos.tsx'
import Teclado from '../../componentes/Teclado.tsx'
import Campo from '../../ui/Campo.tsx'
import Boton from '../../ui/Boton.tsx'

const muestra = (s: string) => (s === '' ? '⟨vacía⟩' : s)

export default function PanelGLC({ id, ir }: { id: string; ir: (r: Ruta) => void }) {
  const e = GLC.find((x) => x.id === id) ?? (GLC[0] as typeof GLC[number])
  const { registrarIntento } = useProgreso()
  const [campos, set] = useBorrador('glc', e.id, { gr: '', propia: '' })
  const [res, setRes] = useState<ResultadoCasos | null>(null)
  const [extra, setExtra] = useState<CasoCorrido[]>([])
  const refGr = useRef<HTMLTextAreaElement>(null)

  const gr = campos.gr ?? ''
  const propia = campos.propia ?? ''

  const validar = useCallback(() => {
    setExtra([])
    const r = testGLC(gr, e.ac, e.rc)
    setRes(r)
    registrarIntento('glc', e.id, r.ok)
  }, [gr, e, registrarIntento])

  const probarPropia = () => {
    try {
      const g = parseGrammar(gr)
      if (!g.start) throw new Error('Escribí al menos una regla')
      const ok = earleyAccepts(g, tokenize(propia))
      setExtra([{ s: propia, obtenido: ok, pass: ok, libre: true }])
      if (!res) setRes(testGLC(gr, e.ac, e.rc))
    } catch (err) {
      setRes({ ok: false, casos: [], error: err instanceof Error ? err.message : String(err) })
    }
  }

  return (
    <div>
      <EncabezadoEjercicio tipo="glc" e={e} casos={e.ac.length + e.rc.length} lista={GLC} ir={ir} />

      <div className="panel panel--plano" style={{ marginTop: 'var(--s4)', fontSize: 'var(--fs-sm)' }}>
        <p style={{ marginBottom: 'var(--s2)' }}>
          <b>Debe aceptar:</b>{' '}
          {e.ac.map((s, i) => <code key={i} style={{ marginRight: 6 }}>{muestra(s)}</code>)}
        </p>
        <p>
          <b>Debe rechazar:</b>{' '}
          {e.rc.map((s, i) => <code key={i} style={{ marginRight: 6 }}>{muestra(s)}</code>)}
        </p>
      </div>

      <div className="campos">
        <Campo
          label="Gramática"
          nota="una regla por línea"
          ayuda={<>
            <code>NoTerminal -&gt; símbolos | alternativa</code>. Los símbolos van separados por espacios,
            <code>ε</code> es la cadena vacía y el primer no terminal es el símbolo distinguido.
          </>}
          error={res?.error ?? null}
        >
          {(p) => (
            <>
              <textarea
                {...p} ref={refGr} className="control" rows={7} value={gr}
                placeholder={'S -> ( S ) S | ε'}
                onChange={(ev) => set('gr', ev.target.value)}
                onKeyDown={(ev) => { if ((ev.metaKey || ev.ctrlKey) && ev.key === 'Enter') validar() }}
              />
              <Teclado destino={refGr} valor={gr} setValor={(v) => set('gr', v)} />
            </>
          )}
        </Campo>
      </div>

      <div className="acciones">
        <Boton variante="primary" onClick={validar} tecla="⌘↵" disabled={!gr.trim()}>Validar</Boton>
        <div style={{ display: 'flex', gap: 'var(--s2)', flex: 1, minWidth: 240 }}>
          <input
            type="text" className="control" value={propia} style={{ flex: 1 }}
            placeholder="probar una cadena (tokens separados por espacios)"
            onChange={(ev) => set('propia', ev.target.value)}
            onKeyDown={(ev) => { if (ev.key === 'Enter') probarPropia() }}
            aria-label="Probar una cadena propia"
          />
          <Boton onClick={probarPropia} disabled={!gr.trim()}>Probar</Boton>
        </div>
      </div>

      <Casos resultado={res} extra={extra} />

      <TrasResolver ok={res?.ok === true} tipo="glc" actual={e.id} lista={GLC} ir={ir} />

      <details style={{ marginTop: 'var(--s5)' }}>
        <summary style={{ cursor: 'pointer', color: 'var(--accent)', fontSize: 'var(--fs-base)' }}>
          Ver una respuesta modelo
        </summary>
        <pre style={{ marginTop: 'var(--s3)' }}>{e.m}</pre>
      </details>
    </div>
  )
}
