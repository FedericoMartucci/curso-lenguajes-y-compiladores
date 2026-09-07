/* Contratos de los motores. Son funciones puras: se prueban desde node sin navegador.
   Todo lo que devuelven termina en pantalla, así que estos tipos son la interfaz real
   entre "validar de verdad" y "mostrarlo bien". */

import type { Entorno } from './ejercicios.ts'

/* ---------- resultado genérico de una tanda de casos ---------- */

/** Un caso de aceptación/rechazo ya corrido. */
export interface CasoCorrido {
  /** La cadena probada. */
  s: string
  /** Qué se esperaba. Ausente en las pruebas libres del alumno. */
  esperado?: boolean
  /** Qué pasó realmente. */
  obtenido: boolean
  pass: boolean
  /** Por qué se rechazó: 'rechazado por la ER' | 'rechazado por la acción'. */
  detalle?: string
  /** true en las cadenas que el alumno prueba por su cuenta: no hay resultado esperado. */
  libre?: boolean
}

export interface ResultadoCasos {
  ok: boolean
  casos: CasoCorrido[]
  /** Mensaje de compilación. `null` cuando no hubo error. */
  error: string | null
  /** La validación pasó pero hay algo mejorable en la forma de la respuesta. */
  avisos?: string[]
}

/* ---------- expresiones regulares ---------- */

/** Definiciones regulares parseadas: { DIGITO: '[0-9]' }. */
export type Conjuntos = Record<string, string>

/* ---------- gramáticas ---------- */

export interface Regla {
  lhs: string
  /** Lado derecho. Array vacío = producción ε. */
  rhs: string[]
}

export interface Gramatica {
  rules: Regla[]
  /** No terminales: todo símbolo que aparece a la izquierda alguna vez. */
  nts: Set<string>
  /** Símbolo distinguido: el lado izquierdo de la primera regla. `null` si no hay reglas. */
  start: string | null
}

/* ---------- parsing SLR ---------- */

/** Ítem LR(0): la regla `r` con el punto en la posición `dot`. */
export interface ItemLR0 {
  r: number
  dot: number
}

export interface Transicion {
  desde: number
  simbolo: string
  hasta: number
}

export type Accion =
  | { tipo: 'd'; valor: number }
  | { tipo: 'r'; valor: number; regla: Regla }
  | { tipo: 'acc' }

export interface Conflicto {
  estado: number
  simbolo: string
  clase: 'desplazamiento-reducción' | 'reducción-reducción' | 'múltiple'
  acciones: Accion[]
}

export interface InfoSLR {
  gAumentada: Gramatica
  primeros: Record<string, Set<string>>
  siguientes: Record<string, Set<string>>
  anulable: Record<string, boolean>
  estados: ItemLR0[][]
  trans: Transicion[]
  /** accion[estado][terminal] = acciones. Más de una = conflicto. */
  accion: Record<number, Record<string, Accion[] | undefined>>
  irA: Record<number, Record<string, number | undefined>>
  terminales: string[]
  noTerminales: string[]
  /** Columnas de la tabla ACCION: terminales + '$'. */
  cols: string[]
  conflictos: Conflicto[]
  esSLR: boolean
}

/** Una fila de la corrección de PRIMEROS/SIGUIENTES. */
export interface FilaConjunto {
  nt: string
  esperado: string[]
  puesto: string[]
  pass: boolean
  faltan: string[]
  sobran: string[]
  /** false si el alumno directamente no cargó ese no terminal. */
  cargado: boolean
}

export interface ResultadoConjuntos {
  ok: boolean
  filas: FilaConjunto[]
  /** No terminales que el alumno cargó y no existen en la gramática. */
  extra?: string[]
  error: string | null
}

/* ---------- validación por ejecución (GCI y Assembler) ---------- */

/** Una comparación deja un booleano en la pila, así que el entorno de ejecución no es solo numérico. */
export type ValorEjec = number | boolean

export type EntornoEjec = Record<string, ValorEjec>

export interface DetalleVariable {
  variable: string
  esperado: number
  /** `undefined` si el programa nunca le asignó valor a esa variable. */
  obtenido: ValorEjec | undefined
  pass: boolean
}

export interface ResultadoCaso {
  inicial: Entorno
  esperado: Entorno
  /** Entorno final. `null` si la ejecución falló. */
  obtenido?: EntornoEjec | null
  pass: boolean
  detalles?: DetalleVariable[]
  /** Mensaje de ejecución: sintaxis, ciclo infinito, pila vacía. */
  error: string | null
}

export interface ResultadoEjecucion {
  ok: boolean
  resultados: ResultadoCaso[]
  error: string | null
}

/* ---------- coprocesador 8087 ---------- */

export interface EstadoCoprocesador {
  /** Variables del segmento .DATA. `null` = declarada con `?`, todavía sin valor. */
  mem: Record<string, number | null>
  /** La pila ST(0)..ST(7). El tope es el índice 0. */
  pila: number[]
  /** Resultado de la última comparación (ST(0) − operando). `null` si no hubo ninguna. */
  flags: number | null
}

/** Una instrucción ya parseada del segmento .CODE. */
export interface Instruccion {
  op: string
  arg: string
  /** Número de línea en el texto original, para poder señalar el error. */
  linea: number
}

/* ---------- editor con resaltado ---------- */

export type ClaseToken = 'kw' | 'attr' | 'num' | 'str' | 'op' | 'punct' | 'com' | 'plain'

export interface TrozoResaltado {
  text: string
  cls: ClaseToken
}
