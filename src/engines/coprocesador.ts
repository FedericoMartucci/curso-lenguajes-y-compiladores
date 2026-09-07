/* Simulador del COPROCESADOR MATEMÁTICO 8087 (Práctica 6).
   Ejecuta el Assembler que escribe el alumno y compara los valores finales de las variables,
   así se valida la traducción de verdad en lugar de compararla contra un texto.

   Pila LIFO de 8 registros: ST(0) es el tope. Al cargar, todo baja y se pierde ST(7).
     FLD / FILD  origen   push, ST(0) := origen
     FST  destino         destino := ST(0)
     FSTP destino         destino := ST(0) y pop
     FADD / FSUB / FMUL / FDIV     ST(1) := ST(1) op ST(0), pop
     FCOMP origen         compara ST(0) - origen, deja las banderas y hace pop
     FSTSW AX / SAHF      pasan las banderas del coprocesador al registro FLAGS
     FFREE                vacía la pila
   Las líneas de arranque (.MODEL, .386, .STACK, .CODE, MOV, INT, END) se ignoran. */

import type { CasoEjecucion } from '../tipos/ejercicios.ts'
import type {
  EstadoCoprocesador, Instruccion, ResultadoCaso, ResultadoEjecucion, DetalleVariable
} from '../tipos/motores.ts'

const MAX_PILA = 8

export interface AssemblerParseado {
  /** Variables del .DATA. `null` cuando se declaran con `?`. */
  datos: Record<string, number | null>
  codigo: Instruccion[]
  errores: string[]
}

export function parseAssembler(texto: string): AssemblerParseado {
  const lineas = String(texto || '').split(/\n/)
  const datos: Record<string, number | null> = {}
  const codigo: Instruccion[] = []
  let seccion: 'data' | 'code' | null = null
  const errores: string[] = []

  lineas.forEach((raw, i) => {
    const sinCom = raw.replace(/;.*$/, '').trim()
    if (!sinCom) return
    const up = sinCom.toUpperCase()

    if (/^\.DATA\b/.test(up)) { seccion = 'data'; return }
    if (/^\.CODE\b/.test(up)) { seccion = 'code'; return }
    if (/^\.(MODEL|386|486|STACK)\b/.test(up) || /^END\b/.test(up)) return

    if (seccion === 'data') {
      const m = sinCom.match(/^([@_A-Za-z][\w@]*)\s+(dd|dw|dq|dt)\s+(.+)$/i)
      if (m && m[1]) {
        const nombre = m[1]
        const v = (m[3] ?? '').trim()
        datos[nombre] = v === '?' ? null : (isNaN(parseFloat(v)) ? null : parseFloat(v))
      } else {
        errores.push(`Línea ${i + 1}: no entiendo la declaración "${sinCom}".`)
      }
      return
    }

    // sección de código (o sin sección declarada: lo tratamos como código)
    if (/^(MOV|INT|PUSH|POP|CALL|RET)\b/.test(up)) return
    const m = sinCom.match(/^([A-Za-z]+)\s*(.*)$/)
    if (!m || !m[1]) { errores.push(`Línea ${i + 1}: no entiendo "${sinCom}".`); return }
    codigo.push({ op: m[1].toUpperCase(), arg: (m[2] || '').trim().replace(/,$/, ''), linea: i + 1 })
  })

  return { datos, codigo, errores }
}

