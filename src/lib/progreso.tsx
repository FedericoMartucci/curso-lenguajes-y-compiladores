/* Store del progreso. Local-first: la fuente de verdad es el navegador, así la app anda
   sin conexión y sin esperar a la red. La sincronización con la cuenta se engancha acá
   (ver src/lib/sync.ts): sube lo local y fusiona lo remoto por marca de tiempo. */

import { createContext, useContext, useCallback, useMemo, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Progreso, Tarjeta, ProgresoEjercicio, Calificacion, ProgresoV1 } from '../tipos/progreso.ts'
import type { TipoEjercicio } from '../tipos/ejercicios.ts'
import { calificar as calificarTarjeta, vencida } from './srs.ts'
import { leerGuardado, escribirGuardado } from './hooks.ts'

const CLAVE = 'lyc-progreso'
const CLAVE_VIEJA_PREGUNTAS = 'lyc-ejerc'
const CLAVE_VIEJO_SANDBOX = 'lyc-sandbox'

export const RITMO_POR_DEFECTO = 3

const vacio = (): Progreso => ({
  v: 2, leidas: {}, preguntas: {}, ejercicios: {},
  semana: 1, cerradas: [], ritmo: RITMO_POR_DEFECTO, actualizado: Date.now()
})

/** Trae el progreso de la versión anterior (dos claves sueltas) al esquema único. */
function migrarV1(base: Progreso): Progreso {
  const viejasPreguntas = leerGuardado<ProgresoV1['ejerc']>(CLAVE_VIEJA_PREGUNTAS, undefined)
  const viejoSandbox = leerGuardado<ProgresoV1['sandbox']>(CLAVE_VIEJO_SANDBOX, undefined)
  if (!viejasPreguntas && !viejoSandbox) return base

  const ahora = Date.now()
  const preguntas = { ...base.preguntas }
  Object.entries(viejasPreguntas ?? {}).forEach(([qid, estado]) => {
    if (preguntas[qid]) return
    // 'known' entra como una tarjeta ya vista una vez; 'repasar', como vencida
    preguntas[qid] = estado === 'known'
      ? { racha: 1, facilidad: 2.3, intervalo: 1, vence: ahora + 86_400_000, visto: ahora, vistas: 1 }
      : { racha: 0, facilidad: 2.15, intervalo: 0, vence: ahora, visto: ahora, vistas: 1 }
  })

  const ejercicios = { ...base.ejercicios }
  Object.entries(viejoSandbox ?? {}).forEach(([clave, hecho]) => {
    if (!hecho || ejercicios[clave]) return
    ejercicios[clave] = { resuelto: true, intentos: 1, actualizado: ahora }
  })

  return { ...base, preguntas, ejercicios, actualizado: ahora }
}

function cargar(): Progreso {
  const crudo = leerGuardado<Partial<Progreso> | null>(CLAVE, null)
  const base: Progreso = crudo && crudo.v === 2 ? { ...vacio(), ...crudo } : vacio()
  return crudo ? base : migrarV1(base)
}

/** Fusiona dos versiones del progreso quedándose con lo más reciente de cada parte.
    Se usa entre pestañas y, más adelante, contra lo que venga del servidor. */
export function fusionar(a: Progreso, b: Progreso): Progreso {
  const nuevo = b.actualizado >= a.actualizado ? b : a
  const viejo = nuevo === b ? a : b

  const leidas = { ...viejo.leidas, ...nuevo.leidas }

  const preguntas = { ...viejo.preguntas }
  Object.entries(nuevo.preguntas).forEach(([k, t]) => {
    const previo = preguntas[k]
    if (!previo || t.visto >= previo.visto) preguntas[k] = t
  })

  const ejercicios = { ...viejo.ejercicios }
  Object.entries(nuevo.ejercicios).forEach(([k, e]) => {
    const previo = ejercicios[k]
    if (!previo) { ejercicios[k] = e; return }
    // resolver un ejercicio no se deshace, y los intentos se acumulan
    ejercicios[k] = {
      resuelto: previo.resuelto || e.resuelto,
      intentos: Math.max(previo.intentos, e.intentos),
      ...((e.actualizado >= previo.actualizado ? e.borrador : previo.borrador)
        ? { borrador: (e.actualizado >= previo.actualizado ? e.borrador : previo.borrador) as Record<string, string> }
        : {}),
      actualizado: Math.max(previo.actualizado, e.actualizado)
    }
  })

  return {
    v: 2,
    leidas, preguntas, ejercicios,
    semana: nuevo.semana,
    cerradas: [...new Set([...viejo.cerradas, ...nuevo.cerradas])].sort((x, y) => x - y),
    ritmo: nuevo.ritmo,
    actualizado: Math.max(a.actualizado, b.actualizado)
  }
}

/* ---------- API del store ---------- */

export const claveEjercicio = (tipo: TipoEjercicio, id: string): string => `${tipo}:${id}`

export interface StoreProgreso {
  progreso: Progreso

  /* teoría */
  leida: (id: string) => boolean
  marcarLeida: (id: string, leida?: boolean) => void

  /* preguntas */
  tarjeta: (qid: string) => Tarjeta | undefined
  calificar: (qid: string, nota: Calificacion) => void
  vencidas: (qids: string[]) => string[]

