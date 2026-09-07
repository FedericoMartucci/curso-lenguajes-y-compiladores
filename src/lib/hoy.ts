/* Qué te toca hoy. Deriva del plan (qué semana estás cursando) cruzado con el progreso
   (qué leíste, qué resolviste, qué preguntas vencieron).

   Regla del proyecto: el plan SUGIERE. Nada de lo que calcula acá bloquea el acceso a nada. */

import { LECCIONES, QIDS, TOTAL_PREGUNTAS } from './curso.ts'
import { semana as semanaDe, practicasHasta } from './plan.ts'
import { vencida } from './srs.ts'
import { TODOS_LOS_EJERCICIOS } from './ejercicios.ts'
import type { Progreso } from '../tipos/progreso.ts'
import type { Semana } from '../tipos/plan.ts'
import type { TipoEjercicio } from '../tipos/ejercicios.ts'
import type { LeccionPlana } from '../tipos/curso.ts'

export interface Hoy {
  semana: Semana
  /** Lecciones de la semana, en orden. */
  deLaSemana: LeccionPlana[]
  /** Las próximas sin leer, recortadas al ritmo elegido: la meta del día. */
  meta: LeccionPlana[]
  leidasSemana: number
  /** Ejercicios de las prácticas ya liberadas que todavía no resolviste. */
  pendientes: { tipo: TipoEjercicio; id: string; t: string; grupo: string; num: string; etiquetaTipo: string }[]
  /** Preguntas que la repetición espaciada pone para hoy. */
  vencidas: string[]
  /** true cuando ya leíste todo lo de la semana. */
  semanaLista: boolean
  /** 0 a 1: avance de lectura de la semana. */
  pctSemana: number
}

export function calcularHoy(progreso: Progreso, ahora = Date.now()): Hoy {
  const sem = semanaDe(progreso.semana)

  const deLaSemana = LECCIONES.filter((l) => sem.modulos.includes(l.mod.id))
  const sinLeer = deLaSemana.filter((l) => !progreso.leidas[l.id])
  const leidasSemana = deLaSemana.length - sinLeer.length

  const tiposLiberados = new Set(practicasHasta(sem.n).flatMap((p) => p.tipos))
  const pendientes = TODOS_LOS_EJERCICIOS
    .filter((e) => tiposLiberados.has(e.tipo))
    .filter((e) => !progreso.ejercicios[`${e.tipo}:${e.id}`]?.resuelto)
    .map((e) => ({ tipo: e.tipo, id: e.id, t: e.t, grupo: e.grupo, num: e.num, etiquetaTipo: e.etiquetaTipo }))

  // solo se ponen a repasar preguntas de temas que ya tocaron.
  // QIDS sale del índice: no hace falta cargar los 719 kB de contenido para contar vencidas.
  const modulosVistos = new Set(
    LECCIONES.filter((l) => progreso.leidas[l.id]).map((l) => l.mod.id)
  )
  const vencidas = QIDS
    .filter((q) => modulosVistos.has(q.modId))
    .filter((q) => vencida(progreso.preguntas[q.qid], ahora))
    .map((q) => q.qid)

  return {
    semana: sem,
    deLaSemana,
    meta: sinLeer.slice(0, progreso.ritmo),
    leidasSemana,
    pendientes,
    vencidas,
    semanaLista: sinLeer.length === 0,
    pctSemana: deLaSemana.length ? leidasSemana / deLaSemana.length : 1
  }
}

/** Avance global del alumno: lo que muestra la portada. Mide al alumno, no al contenido. */
export interface AvanceGlobal {
  leidas: number
  totalLecciones: number
  sabidas: number
  totalPreguntas: number
  resueltos: number
  totalEjercicios: number
  /** Promedio ponderado de las tres, 0 a 1. */
  pct: number
}

export function calcularAvance(progreso: Progreso): AvanceGlobal {
  const leidas = Object.keys(progreso.leidas).length
  const totalLecciones = LECCIONES.length
  // "sabida" = tarjeta con al menos un acierto encadenado
  const sabidas = Object.values(progreso.preguntas).filter((t) => t.racha >= 1).length
  const totalPreguntas = TOTAL_PREGUNTAS
  const resueltos = Object.values(progreso.ejercicios).filter((e) => e.resuelto).length
  const totalEjercicios = TODOS_LOS_EJERCICIOS.length

  const pct = (
    leidas / totalLecciones +
    sabidas / totalPreguntas +
    resueltos / totalEjercicios
  ) / 3

  return { leidas, totalLecciones, sabidas, totalPreguntas, resueltos, totalEjercicios, pct }
}