export function ejecutarAssembler(texto: string, inicial: Record<string, number> = {}): EstadoCoprocesador {
  const { datos, codigo, errores } = parseAssembler(texto)
  if (errores.length) throw new Error(errores[0] as string)
  if (!codigo.length) throw new Error('No hay instrucciones para ejecutar en el segmento .CODE.')

  const mem: Record<string, number | null> = { ...datos, ...inicial }
  const pila: number[] = []   // pila[0] = ST(0)
  let flags: number | null = null

  const leer = (arg: string): number => {
    if (!arg) throw new Error('Falta el operando.')
    const a = arg.trim()
    if (/^-?\d+(\.\d+)?$/.test(a)) {
      throw new Error(`El coprocesador no puede cargar la constante literal ${a}: declarala como variable (por ejemplo  _${a.replace('.', '_')} dd ${a}) y cargá esa.`)
    }
    if (!(a in mem)) throw new Error(`La variable "${a}" no está declarada en el segmento .DATA.`)
    const v = mem[a]
    if (v === null || v === undefined) throw new Error(`La variable "${a}" se usa antes de tener un valor.`)
    return v
  }
  const push = (v: number): void => {
    if (pila.length >= MAX_PILA) pila.pop()   // se pierde ST(7)
    pila.unshift(v)
  }
  const pop = (): number => {
    if (!pila.length) throw new Error('La pila del coprocesador está vacía: falta un FLD antes de operar.')
    return pila.shift() as number
  }
  const binaria = (f: (a: number, b: number) => number, op: string): void => {
    if (pila.length < 2) throw new Error(`${op} necesita dos valores en la pila: te falta un FLD.`)
    const st0 = pop(); const st1 = pop()
    push(f(st1, st0))     // ST(1) := ST(1) op ST(0), pop
  }

  for (const ins of codigo) {
    switch (ins.op) {
      case 'FLD': case 'FILD': push(leer(ins.arg)); break
      case 'FST': {
        if (!pila.length) throw new Error('FST sin nada en la pila.')
        mem[ins.arg] = pila[0] as number; break
      }
      case 'FSTP': case 'FISTP': {
        if (!ins.arg) throw new Error('FSTP necesita un destino.')
        mem[ins.arg] = pop(); break
      }
      case 'FADD': case 'FADDP': binaria((a, b) => a + b, 'FADD'); break
      case 'FSUB': case 'FSUBP': binaria((a, b) => a - b, 'FSUB'); break
      case 'FMUL': case 'FMULP': binaria((a, b) => a * b, 'FMUL'); break
      case 'FDIV': case 'FDIVP': binaria((a, b) => {
        if (b === 0) throw new Error('División por cero en el coprocesador.')
        return a / b
      }, 'FDIV'); break
      case 'FCOMP': {
        const otro = leer(ins.arg); const st0 = pop()
        flags = st0 - otro; break
      }
      case 'FCOM': { const otro = leer(ins.arg); flags = (pila[0] as number) - otro; break }
      case 'FCHS': { const v = pop(); push(-v); break }
      case 'FABS': { const v = pop(); push(Math.abs(v)); break }
      case 'FFREE': pila.length = 0; break
      case 'FSTSW': case 'SAHF': case 'FINIT': case 'FWAIT': break
      default:
        throw new Error(`Instrucción no reconocida: ${ins.op} (línea ${ins.linea}).`)
    }
  }
  return { mem, pila, flags }
}

const casiIgual = (a: number | null | undefined, b: number): boolean =>
  typeof a === 'number' ? Math.abs(a - b) < 1e-9 : false

/** Corre el Assembler del alumno contra los casos y compara las variables esperadas. */
export function testAssembler(texto: string, casos: CasoEjecucion[]): ResultadoEjecucion {
  const resultados: ResultadoCaso[] = []
  let ok = true
  for (const c of casos) {
    let salida: EstadoCoprocesador | null = null
    let error: string | null = null
    try { salida = ejecutarAssembler(texto, c.inicial || {}) }
    catch (e) { error = e instanceof Error ? e.message : String(e) }
    if (error || !salida) {
      ok = false
      resultados.push({ inicial: c.inicial, esperado: c.esperado, pass: false, error })
      continue
    }
    const final = salida
    const detalles: DetalleVariable[] = Object.entries(c.esperado).map(([k, v]) => ({
      variable: k, esperado: v, obtenido: final.mem[k] ?? undefined, pass: casiIgual(final.mem[k], v)
    }))
    const pass = detalles.every((d) => d.pass)
    if (!pass) ok = false
    resultados.push({ inicial: c.inicial, esperado: c.esperado, pass, detalles, error: null })
  }
  return { ok, resultados, error: null }
}
