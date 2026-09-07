import { useState, useEffect } from 'react'
import { comparar } from '../lib/comparar.ts'
import type { Comparacion } from '../lib/comparar.ts'
import Boton from '../ui/Boton.tsx'
import Icono from '../ui/Icono.tsx'

/* Campo para escribir la respuesta antes de revelar el modelo.

   Escribir antes de ver la respuesta es lo que separa "me suena" de "lo sé": sin esto,
   revelar y decir "la sabía" es demasiado fácil.

   Sobre la corrección hay dos niveles y NO valen lo mismo, así que se dicen distinto:

   1. Motor. Una gramática se corre contra las cadenas del ejercicio. "Correcta" ahí es un
      hecho, con el mismo estándar del sandbox.
   2. Conceptos. Para prosa, ningún motor puede juzgar. Se marcan los conceptos del modelo
      que aparecen en tu texto y se aclara que es una ayuda para que te califiques, no una
      corrección. Decir "correcta" ahí sería la promesa que el proyecto no se permite. */

interface Props {
  /** Se resetea el texto cuando cambia. */
  clave: string
  /** El HTML de la respuesta modelo, para comparar. */
  modelo: string
  revelada: boolean
  filas?: number
}

export default function Responder({ clave, modelo, revelada, filas = 4 }: Props) {
  const [texto, setTexto] = useState('')
  const [comp, setComp] = useState<Comparacion | null>(null)

  useEffect(() => { setTexto(''); setComp(null) }, [clave])

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

      {revelada && !texto.trim() && (
        <p className="responder__aviso">
          No escribiste nada. La próxima, escribí antes de revelar: es lo que separa
          «me suena» de «lo sé».
        </p>
      )}
    </div>
  )
}
