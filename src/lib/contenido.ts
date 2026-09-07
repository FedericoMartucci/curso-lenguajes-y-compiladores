/* Hooks para el contenido diferido. La navegación no los necesita: solo las pantallas que
   de verdad muestran el cuerpo de una lección o una pregunta con su respuesta. */

import { useState, useEffect } from 'react'
import { cargarContenido, cargarBanco, contenidoCargado, bancoCargado } from './curso.ts'
import type { CuerpoLeccion, PreguntaBanco } from '../tipos/curso.ts'

/** El cuerpo de una lección. `cargando` es true solo la primera vez de la sesión. */
export function useCuerpo(id: string): { cuerpo: CuerpoLeccion | undefined; cargando: boolean } {
  const yaEsta = contenidoCargado()
  const [cuerpo, setCuerpo] = useState<CuerpoLeccion | undefined>(() => yaEsta?.[id])
  const [cargando, setCargando] = useState(!yaEsta)

  useEffect(() => {
    let vivo = true
    const enMemoria = contenidoCargado()
    if (enMemoria) { setCuerpo(enMemoria[id]); setCargando(false); return }
    setCargando(true)
    cargarContenido().then((c) => {
      if (!vivo) return
      setCuerpo(c[id])
      setCargando(false)
    })
    return () => { vivo = false }
  }, [id])

  return { cuerpo, cargando }
}

/** El banco completo de preguntas con sus respuestas. */
export function useBanco(): { banco: PreguntaBanco[]; cargando: boolean } {
  const yaEsta = bancoCargado()
  const [banco, setBanco] = useState<PreguntaBanco[]>(() => yaEsta ?? [])
  const [cargando, setCargando] = useState(!yaEsta)

  useEffect(() => {
    if (bancoCargado()) return
    let vivo = true
    setCargando(true)
    cargarBanco().then((b) => {
      if (!vivo) return
      setBanco(b)
      setCargando(false)
    })
    return () => { vivo = false }
  }, [])

  return { banco, cargando }
}
