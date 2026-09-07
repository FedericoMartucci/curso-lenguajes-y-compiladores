/* Store del progreso. Local-first: la fuente de verdad es el navegador, así la app anda
   sin conexión y sin esperar a la red. La sincronización con la cuenta se engancha acá
   (ver src/lib/sync.ts): sube lo local y fusiona lo remoto por marca de tiempo. */

import { createContext, useContext, useCallback, useMemo, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Progreso, Tarjeta, ProgresoEjercicio, Calificacion, ProgresoV1 } from '../tipos/progreso.ts'
import type { TipoEjercicio } from '../tipos/ejercicios.ts'
import { calificar as calificarTarjeta, vencida } from './srs.ts'
import { leerGuardado, escribirGuardado } from './hooks.ts'
import { fusionar } from './fusion.ts'
import { useSesion } from './sesion.tsx'
import { sincronizar } from './sync.ts'

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


/* ---------- API del store ---------- */

export { fusionar }

export const claveEjercicio = (tipo: TipoEjercicio, id: string): string => `${tipo}:${id}`

export interface StoreProgreso {
  progreso: Progreso

  /* teoría */
  leida: (id: string) => boolean
  marcarLeida: (id: string, leida?: boolean) => void

  /* preguntas */
  tarjeta: (qid: string) => Tarjeta | undefined
  calificar: (qid: string, nota: Calificacion) => void
  /** Vuelve una tarjeta a un estado anterior. `undefined` la deja como nunca vista. */
  restaurarTarjeta: (qid: string, tarjeta: Tarjeta | undefined) => void
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

  /* sincronización */
  sync: EstadoSync
  sincronizarAhora: () => void
}

export type EstadoSync =
  | { fase: 'local' }                          /* sin cuenta: solo este navegador */
  | { fase: 'sincronizando' }
  | { fase: 'al-dia'; cuando: number }
  | { fase: 'error'; mensaje: string }

const Ctx = createContext<StoreProgreso | null>(null)

export function ProveedorProgreso({ children }: { children: ReactNode }) {
  const [progreso, setProgreso] = useState<Progreso>(cargar)
  const [sync, setSync] = useState<EstadoSync>({ fase: 'local' })
  const primeraVez = useRef(true)
  const { usuario } = useSesion()
  const ultimoSubido = useRef(0)

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

  /* ---------- sincronización con la cuenta ---------- */

  const correrSync = useCallback(async () => {
    if (!usuario) { setSync({ fase: 'local' }); return }
    setSync({ fase: 'sincronizando' })
    const actual = leerGuardado<Progreso>(CLAVE, cargar())
    const r = await sincronizar(usuario.id, actual, fusionar)
    if (r.ok && r.progreso) {
      setProgreso(r.progreso)
      ultimoSubido.current = r.progreso.actualizado
      setSync({ fase: 'al-dia', cuando: Date.now() })
    } else {
      setSync({ fase: 'error', mensaje: r.error ?? 'No pude sincronizar.' })
    }
  }, [usuario])

  // al entrar (o al cambiar de cuenta) se fusiona lo local con lo del servidor
  useEffect(() => { void correrSync() }, [correrSync])

  // después, se sube con retraso: no una vez por tecla, y solo si algo cambió
  useEffect(() => {
    if (!usuario) return
    if (progreso.actualizado <= ultimoSubido.current) return
    const t = setTimeout(() => { void correrSync() }, 4000)
    return () => clearTimeout(t)
  }, [progreso.actualizado, usuario, correrSync])

  // y también al cerrar la pestaña, para no perder los últimos segundos
  useEffect(() => {
    if (!usuario) return
    const on = () => {
      if (progreso.actualizado <= ultimoSubido.current) return
      void correrSync()
    }
    window.addEventListener('pagehide', on)
    return () => window.removeEventListener('pagehide', on)
  }, [progreso, usuario, correrSync])

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
    restaurarTarjeta: (qid, tarjeta) => actualizar((p) => {
      const preguntas = { ...p.preguntas }
      if (tarjeta) preguntas[qid] = tarjeta
      else delete preguntas[qid]
      return { ...p, preguntas }
    }),
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
    importar: (nuevo) => setProgreso({ ...vacio(), ...nuevo, actualizado: Date.now() }),

    sync,
    sincronizarAhora: () => { void correrSync() }
  }), [progreso, actualizar, sync, correrSync])

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useProgreso(): StoreProgreso {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useProgreso tiene que usarse dentro de <ProveedorProgreso>')
  return ctx
}
