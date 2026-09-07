/* Acciones léxicas: la ER reconoce la FORMA del lexema; la acción léxica valida la COTA
   (rango de valor o longitud). Un lexema con forma válida pero fuera de cota se rechaza
   EN LA ACCIÓN, en tiempo de compilación, etapa léxica. */

import { buildRegex, parseConjuntos } from './regex.js'

export const ATRIBUTOS = [
  { id: 'valor', label: 'valor (numérico)' },
  { id: 'valor_abs', label: 'valor absoluto' },
  { id: 'longitud', label: 'longitud (caracteres)' },
  { id: 'longitud_sin_comillas', label: 'longitud sin las comillas' },
  { id: 'cant_guiones_bajos', label: 'cantidad de guiones bajos' },
  { id: 'cant_guiones', label: 'cantidad de guiones medios' }
]

export const OPERADORES = ['<=', '<', '==', '>=', '>', '!=']

export function attrValue(atr, lexema) {
  const s = String(lexema)
  switch (atr) {
    case 'valor': { const n = parseFloat(s); return isNaN(n) ? null : n }
    case 'valor_abs': { const n = parseFloat(s); return isNaN(n) ? null : Math.abs(n) }
    case 'longitud': return s.length
    case 'longitud_sin_comillas': {
      let t = s
      if (t.length >= 2 && /["“]/.test(t[0]) && /["”]/.test(t[t.length - 1])) t = t.slice(1, -1)
      return t.length
    }
    case 'cant_guiones_bajos': return (s.match(/_/g) || []).length
    case 'cant_guiones': return (s.match(/-/g) || []).length
    default: return null
  }
}

export function cmp(a, op, b) {
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
export function testAccionLexica(expr, conjuntosText, atributo, op, cota, tests = []) {
  let rx
  try {
    rx = buildRegex(expr, parseConjuntos(conjuntosText))
  } catch (e) {
    return { ok: false, casos: [], error: e.message }
  }
  const casos = []
  let ok = true
  for (const tc of tests) {
    const formaOk = rx.test(tc.v)
    const cotaOk = formaOk ? cmp(attrValue(atributo, tc.v), op, cota) : false
    const acepta = formaOk && cotaOk
    const pass = acepta === tc.ok
    if (!pass) ok = false
    casos.push({
      s: tc.v, esperado: tc.ok, obtenido: acepta, pass,
      motivo: tc.por || null,
      detalle: acepta ? 'aceptado' : (!formaOk ? 'rechazado por la ER' : 'rechazado por la cota')
    })
  }
  return { ok, casos, error: null }
}
