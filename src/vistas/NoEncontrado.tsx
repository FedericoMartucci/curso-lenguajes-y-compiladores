import type { Ruta } from '../lib/router.ts'
import Cabecera from './Cabecera.tsx'
import Boton from '../ui/Boton.tsx'

export default function NoEncontrado({ ir, que }: { ir: (r: Ruta) => void; que?: string }) {
  return (
    <>
      <Cabecera titulo="No encontré eso" />
      <div className="vacio">
        <h3>{que ? `No existe ${que}.` : 'Esta dirección no corresponde a ninguna pantalla.'}</h3>
        <p>
          Puede que el link esté viejo o mal copiado. Probá buscar el tema por nombre: la paleta
          indexa las 110 lecciones y los 98 ejercicios.
        </p>
        <div className="tira" style={{ justifyContent: 'center' }}>
          <Boton variante="primary" onClick={() => ir({ v: 'inicio' })}>Volver a Hoy</Boton>
          <Boton onClick={() => ir({ v: 'plan' })}>Ver el plan</Boton>
        </div>
      </div>
    </>
  )
}
