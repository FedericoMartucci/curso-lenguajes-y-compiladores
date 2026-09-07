/* Acciones léxicas: la ER reconoce la FORMA del lexema; la acción léxica valida la COTA
   (rango de valor o longitud). Un lexema con forma válida pero fuera de cota se rechaza
   EN LA ACCIÓN, en tiempo de compilación, etapa léxica. */

import { buildRegex, parseConjuntos } from './regex.ts'
import type { Atributo, Operador, CasoLexico } from '../tipos/ejercicios.ts'
import type { CasoCorrido, ResultadoCasos } from '../tipos/motores.ts'

const mensaje = (e: unknown): string => (e instanceof Error ? e.message : String(e))

export interface OpcionAtributo {
  id: Atributo
  label: string
}

export const ATRIBUTOS: OpcionAtributo[] = [
  { id: 'valor', label: 'valor (numérico)' },
  { id: 'valor_abs', label: 'valor absoluto' },
  { id: 'longitud', label: 'longitud (caracteres)' },
  { id: 'longitud_sin_comillas', label: 'longitud sin las comillas' },
  { id: 'cant_guiones_bajos', label: 'cantidad de guiones bajos' },
  { id: 'cant_guiones', label: 'cantidad de guiones medios' }
]

export const OPERADORES: Operador[] = ['<=', '<', '==', '>=', '>', '!=']

/** Valor del atributo para un lexema. `null` cuando el atributo no aplica (texto no numérico). */
export function attrValue(atr: Atributo, lexema: string): number | null {
  const s = String(lexema)
  switch (atr) {
    case 'valor': { const n = parseFloat(s); return isNaN(n) ? null : n }
    case 'valor_abs': { const n = parseFloat(s); return isNaN(n) ? null : Math.abs(n) }
    case 'longitud': return s.length
    case 'longitud_sin_comillas': {
      let t = s
      if (t.length >= 2 && /["“]/.test(t[0] as string) && /["”]/.test(t[t.length - 1] as string)) t = t.slice(1, -1)
      return t.length
    }
    case 'cant_guiones_bajos': return (s.match(/_/g) || []).length
    case 'cant_guiones': return (s.match(/-/g) || []).length
    default: return null
  }
}

export function cmp(a: number | null | undefined, op: Operador | string, b: number): boolean {
  if (a === null || a === undefined) return false
  switch (op) {
    case '<=': return a <= b
    case '<': return a < b
    case '==': return a === b
    case '>=': return a >= b
    case '>': return a > b
    case '!=': return a !== b
    default: return false
  }
}

/** Corre el pipeline completo ER + acción léxica sobre los casos de prueba. */
export function testAccionLexica(
  expr: string,
  conjuntosText: string,
  atributo: Atributo,
  op: Operador,
  cota: number,
  tests: CasoLexico[] = []
): ResultadoCasos {
  let rx: RegExp
  try {
    rx = buildRegex(expr, parseConjuntos(conjuntosText))
  } catch (e) {
    return { ok: false, casos: [], error: mensaje(e) }
  }
  const casos: CasoCorrido[] = []
  let ok = true
  for (const tc of tests) {
    const formaOk = rx.test(tc.v)
    const cotaOk = formaOk ? cmp(attrValue(atributo, tc.v), op, cota) : false
    const acepta = formaOk && cotaOk
    const pass = acepta === tc.ok
    if (!pass) ok = false
    casos.push({
      s: tc.v, esperado: tc.ok, obtenido: acepta, pass,
      detalle: acepta ? 'aceptado' : (!formaOk ? 'rechazado por la ER' : 'rechazado por la cota')
    })
  }
  return { ok, casos, error: null }
}
