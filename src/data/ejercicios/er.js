/* Banco de ejercicios de EXPRESIONES REGULARES.
   Cubre toda la Práctica 1 de la cátedra más ejercicios extra de parciales y del lenguaje L1_aho.
   Cada ejercicio trae sets extensos de aceptación/rechazo, incluyendo casos borde.
   `m` es una solución modelo verificada: acepta todo `ac` y rechaza todo `rc`. */

export const ER_EJ = [
  {
    id: 'p1-1a', t: 'Códigos postales', fuente: 'Práctica 1 · Ej. 1a', nivel: 'básico',
    c: 'Cuatro dígitos exactos; el primero no puede ser cero. Ej.: 1234, 8366 — pero no 422 ni 0027.',
    cj: 'DIGITO   [0-9]\nDIGITO1  [1-9]',
    m: '{DIGITO1}{DIGITO}{DIGITO}{DIGITO}',
    ac: ['1234', '8366', '9000', '1000', '9999', '5050'],
    rc: ['', '4', '42', '422', '0027', '0000', '12345', '99999', 'abcd', '12a4', '12 4', ' 1234', '1234 ', '-123']
  },
  {
    id: 'p1-1b', t: 'Patente Mercosur', fuente: 'Práctica 1 · Ej. 1b', nivel: 'básico',
    c: 'Dos formatos: AA386NX (2 mayúsculas, 3 dígitos, 2 mayúsculas) o DMS109 (3 mayúsculas, 3 dígitos).',
    cj: 'DIGITO  [0-9]\nMAY     [A-Z]',
    m: '{MAY}{MAY}{DIGITO}{DIGITO}{DIGITO}{MAY}{MAY}|{MAY}{MAY}{MAY}{DIGITO}{DIGITO}{DIGITO}',
    ac: ['AA386NX', 'DMS109', 'ABC123', 'ZZ999ZZ', 'AA000AA', 'AAA000'],
    rc: ['', 'A386NX', 'aa386nx', 'dms109', 'AA38NX', 'AA3861NX', 'AAAA123', 'AA386N', 'AA386NXX', '386AANX', 'AA-386-NX']
  },
  {
    id: 'p1-1c', t: 'Comentario /* */', fuente: 'Práctica 1 · Ej. 1c', nivel: 'medio',
    c: 'Comentario acotado por /* y */, que contiene solo letras. Alfabeto Σ = {letras, *, /}.',
    cj: 'LETRA  [a-zA-Z]',
    m: '"/*"{LETRA}*"*/"',
    ac: ['/**/', '/*a*/', '/*hola*/', '/*Comentario*/', '/*ABCdef*/'],
    rc: ['', '/*', '*/', '/*hola', 'hola*/', '/*a*b*/', '/*a/b*/', '/*a1*/', '/* a */', '/**//**/', '/*a**/']
  },
  {
    id: 'p1-1d', t: 'Identificador con guiones', fuente: 'Práctica 1 · Ej. 1d', nivel: 'medio',
    c: 'Empieza con letra; sigue con letras, dígitos o guiones medios; NO puede terminar con guión.',
    cj: 'DIGITO  [0-9]\nLETRA   [a-zA-Z]',
    m: '{LETRA}(({LETRA}|{DIGITO}|"-")*({LETRA}|{DIGITO}))?',
    ac: ['a', 'abc', 'a1', 'a-b', 'a1-b2', 'x-y-z', 'a--b', 'contador', 'A-1'],
    rc: ['', '1abc', '-abc', 'abc-', 'a-', 'a--', '_abc', 'a b', 'a_b', '1', '-']
  },
  {
    id: 'p1-1e', t: 'Identificador sin dos guiones seguidos', fuente: 'Práctica 1 · Ej. 1e', nivel: 'difícil',
    c: 'Ídem anterior, pero además NO puede contener dos guiones medios seguidos.',
    cj: 'DIGITO  [0-9]\nLETRA   [a-zA-Z]',
    m: '{LETRA}("-"?({LETRA}|{DIGITO}))*',
    ac: ['a', 'abc', 'a-b', 'a-b-c', 'a1-b2-c3', 'xY-9'],
    rc: ['', 'a--b', 'a-', '-a', 'a-b--c', '1abc', 'abc-', 'a---b', 'a b']
  },
  {
    id: 'p1-1f', t: 'Constante entera', fuente: 'Práctica 1 · Ej. 1f', nivel: 'básico',
    c: 'Constante aritmética entera, con signo menos opcional. (El control de rango va en la acción léxica.)',
    cj: 'DIGITO  [0-9]',
    m: '"-"?{DIGITO}+',
    ac: ['0', '7', '123', '-5', '-0', '000', '32767', '99999999'],
    rc: ['', '-', 'abc', '1.5', '+5', '5-', '- 5', '1 2', '1a', '--5']
  },
  {
    id: 'p1-1g', t: 'Constante real xx.xx', fuente: 'Práctica 1 · Ej. 1g', nivel: 'medio',
    c: 'Uno o más dígitos, punto, uno o más dígitos. Signo menos opcional. (El rango va en la acción léxica.)',
    cj: 'DIGITO  [0-9]',
    m: '"-"?{DIGITO}+"."{DIGITO}+',
    ac: ['0.0', '12.34', '-5.67', '100.1', '000.000', '-0.5'],
    rc: ['', '12', '12.', '.34', '.', '12.3.4', '-.5', '12,34', 'a.b', '12. 34', '-']
  },
  {
    id: 'p1-1h', t: 'Constante string', fuente: 'Práctica 1 · Ej. 1h', nivel: 'medio',
    c: 'Texto entre comillas dobles, con letras o dígitos adentro. Usá {COMILLA} para la comilla literal.',
    cj: 'DIGITO   [0-9]\nLETRA    [a-zA-Z]\nCOMILLA  ["]',
    m: '{COMILLA}({DIGITO}|{LETRA})*{COMILLA}',
    ac: ['""', '"a"', '"abc"', '"a1b2"', '"Hola"', '"123"'],
    rc: ['', '"', 'abc', '"abc', 'abc"', '"a b"', '"a-b"', '"a,b"', '""""']
  },
  {
    id: 'p1-1i', t: 'Palabras reservadas', fuente: 'Práctica 1 · Ej. 1i', nivel: 'básico',
    c: 'Reconocer exactamente el conjunto: IF, WHILE, DECVAR, ENDDEC, INTEGER, FLOAT, WRITE.',
    cj: '',
    m: '"IF"|"WHILE"|"DECVAR"|"ENDDEC"|"INTEGER"|"FLOAT"|"WRITE"',
    ac: ['IF', 'WHILE', 'DECVAR', 'ENDDEC', 'INTEGER', 'FLOAT', 'WRITE'],
    rc: ['', 'if', 'While', 'IFF', 'IF ', 'ELSE', 'INT', 'WRITELN', 'DECVARS', 'FLOA']
  },
  {
    id: 'p1-1j', t: 'Operadores aritméticos y lógicos', fuente: 'Práctica 1 · Ej. 1j', nivel: 'básico',
    c: 'Operadores aritméticos + - * / y comparadores == != < > <= >=.',
    cj: '',
    m: '"+"|"-"|"*"|"/"|"=="|"!="|"<="|">="|"<"|">"',
    ac: ['+', '-', '*', '/', '==', '!=', '<', '>', '<=', '>='],
    rc: ['', '=', '++', '<>', '=<', '=>', '**', '//', '&&', 'and', '+ ']
  },
  {
    id: 'p1-1k1', t: 'Constante decimal (estilo C)', fuente: 'Práctica 1 · Ej. 1k', nivel: 'medio',
    c: 'Constante decimal como en C: no empieza con 0 (salvo que sea el propio 0).',
    cj: 'DIGITO   [0-9]\nDIGITO1  [1-9]',
    m: '"0"|{DIGITO1}{DIGITO}*',
    ac: ['0', '7', '64521', '123456', '1'],
    rc: ['', '024', '007', '0x1F', 'abc', '01', '00', '1a', '-5']
  },
  {
    id: 'p1-1k2', t: 'Constante octal (estilo C)', fuente: 'Práctica 1 · Ej. 1k', nivel: 'medio',
    c: 'Constante octal como en C: empieza con 0 y sigue con dígitos del 0 al 7 (al menos uno).',
    cj: 'OCTAL  [0-7]',
    m: '"0"{OCTAL}+',
    ac: ['024', '007', '0777', '01', '00'],
    rc: ['', '0', '08', '09', '0182', '24', '0x1F', '0abc', '0 7']
  },
  {
    id: 'p1-1k3', t: 'Constante hexadecimal (estilo C)', fuente: 'Práctica 1 · Ej. 1k', nivel: 'medio',
    c: 'Constante hexadecimal como en C: empieza con 0x o 0X y sigue con al menos un dígito hexadecimal.',
    cj: 'HEX  [0-9a-fA-F]',
    m: '"0"("x"|"X"){HEX}+',
    ac: ['0XFF111', '0x1F', '0xabc', '0XABC', '0x0', '0xdeadBEEF'],
    rc: ['', '0x', '0X', 'x1F', '0xg1', '1F', '00x1', '0 x1', '0xZZ']
  },
  {
    id: 'p1-1k4', t: 'Constante entera en cualquier base (C)', fuente: 'Práctica 1 · Ej. 1k', nivel: 'difícil',
    c: 'Unión de las tres anteriores: decimal, octal o hexadecimal, como en C.',
    cj: 'DIGITO   [0-9]\nDIGITO1  [1-9]\nOCTAL    [0-7]\nHEX      [0-9a-fA-F]',
    m: '"0"("x"|"X"){HEX}+|"0"{OCTAL}+|"0"|{DIGITO1}{DIGITO}*',
    ac: ['0', '024', '0XFF111', '64521', '0x1F', '007', '1'],
    rc: ['', '08', '0x', 'x1F', 'abc', '0xZZ', '-5', '1.5', '09']
  },
  {
    id: 'p1-2', t: 'Direcciones de correo', fuente: 'Práctica 1 · Ej. 2', nivel: 'difícil',
    c: 'Nombre: empieza con minúscula, sigue con minúsculas, dígitos, guión medio o bajo. Sufijo opcional con "+" (letras o dígitos, no empieza con guión). Arroba. Dominio: unlam.edu.ar, yahoo.com, yahoo.com.ar, gmail.com o hotmail.com.',
    cj: 'MIN  [a-z]\nDIG  [0-9]',
    m: '{MIN}({MIN}|{DIG}|"-"|"_")*("+"({MIN}|{DIG})({MIN}|{DIG}|"-")*)?"@"("unlam.edu.ar"|"yahoo.com.ar"|"yahoo.com"|"gmail.com"|"hotmail.com")',
    ac: ['lyc@hotmail.com', 'lyc+comision-2024@unlam.edu.ar', 'lyc+comision-2024@gmail.com', 'a@yahoo.com', 'a_b-c1@yahoo.com.ar', 'lyc+2024@gmail.com'],
    rc: ['', 'Lyc@gmail.com', '1lyc@gmail.com', 'lyc@otro.com', '@gmail.com', 'lyc+@gmail.com', 'lyc+-a@gmail.com', 'lyc@gmail.com.ar', 'lyc gmail.com', 'lyc@@gmail.com', 'lyc@']
  },
  {
    id: 'p1-4c', t: 'String de contenido libre', fuente: 'Práctica 1 · Ej. 4c', nivel: 'medio',
    c: 'Constante string que empieza y termina con comilla doble y puede contener cualquier texto que no sea comilla.',
    cj: 'NOCOMILLA  [^"]\nCOMILLA    ["]',
    m: '{COMILLA}{NOCOMILLA}*{COMILLA}',
    ac: ['""', '"hola mundo"', '"con, signos! y 123"', '"a-b_c"', '"  "'],
    rc: ['', '"', 'hola', '"abc', 'abc"', '"a"b"']
  },
  {
    id: 'l1-id', t: 'Identificador de L1_aho', fuente: 'Tu lenguaje · Lexico.l', nivel: 'básico',
    c: 'Identificador de tu lenguaje: empieza con letra y sigue con letras o dígitos.',
    cj: 'LETRA   [a-zA-Z]\nDIGITO  [0-9]',
    m: '{LETRA}({LETRA}|{DIGITO})*',
    ac: ['a', 'contador', 'x1', 'Suma2', 'ABC123'],
    rc: ['', '1a', '_a', 'a_b', 'a-b', 'a b', '123', 'á']
  },
  {
    id: 'l1-com', t: 'Comentario de L1_aho', fuente: 'Tu lenguaje · Lexico.l', nivel: 'difícil',
    c: 'Comentario que abre con #+ y cierra con +#, con cualquier contenido en el medio (incluidos + y # sueltos).',
    cj: 'NOMAS   [^+]\nMASNOH  "+"[^#]',
    m: '"#+"({NOMAS}|{MASNOH})*"+#"',
    ac: ['#++#', '#+ hola +#', '#+ a+b +#', '#+ #hash +#', '#+ multi palabra +#'],
    rc: ['', '#+', '+#', '#+ hola', 'hola +#', '# + hola + #']
  },
  {
    id: 'l1-float', t: 'Constante Float de L1_aho', fuente: 'Tu lenguaje · Lexico.l', nivel: 'básico',
    c: 'Dígitos, punto, dígitos (sin signo). La cota 3.4e38 va en la acción léxica.',
    cj: 'DIGITO  [0-9]',
    m: '{DIGITO}+"."{DIGITO}+',
    ac: ['0.0', '3.14', '123.456', '00.00'],
    rc: ['', '3', '3.', '.14', '-3.14', '3..14', '3,14']
  },
  {
    id: 'ex-hora', t: 'Hora hh:mm', fuente: 'Extra · estilo parcial', nivel: 'medio',
    c: 'Hora en formato hh:mm, con horas de 00 a 23 y minutos de 00 a 59.',
    cj: 'D    [0-9]\nD5   [0-5]\nD3   [0-3]',
    m: '("0"|"1"){D}":"{D5}{D}|"2"{D3}":"{D5}{D}',
    ac: ['00:00', '09:59', '13:45', '23:59', '19:00', '20:30'],
    rc: ['', '24:00', '23:60', '9:05', '09:5', '0900', '99:99', '1:1', '23:59:00', '-1:00']
  },
  {
    id: 'ex-fecha', t: 'Fecha dd/mm/aaaa', fuente: 'Extra · estilo parcial', nivel: 'medio',
    c: 'Fecha con día 01–31, mes 01–12 y año de cuatro dígitos. (No hace falta validar meses cortos.)',
    cj: 'D    [0-9]\nD12  [1-2]',
    m: '("0"[1-9]|{D12}{D}|"3"[01])"/"("0"[1-9]|"1"[0-2])"/"{D}{D}{D}{D}',
    ac: ['01/01/2026', '31/12/1999', '15/06/2000', '29/02/2024', '09/09/2009'],
    rc: ['', '00/01/2026', '32/01/2026', '01/00/2026', '01/13/2026', '1/1/2026', '01/01/26', '01-01-2026', '2026/01/01']
  },
  {
    id: 'ex-coord', t: 'Constante coordenada', fuente: 'Parcial 2C 2024', nivel: 'difícil',
    c: 'Direcciones de dos dígitos a ambos lados de ":", donde los dos primeros no pueden ser cero. Se concatenan con "%" y la constante cierra con "#". Puede aparecer la dirección especial 100 (también seguida de %).',
    cj: 'D   [0-9]\nD1  [1-9]',
    m: '(({D1}{D1}":"{D}{D}|"100")"%")*{D1}{D1}":"{D}{D}"#"',
    ac: ['99:45%33:27#', '15:05%12:07%55:01#', '100%11:00#', '92:00#', '100%100%11:00#'],
    rc: ['', '92:00', '09:45#', '9:45#', '92:0#', '100#', '92:00%#', '92:00#%', '1234#']
  },
  {
    id: 'ex-binpar', t: 'Binario par', fuente: 'Apunte · ER', nivel: 'básico',
    c: 'Cadena de ceros y unos (al menos un símbolo) que representa un número binario par: termina en 0.',
    cj: 'B  [01]',
    m: '{B}*"0"',
    ac: ['0', '10', '110', '00', '1010', '000'],
    rc: ['', '1', '11', '101', '2', '10a', '0 0', ' 0']
  },
  {
    id: 'ex-ceros-unos', t: 'Ceros seguidos de unos', fuente: 'Apunte · ER', nivel: 'básico',
    c: 'Uno o más ceros seguidos de uno o más unos (el clásico 0+1+ del apunte).',
    cj: '',
    m: '"0"+"1"+',
    ac: ['01', '0011', '00011', '0001', '01111'],
    rc: ['', '0', '1', '10', '0101', '011 1', '0a1']
  },
  {
    id: 'ex-real-exp', t: 'Real con exponente', fuente: 'Extra · estilo parcial', nivel: 'difícil',
    c: 'Constante real con parte exponencial opcional: dígitos, punto, dígitos y, opcionalmente, e o E con signo opcional y al menos un dígito.',
    cj: 'D  [0-9]',
    m: '"-"?{D}+"."{D}+(("e"|"E")("+"|"-")?{D}+)?',
    ac: ['1.5', '-2.75', '1.5e3', '1.5E-3', '0.0e+0', '12.34e10'],
    rc: ['', '1.5e', '1.5e+', '1e3', '.5e3', '1.5ee3', '1.5 e3', '1.5e3.2']
  },
  {
    id: 'ex-id-guionbajo', t: 'Identificador con guiones bajos', fuente: 'Práctica 1 · Ej. 4b', nivel: 'medio',
    c: 'Empieza con letra y sigue con letras, dígitos o guiones bajos. (El máximo de 5 guiones bajos se controla en la acción léxica.)',
    cj: 'LETRA   [a-zA-Z]\nDIGITO  [0-9]',
    m: '{LETRA}({LETRA}|{DIGITO}|"_")*',
    ac: ['a', 'mi_var', 'a_1_b', 'x__y', 'A_B_C_D_E_F'],
    rc: ['', '_a', '1a', 'a-b', 'a b', '_', 'a.b']
  },
  {
    id: 'ex-id-c', t: 'Identificador estilo C', fuente: 'Extra · lenguajes reales', nivel: 'básico',
    c: 'Como en C: empieza con letra o guión bajo, y sigue con letras, dígitos o guiones bajos.',
    cj: 'LETRA   [a-zA-Z]\nDIGITO  [0-9]',
    m: '({LETRA}|"_")({LETRA}|{DIGITO}|"_")*',
    ac: ['a', '_a', '_', 'mi_var', '__x1', 'A1_b2'],
    rc: ['', '1a', 'a-b', 'a b', '1_a', 'a.b', '$x']
  },
  {
    id: 'ex-telefono', t: 'Teléfono con característica', fuente: 'Extra · estilo parcial', nivel: 'medio',
    c: 'Formato (011) 4444-5555: paréntesis con 2 a 4 dígitos, un espacio, 4 dígitos, guión y 4 dígitos.',
    cj: 'D  [0-9]',
    m: '"(" {D}{D}{D}?{D}? ")" " " {D}{D}{D}{D} "-" {D}{D}{D}{D}',
    ac: ['(011) 4444-5555', '(0111) 1234-5678', '(11) 0000-0000'],
    rc: ['', '(1) 4444-5555', '(01111) 4444-5555', '011 4444-5555', '(011)4444-5555', '(011) 444-5555', '(011) 4444 5555']
  },
  {
    id: 'ex-dni', t: 'DNI con puntos', fuente: 'Extra · estilo parcial', nivel: 'medio',
    c: 'Documento con separador de miles: 1 o 2 dígitos, punto, 3 dígitos, punto, 3 dígitos. El primer dígito no puede ser cero.',
    cj: 'D   [0-9]\nD1  [1-9]',
    m: '{D1}{D}?"."{D}{D}{D}"."{D}{D}{D}',
    ac: ['1.234.567', '12.345.678', '9.999.999'],
    rc: ['', '0.123.456', '123.456.789', '12345678', '12.34.567', '1.234.56', '1,234,567']
  },
  {
    id: 'ex-binaria', t: 'Constante binaria', fuente: 'Extra · bases', nivel: 'básico',
    c: 'Constante binaria estilo C: empieza con 0b o 0B y sigue con al menos un cero o uno.',
    cj: 'B  [01]',
    m: '"0"("b"|"B"){B}+',
    ac: ['0b0', '0b1010', '0B1111', '0b00000001'],
    rc: ['', '0b', '0b2', '1010', 'b1010', '0xb1', '0b1a']
  },
  {
    id: 'ex-asig-comp', t: 'Operadores de asignación compuesta', fuente: 'Extra · operadores', nivel: 'básico',
    c: 'Reconocer la asignación simple y las compuestas: = += -= *= /=',
    cj: '',
    m: '("+"|"-"|"*"|"/")?"="',
    ac: ['=', '+=', '-=', '*=', '/='],
    rc: ['', '==', '++', '=+', '%=', ':=', '+ =']
  },
  {
    id: 'ex-com-linea', t: 'Comentario de línea', fuente: 'Extra · comentarios', nivel: 'medio',
    c: 'Comentario que empieza con // y sigue hasta el fin de línea con cualquier cosa que no sea un salto de línea.',
    cj: 'NOSALTO  [^\\n]',
    m: '"//"{NOSALTO}*',
    ac: ['//', '// hola', '//comentario con 123 y símbolos!', '// a // b'],
    rc: ['', '/', '/ / hola', 'hola //', '/* hola */']
  }
]
