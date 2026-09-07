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

const OP_ARIT = new Set(['+', '-', '*', '/'])
const OP_COMP = new Set(['<', '>', '<=', '>=', '==', '!='])

const esNumero = (t) => /^-?\d+(\.\d+)?$/.test(t)

function aplicarArit(op, a, b) {
  switch (op) {
    case '+': return a + b
    case '-': return a - b
    case '*': return a * b
    case '/': if (b === 0) throw new Error('División por cero al ejecutar la notación.'); return a / b
    default: throw new Error('Operador desconocido: ' + op)
  }
}
function aplicarComp(op, a, b) {
  switch (op) {
    case '<': return a < b
    case '>': return a > b
    case '<=': return a <= b
    case '>=': return a >= b
    case '==': return a === b
    case '!=': return a !== b
    default: throw new Error('Comparador desconocido: ' + op)
  }
}

/** Ejecuta una polaca inversa. `inicial` es un objeto {variable: valor}. Devuelve el entorno final. */
export function ejecutarPolaca(texto, inicial = {}, opciones = {}) {
  const base = opciones.base ?? 1
  const limite = opciones.limite ?? 20000
  const celdas = String(texto || '').trim().split(/\s+/).filter(Boolean)
  if (!celdas.length) throw new Error('Escribí la polaca (celdas separadas por espacios).')

  const env = { ...inicial }
  const pila = []
  const resolver = (x) => {
    if (x === undefined) throw new Error('La pila se quedó sin operandos: falta algo en la polaca.')
    if ('val' in x) return x.val
    if (!(x.ref in env)) throw new Error(`La variable "${x.ref}" se usa antes de tener valor.`)
    return env[x.ref]
  }

  let pc = 0
  let pasos = 0
  while (pc < celdas.length) {
    if (++pasos > limite) throw new Error('La ejecución no termina: revisá los saltos (parece un ciclo infinito).')
    const t = celdas[pc]

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

/** Ejecuta una lista de tercetos. */
export function ejecutarTercetos(texto, inicial = {}) {
  const env = { ...inicial }
  const res = {} // número de terceto -> valor
  const lineas = String(texto || '').split(/\n/).map((l) => l.trim()).filter(Boolean)
  if (!lineas.length) throw new Error('Escribí los tercetos, uno por línea.')

  const valor = (tok) => {
    const t = tok.trim()
    const ref = t.match(/^\[\s*(\d+)\s*\]$/)
    if (ref) {
      const n = Number(ref[1])
      if (!(n in res)) throw new Error(`El terceto [${n}] se usa antes de haberse calculado.`)
      return res[n]
    }
    if (esNumero(t)) return Number(t)
    if (t === '_' || t === '') return null
    if (!(t in env)) throw new Error(`La variable "${t}" se usa antes de tener valor.`)
    return env[t]
  }

  for (const linea of lineas) {
    const m = linea.match(/^\[?\s*(\d+)\s*\]?\s*[:.\-]?\s*\(([^)]*)\)\s*$/)
    if (!m) throw new Error(`No entiendo esta línea: "${linea}". Usá el formato  [11] (op, arg1, arg2)`)
    const num = Number(m[1])
    const partes = m[2].split(',').map((x) => x.trim())
    const op = partes[0]
    const a = partes[1]
    const b = partes[2]

    if (op === ':=' || op === '=') {
      const destino = (a || '').trim()
      if (!destino || esNumero(destino) || /^\[/.test(destino)) throw new Error(`El terceto [${num}] necesita una variable como destino.`)
      const v = valor(b)
      env[destino] = v
      res[num] = v
      continue
    }
    if (OP_ARIT.has(op)) { res[num] = aplicarArit(op, valor(a), valor(b)); continue }
    if (OP_COMP.has(op)) { res[num] = aplicarComp(op, valor(a), valor(b)); continue }
    // terceto de carga: (x, _, _)
    if (b === undefined || b === '_' || b === '') { res[num] = valor(op); continue }
    throw new Error(`Operador desconocido en el terceto [${num}]: "${op}"`)
  }
  return env
}

const casiIgual = (a, b) => (typeof a === 'number' && typeof b === 'number')
  ? Math.abs(a - b) < 1e-9
  : a === b

/** Corre el código del alumno contra los casos y compara las variables esperadas.
    modo: 'polaca' | 'tercetos'   */
export function testIntermedia(texto, casos, modo = 'polaca') {
  const ejecutar = modo === 'tercetos' ? ejecutarTercetos : ejecutarPolaca
  const resultados = []
  let ok = true
  for (const c of casos) {
    let salida = null
    let error = null
    try { salida = ejecutar(texto, c.inicial || {}) }
    catch (e) { error = e.message }
    if (error) {
      ok = false
      resultados.push({ inicial: c.inicial, esperado: c.esperado, obtenido: null, pass: false, error })
      continue
    }
    const detalles = Object.entries(c.esperado).map(([k, v]) => ({
      variable: k, esperado: v, obtenido: salida[k], pass: casiIgual(salida[k], v)
    }))
    const pass = detalles.every((d) => d.pass)
    if (!pass) ok = false
    resultados.push({ inicial: c.inicial, esperado: c.esperado, obtenido: salida, pass, detalles, error: null })
  }
  return { ok, resultados, error: null }
}
