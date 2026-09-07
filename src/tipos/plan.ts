/* El plan de estudio sigue el cronograma real de la cátedra (Cronograma 2026 2C, 16 clases).
   No trabaja con fechas: la unidad es la SEMANA y avanza cuando vos la cerrás, no cuando
   pasa el tiempo. Así no hay "vencido" ni culpa, y el mismo plan sirve para cualquier
   cuatrimestre y cualquier comisión. */

import type { TipoEjercicio } from './ejercicios.ts'

export type ClaseSemana =
  | 'teoria'      /* clase con tema nuevo */
  | 'consultas'   /* clase de consultas: no hay teoría nueva, se repasa */
  | 'parcial'
  | 'feriado'     /* semana sin clase: queda de colchón para ponerse al día */
  | 'cierre'      /* recuperatorio y notas */

export interface Semana {
  /** 1 a 16, igual que la numeración de clases del cronograma. */
  n: number
  /** Rótulo de la semana según el cronograma: 'del 7 de septiembre'. Informativo, no operativo. */
  cuando: string
  clase: ClaseSemana
  /** Cómo la llama la cátedra: 'C2 Sintáctico y GLC + C3 Parsing'. */
  tema: string
  /** Qué hay que leer esa semana, por id de módulo. */
  modulos: number[]
  /** Prácticas que quedan disponibles: se puede resolver con la teoría ya vista. */
  libera: PracticaLiberada[]
  /** Hito de la cursada que cae esa semana. */
  hito?: string
  /** Para qué sirve la semana cuando no hay teoría nueva. */
  nota?: string
}

export interface PracticaLiberada {
  /** Número de práctica, 1 a 6. */
  n: number
  titulo: string
  /** Solapas del sandbox donde se resuelve. */
  tipos: TipoEjercicio[]
}

/** Lo que la app le propone al alumno para el día de hoy. */
export interface MetaDelDia {
  semana: Semana
  /** Las próximas lecciones sin leer de la semana activa, recortadas al ritmo elegido. */
  lecciones: string[]
  /** Ejercicios pendientes de las prácticas ya liberadas. */
  ejercicios: { tipo: TipoEjercicio; id: string; etiqueta: string }[]
  /** Preguntas que tocan repasar hoy según la repetición espaciada. */
  preguntasVencidas: number
  /** true cuando no queda nada por hacer en la semana activa. */
  semanaCompleta: boolean
}
