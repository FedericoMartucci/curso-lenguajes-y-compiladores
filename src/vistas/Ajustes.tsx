import { useState, useMemo } from 'react'
import { useTheme } from '../lib/hooks.ts'
import type { Tema } from '../lib/hooks.ts'
import { useProgreso } from '../lib/progreso.tsx'
import { useSesion } from '../lib/sesion.tsx'
import { nombreDe, avatarDe } from '../lib/supabase.ts'
import EstadoSync from '../componentes/EstadoSync.tsx'
import { calcularAvance } from '../lib/hoy.ts'
import { coberturaContenido } from '../lib/curso.ts'
import Cabecera from './Cabecera.tsx'
import Boton from '../ui/Boton.tsx'
import Selector from '../ui/Selector.tsx'

const TEMAS: { id: Tema; label: string }[] = [
  { id: 'light', label: 'Claro' },
  { id: 'dark', label: 'Oscuro' },
  { id: 'system', label: 'Como el sistema' }
]

type Borrado = 'todo' | 'preguntas' | 'ejercicios' | 'lecturas'

const QUE_BORRA: Record<Borrado, string> = {
  todo: 'todo tu progreso: lecturas, preguntas y ejercicios',
  preguntas: 'las calificaciones de las 417 preguntas',
  ejercicios: 'los ejercicios resueltos y los borradores del sandbox',
  lecturas: 'las marcas de lección leída'
}


