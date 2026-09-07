/* Parser del PSEUDOCÓDIGO de una acción léxica, al estilo de la cátedra:

     ACCION LEXICA
     {
       if ( valor absoluto <= 64556 )
           return TOKEN;
       else
           error("fuera de cota");
     }

   Extrae la condición del `if` y devuelve un predicado que se aplica al lexema,
   para poder validar funcionalmente la acción (no solo compararla a ojo).
   Acepta condiciones compuestas con and / or, paréntesis, y el número de cualquier lado. */

import { attrValue, cmp } from './lexica.js'

/* ---------- atributos que se pueden nombrar en la condición ---------- */
export const ATTR_ALIAS = {
  'valor': 'valor', 'val': 'valor', 'value': 'valor', 'numero': 'valor',
  'valor del lexema': 'valor', 'el valor': 'valor', 'valor numerico': 'valor',
  'valor absoluto': 'valor_abs', 'abs': 'valor_abs', 'abs valor': 'valor_abs',
  'valor abs': 'valor_abs', 'modulo': 'valor_abs', 'modulo del valor': 'valor_abs',
  'longitud': 'longitud', 'len': 'longitud', 'length': 'longitud', 'largo': 'longitud',
  'len yytext': 'longitud', 'longitud del lexema': 'longitud', 'cantidad de caracteres': 'longitud',
  'longitud sin comillas': 'longitud_sin_comillas', 'longitud sin las comillas': 'longitud_sin_comillas',
  'longitud del contenido': 'longitud_sin_comillas', 'longitud contenido': 'longitud_sin_comillas',
  'cantidad de guiones bajos': 'cant_guiones_bajos', 'guiones bajos': 'cant_guiones_bajos',
  'cant guiones bajos': 'cant_guiones_bajos', 'cantidad guiones bajos': 'cant_guiones_bajos',
  'cantidad de guiones medios': 'cant_guiones', 'guiones medios': 'cant_guiones',
  'cant guiones': 'cant_guiones', 'guiones': 'cant_guiones'
}

export const ATTR_LABEL = {
  valor: 'valor', valor_abs: 'valor absoluto', longitud: 'longitud',
  longitud_sin_comillas: 'longitud sin comillas',
  cant_guiones_bajos: 'cantidad de guiones bajos', cant_guiones: 'cantidad de guiones medios'
}

const KEYWORDS = ['accion', 'acción', 'lexica', 'léxica', 'if', 'else', 'return', 'error', 'and', 'or', 'not']

/* palabras que solo nombran al lexema y no aportan al atributo: len(yytext) es "longitud" */
const PLACEHOLDERS = new Set(['yytext', 'yyval', 'yylval', 'lexema', 'texto', 'token'])

function normalizar(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim()
}

/* ---------- tokenizador de la condición ---------- */
function tokenizarCond(s) {
  const out = []
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (/\s/.test(c)) { i++; continue }
    if (c === '(' || c === ')') { out.push({ t: c }); i++; continue }
    const dos = s.slice(i, i + 2)
    if (['<=', '>=', '==', '!=', '&&', '||'].includes(dos)) {
      out.push(dos === '&&' ? { t: 'and' } : dos === '||' ? { t: 'or' } : { t: 'op', v: dos })
      i += 2; continue
    }
    if (c === '<' || c === '>') { out.push({ t: 'op', v: c }); i++; continue }
    if (c === '=') { out.push({ t: 'op', v: '==' }); i++; continue }
    const num = s.slice(i).match(/^-?\d+(\.\d+)?([eE][+-]?\d+)?/)
    if (num && (/[\d]/.test(c) || (c === '-' && /\d/.test(s[i + 1] || '')))) {
      out.push({ t: 'num', v: parseFloat(num[0]) }); i += num[0].length; continue
    }
    const pal = s.slice(i).match(/^[A-Za-zÁÉÍÓÚÑáéíóúñ_|]+/)
    if (pal) {
      const w = pal[0]
      const wn = normalizar(w)
      if (wn === 'and' || wn === 'y') { out.push({ t: 'and' }); i += w.length; continue }
      if (wn === 'or' || wn === 'o') { out.push({ t: 'or' }); i += w.length; continue }
      // ¿es una llamada tipo val(), len(yytext), abs(valor)? entonces forma parte del atributo
      let consumido = w.length
      let extra = ''
      let k = i + w.length
      while (k < s.length && /\s/.test(s[k])) k++
      if (s[k] === '(') {
        let niv = 1, m = k + 1
        while (m < s.length && niv > 0) {
          if (s[m] === '(') niv++
          else if (s[m] === ')') { niv--; if (niv === 0) break }
          m++
        }
        const dentro = niv === 0 ? s.slice(k + 1, m) : null
        if (dentro !== null && /^[A-Za-zÁÉÍÓÚÑáéíóúñ_\s]*$/.test(dentro)) {
          extra = dentro
          consumido = (m + 1) - i
        }
      }
      const palabras = (w + ' ' + extra).split(/\s+/).filter(Boolean)
        .filter((p) => !PLACEHOLDERS.has(normalizar(p)))
      out.push({ t: 'pal', v: palabras.join(' ') })
      i += consumido; continue
    }
    i++ // carácter que no aporta (comas, etc.)
  }
  return out
}

