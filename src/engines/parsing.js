/* Motor de PARSING ASCENDENTE (Práctica 3).
   A partir de una gramática en la notación de la cátedra calcula:
     - la gramática aumentada
     - los conjuntos PRIMEROS y SIGUIENTES
     - los estados de ítems LR(0) (CLOSURE / GOTO)
     - la tabla SLR, con sus conflictos desplazamiento-reducción y reducción-reducción
   Sirve para corregir automáticamente lo que carga el alumno y para mostrar la solución completa. */

import { parseGrammar } from './earley.js'

export const FIN = '$'
export const VACIO = 'ε'

/* ---------- utilidades ---------- */
export function simbolos(g) {
  const terminales = new Set()
  g.rules.forEach((r) => r.rhs.forEach((s) => { if (!g.nts.has(s)) terminales.add(s) }))
  return { terminales: [...terminales], noTerminales: [...g.nts] }
}

/** Agrega S' -> S. Devuelve una gramática nueva con `start` nuevo y la regla 0 primero. */
export function aumentar(g) {
  let nuevo = g.start + "'"
  while (g.nts.has(nuevo)) nuevo += "'"
  const rules = [{ lhs: nuevo, rhs: [g.start] }, ...g.rules]
  const nts = new Set([nuevo, ...g.nts])
  return { rules, nts, start: nuevo, original: g.start }
}

/* ---------- PRIMEROS ---------- */
export function calcularPrimeros(g) {
  const P = {}
  g.nts.forEach((A) => { P[A] = new Set() })
  const anulable = new Set()
  let cambio = true
  while (cambio) {
    cambio = false
    for (const r of g.rules) {
      if (r.rhs.length === 0) { if (!anulable.has(r.lhs)) { anulable.add(r.lhs); cambio = true } continue }
      let todosAnulables = true
      for (const X of r.rhs) {
        if (!g.nts.has(X)) { if (!P[r.lhs].has(X)) { P[r.lhs].add(X); cambio = true } todosAnulables = false; break }
        for (const t of P[X]) if (!P[r.lhs].has(t)) { P[r.lhs].add(t); cambio = true }
        if (!anulable.has(X)) { todosAnulables = false; break }
      }
      if (todosAnulables && !anulable.has(r.lhs)) { anulable.add(r.lhs); cambio = true }
    }
  }
  return { primeros: P, anulable }
}

/** PRIMERO de una secuencia de símbolos. Devuelve {conjunto:Set, anulable:bool} */
export function primerosDeSecuencia(sec, g, P, anulable) {
  const out = new Set()
  for (const X of sec) {
    if (!g.nts.has(X)) { out.add(X); return { conjunto: out, anulable: false } }
    P[X].forEach((t) => out.add(t))
    if (!anulable.has(X)) return { conjunto: out, anulable: false }
  }
  return { conjunto: out, anulable: true }
}

/* ---------- SIGUIENTES ---------- */
export function calcularSiguientes(g, P, anulable) {
  const S = {}
  g.nts.forEach((A) => { S[A] = new Set() })
  S[g.start].add(FIN)
  let cambio = true
  while (cambio) {
    cambio = false
    for (const r of g.rules) {
      for (let i = 0; i < r.rhs.length; i++) {
        const B = r.rhs[i]
        if (!g.nts.has(B)) continue
        const resto = r.rhs.slice(i + 1)
        const { conjunto, anulable: restoAnulable } = primerosDeSecuencia(resto, g, P, anulable)
        conjunto.forEach((t) => { if (!S[B].has(t)) { S[B].add(t); cambio = true } })
        if (restoAnulable) {
          S[r.lhs].forEach((t) => { if (!S[B].has(t)) { S[B].add(t); cambio = true } })
        }
      }
    }
  }
  return S
}

/* ---------- ítems LR(0) ---------- */
const claveItem = (it) => `${it.r}|${it.dot}`
const claveEstado = (items) => items.map(claveItem).sort().join(';')

export function closure(items, g) {
  const out = items.slice()
  const vistos = new Set(out.map(claveItem))
  for (let i = 0; i < out.length; i++) {
    const it = out[i]
    const regla = g.rules[it.r]
    const sig = regla.rhs[it.dot]
    if (sig && g.nts.has(sig)) {
      g.rules.forEach((r, ix) => {
        if (r.lhs === sig) {
          const nuevo = { r: ix, dot: 0 }
          if (!vistos.has(claveItem(nuevo))) { vistos.add(claveItem(nuevo)); out.push(nuevo) }
        }
      })
    }
  }
  return out
}

export function goto(items, X, g) {
  const movidos = items
    .filter((it) => g.rules[it.r].rhs[it.dot] === X)
    .map((it) => ({ r: it.r, dot: it.dot + 1 }))
  return movidos.length ? closure(movidos, g) : []
}

