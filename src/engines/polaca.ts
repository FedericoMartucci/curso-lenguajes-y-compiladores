/* Motor de CÓDIGO INTERMEDIO (Prácticas 4 y 5).
   Valida POR EJECUCIÓN: corre la notación intermedia que escribe el alumno con unos valores
   iniciales y compara el estado final de las variables. Así se acepta cualquier solución
   correcta, sin exigir una redacción exacta.

   ── Polaca inversa ──────────────────────────────────────────────
   Se escribe como una lista de celdas separadas por espacios, numeradas desde 1.
     · operandos: identificadores y constantes
     · operadores: + - * /  y la asignación :=
     · comparadores: <  >  <=  >=  ==  !=   (dejan verdadero/falso)
     · saltos: BF (salta si es falso) y BI (salto incondicional).
       El destino va en la celda SIGUIENTE al salto, como en el apunte.
   Ejemplo (z := a + b):      a b + z :=
   Ejemplo (if a > 5 then b := 1):   a 5 > BF 9 1 b :=

   ── Tercetos ────────────────────────────────────────────────────
   Una línea por terceto, numerados. Se referencian con [n].
     [11] (*, b, c)
     [12] (+, a, [11])
     [13] (:=, z, [12])                                              */

import type { CasoEjecucion, ModoGCI } from '../tipos/ejercicios.ts'
import type { ValorEjec, EntornoEjec, ResultadoCaso, ResultadoEjecucion, DetalleVariable } from '../tipos/motores.ts'

const OP_ARIT = new Set(['+', '-', '*', '/'])
const OP_COMP = new Set(['<', '>', '<=', '>=', '==', '!='])

const esNumero = (t: string): boolean => /^-?\d+(\.\d+)?$/.test(t)

/** Coerción numérica idéntica a la que hacía JS al operar con booleanos o nulos. */
const num = (v: ValorEjec | null | undefined): number => Number(v)

function aplicarArit(op: string, a: ValorEjec | null, b: ValorEjec | null): number {
  const x = num(a), y = num(b)
  switch (op) {
    case '+': return x + y
    case '-': return x - y
    case '*': return x * y
    case '/': if (y === 0) throw new Error('División por cero al ejecutar la notación.'); return x / y
    default: throw new Error('Operador desconocido: ' + op)
  }
}

function aplicarComp(op: string, a: ValorEjec | null, b: ValorEjec | null): boolean {
  switch (op) {
    case '<': return num(a) < num(b)
    case '>': return num(a) > num(b)
    case '<=': return num(a) <= num(b)
    case '>=': return num(a) >= num(b)
    case '==': return a === b
    case '!=': return a !== b
    default: throw new Error('Comparador desconocido: ' + op)
  }
}

/** Una celda apilada: o un valor calculado, o la referencia a una variable todavía sin resolver. */
type EnPila = { val: ValorEjec; ref?: undefined } | { ref: string; val?: undefined }

export interface OpcionesPolaca {
  /** Número de la primera celda. La cátedra numera desde 1. */
  base?: number
  /** Tope de pasos antes de declarar ciclo infinito. */
  limite?: number
}

/** Ejecuta una polaca inversa y devuelve el entorno final. */
export function ejecutarPolaca(
  texto: string,
  inicial: Record<string, number> = {},
  opciones: OpcionesPolaca = {}
): EntornoEjec {
  const base = opciones.base ?? 1
  const limite = opciones.limite ?? 20000
  const celdas = String(texto || '').trim().split(/\s+/).filter(Boolean)
  if (!celdas.length) throw new Error('Escribí la polaca (celdas separadas por espacios).')

  const env: EntornoEjec = { ...inicial }
  const pila: EnPila[] = []
  const resolver = (x: EnPila | undefined): ValorEjec => {
    if (x === undefined) throw new Error('La pila se quedó sin operandos: falta algo en la polaca.')
    if (x.ref === undefined) return x.val
    if (!(x.ref in env)) throw new Error(`La variable "${x.ref}" se usa antes de tener valor.`)
    return env[x.ref] as ValorEjec
  }

  let pc = 0
  let pasos = 0
  while (pc < celdas.length) {
    if (++pasos > limite) throw new Error('La ejecución no termina: revisá los saltos (parece un ciclo infinito).')
    const t = celdas[pc] as string

    if (t === 'BF' || t === 'BI') {
      const destinoTok = celdas[pc + 1]
      if (destinoTok === undefined || !esNumero(destinoTok)) {
        throw new Error(`Después de ${t} tiene que ir el número de celda destino (en la celda siguiente).`)
      }
      const destino = Number(destinoTok) - base
      if (destino < 0 || destino > celdas.length) throw new Error(`El salto ${t} apunta a la celda ${destinoTok}, que no existe.`)
      if (t === 'BI') { pc = destino; continue }
      const cond = resolver(pila.pop())
      if (!cond) { pc = destino; continue }
      pc += 2
      continue
    }

    if (OP_ARIT.has(t)) {
      const b = resolver(pila.pop()); const a = resolver(pila.pop())
      pila.push({ val: aplicarArit(t, a, b) }); pc++; continue
    }
    if (OP_COMP.has(t)) {
      const b = resolver(pila.pop()); const a = resolver(pila.pop())
      pila.push({ val: aplicarComp(t, a, b) }); pc++; continue
    }
    if (t === ':=' || t === '=') {
      const y = pila.pop(); const x = pila.pop()
      if (y === undefined || x === undefined) throw new Error('A la asignación le faltan operandos.')
      // admite las dos convenciones: "valor destino :=" y "destino valor :="
      if (y.ref !== undefined) env[y.ref] = resolver(x)
      else if (x.ref !== undefined) env[x.ref] = resolver(y)
      else throw new Error('La asignación necesita una variable como destino.')
      pc++; continue
    }
    if (esNumero(t)) { pila.push({ val: Number(t) }); pc++; continue }
    // identificador
    pila.push({ ref: t }); pc++
  }
  return env
}

