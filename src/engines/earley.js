/* Reconocedor Earley para gramáticas libres de contexto escritas en notación BNF de la cátedra.
   Formato aceptado (una regla por línea):
       NoTerminal -> simbolos | otra alternativa
   También se aceptan las flechas  →  y  ::=
   - Los símbolos van separados por espacios.
   - Todo símbolo que aparezca alguna vez a la IZQUIERDA es no terminal; el resto, terminal.
   - El símbolo distinguido es el lado izquierdo de la PRIMERA regla.
   - Vacío: ε, lambda, epsilon, λ.
   Maneja recursión a izquierda y reglas anulables.
*/

const VACIO = /^(ε|lambda|epsilon|λ|vacio|vacío)$/i

export function parseGrammar(text) {
  const rules = []
  const nts = new Set()
  let start = null
  ;(text || '').split(/\n/).forEach((line) => {
    const l = line.trim()
    if (!l || l.startsWith('#') || l.startsWith('//')) return
    const parts = l.split(/->|→|::=/)
    if (parts.length < 2) return
    const lhs = parts[0].trim()
    if (!lhs || /\s/.test(lhs)) return
    nts.add(lhs)
    if (start === null) start = lhs
    parts.slice(1).join('->').split('|').forEach((alt) => {
      let syms = alt.trim().split(/\s+/).filter((x) => x.length)
      if (syms.length === 1 && VACIO.test(syms[0])) syms = []
      rules.push({ lhs, rhs: syms })
    })
  })
  return { rules, nts, start }
}

export function tokenize(s) {
  return (s || '').trim().split(/\s+/).filter((x) => x.length)
}

export function earleyAccepts(g, input) {
  if (!g || !g.start) throw new Error('La gramática está vacía')
  const n = input.length
  const chart = []
  const seen = []
  for (let i = 0; i <= n; i++) { chart.push([]); seen.push(new Set()) }
  const key = (it) => it.lhs + '|' + it.rhs.join(' ') + '|' + it.dot + '|' + it.start
  function add(i, it) {
    const k = key(it)
    if (seen[i].has(k)) return
    seen[i].add(k)
    chart[i].push(it)
  }
  g.rules.filter((r) => r.lhs === g.start).forEach((r) => add(0, { lhs: r.lhs, rhs: r.rhs, dot: 0, start: 0 }))

  for (let i = 0; i <= n; i++) {
    for (let x = 0; x < chart[i].length; x++) {
      const it = chart[i][x]
      if (it.dot < it.rhs.length) {
        const sym = it.rhs[it.dot]
        if (g.nts.has(sym)) {
          // predict
          g.rules.filter((r) => r.lhs === sym).forEach((r) => add(i, { lhs: r.lhs, rhs: r.rhs, dot: 0, start: i }))
          // completar anulables ya reconocidos en este mismo punto
          chart[i].forEach((jt) => {
            if (jt.start === i && jt.lhs === sym && jt.dot === jt.rhs.length) {
              add(i, { lhs: it.lhs, rhs: it.rhs, dot: it.dot + 1, start: it.start })
            }
          })
        } else if (i < n && input[i] === sym) {
          add(i + 1, { lhs: it.lhs, rhs: it.rhs, dot: it.dot + 1, start: it.start })
        }
      } else {
        // complete
        chart[it.start].forEach((jt) => {
          if (jt.dot < jt.rhs.length && jt.rhs[jt.dot] === it.lhs) {
            add(i, { lhs: jt.lhs, rhs: jt.rhs, dot: jt.dot + 1, start: jt.start })
          }
        })
      }
    }
  }
  return chart[n].some((it) => it.lhs === g.start && it.dot === it.rhs.length && it.start === 0)
}

/** Prueba una gramática contra sets de cadenas. Devuelve {ok, casos, error} */
export function testGLC(texto, aceptar = [], rechazar = []) {
  let g
  try {
    g = parseGrammar(texto)
    if (!g.start) throw new Error('Escribí al menos una regla con la forma  NoTerminal -> símbolos')
  } catch (e) {
    return { ok: false, casos: [], error: e.message }
  }
  const casos = []
  let ok = true
  const run = (s, esperado) => {
    let acc
    try { acc = earleyAccepts(g, tokenize(s)) } catch { acc = false }
    if (acc !== esperado) ok = false
    casos.push({ s, esperado, obtenido: acc, pass: acc === esperado })
  }
  aceptar.forEach((s) => run(s, true))
  rechazar.forEach((s) => run(s, false))
  return { ok, casos, error: null }
}
