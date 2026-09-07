/* Motor de ÁRBOL SINTÁCTICO, la tercera notación intermedia que pide la cátedra.

   Convenciones sacadas de las clases y de la Práctica 4:
   - Cada nodo tiene padre, hijo izquierdo e hijo derecho.
   - Recorrer el árbol IN-ORDER devuelve el programa original.
   - Recorrerlo POST-ORDER da la polaca inversa. Esa equivalencia es el corazón del tema.
   - Las hojas se crean con `crear_hoja` (id o cte) y los internos con `crear_nodo`.
   - No hay saltos, comparaciones ni etiquetas: es la ventaja del árbol sobre polaca y
     tercetos. Un `if` se arma con la condición en el hijo izquierdo y la acción en el
     derecho; con `else`, la parte true a la izquierda y la false a la derecha.
   - Los nodos conectores (`M`, `:=` cuando sólo une) son dummy: no producen código, existen
     para que los subárboles no queden huérfanos.

   Notación de texto: `nodo(hijo, hijo)`. Las hojas son etiquetas sueltas. Es la misma que ya
   usa la Mesa de trabajo, así que lo que armás ahí se pega acá.

   Se valida POR EJECUCIÓN, igual que polaca y tercetos: se evalúa el árbol con los valores
   iniciales de cada caso y se comparan las variables finales. */

import type { CasoEjecucion } from '../tipos/ejercicios.ts'
import type { ValorEjec, EntornoEjec, ResultadoCaso, ResultadoEjecucion, DetalleVariable } from '../tipos/motores.ts'

export interface NodoArbol {
  etiqueta: string
  hijos: NodoArbol[]
}

const ARIT = new Set(['+', '-', '−', '*', '/'])
const COMP = new Set(['<', '>', '<=', '>=', '==', '!=', '='])
const ASIG = new Set([':=', 'asig'])
/** Nodos que sólo conectan subárboles y no producen código. */
const CONECTORES = new Set(['M', 'm', 'conector', 'dummy', ';'])

const esNumero = (t: string): boolean => /^-?\d+(\.\d+)?$/.test(t)

/* ---------- parseo de la notación nodo(hijo, hijo) ---------- */

export function parseArbol(texto: string): NodoArbol {
  const s = String(texto || '')
  let i = 0

  const saltarBlancos = () => { while (i < s.length && /\s/.test(s[i] as string)) i++ }

  function nodo(): NodoArbol {
    saltarBlancos()
    let etiqueta = ''
    while (i < s.length && '(),'.indexOf(s[i] as string) < 0) etiqueta += s[i++]
    etiqueta = etiqueta.trim()
    const n: NodoArbol = { etiqueta, hijos: [] }
    saltarBlancos()
    if (s[i] === '(') {
      i++
      for (;;) {
        saltarBlancos()
        if (s[i] === ')') { i++; break }
        n.hijos.push(nodo())
        saltarBlancos()
        if (s[i] === ',') { i++; continue }
        if (s[i] === ')') { i++; break }
        if (i >= s.length) throw new Error('Falta cerrar un paréntesis.')
      }
    }
    if (!n.etiqueta) throw new Error('Hay un nodo sin etiqueta: revisá las comas y los paréntesis.')
    return n
  }

  const raiz = nodo()
  saltarBlancos()
  if (i < s.length) throw new Error(`Sobra texto después del árbol: "${s.slice(i, i + 20)}"`)
  return raiz
}

/* ---------- recorridos ---------- */

/** Post-orden: hijos y después el padre. Da la polaca inversa. */
export function postOrden(n: NodoArbol): string[] {
  return [...n.hijos.flatMap(postOrden), n.etiqueta]
}

/** In-orden: izquierdo, padre, derecho. Reconstruye el programa original. */
export function inOrden(n: NodoArbol): string[] {
  if (!n.hijos.length) return [n.etiqueta]
  if (n.hijos.length === 1) return [n.etiqueta, ...inOrden(n.hijos[0] as NodoArbol)]
  const [izq, ...resto] = n.hijos
  return [...inOrden(izq as NodoArbol), n.etiqueta, ...resto.flatMap(inOrden)]
}

/* ---------- evaluación ---------- */

const num = (v: ValorEjec | null | undefined): number => Number(v)

