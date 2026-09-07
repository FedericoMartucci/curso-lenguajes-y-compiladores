import React, { useRef } from 'react'
import { resaltar } from '../engines/accionLexica.js'

/* Editor con resaltado: un <pre> pintado debajo y un <textarea> transparente encima.
   Mantiene la edición nativa (cursor, selección, deshacer) y colorea en vivo. */
export default function CodeEditor({ value, onChange, rows = 9, placeholder }) {
  const taRef = useRef(null)
  const preRef = useRef(null)

  const sincronizarScroll = () => {
    if (preRef.current && taRef.current) {
      preRef.current.scrollTop = taRef.current.scrollTop
      preRef.current.scrollLeft = taRef.current.scrollLeft
    }
  }

  // el \n final asegura que la última línea vacía se pinte
  const trozos = resaltar(value + '\n')

  const onKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const el = e.target
      const s = el.selectionStart, f = el.selectionEnd
      const nuevo = value.slice(0, s) + '    ' + value.slice(f)
      onChange(nuevo)
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 4 })
    }
  }

  return (
    <div className="editor" style={{ '--rows': rows }}>
      <pre className="editor-hl" ref={preRef} aria-hidden="true">
        <code>{trozos.map((t, i) => <span key={i} className={'tk-' + t.cls}>{t.text}</span>)}</code>
      </pre>
      <textarea
        ref={taRef}
        className="editor-ta"
        value={value}
        rows={rows}
        spellCheck={false}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onScroll={sincronizarScroll}
        onKeyDown={onKeyDown}
      />
    </div>
  )
}
