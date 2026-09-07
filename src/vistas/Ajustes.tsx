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
import Icono from '../ui/Icono.tsx'
import { leerClaveIA, guardarClaveIA } from '../lib/corregirIA.ts'

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


/* La clave de Azure es el único ajuste que NO se sincroniza, a propósito: sincronizarla
   significaría guardar la credencial de cada alumno en una base que no necesita tenerla. */
function PanelIA() {
  const [guardada, setGuardada] = useState(() => leerClaveIA())
  const [endpoint, setEndpoint] = useState(guardada?.endpoint ?? '')
  const [key, setKey] = useState('')
  const [modelo, setModelo] = useState(guardada?.modelo ?? 'gpt-5.1')
  const [aviso, setAviso] = useState<string | null>(null)

  const guardar = () => {
    const clave = key.trim() || guardada?.key || ''
    if (!endpoint.trim() || !clave) return
    const nueva = { endpoint: endpoint.trim(), key: clave, modelo: modelo.trim() || 'gpt-5.1' }
    guardarClaveIA(nueva)
    setGuardada(nueva); setKey('')
    setAviso('Clave guardada en este navegador.')
  }
  const borrar = () => {
    guardarClaveIA(null)
    setGuardada(null); setEndpoint(''); setKey(''); setModelo('gpt-5.1')
    setAviso('Clave borrada de este navegador.')
  }

  return (
    <section className="panel" style={{ marginTop: 'var(--s4)' }} aria-labelledby="h-ia">
      <h3 id="h-ia" className="panel__titulo">Corrección con IA</h3>
      <p style={{ color: 'var(--ink-2)', marginBottom: 'var(--s4)', fontSize: 'var(--fs-md)', lineHeight: 1.6 }}>
        En las respuestas escritas la app compara tu texto con el modelo y te marca qué conceptos
        aparecen. Si cargás tu clave de Azure OpenAI, además te dice si está bien y qué te falta.{' '}
        <strong>Es la opinión de un modelo, no el sandbox:</strong> ahí un ejercicio se ejecuta de
        verdad y el veredicto es un hecho; acá se puede equivocar.
      </p>

      <div className="callout aho" style={{ marginBottom: 'var(--s4)' }}>
        <span className="lab"><Icono nombre="libro" tam={14} /> Dónde queda tu clave</span>
        En este navegador y nada más. No se guarda en el servidor, no viaja con tu progreso a tus
        otros dispositivos y no se comparte con nadie: cada uno pone la suya y paga lo suyo.
      </div>

      <div className="campo">
        <label className="campo__label" htmlFor="ia-endpoint"><span>Endpoint</span></label>
        <input id="ia-endpoint" className="control" type="url" autoComplete="off" spellCheck={false}
          placeholder="https://tu-recurso.services.ai.azure.com/openai/v1"
          value={endpoint} onChange={(e) => setEndpoint(e.target.value)} />
      </div>
      <div className="campo" style={{ marginTop: 'var(--s3)' }}>
        <label className="campo__label" htmlFor="ia-key">
          <span>Clave</span>
          {guardada && <em>ya hay una guardada; escribí para reemplazarla</em>}
        </label>
        <input id="ia-key" className="control" type="password" autoComplete="off" spellCheck={false}
          placeholder={guardada ? '••••••••' : 'La clave del panel de Azure'}
          value={key} onChange={(e) => setKey(e.target.value)} />
      </div>
      <div className="campo" style={{ marginTop: 'var(--s3)' }}>
        <label className="campo__label" htmlFor="ia-modelo"><span>Modelo</span></label>
        <input id="ia-modelo" className="control" type="text" autoComplete="off" spellCheck={false}
          value={modelo} onChange={(e) => setModelo(e.target.value)} />
      </div>

      <div className="tira" style={{ gap: 'var(--s2)', marginTop: 'var(--s4)' }}>
        <Boton variante="primary" onClick={guardar}
               disabled={!endpoint.trim() || (!key.trim() && !guardada)}>
          Guardar clave
        </Boton>
        {guardada && <Boton variante="ghost" onClick={borrar}>Borrar de este navegador</Boton>}
      </div>
      {aviso && (
        <p role="status" style={{ marginTop: 'var(--s3)', color: 'var(--ok)', fontSize: 'var(--fs-sm)' }}>{aviso}</p>
      )}
    </section>
  )
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

      <PanelIA />

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
