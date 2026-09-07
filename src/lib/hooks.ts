import { useState, useEffect, useCallback, useRef } from 'react'

/* ---------- almacenamiento ---------- */

/** Acceso a localStorage que nunca tira: en modo privado degrada a memoria. */
const memoria = new Map<string, string>()

export function leerGuardado<T>(clave: string, porDefecto: T): T {
  try {
    const raw = localStorage.getItem(clave) ?? memoria.get(clave) ?? null
    return raw ? (JSON.parse(raw) as T) : porDefecto
  } catch {
    return porDefecto
  }
}

export function escribirGuardado(clave: string, valor: unknown): void {
  const raw = JSON.stringify(valor)
  memoria.set(clave, raw)
  try { localStorage.setItem(clave, raw) } catch { /* modo privado: queda en memoria */ }
}

/** Estado persistido en el navegador. Acepta actualizadores como useState. */
export function useLocalStorage<T>(clave: string, inicial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [valor, setValor] = useState<T>(() => leerGuardado(clave, inicial))
  const claveRef = useRef(clave)
  claveRef.current = clave

  useEffect(() => { escribirGuardado(clave, valor) }, [clave, valor])

  const set = useCallback((v: T | ((prev: T) => T)) => {
    setValor((prev) => (typeof v === 'function' ? (v as (p: T) => T)(prev) : v))
  }, [])

  return [valor, set]
}

/* ---------- tema ---------- */

export type Tema = 'light' | 'dark' | 'system'

const CLAVE_TEMA = 'lyc-tema'

/** El tema tiene tres estados. 'system' no escribe el atributo y deja mandar al SO. */
export function useTheme(): [Tema, (t: Tema) => void, 'light' | 'dark'] {
  const [tema, setTema] = useLocalStorage<Tema>(CLAVE_TEMA, 'system')
  const [delSistema, setDelSistema] = useState<'light' | 'dark'>(() => prefiereOscuro() ? 'dark' : 'light')

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mq) return
    const on = (e: MediaQueryListEvent) => setDelSistema(e.matches ? 'dark' : 'light')
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  useEffect(() => {
    const raiz = document.documentElement
    if (tema === 'system') raiz.removeAttribute('data-theme')
    else raiz.setAttribute('data-theme', tema)
  }, [tema])

  const efectivo: 'light' | 'dark' = tema === 'system' ? delSistema : tema
  return [tema, setTema, efectivo]
}

function prefiereOscuro(): boolean {
  try { return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false }
  catch { return false }
}

/** true cuando la barra lateral se comporta como drawer. El breakpoint es el mismo que
    el de shell.css: si cambia uno hay que cambiar el otro. */
export function useEsDrawer(): boolean {
  const [es, setEs] = useState<boolean>(() => {
    try { return window.matchMedia?.('(max-width: 880px)').matches ?? false }
    catch { return false }
  })
  useEffect(() => {
    const mq = window.matchMedia?.('(max-width: 880px)')
    if (!mq) return
    const on = (e: MediaQueryListEvent) => setEs(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return es
}

/* ---------- utilidades de interacción ---------- */

/** Cierra algo al apretar Escape. */
export function useEscape(activo: boolean, alCerrar: () => void): void {
  useEffect(() => {
    if (!activo) return
    const on = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); alCerrar() } }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [activo, alCerrar])
}

/** true cuando el usuario pidió menos movimiento. Toda animación tiene que consultarlo. */
export function useMenosMovimiento(): boolean {
  const [menos, setMenos] = useState<boolean>(() => {
    try { return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false }
    catch { return false }
  })
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return
    const on = (e: MediaQueryListEvent) => setMenos(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return menos
}
