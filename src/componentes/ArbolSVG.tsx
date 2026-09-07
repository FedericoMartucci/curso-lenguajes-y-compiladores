import { useMemo } from 'react'
import type { ReactElement } from 'react'
import type { NodoArbol } from '../engines/arbol.ts'

/* Dibuja el árbol sintáctico mientras se escribe. Ver el árbol es la mitad del ejercicio:
   la notación de texto es cómoda para tipear pero ilegible para verificar la forma. */

interface Puesto extends NodoArbol {
  x: number
  y: number
  hijos: Puesto[]
}

const ANCHO_NODO = (etiqueta: string) => Math.max(30, etiqueta.length * 8.5 + 16)

function ubicar(n: NodoArbol): { raiz: Puesto; hojas: number; alto: number } {
  let hoja = 0
  let maxD = 0
  const rec = (m: NodoArbol, d: number): Puesto => {
    maxD = Math.max(maxD, d)
    const hijos = m.hijos.map((h) => rec(h, d + 1))
    const x = hijos.length
      ? ((hijos[0] as Puesto).x + (hijos[hijos.length - 1] as Puesto).x) / 2
      : hoja++
    return { ...m, hijos, x, y: d }
  }
  const raiz = rec(n, 0)
  return { raiz, hojas: Math.max(hoja, 1), alto: maxD + 1 }
}

export default function ArbolSVG({ raiz }: { raiz: NodoArbol }) {
  const svg = useMemo(() => {
    const { raiz: r, hojas, alto } = ubicar(raiz)
    const gx = 78, gy = 66, mx = 40, my = 24
    const W = hojas * gx + mx
    const H = alto * gy + my

    const lineas: ReactElement[] = []
    const nodos: ReactElement[] = []

    const dibujar = (n: Puesto, k: string) => {
      const x = mx + n.x * gx
      const y = my + n.y * gy
      n.hijos.forEach((h, i) => {
        lineas.push(
          <line
            key={`${k}-l${i}`}
            x1={x} y1={y + 9} x2={mx + h.x * gx} y2={my + h.y * gy - 13}
            stroke="var(--hairline-strong)" strokeWidth="1"
          />
        )
        dibujar(h, `${k}-${i}`)
      })
      const w = ANCHO_NODO(n.etiqueta)
      const esHoja = !n.hijos.length
      nodos.push(
        <g key={k}>
          <rect
            x={x - w / 2} y={y - 13} width={w} height={26} rx="6"
            fill={esHoja ? 'var(--accent-bg)' : 'var(--surface)'}
            stroke={esHoja ? 'var(--accent)' : 'var(--hairline-strong)'} strokeWidth="1"
          />
          <text
            x={x} y={y + 5} textAnchor="middle" fontSize="13"
            fill={esHoja ? 'var(--accent)' : 'var(--ink)'}
          >
            {n.etiqueta}
          </text>
        </g>
      )
    }
    dibujar(r, 'r')

    return (
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img"
           aria-label="Árbol sintáctico de tu respuesta">
        {lineas}{nodos}
      </svg>
    )
  }, [raiz])

  return <div className="arbol-caja scroll-x">{svg}</div>
}
