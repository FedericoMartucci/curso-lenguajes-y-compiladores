/* Motor de PARSING ASCENDENTE (Práctica 3).
   A partir de una gramática en la notación de la cátedra calcula:
     - la gramática aumentada
     - los conjuntos PRIMEROS y SIGUIENTES
     - los estados de ítems LR(0) (CLOSURE / GOTO)
     - la tabla SLR, con sus conflictos desplazamiento-reducción y reducción-reducción
   Sirve para corregir automáticamente lo que carga el alumno y para mostrar la solución completa. */

import { parseGrammar } from './earley.ts'
import type {
  Gramatica, Regla, ItemLR0, Transicion, Accion, Conflicto,
  InfoSLR, FilaConjunto, ResultadoConjuntos
} from '../tipos/motores.ts'

export const FIN = '$'
export const VACIO = 'ε'

/** Gramática aumentada: guarda cuál era el símbolo distinguido original. */
export interface GramaticaAumentada extends Gramatica {
  start: string
  original: string
}

/* ---------- utilidades ---------- */
export function simbolos(g: Gramatica): { terminales: string[]; noTerminales: string[] } {
  const terminales = new Set<string>()
  g.rules.forEach((r) => r.rhs.forEach((s) => { if (!g.nts.has(s)) terminales.add(s) }))
  return { terminales: [...terminales], noTerminales: [...g.nts] }
}

/** Agrega S' -> S. Devuelve una gramática nueva con `start` nuevo y la regla 0 primero. */
export function aumentar(g: Gramatica): GramaticaAumentada {
  if (!g.start) throw new Error('La gramática está vacía: no hay símbolo distinguido.')
  const original = g.start
  let nuevo = original + "'"
  while (g.nts.has(nuevo)) nuevo += "'"
  const rules: Regla[] = [{ lhs: nuevo, rhs: [original] }, ...g.rules]
  const nts = new Set([nuevo, ...g.nts])
  return { rules, nts, start: nuevo, original }
}

/* ---------- PRIMEROS ---------- */
export interface Primeros {
  primeros: Record<string, Set<string>>
  anulable: Set<string>
}

export function calcularPrimeros(g: Gramatica): Primeros {
  const P: Record<string, Set<string>> = {}
  g.nts.forEach((A) => { P[A] = new Set() })
  const anulable = new Set<string>()
  const de = (A: string): Set<string> => (P[A] ??= new Set())
  let cambio = true
  while (cambio) {
    cambio = false
    for (const r of g.rules) {
      const lhs = de(r.lhs)
      if (r.rhs.length === 0) { if (!anulable.has(r.lhs)) { anulable.add(r.lhs); cambio = true } continue }
      let todosAnulables = true
      for (const X of r.rhs) {
        if (!g.nts.has(X)) { if (!lhs.has(X)) { lhs.add(X); cambio = true } todosAnulables = false; break }
        for (const t of de(X)) if (!lhs.has(t)) { lhs.add(t); cambio = true }
        if (!anulable.has(X)) { todosAnulables = false; break }
      }
      if (todosAnulables && !anulable.has(r.lhs)) { anulable.add(r.lhs); cambio = true }
    }
  }
  return { primeros: P, anulable }
}

/** PRIMERO de una secuencia de símbolos. */
export function primerosDeSecuencia(
  sec: string[],
  g: Gramatica,
  P: Record<string, Set<string>>,
  anulable: Set<string>
): { conjunto: Set<string>; anulable: boolean } {
  const out = new Set<string>()
  for (const X of sec) {
    if (!g.nts.has(X)) { out.add(X); return { conjunto: out, anulable: false } }
    ;(P[X] ?? new Set<string>()).forEach((t) => out.add(t))
    if (!anulable.has(X)) return { conjunto: out, anulable: false }
  }
  return { conjunto: out, anulable: true }
}

/* ---------- SIGUIENTES ---------- */
export function calcularSiguientes(
  g: GramaticaAumentada,
  P: Record<string, Set<string>>,
  anulable: Set<string>
): Record<string, Set<string>> {
  const S: Record<string, Set<string>> = {}
  g.nts.forEach((A) => { S[A] = new Set() })
  const de = (A: string): Set<string> => (S[A] ??= new Set())
  de(g.start).add(FIN)
  let cambio = true
  while (cambio) {
    cambio = false
    for (const r of g.rules) {
      for (let i = 0; i < r.rhs.length; i++) {
        const B = r.rhs[i] as string
        if (!g.nts.has(B)) continue
        const resto = r.rhs.slice(i + 1)
        const { conjunto, anulable: restoAnulable } = primerosDeSecuencia(resto, g, P, anulable)
        const sigB = de(B)
        conjunto.forEach((t) => { if (!sigB.has(t)) { sigB.add(t); cambio = true } })
        if (restoAnulable) {
          de(r.lhs).forEach((t) => { if (!sigB.has(t)) { sigB.add(t); cambio = true } })
        }
      }
    }
  }
  return S
}

