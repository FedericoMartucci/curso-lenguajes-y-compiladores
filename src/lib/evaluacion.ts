/* Evaluación de cierre de semana.

   Cerrar una semana era un botón: la marcabas y listo. Ahora hay que rendir lo de esa semana.

   Sobre el principio del proyecto ("el plan sugiere, nunca bloquea"): esto NO lo contradice.
   La evaluación no impide leer nada ni entrar a ningún ejercicio — todo sigue siempre
   accesible. Lo único que condiciona es marcar la semana como cerrada, que es una afirmación
   sobre lo que sabés, no una puerta.

   La evaluación mezcla las dos cosas que la app puede medir, y dice cuál es cuál:
   - preguntas de los módulos de la semana, que se autoevalúan (es lo que hace toda la app);
   - ejercicios de la práctica que esa semana libera, que los valida el motor de verdad. */

import { LECCIONES, QIDS } from './curso.ts'
import { semana as semanaDe } from './plan.ts'
import { TODOS_LOS_EJERCICIOS } from './ejercicios.ts'
import type { Progreso } from '../tipos/progreso.ts'
import type { TipoEjercicio } from '../tipos/ejercicios.ts'

/** Cuántas preguntas entran y cuántas hay que saber. */
export const PREGUNTAS_POR_EVALUACION = 6
export const MINIMO_SABIDAS = 5
/** Ejercicios de la práctica liberada que hay que tener resueltos. */
export const MINIMO_EJERCICIOS = 3

export interface RequisitoEjercicios {
  practica: number
  titulo: string
  tipos: TipoEjercicio[]
  resueltos: number
  /** Cuántos hacen falta. Nunca más que los que existen. */
  necesarios: number
  cumple: boolean
}

export interface Evaluacion {
  semana: number
  /** Preguntas sorteadas de los módulos de la semana. */
  preguntas: string[]
  /** Cuántas hay que saber de las que entran. */
  minimo: number
  /** Requisito de ejercicios, si la semana libera alguna práctica. */
  ejercicios: RequisitoEjercicios[]
  /** true si la semana no tiene teoría ni práctica: no hay nada que rendir. */
  sinContenido: boolean
}

/** Sorteo estable: la misma semana da siempre las mismas preguntas hasta que se cierre.
    Sin esto, recargar la página cambiaría la evaluación y sería fácil de esquivar. */
function mezclaEstable<T>(arr: T[], semilla: number): T[] {
  const a = arr.slice()
  let s = semilla * 9301 + 49297
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280
    const j = Math.floor((s / 233280) * (i + 1))
    ;[a[i], a[j]] = [a[j] as T, a[i] as T]
  }
  return a
}

export function armarEvaluacion(n: number, progreso: Progreso): Evaluacion {
  const sem = semanaDe(n)

  const qids = QIDS.filter((q) => sem.modulos.includes(q.modId)).map((q) => q.qid)
  const preguntas = mezclaEstable(qids, n).slice(0, PREGUNTAS_POR_EVALUACION)

  const ejercicios: RequisitoEjercicios[] = sem.libera.map((p) => {
    const del = TODOS_LOS_EJERCICIOS.filter((e) => p.tipos.includes(e.tipo))
    const resueltos = del.filter((e) => progreso.ejercicios[`${e.tipo}:${e.id}`]?.resuelto).length
    const necesarios = Math.min(MINIMO_EJERCICIOS, del.length)
    return {
      practica: p.n, titulo: p.titulo, tipos: p.tipos,
      resueltos, necesarios, cumple: resueltos >= necesarios
    }
  })

  return {
    semana: n,
    preguntas,
    minimo: Math.min(MINIMO_SABIDAS, preguntas.length),
    ejercicios,
    sinContenido: preguntas.length === 0 && ejercicios.length === 0
  }
}

export interface EstadoEvaluacion {
  /** Cuántas de las preguntas de la evaluación marcaste como sabidas en esta tanda. */
  sabidas: number
  /** Cuántas respondiste, sabidas o no. */
  respondidas: number
  preguntasOk: boolean
  ejerciciosOk: boolean
  /** true cuando se puede cerrar la semana. */
  aprobada: boolean
}

/** Evalúa el estado actual contra los requisitos. `notas` son las de esta tanda, no el SRS:
    la evaluación mide lo que contestaste ahora, no lo que sabías la semana pasada. */
export function evaluarEstado(ev: Evaluacion, notas: Record<string, boolean>): EstadoEvaluacion {
  const respondidas = ev.preguntas.filter((q) => q in notas).length
  const sabidas = ev.preguntas.filter((q) => notas[q]).length
  const preguntasOk = sabidas >= ev.minimo
  const ejerciciosOk = ev.ejercicios.every((r) => r.cumple)
  return {
    sabidas, respondidas, preguntasOk, ejerciciosOk,
    aprobada: ev.sinContenido || (preguntasOk && ejerciciosOk)
  }
}
