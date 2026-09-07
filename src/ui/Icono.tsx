import type { SVGProps, ReactElement } from 'react'

/* Sistema de iconos propio: SVG dibujado, no glifos unicode.

   Todos comparten la misma grilla de 16, trazo de 1.5, extremos redondeados y `currentColor`,
   así que heredan el color y el peso del texto donde estén. Los glifos del teclado de la Mesa
   (→ ⇒ ε λ ⊢ α β) NO son iconos: son notación de la materia y siguen siendo texto. */

export type NombreIcono =
  | 'buscar' | 'menu' | 'chevron' | 'flecha' | 'check' | 'cruz'
  | 'externo' | 'reloj' | 'deshacer' | 'libro' | 'consola' | 'calendario' | 'chispa'

interface Props extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  nombre: NombreIcono
  /** En px. Por defecto 16, la grilla de diseño. */
  tam?: number
  /** Etiqueta accesible. Sin ella el icono es decorativo y se oculta al lector de pantalla. */
  titulo?: string
}

const TRAZOS: Record<NombreIcono, ReactElement> = {
  buscar: <><circle cx="7.2" cy="7.2" r="4.4" /><path d="M10.5 10.5 13.6 13.6" /></>,
  menu: <><path d="M2.5 4.5h11" /><path d="M2.5 8h11" /><path d="M2.5 11.5h11" /></>,
  chevron: <path d="m6.5 4 4 4-4 4" />,
  flecha: <><path d="M3 8h10" /><path d="m9 4 4 4-4 4" /></>,
  check: <path d="m3.2 8.4 3.2 3.2 6.4-6.8" />,
  cruz: <><path d="m4 4 8 8" /><path d="m12 4-8 8" /></>,
  externo: <><path d="M9 3h4v4" /><path d="M13 3 7.6 8.4" /><path d="M12 9.6V13H3V4h3.4" /></>,
  reloj: <><circle cx="8" cy="8" r="5.6" /><path d="M8 4.8V8l2.2 1.6" /></>,
  deshacer: <><path d="M3.2 6.4h6.2a3.4 3.4 0 0 1 0 6.8H6.6" /><path d="m5.8 3.6-2.6 2.8 2.6 2.8" /></>,
  libro: <><path d="M2.8 3.2h4a2 2 0 0 1 2 2v8a1.6 1.6 0 0 0-1.6-1.6H2.8Z" /><path d="M13.2 3.2h-4a2 2 0 0 0-2 2v8a1.6 1.6 0 0 1 1.6-1.6h4.4Z" /></>,
  consola: <><rect x="2.4" y="3.2" width="11.2" height="9.6" rx="1.6" /><path d="m5.4 6.6 1.8 1.6-1.8 1.6" /><path d="M8.8 10h2.4" /></>,
  calendario: <><rect x="2.6" y="3.6" width="10.8" height="9.6" rx="1.6" /><path d="M2.6 6.6h10.8" /><path d="M5.6 2.4v2.4" /><path d="M10.4 2.4v2.4" /></>,
  /* Una chispa grande y una chica: marca lo que opinó un modelo, para que nunca se
     confunda con el ✓ del motor, que es el que sí verifica. */
  chispa: <><path d="M6.4 2.4 7.6 5.9l3.5 1.2-3.5 1.2-1.2 3.5-1.2-3.5L1.7 7.1l3.5-1.2Z" /><path d="M11.8 9.4l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6Z" /></>
}

export default function Icono({ nombre, tam = 16, titulo, ...resto }: Props) {
  return (
    <svg
      {...resto}
      width={tam} height={tam} viewBox="0 0 16 16"
      fill="none" stroke="currentColor"
      strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      role={titulo ? 'img' : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
      focusable="false"
      className={'ico' + (resto.className ? ' ' + resto.className : '')}
    >
      {titulo && <title>{titulo}</title>}
      {TRAZOS[nombre]}
    </svg>
  )
}