/* ---------- ítems LR(0) ---------- */
const claveItem = (it: ItemLR0): string => `${it.r}|${it.dot}`
const claveEstado = (items: ItemLR0[]): string => items.map(claveItem).sort().join(';')

export function closure(items: ItemLR0[], g: Gramatica): ItemLR0[] {
  const out = items.slice()
  const vistos = new Set(out.map(claveItem))
  for (let i = 0; i < out.length; i++) {
    const it = out[i] as ItemLR0
    const regla = g.rules[it.r]
    if (!regla) continue
    const sig = regla.rhs[it.dot]
    if (sig && g.nts.has(sig)) {
      g.rules.forEach((r, ix) => {
        if (r.lhs === sig) {
          const nuevo: ItemLR0 = { r: ix, dot: 0 }
          if (!vistos.has(claveItem(nuevo))) { vistos.add(claveItem(nuevo)); out.push(nuevo) }
        }
      })
    }
  }
  return out
}

export function goto(items: ItemLR0[], X: string, g: Gramatica): ItemLR0[] {
  const movidos = items
    .filter((it) => g.rules[it.r]?.rhs[it.dot] === X)
    .map((it) => ({ r: it.r, dot: it.dot + 1 }))
  return movidos.length ? closure(movidos, g) : []
}

/** Colección canónica de estados LR(0) + transiciones. `g` debe estar AUMENTADA. */
export function automataLR0(g: Gramatica): { estados: ItemLR0[][]; trans: Transicion[] } {
  const inicial = closure([{ r: 0, dot: 0 }], g)
  const estados: ItemLR0[][] = [inicial]
  const indice = new Map<string, number>([[claveEstado(inicial), 0]])
  const trans: Transicion[] = []
  const { terminales, noTerminales } = simbolos(g)
  const todos = [...terminales, ...noTerminales]
  for (let i = 0; i < estados.length; i++) {
    for (const X of todos) {
      const dest = goto(estados[i] as ItemLR0[], X, g)
      if (!dest.length) continue
      const k = claveEstado(dest)
      let j = indice.get(k)
      if (j === undefined) { j = estados.length; estados.push(dest); indice.set(k, j) }
      trans.push({ desde: i, simbolo: X, hasta: j })
    }
  }
  return { estados, trans }
}

/* ---------- tabla SLR ---------- */
export function tablaSLR(gOriginal: Gramatica): InfoSLR {
  const g = aumentar(gOriginal)
  const { primeros, anulable } = calcularPrimeros(g)
  const siguientes = calcularSiguientes(g, primeros, anulable)
  const { estados, trans } = automataLR0(g)
  const { terminales, noTerminales } = simbolos(g)
  const cols = [...terminales, FIN]

  const accion: Record<number, Record<string, Accion[] | undefined>> = {}
  const irA: Record<number, Record<string, number | undefined>> = {}
  estados.forEach((_, i) => { accion[i] = {}; irA[i] = {} })

  const filaAccion = (i: number): Record<string, Accion[] | undefined> => (accion[i] ??= {})
  const filaIrA = (i: number): Record<string, number | undefined> => (irA[i] ??= {})

  trans.forEach(({ desde, simbolo, hasta }) => {
    if (g.nts.has(simbolo)) filaIrA(desde)[simbolo] = hasta
    else (filaAccion(desde)[simbolo] ??= []).push({ tipo: 'd', valor: hasta })
  })

  estados.forEach((items, i) => {
    items.forEach((it) => {
      const r = g.rules[it.r]
      if (!r || it.dot !== r.rhs.length) return
      if (it.r === 0) {
        ;(filaAccion(i)[FIN] ??= []).push({ tipo: 'acc' })
      } else {
        ;(siguientes[r.lhs] ?? new Set<string>()).forEach((t) => {
          ;(filaAccion(i)[t] ??= []).push({ tipo: 'r', valor: it.r, regla: r })
        })
      }
    })
  })

  const conflictos: Conflicto[] = []
  estados.forEach((_, i) => {
    cols.forEach((t) => {
      const a = filaAccion(i)[t]
      if (a && a.length > 1) {
        const tipos = new Set(a.map((x) => x.tipo))
        const clase: Conflicto['clase'] = tipos.has('d') && tipos.has('r')
          ? 'desplazamiento-reducción'
          : (a.filter((x) => x.tipo === 'r').length > 1 ? 'reducción-reducción' : 'múltiple')
        conflictos.push({ estado: i, simbolo: t, clase, acciones: a })
      }
    })
  })

  return {
    gAumentada: g, primeros, siguientes,
    anulable: Object.fromEntries([...g.nts].map((A) => [A, anulable.has(A)])),
    estados, trans, accion, irA, terminales, noTerminales, cols, conflictos,
    esSLR: conflictos.length === 0
  }
}