  /* ejercicios */
  ejercicio: (tipo: TipoEjercicio, id: string) => ProgresoEjercicio | undefined
  resuelto: (tipo: TipoEjercicio, id: string) => boolean
  registrarIntento: (tipo: TipoEjercicio, id: string, ok: boolean) => void
  guardarBorrador: (tipo: TipoEjercicio, id: string, campos: Record<string, string>) => void

  /* plan */
  irASemana: (n: number) => void
  cerrarSemana: (n: number) => void
  abrirSemana: (n: number) => void
  setRitmo: (n: number) => void

  /* mantenimiento */
  reiniciar: (que: 'todo' | 'preguntas' | 'ejercicios' | 'lecturas') => void
  importar: (p: Progreso) => void
}

const Ctx = createContext<StoreProgreso | null>(null)

export function ProveedorProgreso({ children }: { children: ReactNode }) {
  const [progreso, setProgreso] = useState<Progreso>(cargar)
  const primeraVez = useRef(true)

  useEffect(() => {
    if (primeraVez.current) { primeraVez.current = false; return }
    escribirGuardado(CLAVE, progreso)
  }, [progreso])

  // Otra pestaña de la misma app también escribe. Sin esto, la última en guardar pisa a la
  // otra: con el sandbox en una pestaña y una lección en otra, se perdía progreso.
  useEffect(() => {
    const on = (e: StorageEvent) => {
      if (e.key !== CLAVE || !e.newValue) return
      try {
        const remoto = JSON.parse(e.newValue) as Progreso
        if (remoto.v !== 2) return
        setProgreso((local) => fusionar(local, remoto))
      } catch { /* JSON de otra versión: se ignora */ }
    }
    window.addEventListener('storage', on)
    return () => window.removeEventListener('storage', on)
  }, [])

  const actualizar = useCallback((f: (p: Progreso) => Progreso) => {
    setProgreso((p) => ({ ...f(p), actualizado: Date.now() }))
  }, [])

  const store = useMemo<StoreProgreso>(() => ({
    progreso,

    leida: (id) => Boolean(progreso.leidas[id]),
    marcarLeida: (id, leida = true) => actualizar((p) => {
      const leidas = { ...p.leidas }
      if (leida) leidas[id] = Date.now()
      else delete leidas[id]
      return { ...p, leidas }
    }),

    tarjeta: (qid) => progreso.preguntas[qid],
    calificar: (qid, nota) => actualizar((p) => ({
      ...p, preguntas: { ...p.preguntas, [qid]: calificarTarjeta(p.preguntas[qid], nota) }
    })),
    vencidas: (qids) => qids.filter((q) => vencida(progreso.preguntas[q])),

    ejercicio: (tipo, id) => progreso.ejercicios[claveEjercicio(tipo, id)],
    resuelto: (tipo, id) => Boolean(progreso.ejercicios[claveEjercicio(tipo, id)]?.resuelto),
    registrarIntento: (tipo, id, ok) => actualizar((p) => {
      const k = claveEjercicio(tipo, id)
      const previo = p.ejercicios[k]
      return {
        ...p,
        ejercicios: {
          ...p.ejercicios,
          [k]: {
            resuelto: ok || Boolean(previo?.resuelto),
            intentos: (previo?.intentos ?? 0) + 1,
            ...(previo?.borrador ? { borrador: previo.borrador } : {}),
            actualizado: Date.now()
          }
        }
      }
    }),
    guardarBorrador: (tipo, id, campos) => actualizar((p) => {
      const k = claveEjercicio(tipo, id)
      const previo = p.ejercicios[k]
      return {
        ...p,
        ejercicios: {
          ...p.ejercicios,
          [k]: {
            resuelto: Boolean(previo?.resuelto),
            intentos: previo?.intentos ?? 0,
            borrador: campos,
            actualizado: Date.now()
          }
        }
      }
    }),

    irASemana: (n) => actualizar((p) => ({ ...p, semana: Math.max(1, Math.min(16, n)) })),
    cerrarSemana: (n) => actualizar((p) => ({
      ...p,
      cerradas: p.cerradas.includes(n) ? p.cerradas : [...p.cerradas, n].sort((a, b) => a - b),
      semana: Math.min(16, Math.max(p.semana, n + 1))
    })),
    abrirSemana: (n) => actualizar((p) => ({ ...p, cerradas: p.cerradas.filter((x) => x !== n) })),
    setRitmo: (n) => actualizar((p) => ({ ...p, ritmo: Math.max(1, Math.min(12, n)) })),

    reiniciar: (que) => actualizar((p) => {
      if (que === 'todo') return vacio()
      if (que === 'preguntas') return { ...p, preguntas: {} }
      if (que === 'ejercicios') return { ...p, ejercicios: {} }
      return { ...p, leidas: {} }
    }),
    importar: (nuevo) => setProgreso({ ...vacio(), ...nuevo, actualizado: Date.now() })
  }), [progreso, actualizar])

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useProgreso(): StoreProgreso {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useProgreso tiene que usarse dentro de <ProveedorProgreso>')
  return ctx
}
