import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import { useRuta } from './lib/router.ts'
import { ProveedorSesion, useSesion } from './lib/sesion.tsx'
import { ProveedorProgreso, useProgreso } from './lib/progreso.tsx'
import { calcularHoy } from './lib/hoy.ts'
import { TOTAL_EJERCICIOS } from './lib/ejercicios.ts'
import BarraLateral from './componentes/BarraLateral.tsx'
import PaletaComandos from './componentes/PaletaComandos.tsx'
import Inicio from './vistas/Inicio.tsx'
import Plan from './vistas/Plan.tsx'
import Leccion from './vistas/Leccion.tsx'
import Ejercitar from './vistas/Ejercitar.tsx'
import Examen from './vistas/Examen.tsx'
import Sandbox from './vistas/Sandbox.tsx'
import Mesa from './vistas/Mesa.tsx'
import Ajustes from './vistas/Ajustes.tsx'
import NoEncontrado from './vistas/NoEncontrado.tsx'
import Entrada from './vistas/Entrada.tsx'
import { SkeletonProsa } from './ui/Cargando.tsx'

/* Estas dos arrastran datos pesados (279 kB de transcripciones y 66 kB de enunciados)
   y se visitan poco: se cargan al entrar. */
const Practicas = lazy(() => import('./vistas/Practicas.tsx'))
const Clases = lazy(() => import('./vistas/Clases.tsx'))

const TITULOS: Record<string, string> = {
  inicio: 'Hoy', plan: 'Plan de estudio', leccion: 'Teoría', modulo: 'Teoría',
  ejercitar: 'Ejercitación', examen: 'Modo examen', sandbox: 'Sandbox',
  mesa: 'Mesa de trabajo', practicas: 'Enunciados', clases: 'Clases grabadas',
  buscar: 'Buscar', ajustes: 'Ajustes', nada: 'No encontrado'
}

function Contenido() {
  const { ruta, ir } = useRuta()
  const { progreso } = useProgreso()
  const [drawer, setDrawer] = useState(false)
  const [paleta, setPaleta] = useState(false)

  const hoy = useMemo(() => calcularHoy(progreso), [progreso])

  // al cambiar de vista: arriba de todo, y el título del documento acompaña
  useEffect(() => {
    window.scrollTo(0, 0)
    setDrawer(false)
    const t = TITULOS[ruta.v] ?? ''
    document.title = t ? `${t} · Lenguajes y Compiladores` : 'Lenguajes y Compiladores'
  }, [ruta])

  // atajos globales. Se ignoran mientras escribís en un campo, salvo ⌘K y Escape.
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const destino = e.target as HTMLElement | null
      const escribiendo = Boolean(
        destino && (destino.tagName === 'INPUT' || destino.tagName === 'TEXTAREA' || destino.isContentEditable)
      )
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setPaleta((v) => !v); return
      }
      if (escribiendo || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === '/') { e.preventDefault(); setPaleta(true); return }
      if (e.key === 'g') {
        // g seguido de una letra: ir a…
        const segunda = (ev: KeyboardEvent) => {
          window.removeEventListener('keydown', segunda)
          const mapa: Record<string, () => void> = {
            h: () => ir({ v: 'inicio' }),
            p: () => ir({ v: 'plan' }),
            e: () => ir({ v: 'ejercitar' }),
            s: () => ir({ v: 'sandbox' }),
            m: () => ir({ v: 'mesa' })
          }
          mapa[ev.key.toLowerCase()]?.()
        }
        window.addEventListener('keydown', segunda)
        setTimeout(() => window.removeEventListener('keydown', segunda), 1200)
      }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [ir])

  const cerrarPaleta = useCallback(() => setPaleta(false), [])

  const resueltos = Object.values(progreso.ejercicios).filter((e) => e.resuelto).length

  return (
    <div className="app">
      <a className="saltar" href="#contenido">Saltar al contenido</a>

      <BarraLateral
        ruta={ruta} ir={ir}
        abierta={drawer} cerrar={() => setDrawer(false)}
        abrirPaleta={() => setPaleta(true)}
        vencidas={hoy.vencidas.length}
        resueltos={resueltos}
        totalEjercicios={TOTAL_EJERCICIOS}
      />

      {drawer && <div className="backdrop" onClick={() => setDrawer(false)} aria-hidden="true" />}

      <div className="columna">
        <header className="superior">
          <button
            type="button" className="btn btn--ghost btn--sm"
            onClick={() => setDrawer(true)}
            aria-label="Abrir navegación" aria-expanded={drawer}
          >
            ☰
          </button>
          <span className="superior__titulo">{TITULOS[ruta.v] ?? 'Lenguajes y Compiladores'}</span>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPaleta(true)} aria-label="Buscar">⌕</button>
        </header>

        <main className="principal" id="contenido" tabIndex={-1}>
          <Suspense fallback={<SkeletonProsa lineas={8} />}>
            <Vista />
          </Suspense>
        </main>
      </div>

      <PaletaComandos abierta={paleta} cerrar={cerrarPaleta} ir={ir} />
    </div>
  )

  function Vista() {
    switch (ruta.v) {
      case 'inicio': return <Inicio ir={ir} hoy={hoy} />
      case 'plan': return <Plan ir={ir} />
      case 'leccion': return <Leccion id={ruta.id} ir={ir} />
      case 'modulo': return <Plan ir={ir} />
      case 'ejercitar': return <Ejercitar ir={ir} />
      case 'examen': return <Examen ir={ir} />
      case 'sandbox': return <Sandbox ir={ir} tipo={ruta.tipo} ej={ruta.ej} />
      case 'mesa': return <Mesa />
      case 'practicas': return <Practicas id={ruta.id} ir={ir} />
      case 'clases': return <Clases id={ruta.id} ir={ir} />
      case 'ajustes': return <Ajustes />
      case 'buscar': return <Inicio ir={ir} hoy={hoy} />
      case 'nada': return <NoEncontrado ir={ir} />
    }
  }
}

/* El login es obligatorio cuando hay backend configurado. Sin variables de entorno
   (desarrollo local, tests, `npm run smoke`) la app arranca directo en modo local. */
function Puerta() {
  const { estado } = useSesion()

  if (estado === 'cargando') {
    return (
      <div className="entrada">
        <div className="entrada__caja" aria-busy="true" aria-label="Verificando la sesión">
          <div className="skel" style={{ height: 28, width: 260, marginBottom: 'var(--s4)' }} />
          <div className="skel" style={{ height: 15, width: 320 }} />
        </div>
      </div>
    )
  }

  if (estado === 'anonimo') return <Entrada />

  return (
    <ProveedorProgreso>
      <Contenido />
    </ProveedorProgreso>
  )
}

export default function App() {
  return (
    <ProveedorSesion>
      <Puerta />
    </ProveedorSesion>
  )
}
