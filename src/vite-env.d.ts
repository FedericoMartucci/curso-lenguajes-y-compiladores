/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL del proyecto de Supabase. Sin ella la app corre en modo local, sin cuenta. */
  readonly VITE_SUPABASE_URL?: string
  /** Clave anónima (pública) de Supabase. La seguridad la da RLS, no ocultar esta clave. */
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  /** Opcional a propósito: en los tests la app corre en node, donde no existe. */
  readonly env?: ImportMetaEnv
}
