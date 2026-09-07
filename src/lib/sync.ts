/* Sincronización del progreso contra Supabase.

   Local-first: la fuente de verdad mientras usás la app es el navegador. El servidor guarda
   una copia por usuario y se fusiona por marca de tiempo, con las mismas reglas que entre
   pestañas (`fusionar`): nunca se desmarca un ejercicio resuelto ni se pierde una lectura.

   Es a propósito una sola fila por usuario y no una tabla por evento: el progreso es chico
   (unos 40 kB con todo hecho) y así el conflicto se resuelve en un solo lugar. */

import { supabase } from './supabase.ts'
import type { Progreso } from '../tipos/progreso.ts'

const TABLA = 'progreso'

export interface ResultadoSync {
  ok: boolean
  /** El progreso ya fusionado que hay que adoptar localmente. */
  progreso?: Progreso
  error?: string
}

const mensaje = (e: unknown): string => (e instanceof Error ? e.message : String(e))

/** Trae la copia del servidor. `null` si el usuario todavía no tiene ninguna. */
export async function bajar(userId: string): Promise<Progreso | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from(TABLA)
    .select('datos')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  const datos = (data as { datos?: Progreso } | null)?.datos
  return datos && datos.v === 2 ? datos : null
}

/** Sube el progreso, pisando la copia del servidor con lo ya fusionado. */
export async function subir(userId: string, progreso: Progreso): Promise<void> {
  if (!supabase) return
  const { error } = await supabase
    .from(TABLA)
    .upsert(
      { user_id: userId, datos: progreso, actualizado: new Date(progreso.actualizado).toISOString() },
      { onConflict: 'user_id' }
    )
  if (error) throw new Error(error.message)
}

/** Baja, fusiona y vuelve a subir. Devuelve lo que la app tiene que adoptar. */
export async function sincronizar(
  userId: string,
  local: Progreso,
  fusionar: (a: Progreso, b: Progreso) => Progreso
): Promise<ResultadoSync> {
  if (!supabase) return { ok: false, error: 'No hay backend configurado.' }
  try {
    const remoto = await bajar(userId)
    const fusionado = remoto ? fusionar(local, remoto) : local
    await subir(userId, fusionado)
    return { ok: true, progreso: fusionado }
  } catch (e) {
    return { ok: false, error: mensaje(e) }
  }
}
