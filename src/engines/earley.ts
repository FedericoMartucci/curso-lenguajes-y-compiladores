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
import type { Gramatica, Regla, CasoCorrido, ResultadoCasos } from '../tipos/motores.ts'

const VACIO = /^(ε|lambda|epsilon|λ|vacio|vacío)$/i

const mensaje = (e: unknown): string => (e instanceof Error ? e.message : String(e))

export function parseGrammar(text: string): Gramatica {
  const rules: Regla[] = []
  const nts = new Set<string>()
  let start: string | null = null
  ;(text || '').split(/\n/).forEach((line) => {
    const l = line.trim()
    if (!l || l.startsWith('#') || l.startsWith('//')) return
    const parts = l.split(/->|→|::=/)
    if (parts.length < 2) return
    const lhs = (parts[0] ?? '').trim()
    if (!lhs || /\s/.test(lhs)) return
    nts.add(lhs)
    if (start === null) start = lhs
    parts.slice(1).join('->').split('|').forEach((alt) => {
      let syms = alt.trim().split(/\s+/).filter((x) => x.length)
      if (syms.length === 1 && VACIO.test(syms[0] as string)) syms = []
      rules.push({ lhs, rhs: syms })
    })
  })
  return { rules, nts, start }
}

export function tokenize(s: string): string[] {
  return (s || '').trim().split(/\s+/).filter((x) => x.length)
}

/** Ítem de Earley: la producción con el punto en `dot`, reconocida desde la posición `start`. */
interface ItemEarley {
  lhs: string
  rhs: string[]
  dot: number
  start: number
}

export function earleyAccepts(g: Gramatica, input: string[]): boolean {
  if (!g || !g.start) throw new Error('La gramática está vacía')
  const inicio = g.start
  const n = input.length
  const chart: ItemEarley[][] = []
  const seen: Set<string>[] = []
  for (let i = 0; i <= n; i++) { chart.push([]); seen.push(new Set()) }

  const key = (it: ItemEarley) => it.lhs + '|' + it.rhs.join(' ') + '|' + it.dot + '|' + it.start
  const en = (i: number): ItemEarley[] => chart[i] as ItemEarley[]
  const vistos = (i: number): Set<string> => seen[i] as Set<string>

  function add(i: number, it: ItemEarley): void {
    const k = key(it)
    if (vistos(i).has(k)) return
    vistos(i).add(k)
    en(i).push(it)
  }

  g.rules.filter((r) => r.lhs === inicio).forEach((r) => add(0, { lhs: r.lhs, rhs: r.rhs, dot: 0, start: 0 }))

  for (let i = 0; i <= n; i++) {
    for (let x = 0; x < en(i).length; x++) {
      const it = en(i)[x] as ItemEarley
      if (it.dot < it.rhs.length) {
        const sym = it.rhs[it.dot] as string
        if (g.nts.has(sym)) {
          // predict
          g.rules.filter((r) => r.lhs === sym).forEach((r) => add(i, { lhs: r.lhs, rhs: r.rhs, dot: 0, start: i }))
          // completar anulables ya reconocidos en este mismo punto
          en(i).forEach((jt) => {
            if (jt.start === i && jt.lhs === sym && jt.dot === jt.rhs.length) {
              add(i, { lhs: it.lhs, rhs: it.rhs, dot: it.dot + 1, start: it.start })
            }
          })
        } else if (i < n && input[i] === sym) {
          add(i + 1, { lhs: it.lhs, rhs: it.rhs, dot: it.dot + 1, start: it.start })
        }
      } else {
        // complete
        en(it.start).forEach((jt) => {
          if (jt.dot < jt.rhs.length && jt.rhs[jt.dot] === it.lhs) {
            add(i, { lhs: jt.lhs, rhs: jt.rhs, dot: jt.dot + 1, start: jt.start })
          }
        })
      }
    }
  }
  return en(n).some((it) => it.lhs === inicio && it.dot === it.rhs.length && it.start === 0)
}

/** Prueba una gramática contra sets de cadenas de tokens. */
export function testGLC(
  texto: string,
  aceptar: string[] = [],
  rechazar: string[] = []
): ResultadoCasos {
  let g: Gramatica
  try {
    g = parseGrammar(texto)
    if (!g.start) throw new Error('Escribí al menos una regla con la forma  NoTerminal -> símbolos')
  } catch (e) {
    return { ok: false, casos: [], error: mensaje(e) }
  }
  const casos: CasoCorrido[] = []
  let ok = true
  const run = (s: string, esperado: boolean) => {
    let acc: boolean
    try { acc = earleyAccepts(g, tokenize(s)) } catch { acc = false }
    if (acc !== esperado) ok = false
    casos.push({ s, esperado, obtenido: acc, pass: acc === esperado })
  }
  aceptar.forEach((s) => run(s, true))
  rechazar.forEach((s) => run(s, false))
  return { ok, casos, error: null }
}
