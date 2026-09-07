import { useSesion } from '../lib/sesion.tsx'
import { LECCIONES, TOTAL_PREGUNTAS } from '../lib/curso.ts'
import { TOTAL_EJERCICIOS } from '../lib/ejercicios.ts'
import { TOTAL_SEMANAS } from '../lib/plan.ts'
import Boton from '../ui/Boton.tsx'

/* Primera pantalla para quien llega del link sin haber visto nunca la app.
   Tiene que explicar en diez segundos qué es esto y por qué el validador se puede creer. */

function LogoGoogle() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.2-.4-4.7H24v9h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.2-3.8 6.6-9.5 6.6-16.4z" />
      <path fill="#34A853" d="M24 46c6 0 11-2 14.5-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.6-3.9-12.3-9.1H4.3v5.7C7.9 41.1 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.7 28.1c-.5-1.3-.7-2.7-.7-4.1s.3-2.8.7-4.1v-5.7H4.3C2.8 17.2 2 20.5 2 24s.8 6.8 2.3 9.8l7.4-5.7z" />
      <path fill="#EA4335" d="M24 10.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.2 30 2 24 2 15.4 2 7.9 6.9 4.3 14.2l7.4 5.7c1.7-5.2 6.6-9.1 12.3-9.1z" />
    </svg>
  )
}

export default function Entrada() {
  const { entrarConGoogle, estado, error } = useSesion()

  return (
    <div className="entrada">
      <div className="entrada__caja">
        <div className="entrada__marca">
          <h1>Lenguajes y Compiladores</h1>
          <p>UNLaM · 1124/3663 · sobre el libro de Aho y los apuntes de la cátedra</p>
        </div>

        <ul className="entrada__lista">
          <li>
            <span className="n">{LECCIONES.length}</span>
            <span><b>lecciones de teoría</b>, repartidas en las {TOTAL_SEMANAS} semanas del cronograma
            real de la cursada: cada semana te dice qué leer y qué práctica ya podés resolver.</span>
          </li>
          <li>
            <span className="n">{TOTAL_EJERCICIOS}</span>
            <span><b>ejercicios que se corrigen solos</b>. Tu expresión regular se compila, tu gramática
            se reconoce y tu polaca inversa se ejecuta: no se comparan contra un texto, se corren.</span>
          </li>
          <li>
            <span className="n">{TOTAL_PREGUNTAS}</span>
            <span><b>preguntas con repetición espaciada</b>: las que fallás vuelven enseguida y las que
            sabés se espacian solas.</span>
          </li>
        </ul>

        <Boton
          variante="primary" clase="btn-google"
          onClick={() => { void entrarConGoogle() }}
          cargando={estado === 'cargando'}
        >
          <LogoGoogle />
          Entrar con Google
        </Boton>

        {error && <p className="campo__pie campo__pie--error" role="alert" style={{ marginTop: 'var(--s3)' }}>{error}</p>}

        <p className="entrada__pie">
          Se usa la cuenta solo para que tu progreso te siga entre máquinas. Una vez adentro,
          la app funciona sin conexión: lo que hacés se guarda en el navegador y se sincroniza
          cuando hay red.
        </p>
      </div>
    </div>
  )
}
