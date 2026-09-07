/* Diagnóstico de un caso que falla.

   La app sabe la respuesta del alumno y sabe qué esperaba el caso, pero hasta ahora sólo
   decía "debe aceptarla, pero la rechaza" — seis veces seguidas, sin distinguir un caso de
   otro. Sabía más de lo que mostraba, que es otra forma de romper "el validador es la
   promesa". Acá se calcula el porqué. */

import type { CasoCorrido, DetalleVariable } from '../tipos/motores.ts'

/* ---------- volver visible lo invisible ---------- */

const INVISIBLES: Record<string, string> = {
  ' ': '␣',      // espacio
  '\t': '⇥',     // tabulación
  '\n': '⏎'
}

/** Muestra una cadena de prueba sin ambigüedad.

    Antes ` 1234` y `1234 ` se renderizaban idénticos: el HTML colapsa el espacio de adelante
    y el de atrás no se ve. Justo esos dos son el borde que el ejercicio quiere enseñar. */
export function mostrarCadena(s: string): { texto: string; truncada: boolean } {
  if (s === '') return { texto: '⟨vacía⟩', truncada: false }
  const limite = 46
  const recortada = s.length > limite ? s.slice(0, limite) : s
  // sólo se marcan los invisibles del borde: en el medio estorbarían la lectura
  let texto = recortada
  const inicio = INVISIBLES[texto[0] ?? '']
  const fin = INVISIBLES[texto[texto.length - 1] ?? '']
  if (inicio) texto = inicio + texto.slice(1)
  if (fin && texto.length > 1) texto = texto.slice(0, -1) + fin
  return { texto, truncada: s.length > limite }
}

/** true si la cadena tiene espacios en los bordes: hay que decirlo con palabras además del símbolo. */
export const tieneBordesInvisibles = (s: string): boolean =>
  s.length > 0 && (Boolean(INVISIBLES[s[0] ?? '']) || Boolean(INVISIBLES[s[s.length - 1] ?? '']))

/* ---------- expresiones regulares ---------- */

/** El prefijo más largo de `s` que la expresión reconoce POR COMPLETO.
    Convierte "no la acepta" en "acepta hasta acá y después se pierde".

    Se usa la RegExp anclada tal cual viene del motor: quitarle el `$` haría que `test`
    acepte cualquier prefijo suficientemente largo y devuelva siempre la cadena entera. */
export function prefijoQueMatchea(rx: RegExp, s: string): number {
  for (let n = s.length - 1; n > 0; n--) {
    if (rx.test(s.slice(0, n))) return n
  }
  return 0
}

/** Explica en una frase por qué un caso de ER no dio lo esperado. */
export function porQueER(caso: CasoCorrido, rx: RegExp | null): string | null {
  if (caso.pass || caso.libre) return null
  const s = caso.s

  if (caso.esperado && !caso.obtenido) {
    if (s === '') return 'tu expresión no acepta la cadena vacía'
    if (tieneBordesInvisibles(s)) return 'tiene un espacio en el borde y tu expresión no lo contempla'
    if (rx) {
      const n = prefijoQueMatchea(rx, s)
      if (n > 0) {
        const sobran = s.length - n
        return `reconoce «${s.slice(0, n)}» y ahí se cierra: ${sobran === 1 ? 'sobra 1 carácter' : `sobran ${sobran} caracteres`}`
      }
      return 'tu expresión pide más de lo que hay, o algo distinto desde el primer carácter'
    }
    return 'tu expresión no la reconoce'
  }

  // esperaba rechazo y la aceptó
  if (s === '') return 'tu expresión acepta la cadena vacía y no debería'
  if (tieneBordesInvisibles(s)) return 'tu expresión deja pasar espacios en el borde'
  return `tu expresión es más permisiva de lo que pide la consigna`
}

/* ---------- validación por ejecución (GCI y Assembler) ---------- */

/** Explica un detalle de variable que no coincide. */
export function porQueVariable(d: DetalleVariable): string {
  if (d.pass) return `${d.variable} = ${d.esperado}`
  if (d.obtenido === undefined) return `tu código nunca le asignó valor a ${d.variable}`
  if (typeof d.obtenido === 'boolean') {
    return `${d.variable} quedó con un valor de verdad (${d.obtenido}), no con un número`
  }
  const dif = d.obtenido - d.esperado
  const pista =
    d.obtenido === -d.esperado ? ' — el signo está invertido: revisá el orden de los operandos'
    : Math.abs(dif) < 1e-9 ? ''
    : ''
  return `${d.variable}: esperaba ${d.esperado}, dio ${d.obtenido}${pista}`
}
