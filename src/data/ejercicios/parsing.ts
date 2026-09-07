/* Banco de PARSING ASCENDENTE (Práctica 3).
   La respuesta modelo no se guarda: la calcula el motor (primeros, siguientes, estados y tabla SLR),
   así que siempre es consistente con la gramática del enunciado.
   `pedir`: 'primeros' | 'siguientes' | 'ambos' | 'conflictos' */

import type { EjercicioParsing } from '../../tipos/ejercicios.ts'

export const PARSING_EJ: EjercicioParsing[] = [
  {
    id: 'p3-canonica', t: 'Gramática canónica: primeros y siguientes', fuente: 'Apunte · la de siempre', nivel: 'básico',
    c: 'Calculá los conjuntos PRIMEROS y SIGUIENTES de la gramática que la cátedra usa como hilo conductor. Cargá un no terminal por línea.',
    gramatica: 'A -> id := E\nE -> E + T | T\nT -> T * F | F\nF -> id | cte',
    pedir: 'ambos'
  },
  {
    id: 'p3-practica', t: 'Gramática de la práctica: primeros y siguientes', fuente: 'Práctica 3 · Ej. 1', nivel: 'básico',
    c: 'La gramática de la práctica, con los terminales fin, := y exp. Calculá PRIMEROS y SIGUIENTES.',
    gramatica: 'P -> L E fin\nL -> L , id | id\nE -> := exp',
    pedir: 'ambos'
  },
  {
    id: 'p3-parentesis', t: 'Expresiones con paréntesis', fuente: 'Práctica 2 · Ej. 3 → parsing', nivel: 'medio',
    c: 'Calculá los conjuntos de la gramática de expresiones con paréntesis. Prestá atención a cómo el paréntesis entra en los PRIMEROS.',
    gramatica: 'E -> E + T | E - T | T\nT -> T * F | T / F | F\nF -> id | cte | ( E )',
    pedir: 'ambos'
  },
  {
    id: 'p3-nulos', t: 'Gramática con reglas vacías', fuente: 'Extra · anulables', nivel: 'difícil',
    c: 'Acá hay no terminales que pueden derivar la cadena vacía. Eso cambia los PRIMEROS (aparece ε) y hace que los SIGUIENTES se propaguen. Calculá ambos conjuntos.',
    gramatica: 'S -> A B c\nA -> a | ε\nB -> b | ε',
    pedir: 'ambos'
  },
  {
    id: 'p3-siguientes', t: 'Solo SIGUIENTES de la asignación múltiple', fuente: 'Práctica 2 · Ej. 6 → parsing', nivel: 'medio',
    c: 'Calculá únicamente los conjuntos SIGUIENTES. Acordate: $ arranca en el siguiente del símbolo distinguido, y un no terminal al final de una regla hereda los siguientes del de la izquierda.',
    gramatica: 'A -> id := R\nR -> id := R | E ;\nE -> E + T | T\nT -> id | cte',
    pedir: 'siguientes'
  },
  {
    id: 'p3-primeros', t: 'Solo PRIMEROS de la sentencia ASIGNAR', fuente: 'Práctica 2 · Ej. 11 → parsing', nivel: 'medio',
    c: 'Calculá únicamente los conjuntos PRIMEROS de la gramática de la sentencia ASIGNAR.',
    gramatica: 'S -> ASIGNAR [ LID ] = [ LEXP ]\nLID -> LID , id | id\nLEXP -> LEXP , E | E\nE -> E + T | T\nT -> id | cte',
    pedir: 'primeros'
  },
  {
    id: 'p3-ambigua', t: '¿Es SLR? Gramática ambigua', fuente: 'Parcial 1C 2016 · Ej. 4', nivel: 'medio',
    c: 'Construí el parsing ascendente de esta gramática y decidí si es SLR. Si no lo es, mirá la solución para ver en qué celdas aparecen los conflictos y de qué tipo son.',
    gramatica: 'E -> E : E | E + E | id | ( E )',
    pedir: 'conflictos'
  },
  {
    id: 'p3-slr-ok', t: '¿Es SLR? Gramática estratificada', fuente: 'Extra · contraste', nivel: 'medio',
    c: 'La misma idea que la anterior pero con la gramática escrita en niveles. ¿Sigue habiendo conflictos? Compará con el ejercicio anterior: mismo lenguaje, distinta gramática.',
    gramatica: 'E -> E + T | T\nT -> T : F | F\nF -> id | ( E )',
    pedir: 'conflictos'
  },
  {
    id: 'p3-coord', t: 'Parsing del parcial: constantes coordenada', fuente: 'Parcial 2C 2024 · Ej. 2', nivel: 'difícil',
    c: 'La gramática que tomaron en el parcial. Calculá PRIMEROS y SIGUIENTES; después mirá la solución para comparar la tabla SLR completa y verificar si hay conflictos.',
    gramatica: 'A -> EC | C D\nEC -> EC - ctec | ctec | B - EC\nB -> cten\nD -> ( cten )\nC -> ctec',
    pedir: 'ambos'
  },
  {
    id: 'p3-when', t: 'Parsing de tu matchPatterns', fuente: 'Tu TP · TE1', nivel: 'difícil',
    c: 'Una versión reducida de tu sentencia when. Calculá PRIMEROS y SIGUIENTES, y revisá en la solución si la gramática es SLR.',
    gramatica: 'W -> when ( id ) { RS }\nRS -> RS R | R\nR -> is cte { id }',
    pedir: 'ambos'
  }
]
