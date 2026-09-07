import { useRef } from 'react'
import { resaltar } from '../engines/accionLexica.ts'

interface Props {
  value: string
  onChange: (v: string) => void
  filas?: number
  placeholder?: string
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  /** ⌘↵ / Ctrl↵ dispara la validación sin sacar las manos del teclado. */
  onValidar?: () => void
}

/* Editor con resaltado: un <pre> pintado debajo y un <textarea> transparente encima.
   Mantiene la edición nativa (cursor, selección, deshacer) y colorea en vivo. */
export default function CodeEditor({
  value, onChange, filas = 9, placeholder, onValidar, ...aria
}: Props) {
  const ta = useRef<HTMLTextAreaElement>(null)
  const pre = useRef<HTMLPreElement>(null)

  const sincronizar = () => {
    if (pre.current && ta.current) {
      pre.current.scrollTop = ta.current.scrollTop
      pre.current.scrollLeft = ta.current.scrollLeft
    }
  }

  // el \n final asegura que la última línea vacía se pinte
  const trozos = resaltar(value + '\n')

  return (
    <div className="editor" style={{ ['--filas' as string]: filas }}>
      <pre className="editor__hl" ref={pre} aria-hidden="true">
        <code>{trozos.map((t, i) => <span key={i} className={'tk-' + t.cls}>{t.text}</span>)}</code>
      </pre>
      <textarea
        {...aria}
        ref={ta}
        className="editor__ta"
        value={value}
        rows={filas}
        spellCheck={false}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onScroll={sincronizar}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); onValidar?.(); return }
          if (e.key === 'Tab') {
            e.preventDefault()
            const el = e.currentTarget
            const s = el.selectionStart, f = el.selectionEnd
            onChange(value.slice(0, s) + '    ' + value.slice(f))
            requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 4 })
          }
        }}
      />
    </div>
  )
}
