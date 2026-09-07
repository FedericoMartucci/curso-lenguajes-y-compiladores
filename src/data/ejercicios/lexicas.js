/* Banco de ejercicios de ACCIONES LÉXICAS.
   Idea central del parcial: la EXPRESIÓN REGULAR reconoce la FORMA del lexema;
   la ACCIÓN LÉXICA valida la COTA (rango de valor o longitud). Un lexema con forma
   correcta pero fuera de cota se rechaza EN LA ACCIÓN, en tiempo de compilación (etapa léxica).
   Los tests incluyen siempre los valores LÍMITE (la cota exacta y la cota + 1). */

const rep = (s, n) => new Array(n + 1).join(s)

export const LEX_EJ = [
  {
    id: 'l1-int', t: 'Constante entera con cota (Int de L1_aho)', fuente: 'Tu lenguaje · Lexico.l', nivel: 'básico',
    c: 'Constante entera sin signo. El valor máximo del tipo Int es 32767. Cuidado: la cota NO va en la expresión regular.',
    cj: 'DIGITO  [0-9]', mER: '{DIGITO}+', atr: 'valor', op: '<=', cota: 32767,
    tests: [
      { v: '0', ok: true }, { v: '100', ok: true }, { v: '32766', ok: true },
      { v: '32767', ok: true, nota: 'la cota exacta se acepta' },
      { v: '32768', ok: false, por: 'cota', nota: 'un valor más que la cota' },
      { v: '99999', ok: false, por: 'cota' },
      { v: '12a', ok: false, por: 'ER' }, { v: '', ok: false, por: 'ER' },
      { v: '-5', ok: false, por: 'ER' }, { v: '1.5', ok: false, por: 'ER' }
    ]
  },
  {
    id: 'p1-4a', t: 'Constante entera positiva hasta 32676', fuente: 'Práctica 1 · Ej. 4a', nivel: 'básico',
    c: 'El lenguaje nuevo admite constantes enteras positivas hasta 32676 (ojo: no es 32767).',
    cj: 'DIGITO  [0-9]', mER: '{DIGITO}+', atr: 'valor', op: '<=', cota: 32676,
    tests: [
      { v: '0', ok: true }, { v: '32675', ok: true },
      { v: '32676', ok: true, nota: 'cota exacta' },
      { v: '32677', ok: false, por: 'cota' },
      { v: '32767', ok: false, por: 'cota', nota: 'sería válido en L1_aho, acá no' },
      { v: 'abc', ok: false, por: 'ER' }, { v: '-1', ok: false, por: 'ER' }
    ]
  },
  {
    id: 'l1-str50', t: 'String con longitud máxima 50', fuente: 'Tu lenguaje · Lexico.l', nivel: 'medio',
    c: 'String entre comillas dobles. El contenido (sin contar las comillas) no puede superar 50 caracteres.',
    cj: 'LETRA    [a-zA-Z]\nDIGITO   [0-9]\nCOMILLA  ["]',
    mER: '{COMILLA}({LETRA}|{DIGITO})*{COMILLA}', atr: 'longitud_sin_comillas', op: '<=', cota: 50,
    tests: [
      { v: '""', ok: true }, { v: '"hola"', ok: true },
      { v: '"' + rep('a', 49) + '"', ok: true },
      { v: '"' + rep('a', 50) + '"', ok: true, nota: 'exactamente 50: se acepta' },
      { v: '"' + rep('a', 51) + '"', ok: false, por: 'cota', nota: '51 caracteres' },
      { v: 'hola', ok: false, por: 'ER' }, { v: '"hola', ok: false, por: 'ER' },
      { v: '"a b"', ok: false, por: 'ER', nota: 'el espacio no está en la ER' }
    ]
  },
  {
    id: 'p1-1g-rango', t: 'Constante real en el rango −64556 a 64556', fuente: 'Práctica 1 · Ej. 1g', nivel: 'medio',
    c: 'Constante real xx.xx con signo opcional. El valor debe estar entre −64556 y 64556.',
    cj: 'DIGITO  [0-9]', mER: '"-"?{DIGITO}+"."{DIGITO}+', atr: 'valor_abs', op: '<=', cota: 64556,
    tests: [
      { v: '0.0', ok: true }, { v: '12.34', ok: true },
      { v: '64556.0', ok: true, nota: 'cota exacta positiva' },
      { v: '-64556.0', ok: true, nota: 'cota exacta negativa' },
      { v: '64556.1', ok: false, por: 'cota' },
      { v: '-70000.5', ok: false, por: 'cota' },
      { v: '12', ok: false, por: 'ER' }, { v: '.5', ok: false, por: 'ER' }, { v: '12.', ok: false, por: 'ER' }
    ]
  },
  {
    id: 'l1-float', t: 'Constante Float con cota del tipo', fuente: 'Tu lenguaje · Lexico.l', nivel: 'medio',
    c: 'Constante real sin signo. No puede superar el máximo de un float: 3.4028235e38.',
    cj: 'DIGITO  [0-9]', mER: '{DIGITO}+"."{DIGITO}+', atr: 'valor', op: '<=', cota: 3.4028235e38,
    tests: [
      { v: '0.0', ok: true }, { v: '3.14', ok: true }, { v: '123456.789', ok: true },
      { v: rep('9', 39) + '.0', ok: false, por: 'cota', nota: 'desborda el float' },
      { v: '3', ok: false, por: 'ER' }, { v: '-3.14', ok: false, por: 'ER' }
    ]
  },
  {
    id: 'p1-1a-len', t: 'Código postal controlado por longitud', fuente: 'Práctica 1 · Ej. 1a (2da forma)', nivel: 'medio',
    c: 'La otra solución del apunte: la ER dice "dígito distinto de cero seguido de uno o más dígitos" y la acción léxica controla que la longitud sea exactamente 4.',
    cj: 'DIGITO   [0-9]\nDIGITO1  [1-9]', mER: '{DIGITO1}{DIGITO}+', atr: 'longitud', op: '==', cota: 4,
    tests: [
      { v: '1234', ok: true }, { v: '9000', ok: true },
      { v: '123', ok: false, por: 'cota', nota: 'tres dígitos' },
      { v: '12345', ok: false, por: 'cota', nota: 'cinco dígitos' },
      { v: '0123', ok: false, por: 'ER', nota: 'empieza con cero: lo corta la ER' },
      { v: '1', ok: false, por: 'ER' }, { v: 'abcd', ok: false, por: 'ER' }
    ]
  },
  {
    id: 'p1-4b', t: 'Identificador con máximo 5 guiones bajos', fuente: 'Práctica 1 · Ej. 4b', nivel: 'difícil',
    c: 'Identificador que empieza con letra y sigue con letras, dígitos o guiones bajos. A lo largo del identificador NO puede haber más de 5 guiones bajos: eso se cuenta en la acción léxica.',
    cj: 'LETRA   [a-zA-Z]\nDIGITO  [0-9]', mER: '{LETRA}({LETRA}|{DIGITO}|"_")*',
    atr: 'cant_guiones_bajos', op: '<=', cota: 5,
    tests: [
      { v: 'contador', ok: true, nota: 'cero guiones bajos' },
      { v: 'mi_var', ok: true },
      { v: 'a_b_c_d_e_f', ok: true, nota: 'exactamente 5 guiones bajos' },
      { v: 'a_b_c_d_e_f_g', ok: false, por: 'cota', nota: '6 guiones bajos' },
      { v: 'a______b', ok: false, por: 'cota', nota: '6 seguidos' },
      { v: '_abc', ok: false, por: 'ER', nota: 'no puede empezar con guión bajo' },
      { v: '1abc', ok: false, por: 'ER' }, { v: 'a-b', ok: false, por: 'ER' }
    ]
  },
  {
    id: 'ex-id-len', t: 'Identificador con longitud máxima', fuente: 'Extra · estilo parcial', nivel: 'básico',
    c: 'Identificador (letra seguida de letras o dígitos) que no puede superar los 15 caracteres.',
    cj: 'LETRA   [a-zA-Z]\nDIGITO  [0-9]', mER: '{LETRA}({LETRA}|{DIGITO})*', atr: 'longitud', op: '<=', cota: 15,
    tests: [
      { v: 'a', ok: true }, { v: 'contador', ok: true },
      { v: rep('a', 15), ok: true, nota: 'longitud exacta' },
      { v: rep('a', 16), ok: false, por: 'cota' },
      { v: '1abc', ok: false, por: 'ER' }, { v: 'a_b', ok: false, por: 'ER' }
    ]
  },
  {
    id: 'ex-coord-len', t: 'Constante coordenada con tope de 64 caracteres', fuente: 'Parcial 2C 2024', nivel: 'difícil',
    c: 'La constante coordenada del parcial: la forma la da la ER, pero el total no puede pasar de 64 caracteres. Esa cota va en la acción léxica.',
    cj: 'D   [0-9]\nD1  [1-9]',
    mER: '(({D1}{D1}":"{D}{D}|"100")"%")*{D1}{D1}":"{D}{D}"#"',
    atr: 'longitud', op: '<=', cota: 64,
    tests: [
      { v: '92:00#', ok: true }, { v: '99:45%33:27#', ok: true },
      { v: rep('11:11%', 9) + '11:11#', ok: true, nota: '60 caracteres' },
      { v: rep('11:11%', 11) + '11:11#', ok: false, por: 'cota', nota: '72 caracteres' },
      { v: '9:45#', ok: false, por: 'ER' }, { v: '92:00', ok: false, por: 'ER', nota: 'sin el # de cierre' }
    ]
  },
  {
    id: 'ex-str-libre', t: 'String de contenido libre con tope', fuente: 'Práctica 1 · Ej. 4c', nivel: 'medio',
    c: 'String que admite cualquier texto entre comillas, con un máximo de 30 caracteres de contenido.',
    cj: 'NOCOMILLA  [^"]\nCOMILLA    ["]',
    mER: '{COMILLA}{NOCOMILLA}*{COMILLA}', atr: 'longitud_sin_comillas', op: '<=', cota: 30,
    tests: [
      { v: '""', ok: true }, { v: '"hola mundo!"', ok: true },
      { v: '"' + rep('x', 30) + '"', ok: true, nota: 'cota exacta' },
      { v: '"' + rep('x', 31) + '"', ok: false, por: 'cota' },
      { v: 'hola', ok: false, por: 'ER' }, { v: '"abc', ok: false, por: 'ER' }
    ]
  },
  {
    id: 'ex-id-guiones2', t: 'Identificador con máximo 2 guiones medios', fuente: 'Extra · variante de la Práctica 1', nivel: 'medio',
    c: 'Identificador que empieza con letra y sigue con letras, dígitos o guiones medios, con un máximo de 2 guiones en todo el identificador.',
    cj: 'LETRA   [a-zA-Z]\nDIGITO  [0-9]', mER: '{LETRA}({LETRA}|{DIGITO}|"-")*',
    atr: 'cant_guiones', op: '<=', cota: 2,
    tests: [
      { v: 'contador', ok: true }, { v: 'a-b', ok: true },
      { v: 'a-b-c', ok: true, nota: 'exactamente 2' },
      { v: 'a-b-c-d', ok: false, por: 'cota', nota: '3 guiones' },
      { v: '1abc', ok: false, por: 'ER' }, { v: '-abc', ok: false, por: 'ER' }
    ]
  },
  {
    id: 'ex-octal-cota', t: 'Constante octal con cota', fuente: 'Extra · Práctica 1 Ej. 1k', nivel: 'difícil',
    c: 'Constante octal estilo C (empieza con 0 y sigue con dígitos del 0 al 7). El valor, interpretado en decimal tal como está escrito, no puede superar 777.',
    cj: 'OCTAL  [0-7]', mER: '"0"{OCTAL}+', atr: 'valor', op: '<=', cota: 777,
    tests: [
      { v: '024', ok: true }, { v: '0777', ok: true, nota: 'cota exacta' },
      { v: '01000', ok: false, por: 'cota' },
      { v: '08', ok: false, por: 'ER', nota: 'el 8 no es octal' },
      { v: '24', ok: false, por: 'ER', nota: 'no empieza con 0' }
    ]
  },
  {
    id: 'ex-comentario-len', t: 'Comentario con longitud máxima', fuente: 'Extra · errores léxicos', nivel: 'medio',
    c: 'Comentario acotado por /* y */ con letras adentro, que no puede superar los 20 caracteres en total (incluidos los delimitadores).',
    cj: 'LETRA  [a-zA-Z]', mER: '"/*"{LETRA}*"*/"', atr: 'longitud', op: '<=', cota: 20,
    tests: [
      { v: '/**/', ok: true }, { v: '/*hola*/', ok: true },
      { v: '/*' + rep('a', 16) + '*/', ok: true, nota: '20 caracteres justos' },
      { v: '/*' + rep('a', 17) + '*/', ok: false, por: 'cota' },
      { v: '/*hola', ok: false, por: 'ER', nota: 'comentario sin cerrar' }
    ]
  }
]
