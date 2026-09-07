import { useState, useEffect } from 'react'
import { comparar } from '../lib/comparar.ts'
import type { Comparacion } from '../lib/comparar.ts'
import { corregirConIA, hayClaveIA } from '../lib/corregirIA.ts'
import type { CorreccionIA } from '../lib/corregirIA.ts'
import type { Ruta } from '../lib/router.ts'
import Enlace from './Enlace.tsx'
import Boton from '../ui/Boton.tsx'
import Icono from '../ui/Icono.tsx'

/* Campo para escribir la respuesta antes de revelar el modelo.

   Escribir antes de ver la respuesta es lo que separa "me suena" de "lo sé": sin esto,
   revelar y decir "la sabía" es demasiado fácil.

   Sobre la corrección hay tres niveles y NO valen lo mismo, así que se dicen distinto:

   1. Motor. Una gramática se corre. "Correcta" ahí es un hecho.
   2. Conceptos. Para prosa, sin nada más, se marcan los conceptos del modelo que aparecen
      en tu texto. No dice si está bien: es una ayuda para que te califiques.
   3. IA. Si el alumno cargó su clave de Azure en Ajustes, además opina un modelo. Se pide
      a mano (no sale solo: cuesta plata y es la clave del alumno) y se muestra rotulado
      como revisión, nunca con la autoridad del motor.

   Decir "correcta" con la voz del motor cuando en realidad opinó un modelo sería
   exactamente la promesa que el proyecto no se permite. */

interface Props {
  /** Se resetea el texto cuando cambia. */
  clave: string
  /** El HTML de la respuesta modelo, para comparar. */
  modelo: string
  revelada: boolean
  filas?: number
  /** La consigna, para darle contexto a la corrección con IA. */
  consigna?: string
  /** Para poder mandar a Ajustes a quien todavía no cargó su clave. */
  ir?: (r: Ruta) => void
}

const ROTULO_IA: Record<CorreccionIA['veredicto'], string> = {
  bien: 'La IA la da por correcta',
  parcial: 'La IA la da por incompleta',
  mal: 'La IA la da por incorrecta'
}

export default function Responder({ clave, modelo, revelada, filas = 4, consigna = '', ir }: Props) {
  const [texto, setTexto] = useState('')
  const [comp, setComp] = useState<Comparacion | null>(null)
  const [ia, setIA] = useState<CorreccionIA | null>(null)
  const [pidiendo, setPidiendo] = useState(false)
  const [errorIA, setErrorIA] = useState<string | null>(null)

  useEffect(() => { setTexto(''); setComp(null); setIA(null); setErrorIA(null) }, [clave])

  const pedirIA = async () => {
    setPidiendo(true); setErrorIA(null)
    const r = await corregirConIA({ consigna, modelo, respuesta: texto })
    setPidiendo(false)
    if (r.estado === 'ok') setIA(r.correccion)
    else if (r.estado === 'sin-clave') setErrorIA('Cargá tu clave de Azure en Ajustes para usar esto.')
    else setErrorIA(r.mensaje)
  }

  // al revelar se compara sola: el alumno ya no puede editar para hacerse trampa
  useEffect(() => {
    if (revelada && texto.trim()) setComp(comparar(texto, modelo))
  }, [revelada, texto, modelo])

  return (
    <div className="responder">
      <label className="campo__label" htmlFor={'r-' + clave}>
        <span>Tu respuesta</span>
        <em>{revelada ? 'comparala con el modelo' : 'escribila antes de revelar'}</em>
      </label>
      <textarea
        id={'r-' + clave}
        className="control responder__campo"
        rows={filas}
        value={texto}
        readOnly={revelada}
        placeholder="Escribí acá lo que te acordás. Podés usar la notación de la cátedra."
        onChange={(e) => setTexto(e.target.value)}
      />

      {revelada && comp && (
        <div className={'comparacion comparacion--' + (comp.clase === 'verificada' ? (comp.ok ? 'ok' : 'mal') : 'asistida')}>
          <Icono nombre={comp.clase === 'verificada' ? (comp.ok ? 'check' : 'cruz') : 'libro'} tam={16} />
          <div>
            <p className="comparacion__t">
              {comp.clase === 'verificada'
                ? (comp.ok ? 'Correcta, verificada por el motor' : 'Incorrecta, verificada por el motor')
                : 'Comparación asistida'}
            </p>
            <p className="comparacion__d">{comp.detalle}</p>
            {comp.conceptos && comp.conceptos.length > 0 && (
              <ul className="conceptos">
                {comp.conceptos.map((c) => (
                  <li key={c.termino} className={c.presente ? 'concepto concepto--si' : 'concepto'}>
                    <Icono nombre={c.presente ? 'check' : 'cruz'} tam={11} />
                    {c.termino}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* La revisión con IA se pide a mano: gasta de la clave del alumno, así que no sale
          sola. Sólo aparece cuando el motor no pudo dar un veredicto por su cuenta. */}
      {revelada && texto.trim() && comp?.clase === 'asistida' && (
        <div className="ia">
          {/* Sin clave NO va un botón deshabilitado: un control inerte que además lleva la
              instrucción adentro la pinta con el gris más apagado de la app, no se puede
              clickear y no lleva a ningún lado. Va una oferta con un enlace de verdad. */}
          {!ia && (hayClaveIA() ? (
            <Boton tamaño="sm" variante="secondary" onClick={() => void pedirIA()} cargando={pidiendo}>
              Que la revise la IA
            </Boton>
          ) : ir ? (
            <p className="ia__oferta">
              <Icono nombre="chispa" tam={14} />
              <span>
                ¿Querés que además la revise una IA y te diga qué te falta?{' '}
                <Enlace a={{ v: 'ajustes' }} ir={ir}>Cargá tu clave de Azure</Enlace>: queda en
                este navegador y la usás solo vos.
              </span>
            </p>
          ) : null)}
          {errorIA && <p className="ia__error" role="status">{errorIA}</p>}
          {ia && (
            <div className={'comparacion comparacion--ia comparacion--ia-' + ia.veredicto} role="status">
              <Icono nombre="chispa" tam={16} />
              <div>
                <p className="comparacion__t">
                  {ROTULO_IA[ia.veredicto]} <span className="ia__sello">puede equivocarse</span>
                </p>
                <p className="comparacion__d">{ia.detalle}</p>
                {ia.falta.length > 0 && (
                  <ul className="conceptos">
                    {ia.falta.map((c) => (
                      <li key={c} className="concepto"><Icono nombre="cruz" tam={11} />{c}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {revelada && !texto.trim() && (
        <p className="responder__aviso">
          No escribiste nada. La próxima, escribí antes de revelar: es lo que separa
          «me suena» de «lo sé».
        </p>
      )}
    </div>
  )
}