/* ---------- presentación ---------- */
export function textoItem(g: Gramatica, it: ItemLR0): string {
  const r = g.rules[it.r]
  if (!r) return ''
  const rhs = r.rhs.slice()
  rhs.splice(it.dot, 0, '•')
  return `${r.lhs} -> ${rhs.join(' ') || 'ε'}`
}

export function textoAccion(a: Accion): string {
  if (a.tipo === 'd') return 'D' + a.valor
  if (a.tipo === 'acc') return 'aceptar'
  return 'R' + a.valor
}

export function reglasNumeradas(g: Gramatica): string[] {
  return g.rules.map((r, i) => `${i}. ${r.lhs} -> ${r.rhs.join(' ') || 'ε'}`)
}

/* ---------- validación de lo que carga el alumno ---------- */
/** Parsea "E = id, cte" / "PRIMERO(E) = { id, cte }" / "E: id cte" -> { E: Set } */
export function parseConjuntosUsuario(texto: string): Record<string, Set<string>> {
  const out: Record<string, Set<string>> = {}
  ;(texto || '').split(/\n/).forEach((linea) => {
    let l = linea.trim()
    if (!l || l.startsWith('#')) return
    l = l.replace(/^(primeros?|siguientes?|first|follow)\s*\(?\s*/i, '')
    const m = l.match(/^([A-Za-z_'][A-Za-z0-9_']*)\s*\)?\s*[:=]\s*(.*)$/)
    if (!m || !m[1]) return
    const nt = m[1]
    const cuerpo = (m[2] ?? '').replace(/[{}]/g, ' ')
    const elems = cuerpo.split(/[,\s]+/).map((x) => x.trim()).filter(Boolean)
      .map((x) => (/^(lambda|epsilon|vacio|vacío)$/i.test(x) ? VACIO : x))
    out[nt] = new Set(elems)
  })
  return out
}

const igualSet = (a: Set<string>, b: Set<string>): boolean =>
  a.size === b.size && [...a].every((x) => b.has(x))

/** Compara los conjuntos que cargó el alumno contra los que calcula el motor. */
export function validarConjuntos(
  textoUsuario: string,
  gramaticaTexto: string,
  cual: 'primeros' | 'siguientes'
): ResultadoConjuntos {
  const g0 = parseGrammar(gramaticaTexto)
  if (!g0.start) return { ok: false, filas: [], error: 'La gramática del ejercicio está vacía.' }
  const info = tablaSLR(g0)
  // los conjuntos se piden sobre los NO TERMINALES DE LA GRAMÁTICA ORIGINAL
  const objetivo: Record<string, Set<string>> = {}
  g0.nts.forEach((A) => {
    objetivo[A] = (cual === 'primeros' ? info.primeros[A] : info.siguientes[A]) ?? new Set()
  })
  const dado = parseConjuntosUsuario(textoUsuario)
  if (!Object.keys(dado).length) {
    return { ok: false, filas: [], error: 'Escribí un no terminal por línea, por ejemplo:  E = id, cte' }
  }
  const filas: FilaConjunto[] = []
  let ok = true
  Object.keys(objetivo).forEach((A) => {
    const esperado = objetivo[A] as Set<string>
    const puesto = dado[A] ?? new Set<string>()
    const bien = igualSet(puesto, esperado)
    if (!bien) ok = false
    const faltan = [...esperado].filter((x) => !puesto.has(x))
    const sobran = [...puesto].filter((x) => !esperado.has(x))
    filas.push({
      nt: A, esperado: [...esperado], puesto: [...puesto], pass: bien,
      faltan, sobran, cargado: A in dado
    })
  })
  const extra = Object.keys(dado).filter((A) => !(A in objetivo))
  if (extra.length) ok = false
  return { ok, filas, extra, error: null }
}