export default function Ajustes() {
  const [tema, setTema] = useTheme()
  const { progreso, setRitmo, reiniciar, sincronizarAhora } = useProgreso()
  const { usuario, salir, estado } = useSesion()
  const [confirmar, setConfirmar] = useState<Borrado | null>(null)

  const avance = useMemo(() => calcularAvance(progreso), [progreso])
  const cobertura = coberturaContenido()

  return (
    <>
      <Cabecera titulo="Ajustes" />

      <section className="panel" aria-labelledby="h-tema">
        <h3 id="h-tema" className="panel__titulo">Apariencia</h3>
        <p style={{ color: 'var(--ink-2)', marginBottom: 'var(--s4)', fontSize: 'var(--fs-md)' }}>
          El tema oscuro es una paleta propia, no un filtro invertido: está pensado para leer de noche
          durante horas.
        </p>
        <div className="segmentado" role="group" aria-label="Tema">
          {TEMAS.map((t) => (
            <button key={t.id} type="button" aria-pressed={tema === t.id} onClick={() => setTema(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section className="panel" style={{ marginTop: 'var(--s4)' }} aria-labelledby="h-ritmo">
        <h3 id="h-ritmo" className="panel__titulo">Ritmo de estudio</h3>
        <p style={{ color: 'var(--ink-2)', marginBottom: 'var(--s4)', fontSize: 'var(--fs-md)' }}>
          Cuántas lecciones te propone la app por día dentro de la semana activa. No cambia el plan:
          solo el tamaño de la meta diaria.
        </p>
        <div style={{ maxWidth: 280 }}>
          <Selector
            etiqueta="Lecciones por día" valor={String(progreso.ritmo)} ancho="100%"
            onCambio={(v) => setRitmo(Number(v))}
            opciones={[1, 2, 3, 4, 5, 6, 8].map((n) => ({
              valor: String(n), etiqueta: `${n} ${n === 1 ? 'lección' : 'lecciones'} por día`
            }))}
          />
        </div>
      </section>

      <section className="panel" style={{ marginTop: 'var(--s4)' }} aria-labelledby="h-cuenta">
        <h3 id="h-cuenta" className="panel__titulo">Tu cuenta</h3>

        {usuario ? (
          <>
            <div className="cuenta" style={{ margin: 'var(--s4) 0' }}>
              {avatarDe(usuario)
                ? <img className="cuenta__avatar" src={avatarDe(usuario) as string} alt="" width={32} height={32} />
                : <span className="cuenta__avatar" aria-hidden="true" />}
              <span className="cuenta__cuerpo">
                <span className="cuenta__nombre">{nombreDe(usuario)}</span>
                <span className="cuenta__mail">{usuario.email}</span>
              </span>
            </div>
            <p style={{ color: 'var(--ink-2)', fontSize: 'var(--fs-md)', lineHeight: 1.6, marginBottom: 'var(--s4)' }}>
              Tu progreso vive en este navegador y se copia a tu cuenta, así que podés seguir desde otra
              máquina y no perdés nada si borrás los datos del sitio. La app funciona sin conexión: se
              sincroniza cuando vuelve la red.
            </p>
            <div className="tira">
              <EstadoSync detallado />
              <Boton tamaño="sm" onClick={sincronizarAhora}>Sincronizar ahora</Boton>
              <Boton tamaño="sm" variante="ghost" onClick={() => { void salir() }}>Cerrar sesión</Boton>
            </div>
          </>
        ) : (
          <p style={{ color: 'var(--ink-2)', fontSize: 'var(--fs-md)', lineHeight: 1.6 }}>
            {estado === 'sin-backend'
              ? 'Esta copia corre sin cuenta: tu progreso queda solo en este navegador.'
              : 'No hay una sesión activa.'}
          </p>
        )}
      </section>

      <section className="panel" style={{ marginTop: 'var(--s4)' }} aria-labelledby="h-datos">
        <h3 id="h-datos" className="panel__titulo">Tu progreso</h3>
        <div className="rejilla rejilla--3" style={{ margin: 'var(--s4) 0' }}>
          <div><div className="dato__v">{avance.leidas}</div><div className="dato__l">lecciones leídas de {avance.totalLecciones}</div></div>
          <div><div className="dato__v">{avance.sabidas}</div><div className="dato__l">preguntas sabidas de {avance.totalPreguntas}</div></div>
          <div><div className="dato__v">{avance.resueltos}</div><div className="dato__l">ejercicios resueltos de {avance.totalEjercicios}</div></div>
        </div>

        <p className="campo__label" style={{ marginTop: 'var(--s5)' }}>Empezar de nuevo</p>
        <div className="tira" style={{ gap: 'var(--s2)' }}>
          {(Object.keys(QUE_BORRA) as Borrado[]).map((k) => (
            <Boton key={k} tamaño="sm" variante={k === 'todo' ? 'danger' : 'secondary'}
                   onClick={() => setConfirmar(k)}>
              {k === 'todo' ? 'Borrar todo' : `Borrar ${k}`}
            </Boton>
          ))}
        </div>

        {confirmar && (
          <div className="avisos" role="alertdialog" aria-label="Confirmar borrado">
            <p style={{ marginBottom: 'var(--s3)' }}>
              Vas a borrar <b>{QUE_BORRA[confirmar]}</b>. No se puede deshacer.
            </p>
            <div className="tira" style={{ gap: 'var(--s2)' }}>
              <Boton tamaño="sm" variante="danger" onClick={() => { reiniciar(confirmar); setConfirmar(null) }}>
                Sí, borrar
              </Boton>
              <Boton tamaño="sm" variante="ghost" onClick={() => setConfirmar(null)}>Cancelar</Boton>
            </div>
          </div>
        )}
      </section>

      <section className="panel panel--plano" style={{ marginTop: 'var(--s4)' }} aria-labelledby="h-acerca">
        <h3 id="h-acerca" className="panel__titulo">Sobre el contenido</h3>
        <p style={{ color: 'var(--ink-2)', fontSize: 'var(--fs-md)', lineHeight: 1.6 }}>
          {cobertura.total} lecciones escritas sobre el libro de Aho (2ª edición) y los apuntes de la
          cátedra, {avance.totalPreguntas} preguntas y {avance.totalEjercicios} ejercicios con{' '}
          casos de prueba que se ejecutan de verdad. El plan sigue el cronograma 2C2026 de la materia
          1124/3663 de la UNLaM.
        </p>
      </section>
    </>
  )
}
