/* Tests de `fusionar`: el único lugar donde un bug pierde progreso del usuario en silencio.

   Corre entre pestañas y contra el servidor, y tiene que distinguir dos situaciones que se
   ven igual —la ausencia de una clave—: una entrada que el otro lado todavía no vio, y una
   que el otro lado BORRÓ. Solo las marcas de tiempo por entrada las separan.
   Uso:  npm run test  */

import { fusionar } from '../src/lib/fusion.ts'
import type { Progreso, Tarjeta, ProgresoEjercicio } from '../src/tipos/progreso.ts'

let fallos = 0
let corridos = 0

function comprobar(nombre: string, condicion: boolean, detalle = ''): void {
  corridos++
  if (!condicion) {
    fallos++
    console.log(`  ✗ [FUSION] ${nombre}${detalle ? ' — ' + detalle : ''}`)
  }
}

const T = 1_000_000

const base = (actualizado: number, extra: Partial<Progreso> = {}): Progreso => ({
  v: 2, leidas: {}, preguntas: {}, ejercicios: {},
  semana: 1, cerradas: [], ritmo: 3, actualizado, ...extra
})

const tarjeta = (visto: number, racha = 1): Tarjeta =>
  ({ racha, facilidad: 2.3, intervalo: 1, vence: visto + 86_400_000, visto, vistas: racha })

const ejercicio = (actualizado: number, resuelto: boolean, intentos: number): ProgresoEjercicio =>
  ({ resuelto, intentos, actualizado })

/* ---------- lecturas ---------- */

comprobar(
  'la lectura del lado más reciente se conserva',
  fusionar(
    base(T + 800),
    base(T + 900, { leidas: { '6.4': T + 900 } })
  ).leidas['6.4'] === T + 900
)

comprobar(
  'una lectura posterior a la última escritura del otro lado no se pierde',
  fusionar(
    base(T + 950, { leidas: { '7.1': T + 950 } }),
    base(T + 900)
  ).leidas['7.1'] === T + 950
)

comprobar(
  'una lectura borrada en el lado más reciente NO revive',
  !('6.4' in fusionar(
    base(T + 100, { leidas: { '6.4': T + 100 } }),
    base(T + 900)                                   // más nuevo y sin la lectura: la borró
  ).leidas)
)

/* ---------- preguntas ---------- */

comprobar(
  'gana la calificación más reciente, no la de racha más alta',
  fusionar(
    base(T + 500, { preguntas: { q: tarjeta(T + 500, 3) } }),
    base(T + 900, { preguntas: { q: tarjeta(T + 900, 1) } })
  ).preguntas['q']?.racha === 1
)

comprobar(
  'una pregunta borrada en el lado más reciente NO revive',
  !('q' in fusionar(
    base(T + 100, { preguntas: { q: tarjeta(T + 100) } }),
    base(T + 900)
  ).preguntas)
)

/* ---------- ejercicios ---------- */

const mezclaEjercicio = fusionar(
  base(T + 500, { ejercicios: { 'er:x': ejercicio(T + 500, true, 4) } }),
  base(T + 900, { ejercicios: { 'er:x': ejercicio(T + 900, false, 2) } })
).ejercicios['er:x']

comprobar('resolver un ejercicio no se deshace', mezclaEjercicio?.resuelto === true)
comprobar('los intentos se quedan con el máximo', mezclaEjercicio?.intentos === 4)

comprobar(
  'un ejercicio borrado entero en el lado más reciente NO revive',
  !('er:x' in fusionar(
    base(T + 100, { ejercicios: { 'er:x': ejercicio(T + 100, true, 1) } }),
    base(T + 900)
  ).ejercicios)
)

comprobar(
  'gana el borrador más reciente',
  fusionar(
    base(T + 500, { ejercicios: { 'er:x': { ...ejercicio(T + 500, false, 1), borrador: { er: 'viejo' } } } }),
    base(T + 900, { ejercicios: { 'er:x': { ...ejercicio(T + 900, false, 1), borrador: { er: 'nuevo' } } } })
  ).ejercicios['er:x']?.borrador?.['er'] === 'nuevo'
)

/* ---------- plan ---------- */

const mezclaPlan = fusionar(
  base(T + 100, { semana: 8, cerradas: [1, 2, 3] }),
  base(T + 900, { semana: 3, cerradas: [1, 2] })
)

comprobar('la semana activa la fija el lado más reciente', mezclaPlan.semana === 3)
comprobar('reabrir una semana en el lado más reciente se respeta', mezclaPlan.cerradas.length === 2,
  JSON.stringify(mezclaPlan.cerradas))

/* ---------- el orden no importa ---------- */

const izq = base(T + 500, { leidas: { a: T + 500 }, preguntas: { q: tarjeta(T + 500) } })
const der = base(T + 900, { leidas: { b: T + 900 } })

comprobar(
  'fusionar da lo mismo en cualquier orden',
  JSON.stringify(fusionar(izq, der)) === JSON.stringify(fusionar(der, izq))
)

if (fallos === 0) console.log(`✓ OK — ${corridos} comprobaciones de fusión de progreso.`)
else { console.log(`✗ ${fallos} de ${corridos} comprobaciones de fusión fallaron.`); process.exit(1) }
