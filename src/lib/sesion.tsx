/* Sesión con Google. El login es obligatorio cuando hay backend configurado.

   La app sigue siendo local-first: una vez que entraste, todo lo que hacés se guarda en el
   navegador y anda sin conexión. La cuenta sirve para que el progreso te siga entre
   máquinas, no para que la app dependa de la red en cada acción. */

import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase, hayBackend, type Session, type User } from './supabase.ts'

export type EstadoSesion = 'cargando' | 'sin-backend' | 'anonimo' | 'con-sesion'

export interface Sesion {
  estado: EstadoSesion
  usuario: User | null
  entrarConGoogle: () => Promise<void>
  salir: () => Promise<void>
  /** Último error de autenticación, para mostrarlo en la pantalla de entrada. */
  error: string | null
}

const Ctx = createContext<Sesion | null>(null)

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoSesion>(hayBackend ? 'cargando' : 'sin-backend')
  const [usuario, setUsuario] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return
    let vivo = true

    supabase.auth.getSession().then(({ data, error: e }) => {
      if (!vivo) return
      if (e) setError(e.message)
      aplicar(data.session)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      if (!vivo) return
      aplicar(sesion)
    })

    function aplicar(s: Session | null) {
      setUsuario(s?.user ?? null)
      setEstado(s ? 'con-sesion' : 'anonimo')
    }

    return () => { vivo = false; sub.subscription.unsubscribe() }
  }, [])

  const entrarConGoogle = async () => {
    if (!supabase) return
    setError(null)
    const { error: e } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        // refresh token de larga duración: para que la PWA no te pida entrar cada vez
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    })
    if (e) setError(e.message)
  }

  const salir = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  return (
    <Ctx.Provider value={{ estado, usuario, entrarConGoogle, salir, error }}>
      {children}
    </Ctx.Provider>
  )
}

export function useSesion(): Sesion {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSesion tiene que usarse dentro de <ProveedorSesion>')
  return ctx
}
