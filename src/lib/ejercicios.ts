/* Índice único de los 98 ejercicios del sandbox, ya decorados con su grupo y su número.
   Existe para que la paleta de comandos, el plan y el navegador de ejercicios miren
   la misma lista y no tres listas paralelas. */

import { ER_EJ } from '../data/ejercicios/er.ts'
import { LEX_EJ } from '../data/ejercicios/lexicas.ts'
import { GLC_EJ } from '../data/ejercicios/glc.ts'
import { PARSING_EJ } from '../data/ejercicios/parsing.ts'
import { GCI_EJ } from '../data/ejercicios/gci.ts'
import { ASM_EJ } from '../data/ejercicios/asm.ts'
import { decorar, agrupar } from '../data/ejercicios/meta.ts'
import type {
  TipoEjercicio, Decorado, GrupoEjercicios,
  EjercicioER, EjercicioLex, EjercicioGLC, EjercicioParsing, EjercicioGCI, EjercicioASM
} from '../tipos/ejercicios.ts'

export const ER = decorar(ER_EJ, 'er')
export const LEX = decorar(LEX_EJ, 'lex')
export const GLC = decorar(GLC_EJ, 'glc')
export const PARSING = decorar(PARSING_EJ, 'parsing')
export const GCI = decorar(GCI_EJ, 'gci')
export const ASM = decorar(ASM_EJ, 'asm')

export interface Solapa {
  tipo: TipoEjercicio
  /** Cómo se llama en la interfaz. */
  etiqueta: string
  /** Una línea sobre qué se practica y cómo se valida. */
  bajada: string
  /** De qué práctica de la cátedra sale. */
  practica: string
  total: number
}

export const SOLAPAS: Solapa[] = [
  { tipo: 'er', etiqueta: 'Expresiones regulares', practica: 'Práctica 1', total: ER.length,
    bajada: 'Escribís la ER en la notación de la cátedra y se compila de verdad contra los casos que debe aceptar y los que debe rechazar.' },
  { tipo: 'lex', etiqueta: 'Acciones léxicas', practica: 'Práctica 1', total: LEX.length,
    bajada: 'La ER reconoce la forma; la acción léxica valida la cota. Se prueban siempre los valores límite.' },
  { tipo: 'glc', etiqueta: 'Gramáticas', practica: 'Práctica 2', total: GLC.length,
    bajada: 'Tu gramática se corre en un reconocedor Earley: se comprueba qué cadenas acepta y cuáles rechaza.' },
  { tipo: 'parsing', etiqueta: 'Parsing SLR', practica: 'Práctica 3', total: PARSING.length,
    bajada: 'PRIMEROS, SIGUIENTES y conflictos, corregidos contra la tabla que calcula el motor a partir de la gramática.' },
  { tipo: 'gci', etiqueta: 'Código intermedio', practica: 'Prácticas 4 y 5', total: GCI.length,
    bajada: 'Tu polaca o tus tercetos se ejecutan con valores iniciales y se comparan las variables finales.' },
  { tipo: 'asm', etiqueta: 'Assembler', practica: 'Práctica 6', total: ASM.length,
    bajada: 'Tu código corre en un simulador del coprocesador 8087 y se comparan los resultados en memoria.' }
]

export const solapa = (t: TipoEjercicio): Solapa =>
  SOLAPAS.find((s) => s.tipo === t) ?? (SOLAPAS[0] as Solapa)

export const TOTAL_EJERCICIOS =
  ER.length + LEX.length + GLC.length + PARSING.length + GCI.length + ASM.length

/** Entrada plana para buscar: lo mínimo para encontrar un ejercicio y saltar a él. */
export interface EntradaEjercicio {
  tipo: TipoEjercicio
  id: string
  t: string
  fuente: string
  grupo: string
  num: string
  nivel: string
  etiquetaTipo: string
  /** Palabras extra por las que se lo puede buscar: 'polaca', 'tercetos', 'coprocesador'. */
  notacion?: string
}

const NOTACION: Record<TipoEjercicio, string> = {
  er: 'expresion regular er token conjunto lexico flex',
  lex: 'accion lexica cota lexema longitud valor',
  glc: 'gramatica bnf glc libre de contexto derivacion',
  parsing: 'parsing slr primeros siguientes first follow tabla conflictos lr',
  gci: 'codigo intermedio polaca inversa tercetos backpatching celdas',
  asm: 'assembler coprocesador 8087 pila registros fld fstp'
}

const aplanar = <E extends { id: string; t: string; fuente: string; nivel: string }>(
  lista: Decorado<E>[], tipo: TipoEjercicio
): EntradaEjercicio[] =>
  lista.map((e) => ({
    tipo, id: e.id, t: e.t, fuente: e.fuente,
    grupo: e.grupo, num: e.num, nivel: e.nivel,
    etiquetaTipo: solapa(tipo).etiqueta,
    notacion: NOTACION[tipo]
  }))

export const TODOS_LOS_EJERCICIOS: EntradaEjercicio[] = [
  ...aplanar(ER, 'er'),
  ...aplanar(LEX, 'lex'),
  ...aplanar(GLC, 'glc'),
  ...aplanar(PARSING, 'parsing'),
  ...aplanar(GCI, 'gci'),
  ...aplanar(ASM, 'asm')
]

export function porTipo(t: TipoEjercicio): EntradaEjercicio[] {
  return TODOS_LOS_EJERCICIOS.filter((e) => e.tipo === t)
}

export { agrupar }
export type {
  Decorado, GrupoEjercicios,
  EjercicioER, EjercicioLex, EjercicioGLC, EjercicioParsing, EjercicioGCI, EjercicioASM
}