/* ---------- parser de la condición ---------- */
function parseCondicion(tokens) {
  let p = 0
  const fin = () => p >= tokens.length
  const ver = () => tokens[p]

  function expr() {
    let izq = term()
    while (!fin() && (ver().t === 'and' || ver().t === 'or')) {
      const tipo = ver().t; p++
      const der = term()
      const a = izq, b = der
      izq = tipo === 'and' ? (lx) => a(lx) && b(lx) : (lx) => a(lx) || b(lx)
    }
    return izq
  }

  function term() {
    if (fin()) throw new Error('La condición del if quedó incompleta.')
    if (ver().t === '(') {
      p++
      const e = expr()
      if (!fin() && ver().t === ')') p++
      return e
    }
    return comparacion()
  }

  function frasePalabras() {
    const palabras = []
    while (!fin() && ver().t === 'pal') { palabras.push(ver().v); p++ }
    return palabras.join(' ')
  }

  function comparacion() {
    // lado izquierdo: atributo o número
    let attr = null, numIzq = null
    if (ver() && ver().t === 'num') { numIzq = ver().v; p++ }
    else {
      const frase = frasePalabras()
      if (!frase) throw new Error('Esperaba el atributo del lexema (por ejemplo: valor, longitud, valor absoluto).')
      const clave = ATTR_ALIAS[normalizar(frase)]
      if (!clave) {
        throw new Error(`No reconozco el atributo "${frase.trim()}". Probá con: ${Object.values(ATTR_LABEL).join(', ')}.`)
      }
      attr = clave
    }
    if (fin() || ver().t !== 'op') throw new Error('Falta el comparador (<=, <, ==, >=, >, !=) en la condición.')
    let op = ver().v; p++
    // lado derecho
    let numDer = null, attrDer = null
    if (!fin() && ver().t === 'num') { numDer = ver().v; p++ }
    else {
      const frase = frasePalabras()
      const clave = ATTR_ALIAS[normalizar(frase)]
      if (!clave) throw new Error('Del otro lado del comparador esperaba un número (la cota).')
      attrDer = clave
    }
    if (attr !== null && numDer !== null) {
      return (lx) => cmp(attrValue(attr, lx), op, numDer)
    }
    if (numIzq !== null && attrDer !== null) {
      const inv = { '<=': '>=', '<': '>', '>=': '<=', '>': '<', '==': '==', '!=': '!=' }[op]
      return (lx) => cmp(attrValue(attrDer, lx), inv, numIzq)
    }
    throw new Error('La comparación tiene que ser entre un atributo del lexema y un número.')
  }

  const pred = expr()
  if (!fin()) throw new Error('Sobra texto al final de la condición del if.')
  return pred
}

