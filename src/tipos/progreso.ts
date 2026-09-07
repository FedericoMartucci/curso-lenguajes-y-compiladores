/* Un solo estado de estudio. No puede haber tres progresos distintos en tres secciones:
   lo que leíste, lo que sabés y lo que resolviste es una sola cosa. */

export type Calificacion = 'mal' | 'costo' | 'bien'

/** Tarjeta de repetición espaciada (SM-2 simplificado). */
export interface Tarjeta {
  /** Aciertos seguidos. Se resetea a 0 cuando fallás. */
  racha: number
  /** Factor de facilidad, entre 1.3 y 2.8. Baja cuando te cuesta. */
  facilidad: number
  /** Días hasta el próximo repaso. */
  intervalo: number
  /** Cuándo vuelve a tocar (timestamp ms). */
  vence: number
  /** Última vez que la calificaste (timestamp ms). */
  visto: number
  /** Cuántas veces la viste en total. */
  vistas: number
}

export interface ProgresoEjercicio {
  resuelto: boolean
  intentos: number
  /** Lo último que escribiste, por campo. Sobrevive al refresh y al cambio de ejercicio. */
  borrador?: Record<string, string>
  actualizado: number
}

export interface Progreso {
  /** Versión del esquema. Sirve para migrar sin perder nada. */
  v: 2
  /** id de lección -> cuándo la marcaste leída. */
  leidas: Record<string, number>
  /** qid -> tarjeta de repetición espaciada. */
  preguntas: Record<string, Tarjeta>
  /** 'er:p1-1a' -> estado del ejercicio. */
  ejercicios: Record<string, ProgresoEjercicio>
  /** Semana activa del plan, 1 a 16. Avanza cuando vos la cerrás. */
  semana: number
  /** Semanas que diste por cerradas. */
  cerradas: number[]
  /** Ritmo elegido: lecciones por día. */
  ritmo: number
  actualizado: number
}

/** Forma del progreso viejo (v1), para poder migrarlo. */
export interface ProgresoV1 {
  ejerc?: Record<string, 'known' | 'repasar'>
  sandbox?: Record<string, boolean>
}
