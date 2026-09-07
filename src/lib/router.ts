/* Router por History API. Reemplaza al router por hash: ahora hay backend y deploy en Vercel,
   así que las URLs pueden ser reales (compartibles, y sin que el # pelee con el callback de OAuth).
   El rewrite a index.html está en vercel.json. */

import { useState, useEffect, useCallback } from 'react'

export type Ruta =
  | { v: 'inicio' }
  | { v: 'plan' }
  | { v: 'evaluacion'; n: number }
  | { v: 'leccion'; id: string }
  | { v: 'modulo'; id: number }
  | { v: 'ejercitar' }
  | { v: 'examen' }
  | { v: 'sandbox'; tipo?: string; ej?: string }
  | { v: 'mesa' }
  | { v: 'practicas'; id?: string }
  | { v: 'clases'; id?: string }
  | { v: 'buscar'; q: string }
  | { v: 'ajustes' }
  | { v: 'nada'; path: string }

const seg = (p: string): string[] => p.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean)

export function parsear(pathname: string, search = ''): Ruta {
  const s = seg(decodeURIComponent(pathname))
  const q = new URLSearchParams(search)
  const [a, b] = s

  if (!a) return { v: 'inicio' }
  switch (a) {
    case 'plan': return { v: 'plan' }
    case 'evaluacion': return b && /^\d+$/.test(b) ? { v: 'evaluacion', n: Number(b) } : { v: 'plan' }
    case 'leccion': return b ? { v: 'leccion', id: b } : { v: 'inicio' }
    case 'modulo': return b && /^\d+$/.test(b) ? { v: 'modulo', id: Number(b) } : { v: 'inicio' }
    case 'ejercitar': return { v: 'ejercitar' }
    case 'examen': return { v: 'examen' }
    case 'sandbox': {
      const r: Ruta = { v: 'sandbox' }
      if (b) r.tipo = b
      const ej = s[2]
      if (ej) r.ej = ej
      return r
    }
    case 'mesa': return { v: 'mesa' }
    case 'practicas': return b ? { v: 'practicas', id: b } : { v: 'practicas' }
    case 'clases': return b ? { v: 'clases', id: b } : { v: 'clases' }
    case 'ajustes': return { v: 'ajustes' }
    case 'buscar': return { v: 'buscar', q: q.get('q') ?? '' }
    default: return { v: 'nada', path: pathname }
  }
}

export function aHref(r: Ruta): string {
  switch (r.v) {
    case 'inicio': return '/'
    case 'plan': return '/plan'
    case 'evaluacion': return '/evaluacion/' + r.n
    case 'leccion': return '/leccion/' + encodeURIComponent(r.id)
    case 'modulo': return '/modulo/' + r.id
    case 'ejercitar': return '/ejercitar'
    case 'examen': return '/examen'
    case 'sandbox': return '/sandbox' + (r.tipo ? '/' + r.tipo : '') + (r.tipo && r.ej ? '/' + encodeURIComponent(r.ej) : '')
    case 'mesa': return '/mesa'
    case 'practicas': return '/practicas' + (r.id ? '/' + r.id : '')
    case 'clases': return '/clases' + (r.id ? '/' + r.id : '')
    case 'ajustes': return '/ajustes'
    case 'buscar': return '/buscar?q=' + encodeURIComponent(r.q)
    case 'nada': return r.path
  }
}

export interface Navegacion {
  ruta: Ruta
  ir: (r: Ruta, opciones?: { reemplazar?: boolean }) => void
  href: (r: Ruta) => string
}

export function useRuta(): Navegacion {
  const [ruta, setRuta] = useState<Ruta>(() => parsear(location.pathname, location.search))

  useEffect(() => {
    const on = () => setRuta(parsear(location.pathname, location.search))
    window.addEventListener('popstate', on)
    return () => window.removeEventListener('popstate', on)
  }, [])

  const ir = useCallback((r: Ruta, opciones?: { reemplazar?: boolean }) => {
    const url = aHref(r)
    // reemplazar: para el buscador, que cambia en cada tecla y no debe llenar el historial
    if (opciones?.reemplazar) history.replaceState(null, '', url)
    else history.pushState(null, '', url)
    setRuta(parsear(location.pathname, location.search))
  }, [])

  return { ruta, ir, href: aHref }
}

/** Igual a un <a> normal: se puede enfocar con Tab, abrir en otra pestaña y copiar el link.
    Solo intercepta el clic simple sin modificadores. */
export function alClicNavegar(
  e: { preventDefault: () => void; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean; button: number },
  accion: () => void
): void {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
  e.preventDefault()
  accion()
}