/* ---------- API ---------- */
/** Analiza el pseudocódigo completo. Devuelve {pred, avisos, error}. */
export function parseAccionLexica(codigo) {
  const src = String(codigo || '')
  if (!src.trim()) return { pred: null, avisos: [], error: 'Escribí la acción léxica.' }

  const mIf = src.match(/\bif\b\s*\(/i)
  if (!mIf) return { pred: null, avisos: [], error: 'No encontré un `if` con la condición. Escribí algo como: if ( valor <= 32767 ) return TOKEN; else error("fuera de cota");' }

  // extraer el contenido balanceado del paréntesis del if
  const desde = mIf.index + mIf[0].length
  let nivel = 1, j = desde
  while (j < src.length && nivel > 0) {
    if (src[j] === '(') nivel++
    else if (src[j] === ')') nivel--
    if (nivel === 0) break
    j++
  }
  if (nivel !== 0) return { pred: null, avisos: [], error: 'Falta cerrar el paréntesis de la condición del if.' }
  const cond = src.slice(desde, j)

  let pred
  try {
    pred = parseCondicion(tokenizarCond(cond))
  } catch (e) {
    return { pred: null, avisos: [], error: e.message }
  }

  const avisos = []
  if (!/\breturn\b/i.test(src)) avisos.push('No indicás qué token devolver cuando la condición se cumple (falta un `return TOKEN;`).')
  if (!/\berror\b/i.test(src)) avisos.push('No contemplás el caso de error (falta un `error("fuera de cota");` en el else).')
  if (!/\belse\b/i.test(src)) avisos.push('No escribiste la rama `else`: conviene dejar explícito qué pasa si la cota no se cumple.')

  return { pred, avisos, error: null }
}

/** Corre ER + acción léxica escrita como código sobre los casos de prueba. */
export function testAccionCodigo(rx, codigo, tests) {
  const { pred, avisos, error } = parseAccionLexica(codigo)
  if (error) return { ok: false, casos: [], error, avisos: [] }
  const casos = []
  let ok = true
  for (const tc of tests) {
    const formaOk = rx.test(tc.v)
    let cotaOk = false
    if (formaOk) { try { cotaOk = !!pred(tc.v) } catch { cotaOk = false } }
    const acepta = formaOk && cotaOk
    const pass = acepta === tc.ok
    if (!pass) ok = false
    casos.push({
      s: tc.v, esperado: tc.ok, obtenido: acepta, pass,
      detalle: acepta ? 'aceptado' : (!formaOk ? 'rechazado por la ER' : 'rechazado por la acción')
    })
  }
  return { ok, casos, error: null, avisos }
}

/** Código modelo a partir de los datos del ejercicio. */
export function codigoModelo(atr, op, cota) {
  return `ACCION LEXICA
{
  if ( ${ATTR_LABEL[atr] || atr} ${op} ${cota} )
      return TOKEN;
  else
      error("fuera de cota");
}`
}

/* ---------- resaltado de sintaxis ---------- */
const RE_TOKENS = /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*")|(\b-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(<=|>=|==|!=|&&|\|\||[<>=+\-*/])|([{}();,])|([A-Za-zÁÉÍÓÚÑáéíóúñ_]+)/g

/** Devuelve [{text, cls}] para pintar el código. cls: kw|attr|num|str|op|punct|com|plain */
export function resaltar(codigo) {
  const src = String(codigo || '')
  const out = []
  let last = 0
  let m
  RE_TOKENS.lastIndex = 0
  while ((m = RE_TOKENS.exec(src)) !== null) {
    if (m.index > last) out.push({ text: src.slice(last, m.index), cls: 'plain' })
    const [txt, com, str, num, op, punct, pal] = m
    if (com) out.push({ text: txt, cls: 'com' })
    else if (str) out.push({ text: txt, cls: 'str' })
    else if (num) out.push({ text: txt, cls: 'num' })
    else if (op) out.push({ text: txt, cls: 'op' })
    else if (punct) out.push({ text: txt, cls: 'punct' })
    else if (pal) {
      const n = normalizar(pal)
      if (KEYWORDS.includes(n)) out.push({ text: txt, cls: 'kw' })
      else if (esPalabraDeAtributo(n)) out.push({ text: txt, cls: 'attr' })
      else out.push({ text: txt, cls: 'plain' })
    }
    last = m.index + txt.length
  }
  if (last < src.length) out.push({ text: src.slice(last), cls: 'plain' })
  return out
}

const PALABRAS_ATTR = new Set()
Object.keys(ATTR_ALIAS).forEach((k) => k.split(' ').forEach((w) => PALABRAS_ATTR.add(w)))
function esPalabraDeAtributo(w) { return PALABRAS_ATTR.has(w) }
