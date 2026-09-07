/* Fusión de dos versiones del progreso. Vive aparte de `progreso.tsx` porque es lógica
   pura sin React: corre entre pestañas y contra el servidor, y se testea sola.

   La parte difícil es que una ELIMINACIÓN se ve igual que "nunca lo tuve": las dos son la
   ausencia de una clave. Unir los mapas sin más hace que desmarcar una lección, o usar
   "borrar lecturas" en Ajustes, quede deshecho por cualquier otra pestaña o por la copia
   del servidor.

   Como cada entrada guarda su propia marca de tiempo, se pueden distinguir: una entrada
   que está solo en el lado VIEJO sobrevive únicamente si nació después de la última
   escritura del lado NUEVO. Si es anterior, el lado nuevo tuvo la oportunidad de tenerla
   y no la tiene: fue borrada, y se respeta. */

import type { Progreso } from '../tipos/progreso.ts'

/** Decide si una entrada presente solo en el lado viejo hay que conservarla. */
const sobreviveAlBorrado = (marcaEntrada: number, actualizadoDelNuevo: number): boolean =>
  marcaEntrada > actualizadoDelNuevo

export function fusionar(a: Progreso, b: Progreso): Progreso {
  const nuevo = b.actualizado >= a.actualizado ? b : a
  const viejo = nuevo === b ? a : b
  const corte = nuevo.actualizado

  // ---- lecturas: id -> cuándo se marcó ----
  const leidas: Progreso['leidas'] = { ...nuevo.leidas }
  Object.entries(viejo.leidas).forEach(([id, cuando]) => {
    if (id in leidas) return
    if (sobreviveAlBorrado(cuando, corte)) leidas[id] = cuando
  })

  // ---- preguntas: gana la calificación más reciente ----
  const preguntas: Progreso['preguntas'] = { ...nuevo.preguntas }
  Object.entries(viejo.preguntas).forEach(([k, t]) => {
    const otro = preguntas[k]
    if (!otro) {
      if (sobreviveAlBorrado(t.visto, corte)) preguntas[k] = t
      return
    }
    if (t.visto > otro.visto) preguntas[k] = t
  })

  // ---- ejercicios ----
  const ejercicios: Progreso['ejercicios'] = { ...nuevo.ejercicios }
  Object.entries(viejo.ejercicios).forEach(([k, e]) => {
    const otro = ejercicios[k]
    if (!otro) {
      if (sobreviveAlBorrado(e.actualizado, corte)) ejercicios[k] = e
      return
    }
    // dentro de una entrada que existe en los dos lados, resolver no se deshace
    // y los intentos se acumulan: son hechos, no estados
    const reciente = e.actualizado >= otro.actualizado ? e : otro
    const borrador = reciente.borrador
    ejercicios[k] = {
      resuelto: otro.resuelto || e.resuelto,
      intentos: Math.max(otro.intentos, e.intentos),
      ...(borrador ? { borrador } : {}),
      actualizado: Math.max(otro.actualizado, e.actualizado)
    }
  })

  // ---- semanas cerradas: no tienen marca propia, manda el lado más reciente ----
  return {
    v: 2,
    leidas, preguntas, ejercicios,
    semana: nuevo.semana,
    cerradas: [...nuevo.cerradas].sort((x, y) => x - y),
    ritmo: nuevo.ritmo,
    actualizado: Math.max(a.actualizado, b.actualizado)
  }
}
