import type { RefObject } from 'react'

const TECLAS = ['{', '}', '(', ')', '|', '*', '+', '?', '[', ']', '"', '-', '.', 'ε', '->']

interface Props {
  destino: RefObject<HTMLInputElement | HTMLTextAreaElement | null>
  valor: string
  setValor: (v: string) => void
  teclas?: string[]
}

/** Símbolos que no están cómodos en el teclado. Se insertan donde está el cursor. */
export default function Teclado({ destino, valor, setValor, teclas = TECLAS }: Props) {
  const insertar = (t: string) => {
    const el = destino.current
    const ini = el?.selectionStart ?? valor.length
    const fin = el?.selectionEnd ?? valor.length
    setValor(valor.slice(0, ini) + t + valor.slice(fin))
    requestAnimationFrame(() => {
      if (el) { el.focus(); el.selectionStart = el.selectionEnd = ini + t.length }
    })
  }
  return (
    <div className="teclado" role="group" aria-label="Insertar símbolo">
      {teclas.map((k) => (
        <button key={k} type="button" onClick={() => insertar(k)} aria-label={`Insertar ${k}`}>{k}</button>
      ))}
    </div>
  )
}
