import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Ejercitar from './components/Ejercitar.jsx'
import Sandbox from './components/Sandbox.jsx'
import Mesa from './components/Mesa.jsx'
import { Inicio, Leccion, Banco, Buscar, Transcripciones, Enunciados } from './components/Vistas.jsx'
import { useHashRoute, useTheme } from './lib/hooks.js'

function Vista({ hash, navigate }) {
  if (hash.startsWith('#/l/')) return <Leccion id={decodeURIComponent(hash.slice(4))} navigate={navigate} />
  if (hash.startsWith('#/buscar/')) return <Buscar term={decodeURIComponent(hash.slice(9))} navigate={navigate} />
  if (hash.startsWith('#/ejercitar')) return <Ejercitar navigate={navigate} />
  if (hash.startsWith('#/sandbox')) return <Sandbox />
  if (hash.startsWith('#/mesa')) return <Mesa />
  if (hash.startsWith('#/transcripciones/')) return <Transcripciones id={decodeURIComponent(hash.slice(18))} navigate={navigate} />
  if (hash.startsWith('#/transcripciones')) return <Transcripciones navigate={navigate} />
  if (hash.startsWith('#/practicas/')) return <Enunciados id={decodeURIComponent(hash.slice(12))} navigate={navigate} />
  if (hash.startsWith('#/practicas')) return <Enunciados navigate={navigate} />
  if (hash.startsWith('#/banco')) return <Banco navigate={navigate} />
  return <Inicio navigate={navigate} />
}

export default function App() {
  const [hash, navigate] = useHashRoute()
  const [, toggleTheme] = useTheme()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  // al cambiar de vista, subir al principio
  useEffect(() => { window.scrollTo(0, 0) }, [hash])

  return (
    <div className="wrap">
      <Sidebar
        hash={hash} navigate={navigate} open={open} setOpen={setOpen}
        onToggleTheme={toggleTheme} query={query} setQuery={setQuery}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="topbar">
          <button className="iconbtn" onClick={() => setOpen((v) => !v)}>☰</button>
          <strong style={{ fontSize: 14, fontWeight: 500 }}>Lenguajes y Compiladores</strong>
        </div>
        <main className="main">
          <Vista hash={hash} navigate={navigate} />
        </main>
      </div>
    </div>
  )
}