/** Ejecuta una lista de tercetos y devuelve el entorno final. */
export function ejecutarTercetos(texto: string, inicial: Record<string, number> = {}): EntornoEjec {
  const env: EntornoEjec = { ...inicial }
  const res: Record<number, ValorEjec> = {} // número de terceto -> valor
  const lineas = String(texto || '').split(/\n/).map((l) => l.trim()).filter(Boolean)
  if (!lineas.length) throw new Error('Escribí los tercetos, uno por línea.')

  const valor = (tok: string | undefined): ValorEjec | null => {
    const t = (tok ?? '').trim()
    const ref = t.match(/^\[\s*(\d+)\s*\]$/)
    if (ref) {
      const n = Number(ref[1])
      if (!(n in res)) throw new Error(`El terceto [${n}] se usa antes de haberse calculado.`)
      return res[n] as ValorEjec
    }
    if (esNumero(t)) return Number(t)
    if (t === '_' || t === '') return null
    if (!(t in env)) throw new Error(`La variable "${t}" se usa antes de tener valor.`)
    return env[t] as ValorEjec
  }

  for (const linea of lineas) {
    const m = linea.match(/^\[?\s*(\d+)\s*\]?\s*[:.\-]?\s*\(([^)]*)\)\s*$/)
    if (!m) throw new Error(`No entiendo esta línea: "${linea}". Usá el formato  [11] (op, arg1, arg2)`)
    const numTerceto = Number(m[1])
    const partes = (m[2] ?? '').split(',').map((x) => x.trim())
    const op = partes[0] ?? ''
    const a = partes[1]
    const b = partes[2]

    if (op === ':=' || op === '=') {
      const destino = (a || '').trim()
      if (!destino || esNumero(destino) || /^\[/.test(destino)) {
        throw new Error(`El terceto [${numTerceto}] necesita una variable como destino.`)
      }
      const v = valor(b)
      if (v === null) throw new Error(`El terceto [${numTerceto}] no tiene qué asignar.`)
      env[destino] = v
      res[numTerceto] = v
      continue
    }
    if (OP_ARIT.has(op)) { res[numTerceto] = aplicarArit(op, valor(a), valor(b)); continue }
    if (OP_COMP.has(op)) { res[numTerceto] = aplicarComp(op, valor(a), valor(b)); continue }
    // terceto de carga: (x, _, _)
    if (b === undefined || b === '_' || b === '') {
      const v = valor(op)
      if (v === null) throw new Error(`El terceto [${numTerceto}] no carga ningún valor.`)
      res[numTerceto] = v
      continue
    }
    throw new Error(`Operador desconocido en el terceto [${numTerceto}]: "${op}"`)
  }
  return env
}

const casiIgual = (a: ValorEjec | undefined, b: number): boolean =>
  typeof a === 'number' ? Math.abs(a - b) < 1e-9 : (a as unknown) === (b as unknown)

/** Corre el código del alumno contra los casos y compara las variables esperadas. */
export function testIntermedia(
  texto: string,
  casos: CasoEjecucion[],
  modo: ModoGCI = 'polaca'
): ResultadoEjecucion {
  const ejecutar = modo === 'tercetos' ? ejecutarTercetos : ejecutarPolaca
  const resultados: ResultadoCaso[] = []
  let ok = true
  for (const c of casos) {
    let salida: EntornoEjec | null = null
    let error: string | null = null
    try { salida = ejecutar(texto, c.inicial || {}) }
    catch (e) { error = e instanceof Error ? e.message : String(e) }
    if (error || !salida) {
      ok = false
      resultados.push({ inicial: c.inicial, esperado: c.esperado, obtenido: null, pass: false, error })
      continue
    }
    const final = salida
    const detalles: DetalleVariable[] = Object.entries(c.esperado).map(([k, v]) => ({
      variable: k, esperado: v, obtenido: final[k], pass: casiIgual(final[k], v)
    }))
    const pass = detalles.every((d) => d.pass)
    if (!pass) ok = false
    resultados.push({ inicial: c.inicial, esperado: c.esperado, obtenido: final, pass, detalles, error: null })
  }
  return { ok, resultados, error: null }
}