/** Colección canónica de estados LR(0) + transiciones. g debe estar AUMENTADA. */
export function automataLR0(g) {
  const inicial = closure([{ r: 0, dot: 0 }], g)
  const estados = [inicial]
  const indice = new Map([[claveEstado(inicial), 0]])
  const trans = [] // {desde, simbolo, hasta}
  const { terminales, noTerminales } = simbolos(g)
  const todos = [...terminales, ...noTerminales]
  for (let i = 0; i < estados.length; i++) {
    for (const X of todos) {
      const dest = goto(estados[i], X, g)
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
export function tablaSLR(gOriginal) {
  const g = aumentar(gOriginal)
  const { primeros, anulable } = calcularPrimeros(g)
  const siguientes = calcularSiguientes(g, primeros, anulable)
  const { estados, trans } = automataLR0(g)
  const { terminales, noTerminales } = simbolos(g)
  const cols = [...terminales, FIN]

  const accion = {} // accion[estado][terminal] = [acciones]
  const irA = {}
  estados.forEach((_, i) => { accion[i] = {}; irA[i] = {} })

  trans.forEach(({ desde, simbolo, hasta }) => {
    if (g.nts.has(simbolo)) irA[desde][simbolo] = hasta
    else (accion[desde][simbolo] ||= []).push({ tipo: 'd', valor: hasta })
  })

  estados.forEach((items, i) => {
    items.forEach((it) => {
      const r = g.rules[it.r]
      if (it.dot !== r.rhs.length) return
      if (it.r === 0) {
        ;(accion[i][FIN] ||= []).push({ tipo: 'acc' })
      } else {
        siguientes[r.lhs].forEach((t) => {
          ;(accion[i][t] ||= []).push({ tipo: 'r', valor: it.r, regla: r })
        })
      }
    })
  })

  const conflictos = []
  estados.forEach((_, i) => {
    cols.forEach((t) => {
      const a = accion[i][t]
      if (a && a.length > 1) {
        const tipos = new Set(a.map((x) => x.tipo))
        const clase = tipos.has('d') && tipos.has('r')
          ? 'desplazamiento-reducción'
          : (a.filter((x) => x.tipo === 'r').length > 1 ? 'reducción-reducción' : 'múltiple')
        conflictos.push({ estado: i, simbolo: t, clase, acciones: a })
      }
    })
  })

  return {
    gAumentada: g, primeros, siguientes, anulable, estados, trans,
    accion, irA, terminales, noTerminales, cols, conflictos,
    esSLR: conflictos.length === 0
  }
}

/* ---------- presentación ---------- */
export function textoItem(g, it) {
  const r = g.rules[it.r]
  const rhs = r.rhs.slice()
  rhs.splice(it.dot, 0, '•')
  return `${r.lhs} -> ${rhs.join(' ') || 'ε'}`
}

export function textoAccion(a) {
  if (a.tipo === 'd') return 'D' + a.valor
  if (a.tipo === 'acc') return 'aceptar'
  return 'R' + a.valor
}

export function reglasNumeradas(g) {
  return g.rules.map((r, i) => `${i}. ${r.lhs} -> ${r.rhs.join(' ') || 'ε'}`)
}

/* ---------- validación de lo que carga el alumno ---------- */
/** Parsea "E = id, cte" / "PRIMERO(E) = { id, cte }" / "E: id cte" -> { E: Set } */
export function parseConjuntosUsuario(texto) {
  const out = {}
  ;(texto || '').split(/\n/).forEach((linea) => {
    let l = linea.trim()
    if (!l || l.startsWith('#')) return
    l = l.replace(/^(primeros?|siguientes?|first|follow)\s*\(?\s*/i, '')
    const m = l.match(/^([A-Za-z_'][A-Za-z0-9_']*)\s*\)?\s*[:=]\s*(.*)$/)
    if (!m) return
    const nt = m[1]
    const cuerpo = m[2].replace(/[{}]/g, ' ')
    const elems = cuerpo.split(/[,\s]+/).map((x) => x.trim()).filter(Boolean)
      .map((x) => (/^(lambda|epsilon|vacio|vacío)$/i.test(x) ? VACIO : x))
    out[nt] = new Set(elems)
  })
  return out
}

const igualSet = (a, b) => a.size === b.size && [...a].every((x) => b.has(x))

/** Compara los conjuntos del alumno contra los correctos. cual: 'primeros' | 'siguientes' */
export function validarConjuntos(textoUsuario, gramaticaTexto, cual) {
  const g0 = parseGrammar(gramaticaTexto)
  if (!g0.start) return { ok: false, filas: [], error: 'La gramática del ejercicio está vacía.' }
  const info = tablaSLR(g0)
  // los conjuntos se piden sobre los NO TERMINALES DE LA GRAMÁTICA ORIGINAL
  const objetivo = {}
  g0.nts.forEach((A) => {
    objetivo[A] = cual === 'primeros' ? info.primeros[A] : info.siguientes[A]
  })
  const dado = parseConjuntosUsuario(textoUsuario)
  if (!Object.keys(dado).length) {
    return { ok: false, filas: [], error: 'Escribí un no terminal por línea, por ejemplo:  E = id, cte' }
  }
  const filas = []
  let ok = true
  Object.keys(objetivo).forEach((A) => {
    const esperado = objetivo[A]
    const puesto = dado[A] || new Set()
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
