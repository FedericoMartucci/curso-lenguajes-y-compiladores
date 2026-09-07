/* Tipos del contenido teórico. `src/data/curso.ts` es generado por build.js a partir de content/;
   estos tipos son el contrato que ese archivo tiene que cumplir. */

/** A qué parcial pertenece un módulo. 'I y II' son los módulos transversales (panorama, proyecto). */
export type Parcial = 'I' | 'II' | 'I y II' | '—'

/** 🎯 entra al parcial · 📘 profundidad de Aho · ⚙️ taller de ejercicios */
export type Badge = '🎯' | '📘' | '⚙️'

export type EstadoLeccion = 'dictada' | 'resumen'

export interface PreguntaQA {
  /** Enunciado de la pregunta. Texto plano. */
  q: string
  /** Respuesta modelo. HTML. */
  a: string
}

export interface Leccion {
  /** Identificador jerárquico: '6.4'. Único en todo el curso y estable (se usa en la URL). */
  id: string
  titulo: string
  /** Referencia al libro de Aho: '§4.6.2, p.242'. */
  aho?: string
  badges?: Badge[]
  estado: EstadoLeccion
  /** Cuerpo de la lección. HTML confiable: sale de content/, no de entrada del usuario. */
  html: string
  qa?: PreguntaQA[]
  /** Visualizador embebido: ruta relativa dentro de public/artifacts/. */
  artifact?: string
  artifactTitle?: string
  /** Alto del iframe en px. Por defecto 620. */
  artifactH?: number
}

export interface Modulo {
  id: number
  titulo: string
  parcial: Parcial
  resumen: string
  lecciones: Leccion[]
}

export interface Curso {
  modulos: Modulo[]
}

/** Lección aplanada con su módulo y su posición global, para navegar sin recorrer el árbol. */
export interface LeccionPlana extends Leccion {
  mod: Modulo
  /** Índice en el orden global del curso: permite anterior/siguiente en O(1). */
  ix: number
}

/** Clasificación de una pregunta del banco, para los filtros de ejercitación. */
export type TipoPregunta = 'vf' | 'practico' | 'desarrollar'

export interface PreguntaBanco {
  /** '6.4#2' — id de lección + índice de la pregunta. Clave de progreso, estable. */
  qid: string
  modId: number
  modT: string
  lid: string
  lt: string
  q: string
  a: string
  tipo: TipoPregunta
}
