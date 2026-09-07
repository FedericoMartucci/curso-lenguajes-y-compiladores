/* Numeración y agrupación de los ejercicios del sandbox.
   Separa el "de dónde sale" (grupo + número) del contenido del ejercicio,
   para poder mostrarlos como  "Práctica 1 · 1a — Códigos postales"  y agruparlos por práctica. */

const P1 = 'Práctica 1'
const P2 = 'Práctica 2'
const L1 = 'Tu lenguaje (L1_aho)'
const TC = 'Temas comunes'
const EX = 'Parciales y extras'

export const META = {
  er: {
    'p1-1a': { grupo: P1, num: '1a', orden: 110 },
    'p1-1b': { grupo: P1, num: '1b', orden: 120 },
    'p1-1c': { grupo: P1, num: '1c', orden: 130 },
    'p1-1d': { grupo: P1, num: '1d', orden: 140 },
    'p1-1e': { grupo: P1, num: '1e', orden: 150 },
    'p1-1f': { grupo: P1, num: '1f', orden: 160 },
    'p1-1g': { grupo: P1, num: '1g', orden: 170 },
    'p1-1h': { grupo: P1, num: '1h', orden: 180 },
    'p1-1i': { grupo: P1, num: '1i', orden: 190 },
    'p1-1j': { grupo: P1, num: '1j', orden: 200 },
    'p1-1k1': { grupo: P1, num: '1k · decimal', orden: 210 },
    'p1-1k2': { grupo: P1, num: '1k · octal', orden: 220 },
    'p1-1k3': { grupo: P1, num: '1k · hexa', orden: 230 },
    'p1-1k4': { grupo: P1, num: '1k · las tres', orden: 240 },
    'p1-2': { grupo: P1, num: '2', orden: 250 },
    'ex-id-guionbajo': { grupo: P1, num: '4b', orden: 260 },
    'p1-4c': { grupo: P1, num: '4c', orden: 270 },
    'l1-id': { grupo: L1, num: 'identificador', orden: 310 },
    'l1-com': { grupo: L1, num: 'comentario', orden: 320 },
    'l1-float': { grupo: L1, num: 'constante Float', orden: 330 },
    'ex-coord': { grupo: EX, num: 'Parcial 2C24', orden: 410 },
    'ex-binpar': { grupo: EX, num: 'Apunte 1', orden: 420 },
    'ex-ceros-unos': { grupo: EX, num: 'Apunte 2', orden: 430 },
    'ex-hora': { grupo: EX, num: 'Extra 1', orden: 440 },
    'ex-fecha': { grupo: EX, num: 'Extra 2', orden: 450 },
    'ex-real-exp': { grupo: EX, num: 'Extra 3', orden: 460 }
  },
  lex: {
    'p1-1a-len': { grupo: P1, num: '1a · por longitud', orden: 110 },
    'p1-1g-rango': { grupo: P1, num: '1g · con rango', orden: 120 },
    'p1-4a': { grupo: P1, num: '4a', orden: 130 },
    'p1-4b': { grupo: P1, num: '4b', orden: 140 },
    'ex-str-libre': { grupo: P1, num: '4c', orden: 150 },
    'l1-int': { grupo: L1, num: 'cota de Int', orden: 210 },
    'l1-float': { grupo: L1, num: 'cota de Float', orden: 220 },
    'l1-str50': { grupo: L1, num: 'longitud de String', orden: 230 },
    'ex-coord-len': { grupo: EX, num: 'Parcial 2C24', orden: 310 },
    'ex-id-len': { grupo: EX, num: 'Extra 1', orden: 320 }
  },
  glc: {
    'p2-1': { grupo: P2, num: '1', orden: 110 },
    'p2-2': { grupo: P2, num: '2', orden: 120 },
    'p2-3': { grupo: P2, num: '3', orden: 130 },
    'p2-4': { grupo: P2, num: '4', orden: 140 },
    'p2-6': { grupo: P2, num: '6', orden: 160 },
    'p2-7': { grupo: P2, num: '7', orden: 170 },
    'p2-11': { grupo: P2, num: '11', orden: 210 },
    'p2-12': { grupo: P2, num: '12', orden: 220 },
    'ex-if': { grupo: TC, num: 'if / then / endif', orden: 310 },
    'ex-ifelse': { grupo: TC, num: 'if con else', orden: 320 },
    'ex-while': { grupo: TC, num: 'while', orden: 330 },
    'ex-decvar': { grupo: TC, num: 'DECVAR', orden: 340 },
    'l1-when': { grupo: L1, num: 'TE1 · matchPatterns', orden: 410 },
    'ex-canonica': { grupo: EX, num: 'Apunte', orden: 510 },
    'ex-par': { grupo: EX, num: 'Extra 1', orden: 520 },
    'ex-anbn': { grupo: EX, num: 'Extra 2', orden: 530 },
    'ex-lista': { grupo: EX, num: 'Extra 3', orden: 540 }
  }
}

const SIN_META = { grupo: 'Otros', num: '—', orden: 9999 }

/** Devuelve la lista ordenada y decorada con grupo, número y etiqueta para mostrar. */
export function decorar(lista, tipo) {
  return lista
    .map((e, i) => {
      const m = META[tipo]?.[e.id] || SIN_META
      return { ...e, ...m, _i: i, etiqueta: `${m.grupo} · ${m.num} — ${e.t}` }
    })
    .sort((a, b) => a.orden - b.orden || a._i - b._i)
}

/** Agrupa una lista ya decorada, preservando el orden de aparición de los grupos. */
export function agrupar(decorada) {
  const grupos = []
  decorada.forEach((e) => {
    let g = grupos.find((x) => x.nombre === e.grupo)
    if (!g) { g = { nombre: e.grupo, items: [] }; grupos.push(g) }
    g.items.push(e)
  })
  return grupos
}
