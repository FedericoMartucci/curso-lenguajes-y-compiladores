import { useState, useEffect } from 'react'
import { comparar, compararVF, veredictoVF } from '../lib/comparar.ts'
import type { Comparacion, ValorVF } from '../lib/comparar.ts'
import type { TipoPregunta } from '../tipos/curso.ts'
import Icono from '../ui/Icono.tsx'

/* Campo para escribir la respuesta antes de revelar el modelo.

   Escribir antes de ver la respuesta es lo que separa "me suena" de "lo sé": sin esto,
   revelar y decir "la sabía" es demasiado fácil.

   La app corrige lo que puede ejecutar y de lo demás no opina:

   - **V/F**: se elige Verdadero o Falso antes de revelar y eso SÍ se valida contra el
     modelo. La justificación escrita al lado queda para que la califiques vos.
   - **Gramáticas**: las corre el motor contra las cadenas, igual que el sandbox.
   - **Desarrollar**: autoevaluación. No hay veredicto ni puntaje aproximado. Se probó dar
     una señal automática (conceptos del modelo presentes en tu texto) y se sacó: "tocás 2
     de 6" se lee como una nota aunque aclare que no lo es, y castigaba a quien lo escribía
     con sus palabras. Para calificarte están los botones del drill, que es donde el juicio
     tiene que estar: en vos. */

interface Props {
  /** Se resetea el texto cuando cambia. */
  clave: string
  /** El HTML de la respuesta modelo, para comparar. */
  modelo: string
  revelada: boolean
  filas?: number
  /** Habilita la elección Verdadero/Falso cuando la pregunta es de ese tipo. */
  tipo?: TipoPregunta
}

export default function Responder({ clave, modelo, revelada, filas = 4, tipo }: Props) {
  const [texto, setTexto] = useState('')
  const [comp, setComp] = useState<Comparacion | null>(null)
  const [eleccion, setEleccion] = useState<ValorVF | null>(null)

  // la V/F sólo se ofrece si el modelo declara su respuesta; si alguien edita el contenido
  // y le saca el formato, desaparece el control en vez de mentir con un veredicto vacío
  const esVF = tipo === 'vf' && veredictoVF(modelo) !== null

  useEffect(() => { setTexto(''); setComp(null); setEleccion(null) }, [clave])

  // al revelar se compara sola: el alumno ya no puede editar para hacerse trampa
  useEffect(() => {
    if (!revelada) return
    if (esVF && eleccion) { setComp(compararVF(eleccion, modelo)); return }
    if (texto.trim()) setComp(comparar(texto, modelo))
  }, [revelada, texto, modelo, esVF, eleccion])

  return (
    <div className="responder">
      {esVF && (
        <fieldset className="vf" disabled={revelada}>
          <legend className="campo__label"><span>Tu respuesta</span></legend>
          <div className="vf__ops">
            {(['V', 'F'] as ValorVF[]).map((v) => (
              <label key={v} className="vf__op">
                <input
                  type="radio" name={'vf-' + clave} value={v}
                  checked={eleccion === v}
                  onChange={() => setEleccion(v)}
                />
                <span>{v === 'V' ? 'Verdadero' : 'Falso'}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <label className="campo__label" htmlFor={'r-' + clave}>
        <span>{esVF ? 'Tu justificación' : 'Tu respuesta'}</span>
        <em>{revelada ? 'comparala con el modelo' : 'escribila antes de revelar'}</em>
      </label>
      <textarea
        id={'r-' + clave}
        className="control responder__campo"
        rows={filas}
        value={texto}
        readOnly={revelada}
        placeholder={esVF
          ? 'Justificá por qué. Podés usar la notación de la cátedra.'
          : 'Escribí acá lo que te acordás. Podés usar la notación de la cátedra.'}
        onChange={(e) => setTexto(e.target.value)}
      />

      {revelada && comp && (
        <div className={'comparacion comparacion--' + (comp.ok ? 'ok' : 'mal')} role="status">
          <Icono nombre={comp.ok ? 'check' : 'cruz'} tam={16} />
          <div>
            <p className="comparacion__t">{comp.ok ? 'Correcta' : 'Incorrecta'}</p>
            <p className="comparacion__d">{comp.detalle}</p>
          </div>
        </div>
      )}

      {/* Lo que no se puede ejecutar no lleva veredicto: se dice qué hacer, no cómo te fue. */}
      {revelada && !comp && texto.trim() && (
        <p className="responder__auto">
          Compará tu respuesta con el modelo y calificate abajo. Esto no se corrige solo:
          sos vos quien sabe si lo tenías o lo estás leyendo por primera vez.
        </p>
      )}

      {revelada && !texto.trim() && !eleccion && (
        <p className="responder__aviso">
          No escribiste nada. La próxima, escribí antes de revelar: es lo que separa
          «me suena» de «lo sé».
        </p>
      )}
    </div>
  )
}
