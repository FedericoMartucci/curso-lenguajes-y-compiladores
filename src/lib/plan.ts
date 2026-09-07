/* Las 16 semanas, mapeadas contra el cronograma real de la cátedra (Cronograma 2026 2C).

   El orden de los módulos NO es el del libro sino el de la cursada: por eso Tipos de datos
   (módulo 10) cae recién en la semana 12, junto con Optimización, que es cuando la cátedra
   da C6 y C7. Las semanas 1, 9 y 15 son feriado y quedan de colchón a propósito.

   Reparto: 110 lecciones en 10 semanas con teoría nueva. Las semanas cargadas (4, 5, 8 y 12)
   son las que la cátedra realmente carga; no se maquilla el reparto para que quede parejo. */

import type { Semana, MetaDelDia, PracticaLiberada } from '../tipos/plan.ts'
import type { TipoEjercicio } from '../tipos/ejercicios.ts'

const P = (n: number, titulo: string, ...tipos: TipoEjercicio[]): PracticaLiberada => ({ n, titulo, tipos })

export const SEMANAS: Semana[] = [
  {
    n: 1, cuando: 'del 17 de agosto', clase: 'feriado',
    tema: 'Arranque',
    modulos: [0], libera: [],
    nota: 'Lunes feriado: no hay clase. Buen momento para el panorama general antes de que empiece la materia.'
  },
  {
    n: 2, cuando: 'del 24 de agosto', clase: 'teoria',
    tema: 'C1 · Léxico y expresiones regulares',
    modulos: [1, 2],
    libera: [P(1, 'Expresiones regulares y analizador léxico', 'er', 'lex')],
    hito: 'Primera clase presencial · presentación de la materia · arranca el proyecto del compilador'
  },
  {
    n: 3, cuando: 'del 31 de agosto', clase: 'teoria',
    tema: 'C1 · Léxico  +  C2 · Sintáctico y GLC',
    modulos: [3], libera: [],
    nota: 'Los autómatas son el motor de Flex: entender esto hace que la Práctica 1 deje de ser memoria.'
  },
  {
    n: 4, cuando: 'del 7 de septiembre', clase: 'teoria',
    tema: 'C2 · Sintáctico y GLC  +  C3 · Parsing',
    modulos: [4, 5],
    libera: [P(2, 'Gramáticas libres de contexto', 'glc')]
  },
  {
    n: 5, cuando: 'del 14 de septiembre', clase: 'teoria',
    tema: 'C3 · Parsing',
    modulos: [6, 7],
    libera: [P(3, 'Parsing ascendente y tabla SLR', 'parsing')],
    nota: 'El módulo 6 es el corazón del Parcial I.'
  },
  {
    n: 6, cuando: 'del 21 de septiembre', clase: 'consultas',
    tema: 'Consultas de la primera etapa',
    modulos: [], libera: [],
    nota: 'No hay teoría nueva. Semana de repaso: dale al modo examen del Parcial I y llevá tus dudas a la clase.'
  },
  {
    n: 7, cuando: 'del 28 de septiembre', clase: 'parcial',
    tema: 'Parcial I',
    modulos: [], libera: [],
    hito: 'Parcial I · presencial · entran los módulos 0 a 7'
  },
  {
    n: 8, cuando: 'del 5 de octubre', clase: 'teoria',
    tema: 'C4 · GCI, sentencias básicas',
    modulos: [8, 9],
    libera: [P(4, 'Código intermedio, sentencias básicas', 'gci')]
  },
  {
    n: 9, cuando: 'del 12 de octubre', clase: 'feriado',
    tema: 'Colchón',
    modulos: [], libera: [],
    nota: 'Lunes feriado: no hay clase. Está reservada para cerrar lo que quedó abierto de la semana anterior.'
  },
  {
    n: 10, cuando: 'del 19 de octubre', clase: 'teoria',
    tema: 'C4 · GCI, sentencias de control',
    modulos: [11],
    libera: [P(5, 'Código intermedio, sentencias de control', 'gci')],
    hito: 'Clase presencial · entrega del compilador (2ª parte)'
  },
  {
    n: 11, cuando: 'del 26 de octubre', clase: 'teoria',
    tema: 'C5 · Assembler y coprocesador matemático',
    modulos: [12],
    libera: [P(6, 'Assembler y coprocesador', 'asm')]
  },
  {
    n: 12, cuando: 'del 2 de noviembre', clase: 'teoria',
    tema: 'C6 · Tipos de datos  +  C7 · Optimización',
    modulos: [10, 13], libera: [],
    nota: 'La semana más cargada del cuatrimestre: 19 lecciones. Si venís justo, priorizá lo marcado 🎯.'
  },
  {
    n: 13, cuando: 'del 9 de noviembre', clase: 'consultas',
    tema: 'Consultas de la segunda etapa y revisión general',
    modulos: [14, 15], libera: [],
    hito: 'Coloquios · entrega final del TP',
    nota: 'Cierre y simulacros, más el módulo de tu propio lenguaje L1_aho aplicado.'
  },
  {
    n: 14, cuando: 'del 16 de noviembre', clase: 'parcial',
    tema: 'Parcial II',
    modulos: [], libera: [],
    hito: 'Parcial II · presencial · entran los módulos 8 a 13'
  },
  {
    n: 15, cuando: 'del 23 de noviembre', clase: 'feriado',
    tema: 'Colchón',
    modulos: [], libera: [],
    nota: 'Lunes feriado. Si quedó algo colgado, esta es la semana.'
  },
  {
    n: 16, cuando: 'del 30 de noviembre', clase: 'cierre',
    tema: 'Recuperatorio y cierre de notas',
    modulos: [], libera: [],
    hito: 'Recuperatorio · presencial'
  }
]

export const TOTAL_SEMANAS = SEMANAS.length

export const semana = (n: number): Semana =>
  SEMANAS.find((s) => s.n === n) ?? (SEMANAS[0] as Semana)

/** Todas las prácticas liberadas hasta la semana `n` inclusive. */
export function practicasHasta(n: number): PracticaLiberada[] {
  return SEMANAS.filter((s) => s.n <= n).flatMap((s) => s.libera)
}

/** Los tipos de ejercicio ya disponibles en la semana `n`. El plan sugiere: no bloquea nada. */
export function tiposHasta(n: number): Set<TipoEjercicio> {
  return new Set(practicasHasta(n).flatMap((p) => p.tipos))
}

/** En qué semana se libera una práctica. `null` si esa práctica no está en el plan. */
export function semanaDePractica(n: number): number | null {
  const s = SEMANAS.find((x) => x.libera.some((p) => p.n === n))
  return s ? s.n : null
}

/** En qué semana se libera un tipo de ejercicio del sandbox. */
export function semanaDeTipo(t: TipoEjercicio): number | null {
  const s = SEMANAS.find((x) => x.libera.some((p) => p.tipos.includes(t)))
  return s ? s.n : null
}

/** En qué semana se ve un módulo. `null` si es un módulo transversal sin semana asignada. */
export function semanaDeModulo(modId: number): number | null {
  const s = SEMANAS.find((x) => x.modulos.includes(modId))
  return s ? s.n : null
}

export type { Semana, MetaDelDia }
