/* Banco de ejercicios de GRAMÁTICAS LIBRES DE CONTEXTO.
   Cubre toda la Práctica 2 más extras de parciales y del lenguaje L1_aho.
   Las cadenas de prueba son secuencias de TOKENS separados por espacios.

   IMPORTANTE (honestidad del validador): el reconocedor comprueba el LENGUAJE, es decir
   qué cadenas acepta y cuáles rechaza tu gramática. La PRECEDENCIA y la ASOCIATIVIDAD
   no cambian el lenguaje (solo la forma del árbol), así que en esos ejercicios el campo
   `nota` avisa que hay que compararlas con el modelo. */

export const GLC_EJ = [
  {
    id: 'p2-1', t: 'Expresiones aritméticas simples', fuente: 'Práctica 2 · Ej. 1', nivel: 'básico',
    c: 'Gramática BNF que reconozca expresiones con sumas, restas, multiplicaciones y divisiones sobre constantes enteras e identificadores. Usá tokens para los elementos léxicos (id, cte).',
    m: 'E -> E + F | E - F | E * F | E / F | F\nF -> id | cte',
    ac: ['id', 'cte', 'id + cte', 'id - cte', 'id * cte', 'id / cte', 'id + cte * id', 'cte / id - cte + id'],
    rc: ['', '+ id', 'id +', 'id id', '+ ', 'id + + cte', '( id )', 'id := cte']
  },
  {
    id: 'p2-2', t: 'Expresiones con precedencia', fuente: 'Práctica 2 · Ej. 2', nivel: 'medio',
    c: 'La misma gramática, pero donde la multiplicación y la división tengan prioridad sobre la suma y la resta. Se logra con niveles: expresión → término → factor.',
    nota: 'El validador comprueba el lenguaje (las mismas cadenas que el Ej. 1). Para verificar la PRECEDENCIA compará la forma de tus reglas con el modelo: tiene que haber un nivel para + − y otro, más profundo, para * /.',
    m: 'E -> E + T | E - T | T\nT -> T * F | T / F | F\nF -> id | cte',
    ac: ['id', 'cte', 'id + cte', 'id + cte * id', 'id * cte + id', 'cte / id - cte'],
    rc: ['', '+ id', 'id +', 'id id', '( id )', 'id * * cte']
  },
  {
    id: 'p2-3', t: 'Expresiones con paréntesis', fuente: 'Práctica 2 · Ej. 3', nivel: 'medio',
    c: 'Agregá a la gramática anterior la posibilidad de usar expresiones entre paréntesis.',
    m: 'E -> E + T | E - T | T\nT -> T * F | T / F | F\nF -> id | cte | ( E )',
    ac: ['id', '( id )', '( id + cte ) * id', 'id * ( cte + id )', '( ( id ) )', '( id + cte ) / ( id - cte )'],
    rc: ['', '( id', 'id )', '( )', '( id + )', 'id ( cte )', ') id (']
  },
  {
    id: 'p2-4', t: 'Asignación simple', fuente: 'Práctica 2 · Ej. 4', nivel: 'medio',
    c: 'BNF que reconozca asignaciones con un lado izquierdo (un identificador) y un lado derecho (una expresión aritmética con paréntesis, como la del ejercicio anterior).',
    m: 'A -> id := E\nE -> E + T | E - T | T\nT -> T * F | T / F | F\nF -> id | cte | ( E )',
    ac: ['id := cte', 'id := id + cte', 'id := ( id / cte ) + id', 'id := ( id )'],
    rc: ['', 'id :=', ':= cte', 'id cte', 'cte := id', 'id := ( cte', 'id = cte', 'id := id :=']
  },
  {
    id: 'p2-6', t: 'Asignación múltiple', fuente: 'Práctica 2 · Ej. 6a', nivel: 'difícil',
    c: 'Asignación múltiple del estilo a := inc := minimo := expresion ; donde varias variables reciben el mismo valor. La sentencia termina con ";" y el valor de la derecha es una expresión con paréntesis.',
    m: 'A -> id := R\nR -> id := R | E ;\nE -> E + T | E - T | T\nT -> T * F | T / F | F\nF -> id | cte | ( E )',
    ac: ['id := cte ;', 'id := id := cte ;', 'id := id := id := id + cte ;', 'id := id := ( id * cte ) ;'],
    rc: ['', 'id := cte', 'id := ;', ':= cte ;', 'id ;', 'id := id := ;', 'cte := id ;']
  },
  {
    id: 'p2-7', t: 'Programa con INICIO y FIN', fuente: 'Práctica 2 · Ej. 7', nivel: 'difícil',
    c: 'Programas que admitan asignaciones simples y múltiples, una o muchas sentencias, cada una terminada en ";". El programa empieza con la palabra reservada INICIO y termina con FIN.',
    m: 'P -> INICIO S FIN\nS -> S A | A\nA -> id := R\nR -> id := R | E ;\nE -> E + T | E - T | T\nT -> T * F | T / F | F\nF -> id | cte | ( E )',
    ac: [
      'INICIO id := cte ; FIN',
      'INICIO id := cte ; id := id := cte ; FIN',
      'INICIO id := ( id / cte ) + id ; FIN',
      'INICIO id := cte ; id := cte ; id := cte ; FIN'
    ],
    rc: ['', 'INICIO FIN', 'id := cte ;', 'INICIO id := cte ;', 'id := cte ; FIN', 'INICIO id := cte FIN', 'FIN id := cte ; INICIO']
  },
  {
    id: 'p2-11', t: 'Sentencia ASIGNAR', fuente: 'Práctica 2 · Ej. 11', nivel: 'difícil',
    c: 'La sentencia ASIGNAR [id, id, …, id] = [exp, exp, …, exp]. Ambas listas tienen cantidad ilimitada de elementos separados por comas y como mínimo un elemento cada una.',
    nota: 'Que ambas listas tengan la MISMA cantidad de elementos no se puede exigir con una gramática libre de contexto: es una validación SEMÁNTICA. La gramática solo garantiza la forma y el mínimo de un elemento.',
    m: 'S -> ASIGNAR [ LID ] = [ LEXP ]\nLID -> LID , id | id\nLEXP -> LEXP , E | E\nE -> E + T | E - T | T\nT -> T * F | T / F | F\nF -> id | cte | ( E )',
    ac: [
      'ASIGNAR [ id ] = [ cte ]',
      'ASIGNAR [ id , id , id ] = [ cte , id + id , cte * cte + id ]',
      'ASIGNAR [ id ] = [ id * cte ]',
      'ASIGNAR [ id , id ] = [ cte ]'
    ],
    rc: ['', 'ASIGNAR [ ] = [ cte ]', 'ASIGNAR [ id ] = [ ]', 'ASIGNAR id = cte', 'ASIGNAR [ id ] [ cte ]', 'ASIGNAR [ id , ] = [ cte ]', '[ id ] = [ cte ]']
  },
  {
    id: 'p2-12', t: 'ASIGNAR con ALIAS', fuente: 'Práctica 2 · Ej. 12', nivel: 'difícil',
    c: 'Extendé la gramática anterior con una tercera lista opcional, precedida por la palabra ALIAS y entre corchetes. Cada elemento asocia un id con una sublista de alias mediante "->", y los elementos se separan con ";" (la coma queda para los alias de cada id).',
    m: 'S -> ASIGNAR [ LID ] = [ LEXP ] AL\nAL -> ALIAS [ LA ] | ε\nLA -> LA ; A1 | A1\nA1 -> id -> LIDA\nLIDA -> LIDA , id | id\nLID -> LID , id | id\nLEXP -> LEXP , E | E\nE -> E + T | E - T | T\nT -> T * F | T / F | F\nF -> id | cte | ( E )',
    ac: [
      'ASIGNAR [ id ] = [ cte ]',
      'ASIGNAR [ id , id ] = [ cte , id ] ALIAS [ id -> id ]',
      'ASIGNAR [ id , id , id ] = [ cte , id , cte ] ALIAS [ id -> id , id , id ; id -> id , id ]',
      'ASIGNAR [ id ] = [ cte ] ALIAS [ id -> id ; id -> id ]'
    ],
    rc: [
      'ASIGNAR [ id ] = [ cte ] ALIAS [ ]',
      'ASIGNAR [ id ] = [ cte ] ALIAS id -> id',
      'ASIGNAR [ id ] = [ cte ] ALIAS [ id -> ]',
      'ASIGNAR [ id ] = [ cte ] ALIAS [ -> id ]',
      'ASIGNAR [ id ] = [ cte ] [ id -> id ]'
    ]
  },
  {
    id: 'ex-par', t: 'Paréntesis balanceados', fuente: 'Extra · clásico', nivel: 'básico',
    c: 'Gramática que genere secuencias de paréntesis balanceados, incluida la cadena vacía. Es el ejemplo de que una GLC puede lo que una expresión regular no.',
    m: 'S -> ( S ) S | ε',
    ac: ['', '( )', '( ( ) )', '( ) ( )', '( ( ) ( ) )', '( ) ( ) ( )'],
    rc: ['(', ')', '( (', '( ) )', ') (', '( ) ) (']
  },
  {
    id: 'ex-anbn', t: 'Lenguaje a^n b^n', fuente: 'Extra · GLC vs ER', nivel: 'medio',
    c: 'Gramática para el lenguaje formado por n símbolos a seguidos de n símbolos b (con n ≥ 0). El clásico ejemplo de lo que NO puede describir una expresión regular, porque hay que contar.',
    m: 'S -> a S b | ε',
    ac: ['', 'a b', 'a a b b', 'a a a b b b'],
    rc: ['a', 'b', 'b a', 'a b b', 'a a b', 'a b a b']
  },
  {
    id: 'ex-lista', t: 'Lista de identificadores', fuente: 'Extra · práctica', nivel: 'básico',
    c: 'Uno o más identificadores separados por comas. No puede haber coma al principio ni al final.',
    m: 'L -> L , id | id',
    ac: ['id', 'id , id', 'id , id , id', 'id , id , id , id'],
    rc: ['', ', id', 'id ,', 'id id', 'id , , id', ',']
  },
  {
    id: 'ex-canonica', t: 'Gramática canónica de la cátedra', fuente: 'Apunte · la que aparece en todos lados', nivel: 'medio',
    c: 'La gramática que usa la cátedra como hilo conductor: una asignación cuyo lado derecho son sumas de términos y productos de factores, con id y cte como operandos.',
    m: 'A -> id := E\nE -> E + T | T\nT -> T * F | F\nF -> id | cte',
    ac: ['id := id', 'id := cte', 'id := id * cte + cte', 'id := id + id + id', 'id := id * id * id'],
    rc: ['', 'id := ', 'id id', ':= id', 'id := id +', 'id := ( id )', 'id := id - cte']
  },
  {
    id: 'ex-if', t: 'Selección if … then … endif', fuente: 'Práctica 1 · Ej. 4g', nivel: 'medio',
    c: 'Sentencia de selección sin else, con el formato: if cond then bloque endif. La condición usa ==, > o < y admite expresiones a ambos lados. El bloque tiene una o más asignaciones terminadas en ";".',
    m: 'S -> if C then B endif\nC -> E == E | E > E | E < E\nB -> B A | A\nA -> id := E ;\nE -> E + T | T\nT -> T * F | F\nF -> id | cte',
    ac: [
      'if id > cte then id := cte ; endif',
      'if id + cte == cte then id := id + cte ; endif',
      'if id < id then id := cte ; id := id ; endif'
    ],
    rc: ['', 'if id > cte then endif', 'if id > cte then id := cte ;', 'id := cte ;', 'if then id := cte ; endif', 'if id > cte id := cte ; endif']
  },
  {
    id: 'ex-ifelse', t: 'Selección con else', fuente: 'Extra · temas comunes', nivel: 'medio',
    c: 'Ídem anterior pero con rama else opcional: if cond then bloque else bloque endif. El endif obligatorio evita la ambigüedad del else colgante.',
    m: 'S -> if C then B EOPT endif\nEOPT -> else B | ε\nC -> E == E | E > E | E < E\nB -> B A | A\nA -> id := E ;\nE -> E + T | T\nT -> T * F | F\nF -> id | cte',
    ac: [
      'if id > cte then id := cte ; endif',
      'if id > cte then id := cte ; else id := id ; endif',
      'if id == cte then id := cte ; id := cte ; else id := id ; endif'
    ],
    rc: ['', 'if id > cte then else endif', 'if id > cte then id := cte ; else endif', 'if id > cte then id := cte ; else id := id ;', 'else id := cte ; endif']
  },
  {
    id: 'ex-while', t: 'Ciclo while con llaves', fuente: 'Extra · temas comunes', nivel: 'medio',
    c: 'Ciclo con el formato while ( cond ) { bloque }, donde el bloque tiene una o más asignaciones terminadas en ";".',
    m: 'S -> while ( C ) { B }\nC -> E == E | E > E | E < E\nB -> B A | A\nA -> id := E ;\nE -> E + T | T\nT -> T * F | F\nF -> id | cte',
    ac: [
      'while ( id > cte ) { id := cte ; }',
      'while ( id + cte < cte ) { id := id + cte ; id := cte ; }'
    ],
    rc: ['', 'while ( id > cte ) { }', 'while id > cte { id := cte ; }', 'while ( id > cte ) id := cte ;', 'while ( ) { id := cte ; }']
  },
  {
    id: 'ex-decvar', t: 'Bloque de declaraciones DECVAR', fuente: 'Práctica 1 · Ej. 5', nivel: 'medio',
    c: 'Bloque que empieza con DECVAR y termina con ENDDEC. Adentro, una o más declaraciones: una lista de identificadores separados por comas, dos puntos, el tipo (Integer o Float) y punto y coma.',
    m: 'D -> DECVAR LD ENDDEC\nLD -> LD DEC | DEC\nDEC -> LID : TIPO ;\nLID -> LID , id | id\nTIPO -> Integer | Float',
    ac: [
      'DECVAR id : Integer ; ENDDEC',
      'DECVAR id : Integer ; id : Float ; ENDDEC',
      'DECVAR id , id : Float ; ENDDEC',
      'DECVAR id , id , id : Integer ; id : Float ; ENDDEC'
    ],
    rc: ['', 'DECVAR ENDDEC', 'DECVAR id : Integer ENDDEC', 'DECVAR id Integer ; ENDDEC', 'id : Integer ;', 'DECVAR id : String ; ENDDEC', 'DECVAR , id : Integer ; ENDDEC']
  },
  {
    id: 'l1-when', t: 'matchPatterns (when) de tu TP', fuente: 'Tu TP · TE1', nivel: 'difícil',
    c: 'Tu tema especial: when ( expresión ) { ramas } con rama else opcional. Cada rama es un patrón seguido de un bloque entre llaves. Los patrones son: is cte (valor exacto), in cte .. cte (rango) o is OPREL cte (guarda). Debe haber al menos una rama y el else, si está, va al final.',
    m: 'W -> when ( E ) { RS EOPT }\nRS -> RS R | R\nR -> P { B }\nP -> is cte | in cte .. cte | is OPREL cte\nOPREL -> < | > | == | <= | >=\nEOPT -> else { B } | ε\nB -> id := E ;\nE -> E + T | T\nT -> T * F | F\nF -> id | cte',
    ac: [
      'when ( id ) { is cte { id := cte ; } }',
      'when ( id ) { is cte { id := cte ; } in cte .. cte { id := cte ; } }',
      'when ( id ) { is < cte { id := cte ; } else { id := cte ; } }',
      'when ( id + cte ) { is cte { id := cte ; } in cte .. cte { id := cte ; } is >= cte { id := cte ; } else { id := cte ; } }'
    ],
    rc: [
      '', 'when ( id ) { }', 'when ( id ) { else { id := cte ; } }',
      'when ( id ) { is cte { id := cte ; }',
      'when id { is cte { id := cte ; } }',
      'when ( id ) { is id { id := cte ; } }',
      'when ( id ) { in cte cte { id := cte ; } }'
    ]
  },
  {
    id: 'ex-listas-anid', t: 'Listas anidadas entre paréntesis', fuente: 'Parcial 1C 2016 · Ej. 2', nivel: 'difícil',
    c: 'Cada línea puede tener un solo nodo o una sola lista. Un nodo es NUM o SYM. Una lista va entre paréntesis, puede estar vacía y puede contener cualquier cantidad de nodos o de listas adentro.',
    m: 'PROG -> PROG LINEA | LINEA\nLINEA -> NODO | LISTA\nLISTA -> ( ELEM ) | ( )\nELEM -> ELEM LINEA | LINEA\nNODO -> NUM | SYM',
    ac: ['NUM', '( NUM SYM )', '( )', '( SYM ( ) NUM ( NUM SYM ) )', '( ( NUM ) ( SYM NUM ( ) ) )'],
    rc: ['', '(', ')', '( NUM', 'NUM )', '( ( NUM )']
  },
  {
    id: 'ex-booleanas', t: 'Expresiones booleanas con precedencia', fuente: 'Extra · temas comunes', nivel: 'medio',
    c: 'Condiciones con AND, OR y NOT, donde NOT liga más fuerte que AND y AND más que OR. Los operandos son comparaciones entre id y cte.',
    nota: 'El validador comprueba el lenguaje. La precedencia entre AND, OR y NOT se verifica mirando los niveles de tus reglas contra el modelo.',
    m: 'B -> B OR C | C\nC -> C AND D | D\nD -> NOT D | ( B ) | R\nR -> id < cte | id > cte | id == cte',
    ac: ['id < cte', 'id < cte AND id > cte', 'NOT id == cte', 'id < cte OR id > cte AND id == cte', '( id < cte OR id > cte ) AND NOT id == cte'],
    rc: ['', 'AND id < cte', 'id < cte AND', 'NOT', 'id cte', '( id < cte']
  },
  {
    id: 'ex-bloque', t: 'Bloque begin … end', fuente: 'Extra · temas comunes', nivel: 'medio',
    c: 'Un bloque delimitado por begin y end que contiene una o más sentencias, cada una terminada en ";". Una sentencia es una asignación o un bloque anidado.',
    m: 'B -> begin S end\nS -> S T | T\nT -> id := E ; | B\nE -> E + F | F\nF -> id | cte',
    ac: ['begin id := cte ; end', 'begin id := cte ; id := id + cte ; end', 'begin begin id := cte ; end end'],
    rc: ['', 'begin end', 'begin id := cte ; ', 'id := cte ;', 'begin id := cte end']
  },
  {
    id: 'ex-llamada', t: 'Llamada a función con parámetros', fuente: 'Extra · estilo parcial', nivel: 'medio',
    c: 'Una llamada con el formato id ( lista ) donde la lista de parámetros puede estar vacía o tener una o más expresiones separadas por comas.',
    m: 'L -> id ( P )\nP -> LP | ε\nLP -> LP , E | E\nE -> E + T | T\nT -> id | cte',
    ac: ['id ( )', 'id ( id )', 'id ( id , cte )', 'id ( id + cte , cte , id )'],
    rc: ['', 'id ( , id )', 'id ( id , )', 'id id', 'id (', '( id )']
  },
  {
    id: 'ex-readwrite', t: 'Sentencias READ y WRITE', fuente: 'Práctica 1 · Ej. 4h y 5', nivel: 'básico',
    c: 'Un programa con una o más sentencias, cada una terminada en ";". Las sentencias pueden ser: una asignación, un READ de una variable, o un WRITE de una variable o de una cadena.',
    m: 'P -> P S | S\nS -> id := E ; | READ id ; | WRITE id ; | WRITE cadena ;\nE -> E + T | T\nT -> id | cte',
    ac: ['READ id ;', 'WRITE cadena ;', 'WRITE id ;', 'READ id ; id := id + cte ; WRITE id ;'],
    rc: ['', 'READ ;', 'WRITE ;', 'READ id', 'READ cadena ;', 'id := ;']
  }
]
