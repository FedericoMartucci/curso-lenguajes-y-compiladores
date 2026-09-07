/* Compilador de expresiones regulares en la NOTACIÓN DE LA CÁTEDRA a RegExp de JS.
   Notación soportada:
     {NOMBRE}   referencia a un conjunto declarado (se expande recursivamente)
     [a-z]      clase de caracteres (pasa tal cual a la RegExp)
     "texto"    literal exacto (todo lo de adentro es literal). También “ ” .
     * + ? | ( ) operadores
     concatenación = escribir seguido. Los espacios se ignoran.
*/
import type { Conjuntos, CasoCorrido, ResultadoCasos } from '../tipos/motores.ts'

/** Mensaje de un error desconocido, sin asumir que es un Error. */
const mensaje = (e: unknown): string => (e instanceof Error ? e.message : String(e))

export function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
}

/** "NOMBRE  definicion" por línea -> { NOMBRE: "definicion" } */
export function parseConjuntos(text: string): Conjuntos {
  const defs: Conjuntos = {}
  ;(text || '').split(/\n/).forEach((line) => {
    const l = line.trim()
    if (!l || l.startsWith('#')) return
    const m = l.match(/^([A-Za-z_][A-Za-z0-9_]*)\s+(.+)$/)
    if (m && m[1] && m[2]) defs[m[1]] = m[2].trim()
  })
  return defs
}

/** Traduce la expresión de la cátedra al source de una RegExp. Lanza Error con mensaje claro. */
export function erToRegex(expr: string, defs: Conjuntos = {}): string {
  let guard = 0
  function compile(s: string, stack: string[]): string {
    let r = ''
    let j = 0
    while (j < s.length) {
      const c = s[j] as string
      if (/\s/.test(c)) { j++; continue }
      if (c === '{') {
        const k = s.indexOf('}', j)
        if (k < 0) throw new Error('Falta cerrar la llave de un conjunto: {')
        const name = s.slice(j + 1, k).trim()
        const def = defs[name]
        if (def === undefined) throw new Error('Conjunto no definido: {' + name + '}')
        if (stack.includes(name)) throw new Error('Referencia circular entre conjuntos: {' + name + '}')
        if (++guard > 5000) throw new Error('Expresión demasiado compleja o circular')
        r += '(?:' + compile(def, stack.concat(name)) + ')'
        j = k + 1
      } else if (c === '"' || c === '“' || c === '”') {
        let k = j + 1
        let lit = ''
        while (k < s.length && !(s[k] === '"' || s[k] === '“' || s[k] === '”')) { lit += s[k]; k++ }
        if (k >= s.length) throw new Error('Falta cerrar la comilla de un literal')
        r += escapeRe(lit)
        j = k + 1
      } else if (c === '[') {
        const k = s.indexOf(']', j)
        if (k < 0) throw new Error('Falta cerrar el corchete de una clase: [')
        r += s.slice(j, k + 1)
        j = k + 1
      } else if ('*+?|()'.indexOf(c) >= 0) {
        r += c; j++
      } else {
        r += escapeRe(c); j++
      }
    }
    return r
  }
  return compile(expr, [])
}

/** RegExp anclada (match completo) a partir de la notación de la cátedra. */
export function buildRegex(expr: string, defs: Conjuntos = {}): RegExp {
  const src = erToRegex(expr, defs)
  return new RegExp('^(?:' + src + ')$')
}

/** Prueba una ER contra sets de aceptación/rechazo. */
export function testER(
  expr: string,
  conjuntosText: string,
  aceptar: string[] = [],
  rechazar: string[] = []
): ResultadoCasos {
  let rx: RegExp
  try {
    rx = buildRegex(expr, parseConjuntos(conjuntosText))
  } catch (e) {
    return { ok: false, casos: [], error: mensaje(e) }
  }
  const casos: CasoCorrido[] = []
  let ok = true
  for (const s of aceptar) {
    const m = rx.test(s)
    if (!m) ok = false
    casos.push({ s, esperado: true, obtenido: m, pass: m === true })
  }
  for (const s of rechazar) {
    const m = rx.test(s)
    if (m) ok = false
    casos.push({ s, esperado: false, obtenido: m, pass: m === false })
  }
  return { ok, casos, error: null }
}
