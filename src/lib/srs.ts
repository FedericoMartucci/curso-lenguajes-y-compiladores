/* Repetición espaciada, SM-2 simplificado a tres calificaciones.

   Los intervalos son en días de calendario real: no tienen nada que ver con las semanas del
   plan de estudio. Una cosa es "cuándo conviene que vuelvas a ver esta pregunta" y otra
   "en qué semana de la cursada vas". */

import type { Tarjeta, Calificacion } from '../tipos/progreso.ts'

const DIA = 86_400_000
const FACILIDAD_INICIAL = 2.3
const FACILIDAD_MIN = 1.3
const FACILIDAD_MAX = 2.8

export const tarjetaNueva = (): Tarjeta => ({
  racha: 0, facilidad: FACILIDAD_INICIAL, intervalo: 0, vence: 0, visto: 0, vistas: 0
})

const acotar = (x: number, min: number, max: number): number => Math.min(max, Math.max(min, x))

/** Aplica una calificación y devuelve la tarjeta actualizada. `ahora` se inyecta para poder testear. */
export function calificar(t: Tarjeta | undefined, nota: Calificacion, ahora = Date.now()): Tarjeta {
  const base = t ?? tarjetaNueva()
  const vistas = base.vistas + 1

  if (nota === 'mal') {
    // vuelve en la misma tanda: no se gana nada posponiendo algo que no sabés
    return { racha: 0, facilidad: acotar(base.facilidad - 0.25, FACILIDAD_MIN, FACILIDAD_MAX),
             intervalo: 0, vence: ahora, visto: ahora, vistas }
  }

  if (nota === 'costo') {
    const intervalo = Math.max(1, Math.round(base.intervalo * 1.2) || 1)
    return { racha: base.racha, facilidad: acotar(base.facilidad - 0.15, FACILIDAD_MIN, FACILIDAD_MAX),
             intervalo, vence: ahora + intervalo * DIA, visto: ahora, vistas }
  }

  const racha = base.racha + 1
  const intervalo =
    racha === 1 ? 1 :
    racha === 2 ? 3 :
    Math.max(1, Math.round(base.intervalo * base.facilidad))
  return { racha, facilidad: acotar(base.facilidad + 0.1, FACILIDAD_MIN, FACILIDAD_MAX),
           intervalo, vence: ahora + intervalo * DIA, visto: ahora, vistas }
}

/** Una tarjeta toca hoy si nunca la viste o si ya venció. */
export const vencida = (t: Tarjeta | undefined, ahora = Date.now()): boolean =>
  !t || t.vistas === 0 || t.vence <= ahora

/** Qué tan asentada está: 0 = nueva, 1 = con intervalo largo. Para pintar el avance real. */
export function madurez(t: Tarjeta | undefined): number {
  if (!t || t.vistas === 0) return 0
  return acotar(t.intervalo / 21, 0, 1)
}

export function textoProximoRepaso(t: Tarjeta | undefined, ahora = Date.now()): string {
  if (!t || t.vistas === 0) return 'sin ver'
  const dias = Math.round((t.vence - ahora) / DIA)
  if (dias <= 0) return 'toca hoy'
  if (dias === 1) return 'vuelve mañana'
  if (dias < 30) return `vuelve en ${dias} días`
  return `vuelve en ${Math.round(dias / 30)} meses`
}
