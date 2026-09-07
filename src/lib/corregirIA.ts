/* Cliente de /api/corregir.

   La clave es del alumno, no del proyecto: la carga en Ajustes y vive en SU navegador.
   Se guarda en localStorage y NO entra en la sincronización con Supabase — es lo único
   del estado del usuario que a propósito no viaja entre dispositivos. Sincronizarla
   significaría guardar la credencial de Azure de cada uno en una base que no hace falta
   que la tenga, y una credencial que nadie guarda es una credencial que nadie filtra.

   Si no hay clave cargada, `corregirConIA` devuelve null y el que llama sigue mostrando la
   comparación de siempre (conceptos del modelo presentes en tu texto). La app tiene que
   andar entera sin nada de esto, igual que anda sin Supabase. */

export interface CorreccionIA {
  veredicto: 'bien' | 'parcial' | 'mal'
  detalle: string
  falta: string[]
}

export interface ClaveIA {
  endpoint: string
  key: string
  modelo: string
}

interface Pedido {
  consigna: string
  modelo: string
  respuesta: string
}

const LLAVE = 'lyc-azure'
const TIMEOUT_MS = 20_000

export function leerClaveIA(): ClaveIA | null {
  try {
    const crudo = localStorage.getItem(LLAVE)
    if (!crudo) return null
    const c = JSON.parse(crudo) as Partial<ClaveIA>
    if (!c.endpoint || !c.key) return null
    return { endpoint: c.endpoint, key: c.key, modelo: c.modelo || 'gpt-5.1' }
  } catch {
    return null   // modo privado, o basura guardada por una versión anterior
  }
}

export function guardarClaveIA(c: ClaveIA | null): void {
  try {
    if (c === null) localStorage.removeItem(LLAVE)
    else localStorage.setItem(LLAVE, JSON.stringify(c))
  } catch { /* sin localStorage la corrección con IA simplemente no está */ }
}

export function hayClaveIA(): boolean {
  return leerClaveIA() !== null
}

export type ResultadoIA =
  | { estado: 'ok'; correccion: CorreccionIA }
  | { estado: 'sin-clave' }
  | { estado: 'error'; mensaje: string }

export async function corregirConIA(p: Pedido): Promise<ResultadoIA> {
  const cred = leerClaveIA()
  if (!cred) return { estado: 'sin-clave' }

  const corte = new AbortController()
  const reloj = setTimeout(() => corte.abort(), TIMEOUT_MS)
  try {
    const r = await fetch('/api/corregir', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-azure-endpoint': cred.endpoint,
        'x-azure-key': cred.key,
        'x-azure-modelo': cred.modelo
      },
      body: JSON.stringify(p),
      signal: corte.signal
    })
    if (!r.ok) {
      const d = (await r.json().catch(() => ({}))) as { error?: string }
      return { estado: 'error', mensaje: d.error || 'No se pudo corregir.' }
    }
    const d = (await r.json()) as Partial<CorreccionIA>
    if (d.veredicto !== 'bien' && d.veredicto !== 'parcial' && d.veredicto !== 'mal') {
      return { estado: 'error', mensaje: 'La corrección volvió incompleta.' }
    }
    return {
      estado: 'ok',
      correccion: {
        veredicto: d.veredicto,
        detalle: typeof d.detalle === 'string' ? d.detalle : '',
        falta: Array.isArray(d.falta) ? d.falta : []
      }
    }
  } catch (e) {
    const abortado = e instanceof DOMException && e.name === 'AbortError'
    return { estado: 'error', mensaje: abortado ? 'La corrección tardó demasiado.' : 'No se pudo corregir.' }
  } finally {
    clearTimeout(reloj)
  }
}
