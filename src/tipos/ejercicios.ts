/* Tipos del banco de ejercicios del sandbox.
   Invariante del proyecto: todo ejercicio tiene una respuesta modelo que pasa sus propios casos,
   y `npm test` lo verifica. Estos tipos hacen que un ejercicio mal formado no llegue ni a compilar. */

export type TipoEjercicio = 'er' | 'lex' | 'glc' | 'parsing' | 'gci' | 'asm'

export type Nivel = 'básico' | 'medio' | 'difícil'

/** Campos comunes a todo ejercicio, sea del tipo que sea. */
export interface EjercicioBase {
  /** Único dentro de su tipo. Se usa como clave de progreso: no cambiarlo una vez publicado. */
  id: string
  /** Título corto. */
  t: string
  /** De dónde sale: 'Práctica 1 · Ej. 1a', 'Parcial 2C24'. */
  fuente: string
  nivel: Nivel
  /** Consigna que ve el alumno. */
  c: string
  /** Aclaración sobre los límites del validador. Ver el principio "el validador es la promesa". */
  nota?: string
}

/* ---------- Expresiones regulares ---------- */
export interface EjercicioER extends EjercicioBase {
  /** Definiciones regulares, una por línea: 'NOMBRE  definición'. */
  cj: string
  /** Respuesta modelo, verificada por los tests. */
  m: string
  /** Cadenas que la expresión debe aceptar. */
  ac: string[]
  /** Cadenas que debe rechazar, incluidos los casos borde. */
  rc: string[]
}

/* ---------- Acciones léxicas ---------- */
export type Atributo =
  | 'valor'
  | 'valor_abs'
  | 'longitud'
  | 'longitud_sin_comillas'
  | 'cant_guiones_bajos'
  | 'cant_guiones'

export type Operador = '<=' | '<' | '==' | '>=' | '>' | '!='

/** Por qué se rechaza un lexema: no matchea la forma (ER) o se pasa de la cota (acción léxica). */
export type MotivoRechazo = 'ER' | 'cota'

export interface CasoLexico {
  /** El lexema a probar. */
  v: string
  /** Si debe aceptarse. */
  ok: boolean
  por?: MotivoRechazo
  nota?: string
}

export interface EjercicioLex extends EjercicioBase {
  cj: string
  /** Expresión regular modelo: la FORMA. */
  mER: string
  /** Atributo del lexema que se compara contra la cota. */
  atr: Atributo
  op: Operador
  cota: number
  tests: CasoLexico[]
}

/* ---------- Gramáticas libres de contexto ---------- */
export interface EjercicioGLC extends EjercicioBase {
  /** Gramática modelo. Una regla por línea: 'A -> α | β'. */
  m: string
  /** Cadenas de tokens separados por espacios que se deben aceptar. */
  ac: string[]
  rc: string[]
}

/* ---------- Parsing SLR ---------- */
export type PedidoParsing = 'primeros' | 'siguientes' | 'ambos' | 'conflictos'

export interface EjercicioParsing extends EjercicioBase {
  gramatica: string
  /** Qué se le pide al alumno. La respuesta no se guarda: la calcula el motor. */
  pedir: PedidoParsing
}

/* ---------- Código intermedio ---------- */
/* Las tres notaciones intermedias que toma la cátedra. Los enunciados suelen pedir la misma
   sentencia en las tres: "Representar la sentencia … en polaca inversa, en árbol sintáctico
   y en tercetos". */
export type ModoGCI = 'polaca' | 'tercetos' | 'arbol'

/** Valores de variables antes y después de ejecutar. */
export type Entorno = Record<string, number>

export interface CasoEjecucion {
  inicial: Entorno
  esperado: Entorno
}

export interface EjercicioGCI extends EjercicioBase {
  /** Qué notaciones pide el enunciado. Se resuelve cuando pasan TODAS. */
  notaciones: ModoGCI[]
  /** El programa fuente a traducir. */
  programa: string
  /** Respuesta modelo por notación. Tiene que haber una por cada entrada de `notaciones`. */
  m: Partial<Record<ModoGCI, string>>
  casos: CasoEjecucion[]
}

/* ---------- Assembler ---------- */
export interface EjercicioASM extends EjercicioBase {
  /** Esqueleto con .MODEL/.DATA/.CODE que el alumno completa. */
  plantilla: string
  m: string
  casos: CasoEjecucion[]
}

export type Ejercicio =
  | EjercicioER
  | EjercicioLex
  | EjercicioGLC
  | EjercicioParsing
  | EjercicioGCI
  | EjercicioASM

/** Mapea cada tipo a su interfaz, para tipar el sandbox sin castear. */
export interface PorTipo {
  er: EjercicioER
  lex: EjercicioLex
  glc: EjercicioGLC
  parsing: EjercicioParsing
  gci: EjercicioGCI
  asm: EjercicioASM
}

/* ---------- Metadatos de numeración ---------- */
export interface MetaEjercicio {
  /** 'Práctica 1', 'Tu lenguaje (L1_aho)', 'Parciales y extras'. */
  grupo: string
  /** '1a', '1k · decimal', 'Parcial 2C24'. */
  num: string
  /** Orden dentro del tipo. Números espaciados de a 10 para poder intercalar. */
  orden: number
}

export type Decorado<E> = E & MetaEjercicio & {
  /** Índice original, para desempatar el orden de forma estable. */
  _i: number
  /** 'Práctica 1 · 1a — Códigos postales' */
  etiqueta: string
}

export interface GrupoEjercicios<E> {
  nombre: string
  items: Decorado<E>[]
}
