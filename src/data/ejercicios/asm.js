/* Banco de ASSEMBLER Y COPROCESADOR (Práctica 6).
   Se valida ejecutando el código en un simulador del 8087 y comparando las variables finales. */

const CAB = `.MODEL LARGE
.386
.STACK 200h
.DATA
`
const PIE = `.CODE
  MOV AX, @DATA
  MOV DS, AX
  MOV ES, AX
`

export const ASM_EJ = [
  {
    id: 'p6-suma', t: 'Suma simple', fuente: 'Práctica 6 · básico', nivel: 'básico',
    c: 'Traducí a Assembler con el coprocesador:  z := a + b',
    plantilla: CAB + '  a dd ?\n  b dd ?\n  z dd ?\n' + PIE + '\n  FFREE\n  MOV AX, 4C00H\n  INT 21H\nEND',
    m: CAB + '  a dd ?\n  b dd ?\n  z dd ?\n' + PIE + '  FLD a\n  FLD b\n  FADD\n  FSTP z\n  FFREE\n  MOV AX, 4C00H\n  INT 21H\nEND',
    casos: [
      { inicial: { a: 2, b: 3 }, esperado: { z: 5 } },
      { inicial: { a: -1.5, b: 0.5 }, esperado: { z: -1 } }
    ]
  },
  {
    id: 'p6-resta', t: 'Resta: cuidado con el orden', fuente: 'Práctica 6 · orden de operandos', nivel: 'básico',
    c: 'Traducí:  z := a − b.  Ojo con el orden: FSUB hace ST(1) := ST(1) − ST(0), así que importa cuál cargás primero.',
    plantilla: CAB + '  a dd ?\n  b dd ?\n  z dd ?\n' + PIE + '\n  FFREE\n  MOV AX, 4C00H\n  INT 21H\nEND',
    m: CAB + '  a dd ?\n  b dd ?\n  z dd ?\n' + PIE + '  FLD a\n  FLD b\n  FSUB\n  FSTP z\n  FFREE\nEND',
    casos: [
      { inicial: { a: 10, b: 3 }, esperado: { z: 7 } },
      { inicial: { a: 3, b: 10 }, esperado: { z: -7 } }
    ]
  },
  {
    id: 'p6-mixta', t: 'Suma y producto con auxiliar', fuente: 'Práctica 6 · con @aux', nivel: 'medio',
    c: 'Traducí:  z := a + b * c.  Vas a necesitar una variable auxiliar para el resultado parcial. Recordá el prefijo @ para que no choque con palabras reservadas.',
    plantilla: CAB + '  a dd ?\n  b dd ?\n  c dd ?\n  z dd ?\n  @aux1 dd ?\n' + PIE + '\n  FFREE\nEND',
    m: CAB + '  a dd ?\n  b dd ?\n  c dd ?\n  z dd ?\n  @aux1 dd ?\n' + PIE +
       '  FLD b\n  FLD c\n  FMUL\n  FSTP @aux1\n  FLD a\n  FLD @aux1\n  FADD\n  FSTP z\n  FFREE\nEND',
    casos: [
      { inicial: { a: 1, b: 2, c: 3 }, esperado: { z: 7 } },
      { inicial: { a: 0, b: 5, c: 4 }, esperado: { z: 20 } }
    ]
  },
  {
    id: 'p6-dos-prod', t: 'Dos productos', fuente: 'Práctica 6 · dos auxiliares', nivel: 'medio',
    c: 'Traducí:  z := a * b + c * d',
    plantilla: CAB + '  a dd ?\n  b dd ?\n  c dd ?\n  d dd ?\n  z dd ?\n  @aux1 dd ?\n  @aux2 dd ?\n' + PIE + '\n  FFREE\nEND',
    m: CAB + '  a dd ?\n  b dd ?\n  c dd ?\n  d dd ?\n  z dd ?\n  @aux1 dd ?\n  @aux2 dd ?\n' + PIE +
       '  FLD a\n  FLD b\n  FMUL\n  FSTP @aux1\n  FLD c\n  FLD d\n  FMUL\n  FSTP @aux2\n  FLD @aux1\n  FLD @aux2\n  FADD\n  FSTP z\n  FFREE\nEND',
    casos: [
      { inicial: { a: 2, b: 3, c: 4, d: 5 }, esperado: { z: 26 } },
      { inicial: { a: 0, b: 9, c: 1, d: 1 }, esperado: { z: 1 } }
    ]
  },
  {
    id: 'p6-division', t: 'División con paréntesis', fuente: 'Práctica 6 · división', nivel: 'medio',
    c: 'Traducí:  z := ( a + b ) / c.  Acordate del orden en FDIV: ST(1) := ST(1) / ST(0).',
    plantilla: CAB + '  a dd ?\n  b dd ?\n  c dd ?\n  z dd ?\n  @aux1 dd ?\n' + PIE + '\n  FFREE\nEND',
    m: CAB + '  a dd ?\n  b dd ?\n  c dd ?\n  z dd ?\n  @aux1 dd ?\n' + PIE +
       '  FLD a\n  FLD b\n  FADD\n  FSTP @aux1\n  FLD @aux1\n  FLD c\n  FDIV\n  FSTP z\n  FFREE\nEND',
    casos: [
      { inicial: { a: 4, b: 6, c: 2 }, esperado: { z: 5 } },
      { inicial: { a: 1, b: 2, c: 4 }, esperado: { z: 0.75 } }
    ]
  },
  {
    id: 'p6-constante', t: 'Promedio: la constante va como variable', fuente: 'Práctica 6 · AVG', nivel: 'difícil',
    c: 'Traducí el AVG:  z := ( a + b + c + d ) / 4.  🎯 El coprocesador NO puede hacer FLD de una constante literal: hay que declararla en el .DATA (por ejemplo  _4 dd 4) y cargar esa variable.',
    plantilla: CAB + '  a dd ?\n  b dd ?\n  c dd ?\n  d dd ?\n  z dd ?\n  _4 dd 4\n  @aux1 dd ?\n' + PIE + '\n  FFREE\nEND',
    m: CAB + '  a dd ?\n  b dd ?\n  c dd ?\n  d dd ?\n  z dd ?\n  _4 dd 4\n  @aux1 dd ?\n' + PIE +
       '  FLD a\n  FLD b\n  FADD\n  FLD c\n  FADD\n  FLD d\n  FADD\n  FSTP @aux1\n  FLD @aux1\n  FLD _4\n  FDIV\n  FSTP z\n  FFREE\nEND',
    casos: [
      { inicial: { a: 1, b: 2, c: 3, d: 4 }, esperado: { z: 2.5 } },
      { inicial: { a: 2, b: 2, c: 2, d: 2 }, esperado: { z: 2 } }
    ]
  },
  {
    id: 'p6-larga', t: 'La expresión del apunte', fuente: 'Apunte · z := a+b*c−d/(e+f)+20', nivel: 'difícil',
    c: 'La expresión completa del apunte:  z := a + b * c − d / ( e + f ) + 20.  Necesitás varias auxiliares y declarar el 20 como variable.',
    plantilla: CAB + '  a dd ?\n  b dd ?\n  c dd ?\n  d dd ?\n  e dd ?\n  f dd ?\n  z dd ?\n  _20 dd 20\n  @aux1 dd ?\n  @aux2 dd ?\n  @aux3 dd ?\n' + PIE + '\n  FFREE\nEND',
    m: CAB + '  a dd ?\n  b dd ?\n  c dd ?\n  d dd ?\n  e dd ?\n  f dd ?\n  z dd ?\n  _20 dd 20\n  @aux1 dd ?\n  @aux2 dd ?\n  @aux3 dd ?\n' + PIE +
       '  FLD b\n  FLD c\n  FMUL\n  FSTP @aux1\n  FLD e\n  FLD f\n  FADD\n  FSTP @aux2\n  FLD d\n  FLD @aux2\n  FDIV\n  FSTP @aux3\n' +
       '  FLD a\n  FLD @aux1\n  FADD\n  FLD @aux3\n  FSUB\n  FLD _20\n  FADD\n  FSTP z\n  FFREE\nEND',
    casos: [
      { inicial: { a: 1, b: 2, c: 3, d: 8, e: 2, f: 2 }, esperado: { z: 25 } },
      { inicial: { a: 0, b: 0, c: 0, d: 10, e: 1, f: 1 }, esperado: { z: 15 } }
    ]
  }
]