function aplicar(op: string, a: ValorEjec, b: ValorEjec): ValorEjec {
  switch (op) {
    case '+': return num(a) + num(b)
    case '-': case '−': return num(a) - num(b)
    case '*': return num(a) * num(b)
    case '/':
      if (num(b) === 0) throw new Error('División por cero al evaluar el árbol.')
      return num(a) / num(b)
    case '<': return num(a) < num(b)
    case '>': return num(a) > num(b)
    case '<=': return num(a) <= num(b)
    case '>=': return num(a) >= num(b)
    case '==': case '=': return a === b
    case '!=': return a !== b
    default: throw new Error(`Operador desconocido en el árbol: "${op}"`)
  }
}

/** Evalúa el árbol modificando el entorno. Devuelve el valor del subárbol. */
function evaluar(n: NodoArbol, env: EntornoEjec, pasos: { n: number }): ValorEjec | null {
  if (++pasos.n > 20000) throw new Error('El árbol es demasiado grande o tiene un ciclo.')
  const et = n.etiqueta

  // hoja
  if (!n.hijos.length) {
    if (esNumero(et)) return Number(et)
    if (!(et in env)) throw new Error(`La variable "${et}" se usa antes de tener valor.`)
    return env[et] as ValorEjec
  }

  // conector: evalúa sus hijos en orden y no produce valor
  if (CONECTORES.has(et)) {
    n.hijos.forEach((h) => evaluar(h, env, pasos))
    return null
  }

  // if / while: la condición va a la izquierda y la acción a la derecha
  if (/^if$/i.test(et)) {
    const [cond, entonces, sino] = n.hijos
    if (!cond || !entonces) throw new Error('Un if necesita al menos condición y acción.')
    if (evaluar(cond, env, pasos)) evaluar(entonces, env, pasos)
    else if (sino) evaluar(sino, env, pasos)
    return null
  }
  if (/^while$/i.test(et)) {
    const [cond, cuerpo] = n.hijos
    if (!cond || !cuerpo) throw new Error('Un while necesita condición y cuerpo.')
    let vueltas = 0
    while (evaluar(cond, env, pasos)) {
      if (++vueltas > 10000) throw new Error('El while del árbol no termina.')
      evaluar(cuerpo, env, pasos)
    }
    return null
  }

  // asignación: el destino es el hijo izquierdo
  if (ASIG.has(et)) {
    const [destino, valor] = n.hijos
    if (!destino || !valor) throw new Error('Una asignación necesita destino y valor.')
    if (destino.hijos.length || esNumero(destino.etiqueta)) {
      throw new Error('El hijo izquierdo de una asignación tiene que ser una variable.')
    }
    const v = evaluar(valor, env, pasos)
    if (v === null) throw new Error('La asignación no tiene qué asignar.')
    env[destino.etiqueta] = v
    return v
  }

  if (ARIT.has(et) || COMP.has(et)) {
    const [a, b] = n.hijos
    if (!a || !b) throw new Error(`El operador "${et}" necesita dos hijos.`)
    const va = evaluar(a, env, pasos)
    const vb = evaluar(b, env, pasos)
    if (va === null || vb === null) throw new Error(`Al operador "${et}" le falta un operando.`)
    return aplicar(et, va, vb)
  }

  throw new Error(`No sé qué hacer con el nodo "${et}". Si es un conector, llamalo M.`)
}

export function ejecutarArbol(texto: string, inicial: Record<string, number> = {}): EntornoEjec {
  const raiz = parseArbol(texto)
  const env: EntornoEjec = { ...inicial }
  evaluar(raiz, env, { n: 0 })
  return env
}

const casiIgual = (a: ValorEjec | undefined, b: number): boolean =>
  typeof a === 'number' ? Math.abs(a - b) < 1e-9 : (a as unknown) === (b as unknown)

/** Corre el árbol del alumno contra los casos y compara las variables esperadas. */
export function testArbol(texto: string, casos: CasoEjecucion[]): ResultadoEjecucion {
  const resultados: ResultadoCaso[] = []
  let ok = true
  for (const c of casos) {
    let salida: EntornoEjec | null = null
    let error: string | null = null
    try { salida = ejecutarArbol(texto, c.inicial || {}) }
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
