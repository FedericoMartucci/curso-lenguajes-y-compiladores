import { useState, useEffect, useCallback } from 'react'

/** Router por hash: no necesita configuración de servidor y anda igual en Vercel y desde file://. */
export function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash || '#/inicio')
  useEffect(() => {
    const on = () => setHash(window.location.hash || '#/inicio')
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const navigate = useCallback((to) => { window.location.hash = to }, [])
  return [hash, navigate]
}

/** Estado persistido en el navegador (sin backend). Degrada a memoria si localStorage falla. */
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initial
    } catch { return initial }
  })
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* modo privado: queda en memoria */ }
  }, [key, value])
  return [value, setValue]
}

export function useTheme() {
  const [theme, setTheme] = useLocalStorage('lyc-theme', null)
  useEffect(() => {
    if (theme) document.documentElement.setAttribute('data-theme', theme)
    else document.documentElement.removeAttribute('data-theme')
  }, [theme])
  const toggle = () => {
    const dark = theme ? theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(dark ? 'light' : 'dark')
  }
  return [theme, toggle]
}
