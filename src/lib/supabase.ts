/* Cliente de Supabase. Es el único archivo que sabe que existe un backend.

   Sobre el flujo de OAuth: se usa PKCE y no el implícito. El implícito devuelve el token en
   el fragmento de la URL (`#access_token=…`), y aunque el router ya no use el hash, PKCE es
   más seguro y no ensucia la URL: vuelve con `?code=…` y se canjea del lado del cliente.

   Si faltan las variables de entorno, `supabase` es null y la app funciona igual en modo
   local: es lo que permite desarrollar y correr los tests sin credenciales. */

import { createClient, type SupabaseClient, type Session, type User } from '@supabase/supabase-js'

/* `import.meta.env` no existe fuera de Vite (los tests corren en node), así que se lee
   con cuidado en vez de asumir que está. */
const env: ImportMetaEnv = import.meta.env ?? ({} as ImportMetaEnv)
const url = env.VITE_SUPABASE_URL
const anon = env.VITE_SUPABASE_ANON_KEY

export const hayBackend = Boolean(url && anon)

export const supabase: SupabaseClient | null = hayBackend
  ? createClient(url as string, anon as string, {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null

export type { Session, User }

/** Nombre para mostrar, con los fallbacks que da Google. */
export function nombreDe(u: User | null): string {
  if (!u) return ''
  const m = u.user_metadata ?? {}
  return (m.full_name as string) || (m.name as string) || u.email || 'Tu cuenta'
}

export function avatarDe(u: User | null): string | null {
  const m = u?.user_metadata ?? {}
  return (m.avatar_url as string) || (m.picture as string) || null
}
