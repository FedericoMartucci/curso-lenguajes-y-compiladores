/* Qué te toca hoy. Deriva del plan (qué semana estás cursando) cruzado con el progreso
   (qué leíste, qué resolviste, qué preguntas vencieron).

   Regla del proyecto: el plan SUGIERE. Nada de lo que calcula acá bloquea el acceso a nada. */

import { LECCIONES, QIDS, TOTAL_PREGUNTAS } from './curso.ts'
import { semana as semanaDe, practicasHasta, semanaDeTipo, SEMANAS } from './plan.ts'
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
  /** Preguntas que la repetición espaciada pone para hoy, acotadas al ritmo del alumno. */
  vencidas: string[]
  /** Cuántas hay vencidas en total. El titular es la meta del día; esto es el dato de fondo. */
  vencidasTotal: number
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
    // lo recién liberado primero: el orden natural de TODOS_LOS_EJERCICIOS es er→lex→glc→…,
    // así que sin esto la sugerencia era siempre la Práctica 1 hasta terminarla entera,
    // incluso en la semana en que se libera la Práctica 3
    .sort((a, b) => (semanaDeTipo(b.tipo) ?? 0) - (semanaDeTipo(a.tipo) ?? 0))
    .map((e) => ({ tipo: e.tipo, id: e.id, t: e.t, grupo: e.grupo, num: e.num, etiquetaTipo: e.etiquetaTipo }))

  // solo se ponen a repasar preguntas de temas que ya tocaron.
  // QIDS sale del índice: no hace falta cargar los 719 kB de contenido para contar vencidas.
  const modulosVistos = new Set(
    LECCIONES.filter((l) => progreso.leidas[l.id]).map((l) => l.mod.id)
  )
  const todasVencidas = QIDS
    .filter((q) => modulosVistos.has(q.modId))
    .filter((q) => vencida(progreso.preguntas[q.qid], ahora))
    .map((q) => q.qid)

  // La lectura está acotada por el ritmo y el repaso no lo estaba: leer 10 lecciones
  // devolvía "100 preguntas que tocan hoy", y 100 no es un día. Se usa el mismo ritmo,
  // con un multiplicador porque una pregunta cuesta mucho menos que una lección.
  const vencidas = todasVencidas.slice(0, progreso.ritmo * 5)

  return {
    semana: sem,
    deLaSemana,
    meta: sinLeer.slice(0, progreso.ritmo),
    leidasSemana,
    pendientes,
    vencidas,
    vencidasTotal: todasVencidas.length,
    semanaLista: sinLeer.length === 0,
    pctSemana: deLaSemana.length ? leidasSemana / deLaSemana.length : 1
  }
}

/* ---------- preparación para un parcial ---------- */

export interface EstadoPractica {
  n: number
  titulo: string
  tipos: TipoEjercicio[]
  hechos: number
  total: number
}

export interface Preparacion {
  /** 'I' o 'II'. */
  parcial: string
  /** Módulos que entran. */
  modulos: number[]
  /** Cómo se dice ese conjunto en una frase: "los módulos 0 a 7, más el 15". */
  modulosTexto: string
  /** Las prácticas que hay que llevar resueltas, con su avance real. */
  practicas: EstadoPractica[]
  /** Lecciones marcadas 🎯 de los módulos que entran y todavía sin leer. */
  faltanLeer: LeccionPlana[]
  /** Cuántas lecciones 🎯 entran en total. */
  totalObjetivo: number
}

const MODULOS_PARCIAL: Record<string, (m: number) => boolean> = {
  I: (m) => m <= 7 || m === 15,
  II: (m) => (m >= 8 && m <= 13) || m === 15
}

/** Qué hay que tener listo para el parcial de esta semana. `null` si no es semana de parcial.

    PRODUCT.md define el éxito como "llegar al Parcial I con las prácticas 1 a 3 resueltas y
    validadas, no leídas". Esa métrica no aparecía en ninguna pantalla, ni siquiera la semana
    del parcial, donde Hoy mostraba exactamente lo mismo que un martes cualquiera. */
export function calcularPreparacion(progreso: Progreso, semanaN: number): Preparacion | null {
  const sem = semanaDe(semanaN)
  if (sem.clase !== 'parcial') return null

  const parcial = semanaN <= 7 ? 'I' : 'II'
  const entra = MODULOS_PARCIAL[parcial] ?? (() => true)
  const modulos = LECCIONES.map((l) => l.mod.id).filter((m, i, a) => a.indexOf(m) === i).filter(entra)

  const practicas: EstadoPractica[] = SEMANAS
    .filter((x) => x.n < semanaN)
    .flatMap((x) => x.libera)
    .map((p) => {
      const ejs = TODOS_LOS_EJERCICIOS.filter((e) => p.tipos.includes(e.tipo))
      return {
        n: p.n, titulo: p.titulo, tipos: p.tipos,
        hechos: ejs.filter((e) => progreso.ejercicios[`${e.tipo}:${e.id}`]?.resuelto).length,
        total: ejs.length
      }
    })

  const objetivo = LECCIONES.filter((l) => entra(l.mod.id) && (l.badges ?? []).includes('🎯'))

  // los módulos no siempre son un rango: el 15 (tu proyecto) entra en los dos parciales
  const ordenados = [...modulos].sort((a, b) => a - b)
  let corte = 1
  while (corte < ordenados.length && ordenados[corte] === (ordenados[corte - 1] as number) + 1) corte++
  const rango = ordenados.slice(0, corte)
  const sueltos = ordenados.slice(corte)
  const modulosTexto =
    `los módulos ${rango[0]} a ${rango[rango.length - 1]}` +
    (sueltos.length ? `, más el ${sueltos.join(' y el ')}` : '')

  return {
    parcial, modulos, modulosTexto, practicas,
    faltanLeer: objetivo.filter((l) => !progreso.leidas[l.id]),
    totalObjetivo: objetivo.length
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
