/* Banco de CÓDIGO INTERMEDIO (Prácticas 4 y 5).
   Se valida POR EJECUCIÓN: se corre lo que escribe el alumno con los valores iniciales de cada
   caso y se comparan las variables finales. Cualquier solución correcta pasa. */

import type { EjercicioGCI } from '../../tipos/ejercicios.ts'

export const GCI_EJ: EjercicioGCI[] = [
  /* ---------- Práctica 4: sentencias básicas ---------- */
  {
    id: 'p4-suma', t: 'Asignación simple', fuente: 'Práctica 4 · básico', nivel: 'básico', notaciones: ['polaca'],
    c: 'Generá la polaca inversa de:  z := a + b',
    programa: 'z := a + b',
    m: { polaca: 'a b + z :=' },
    casos: [
      { inicial: { a: 2, b: 3 }, esperado: { z: 5 } },
      { inicial: { a: -4, b: 4 }, esperado: { z: 0 } }
    ]
  },
  {
    id: 'p4-prec', t: 'Precedencia sin paréntesis', fuente: 'Práctica 4 · básico', nivel: 'básico', notaciones: ['polaca'],
    c: 'Generá la polaca de:  z := a + b * c   (respetando que * va antes que +).',
    programa: 'z := a + b * c',
    m: { polaca: 'a b c * + z :=' },
    casos: [
      { inicial: { a: 1, b: 2, c: 3 }, esperado: { z: 7 } },
      { inicial: { a: 10, b: 0, c: 99 }, esperado: { z: 10 } }
    ]
  },
  {
    id: 'p4-paren', t: 'Expresión con paréntesis', fuente: 'Práctica 4 · Expresiones con paréntesis', nivel: 'medio', notaciones: ['polaca'],
    c: 'Generá la polaca de:  z := ( a + b ) * c',
    programa: 'z := (a + b) * c',
    m: { polaca: 'a b + c * z :=' },
    casos: [
      { inicial: { a: 1, b: 2, c: 3 }, esperado: { z: 9 } },
      { inicial: { a: 5, b: -5, c: 7 }, esperado: { z: 0 } }
    ]
  },
  {
    id: 'p4-avg', t: 'Promedio (AVG)', fuente: 'Práctica 4 · AVG', nivel: 'medio', notaciones: ['polaca'],
    c: 'El ejercicio AVG de la cátedra. Generá la polaca de:  a := ( b + c + d + e ) / 4',
    programa: 'a := (b + c + d + e) / 4',
    m: { polaca: 'b c + d + e + 4 / a :=' },
    casos: [
      { inicial: { b: 1, c: 2, d: 3, e: 4 }, esperado: { a: 2.5 } },
      { inicial: { b: 4, c: 4, d: 4, e: 4 }, esperado: { a: 4 } }
    ]
  },
  {
    id: 'p4-multiple', t: 'Asignación múltiple', fuente: 'Práctica 4 · Asignación múltiple', nivel: 'medio', notaciones: ['polaca'],
    c: 'Generá la polaca de:  a := b := c := x + 1   (las tres variables terminan con el mismo valor).',
    programa: 'a := b := c := x + 1',
    m: { polaca: 'x 1 + c := c b := b a :=' },
    casos: [
      { inicial: { x: 4 }, esperado: { a: 5, b: 5, c: 5 } },
      { inicial: { x: -1 }, esperado: { a: 0, b: 0, c: 0 } }
    ]
  },
  {
    id: 'p4-larga', t: 'Expresión larga', fuente: 'Apunte · z := a+b*c−d/(e+f)+20', nivel: 'difícil', notaciones: ['polaca'],
    c: 'La expresión que el apunte usa para Assembler. Generá su polaca:  z := a + b * c − d / ( e + f ) + 20',
    programa: 'z := a + b*c - d/(e+f) + 20',
    m: { polaca: 'a b c * + d e f + / - 20 + z :=' },
    casos: [
      { inicial: { a: 1, b: 2, c: 3, d: 8, e: 2, f: 2 }, esperado: { z: 25 } },
      { inicial: { a: 0, b: 0, c: 0, d: 10, e: 1, f: 1 }, esperado: { z: 15 } }
    ]
  },
  {
    id: 'p4-terc-suma', t: 'Tercetos de una expresión', fuente: 'Práctica 4 · tercetos', nivel: 'medio', notaciones: ['tercetos'],
    c: 'Escribí los tercetos de:  z := a + b * c   Numerá desde [11] y referenciá con [n].',
    programa: 'z := a + b * c',
    m: { tercetos: '[11] (*, b, c)\n[12] (+, a, [11])\n[13] (:=, z, [12])' },
    casos: [
      { inicial: { a: 1, b: 2, c: 3 }, esperado: { z: 7 } },
      { inicial: { a: 5, b: 1, c: 1 }, esperado: { z: 6 } }
    ]
  },
  {
    id: 'p4-terc-avg', t: 'Tercetos del promedio', fuente: 'Práctica 4 · AVG en tercetos', nivel: 'difícil', notaciones: ['tercetos'],
    c: 'Escribí los tercetos de:  a := ( b + c + d + e ) / 4',
    programa: 'a := (b + c + d + e) / 4',
    m: { tercetos: '[11] (+, b, c)\n[12] (+, [11], d)\n[13] (+, [12], e)\n[14] (/, [13], 4)\n[15] (:=, a, [14])' },
    casos: [
      { inicial: { b: 1, c: 2, d: 3, e: 4 }, esperado: { a: 2.5 } },
      { inicial: { b: 2, c: 2, d: 2, e: 2 }, esperado: { a: 2 } }
    ]
  },


  /* ---------- Las tres notaciones sobre la misma sentencia ----------
     Es como lo toma la cátedra: "Representar la sentencia … en polaca inversa, en árbol
     sintáctico y en tercetos". Las convenciones salen de la Práctica 4 y de las clases:
     el árbol se recorre in-orden para recuperar el fuente y post-orden para la polaca. */
  {
    id: 'p4-avg-tres', t: 'AVG en las tres notaciones', fuente: 'Práctica 4 · AVG', nivel: 'medio',
    notaciones: ['polaca', 'arbol', 'tercetos'],
    c: 'La función avg promedia una lista de elementos. Representá  a := avg(b, c, d, e)  en las tres notaciones intermedias. Acordate de que la cantidad de elementos la lleva una variable de trabajo (@cont en la clase); acá podés poner el 4 directo.',
    programa: 'a := avg(b, c, d, e)',
    m: {
      polaca: 'b c + d + e + 4 / a :=',
      arbol: ':=(a, /(+(+(+(b, c), d), e), 4))',
      tercetos: '[10] (b, _, _)\n[11] (c, _, _)\n[12] (+, [10], [11])\n[13] (d, _, _)\n[14] (+, [12], [13])\n[15] (e, _, _)\n[16] (+, [14], [15])\n[17] (/, [16], 4)\n[18] (:=, a, [17])'
    },
    casos: [
      { inicial: { b: 2, c: 4, d: 6, e: 8 }, esperado: { a: 5 } },
      { inicial: { b: 1, c: 1, d: 1, e: 1 }, esperado: { a: 1 } },
      { inicial: { b: 10, c: 0, d: -2, e: 0 }, esperado: { a: 2 } }
    ]
  },
  {
    id: 'p4-prom-tres', t: 'Promedio con expresiones adentro', fuente: 'Parcial · prom con expresiones', nivel: 'difícil',
    notaciones: ['polaca', 'arbol', 'tercetos'],
    c: 'Ahora los argumentos son expresiones, no variables sueltas. Representá  a := prom(a + b, 3, c * (d - a))  en las tres notaciones. Ojo con el orden: la a de la derecha es la vieja, y la asignación es lo último que pasa.',
    programa: 'a := prom(a + b, 3, c * (d - a))',
    m: {
      polaca: 'a b + 3 + c d a - * + 3 / a :=',
      arbol: ':=(a, /(+(+(+(a, b), 3), *(c, -(d, a))), 3))',
      tercetos: '[10] (+, a, b)\n[11] (+, [10], 3)\n[12] (-, d, a)\n[13] (*, c, [12])\n[14] (+, [11], [13])\n[15] (/, [14], 3)\n[16] (:=, a, [15])'
    },
    casos: [
      { inicial: { a: 1, b: 2, c: 3, d: 5 }, esperado: { a: 6 } },
      { inicial: { a: 0, b: 0, c: 1, d: 3 }, esperado: { a: 2 } }
    ]
  },
  {
    id: 'p4-arbol-simple', t: 'Tu primer árbol sintáctico', fuente: 'Práctica 4 · árbol', nivel: 'básico',
    notaciones: ['arbol'],
    c: 'Armá el árbol sintáctico de  z := a + b * c.  Escribilo como nodo(hijo, hijo): las hojas son etiquetas sueltas. Si lo recorrés in-orden tenés que recuperar el programa original.',
    programa: 'z := a + b * c',
    m: { arbol: ':=(z, +(a, *(b, c)))' },
    casos: [
      { inicial: { a: 1, b: 2, c: 3 }, esperado: { z: 7 } },
      { inicial: { a: 10, b: 0, c: 99 }, esperado: { z: 10 } }
    ]
  },
  {
    id: 'p5-min-arbol', t: 'Mínimo entre dos, en árbol', fuente: 'Práctica 5 · Mínimo', nivel: 'medio',
    notaciones: ['arbol'],
    c: 'El árbol no tiene saltos ni etiquetas: esa es su ventaja sobre polaca y tercetos. Un if lleva la condición en el hijo izquierdo y la acción en el derecho. Armá el árbol de:  m := a;  if (b < m) m := b;',
    nota: 'Para encadenar dos sentencias usá un nodo conector M, que es un nodo dummy: no produce código, sólo evita que los subárboles queden huérfanos.',
    programa: 'm := a\nif (b < m) m := b',
    m: { arbol: 'M(:=(m, a), if(<(b, m), :=(m, b)))' },
    casos: [
      { inicial: { a: 3, b: 7 }, esperado: { m: 3 } },
      { inicial: { a: 9, b: 4 }, esperado: { m: 4 } },
      { inicial: { a: 5, b: 5 }, esperado: { m: 5 } }
    ]
  },

  /* ---------- Práctica 5: sentencias de control ---------- */
  {
    id: 'p5-if', t: 'Selección simple (if)', fuente: 'Práctica 5 · if', nivel: 'medio', notaciones: ['polaca'],
    c: 'Generá la polaca de:  if ( a > 5 ) { b := 1 }   Usá BF con el destino en la celda siguiente. Las celdas se numeran desde 1.',
    programa: 'if (a > 5) { b := 1 }',
    m: { polaca: 'a 5 > BF 9 1 b :=' },
    casos: [
      { inicial: { a: 7, b: 0 }, esperado: { b: 1 } },
      { inicial: { a: 2, b: 0 }, esperado: { b: 0 } },
      { inicial: { a: 5, b: 0 }, esperado: { b: 0 } }
    ]
  },
  {
    id: 'p5-ifelse', t: 'Selección con else', fuente: 'Práctica 5 · if-else', nivel: 'difícil', notaciones: ['polaca'],
    c: 'Generá la polaca de:  if ( a > 5 ) { b := 1 } else { b := 2 }   Vas a necesitar el BF para saltar al else y un BI para saltear el else cuando la condición es verdadera.',
    programa: 'if (a > 5) { b := 1 } else { b := 2 }',
    m: { polaca: 'a 5 > BF 11 1 b := BI 14 2 b :=' },
    casos: [
      { inicial: { a: 7, b: 0 }, esperado: { b: 1 } },
      { inicial: { a: 1, b: 0 }, esperado: { b: 2 } }
    ]
  },
  {
    id: 'p5-while', t: 'Ciclo while', fuente: 'Práctica 5 · while', nivel: 'difícil', notaciones: ['polaca'],
    c: 'Generá la polaca de:  while ( i < 3 ) { i := i + 1 }   Acordate del salto incondicional que vuelve al comienzo de la condición.',
    programa: 'while (i < 3) { i := i + 1 }',
    m: { polaca: 'i 3 < BF 13 i 1 + i := BI 1' },
    casos: [
      { inicial: { i: 0 }, esperado: { i: 3 } },
      { inicial: { i: 5 }, esperado: { i: 5 } }
    ]
  },
  {
    id: 'p5-acum', t: 'While con acumulador', fuente: 'Práctica 5 · variante', nivel: 'difícil', notaciones: ['polaca'],
    c: 'Generá la polaca de:  while ( i < n ) { s := s + i   i := i + 1 }',
    programa: 'while (i < n) { s := s + i;  i := i + 1 }',
    m: { polaca: 'i n < BF 18 s i + s := i 1 + i := BI 1' },
    casos: [
      { inicial: { i: 0, n: 4, s: 0 }, esperado: { s: 6, i: 4 } },
      { inicial: { i: 0, n: 1, s: 10 }, esperado: { s: 10, i: 1 } }
    ]
  },
  {
    id: 'p5-minimo', t: 'Mínimo entre dos', fuente: 'Práctica 5 · Mínimo', nivel: 'difícil', notaciones: ['polaca'],
    c: 'El ejercicio “Mínimo” de la cátedra. Generá la polaca de:  if ( a < b ) { m := a } else { m := b }',
    programa: 'if (a < b) { m := a } else { m := b }',
    m: { polaca: 'a b < BF 11 a m := BI 14 b m :=' },
    casos: [
      { inicial: { a: 3, b: 8 }, esperado: { m: 3 } },
      { inicial: { a: 9, b: 4 }, esperado: { m: 4 } },
      { inicial: { a: 5, b: 5 }, esperado: { m: 5 } }
    ]
  },
  {
    id: 'p5-anidado', t: 'If anidado dentro de un while', fuente: 'Práctica 5 · anidamiento', nivel: 'difícil', notaciones: ['polaca'],
    c: 'Acá se ve para qué sirve la PILA de celdas: hay dos saltos pendientes a la vez. Generá la polaca de:  while ( i < n ) { if ( i > 1 ) { s := s + i }   i := i + 1 }',
    programa: 'while (i < n) { if (i > 1) { s := s + i }  i := i + 1 }',
    m: { polaca: 'i n < BF 23 i 1 > BF 16 s i + s := i 1 + i := BI 1' },
    casos: [
      { inicial: { i: 0, n: 5, s: 0 }, esperado: { s: 9, i: 5 } },
      { inicial: { i: 0, n: 2, s: 0 }, esperado: { s: 0, i: 2 } }
    ]
  }
]
