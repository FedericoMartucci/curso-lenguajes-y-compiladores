/* Corrección de respuestas en prosa con un modelo de lenguaje.

   CADA UNO TRAE SU CLAVE
   ----------------------
   La clave no es del proyecto: la pone cada alumno en Ajustes y queda en SU navegador
   (localStorage, nunca en Supabase, nunca en el bundle). Viaja en un header sólo en el
   momento de corregir y esta función la usa y la olvida: no se guarda, no se loguea.
   Así no hay un secreto compartido que se pueda filtrar ni una factura común que se pueda
   desbordar, y el que corrige paga lo suyo.

   POR QUÉ SIGUE HABIENDO UNA FUNCIÓN EN VEZ DE LLAMAR A AZURE DERECHO DESDE EL BROWSER
   -----------------------------------------------------------------------------------
   Por CORS: el endpoint de Azure no habilita orígenes de navegador de forma confiable.
   La función es un proxy delgado, no un guardián de secretos.

   EL FALLBACK POR VARIABLE DE ENTORNO ES SÓLO PARA DESARROLLO
   ----------------------------------------------------------
   Existe para probar sin cargar la clave a mano en cada browser. Está apagado en
   producción a propósito: si quedara prendido, alcanzaría con dejar AZURE_OPENAI_KEY
   cargada en Vercel para que todos los que abran el link facturen, sin enterarse, contra
   la suscripción de quien deployó.

   QUÉ TAN CIERTO ES LO QUE DEVUELVE
   ---------------------------------
   Nada de esto es el sandbox. Ahí una gramática se corre y el veredicto es un hecho. Acá un
   modelo opina sobre prosa y puede equivocarse, así que la respuesta viaja marcada como
   clase 'ia' y la interfaz la muestra como revisión, no como corrección. Ver comparar.ts. */

export const config = { runtime: 'edge' }

/* Sólo se consultan si el pedido no trae credencial propia, y nunca en producción. */
const EN_DESARROLLO = process.env.VERCEL_ENV !== 'production'
const MODELO_POR_DEFECTO = process.env.AZURE_OPENAI_MODEL_MULTIMODAL ?? 'gpt-5.1'

/* Topes: una corrección tiene que ser corta y barata, sea de quien sea la clave. */
const MAX_ENTRADA = 4000
const MAX_SALIDA = 400

interface Pedido {
  consigna: string
  modelo: string
  respuesta: string
}

/** La credencial del pedido, o la de desarrollo si no vino ninguna. */
function credencial(req: Request): { endpoint: string; key: string; modelo: string } | null {
  const endpoint = req.headers.get('x-azure-endpoint') ?? (EN_DESARROLLO ? process.env.AZURE_OPENAI_ENDPOINT : undefined)
  const key = req.headers.get('x-azure-key') ?? (EN_DESARROLLO ? process.env.AZURE_OPENAI_KEY : undefined)
  const modelo = req.headers.get('x-azure-modelo') ?? MODELO_POR_DEFECTO
  if (!endpoint || !key) return null
  return { endpoint, key, modelo }
}

function json(cuerpo: unknown, estado = 200): Response {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  })
}

const SISTEMA = `Sos ayudante de cátedra de Lenguajes y Compiladores (UNLaM, 1124/3663).
Corregís la respuesta escrita de un alumno contra la respuesta modelo de la cátedra.

Reglas:
- Contestás en español rioplatense, tratando de "vos".
- Juzgás el CONTENIDO, no la redacción ni la ortografía. Si dice lo mismo con otras palabras, está bien.
- Si al alumno le falta algo del modelo, decís exactamente qué falta.
- Si el alumno dice algo que el modelo no dice y además es incorrecto, lo marcás.
- Si el alumno dice algo correcto que el modelo no dice, no lo penalizás.
- No inventás contenido de la materia que no esté en el modelo o en la consigna.
- Sos MUY breve: dos oraciones como mucho, sin repetir la consigna ni el modelo.
- En "falta" ponés frases cortas, no párrafos.

Devolvés SÓLO un objeto JSON, sin markdown y sin texto alrededor:
{"veredicto":"bien"|"parcial"|"mal","detalle":"<tu explicación breve>","falta":["<concepto>", ...]}`

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'Usá POST.' }, 405)

  const cred = credencial(req)
  if (!cred) {
    return json({ error: 'Cargá tu clave de Azure en Ajustes para usar la corrección con IA.' }, 503)
  }

  let cuerpo: Pedido
  try {
    cuerpo = (await req.json()) as Pedido
  } catch {
    return json({ error: 'El cuerpo tiene que ser JSON.' }, 400)
  }

  const consigna = String(cuerpo.consigna ?? '').slice(0, MAX_ENTRADA)
  const modelo = String(cuerpo.modelo ?? '').slice(0, MAX_ENTRADA)
  const respuesta = String(cuerpo.respuesta ?? '').slice(0, MAX_ENTRADA)
  if (!respuesta.trim() || !modelo.trim()) {
    return json({ error: 'Faltan la respuesta del alumno o la respuesta modelo.' }, 400)
  }

  let r: Response
  try {
    r = await fetch(`${cred.endpoint.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'api-key': cred.key },
      body: JSON.stringify({
        model: cred.modelo,
        max_completion_tokens: MAX_SALIDA,
        messages: [
          { role: 'system', content: SISTEMA },
          {
            role: 'user',
            content:
              `CONSIGNA:\n${consigna}\n\n` +
              `RESPUESTA MODELO DE LA CÁTEDRA:\n${modelo}\n\n` +
              `RESPUESTA DEL ALUMNO:\n${respuesta}`
          }
        ]
      })
    })
  } catch {
    return json({ error: 'No se pudo hablar con el servicio de corrección.' }, 502)
  }

  if (!r.ok) {
    /* Sólo el código: el cuerpo del error de Azure puede traer eco del pedido, y el pedido
       lleva la credencial del alumno en un header. No se loguea ni se reenvía. */
    console.error('azure', r.status)
    if (r.status === 401 || r.status === 403) {
      return json({ error: 'Azure rechazó la clave. Revisala en Ajustes.' }, 401)
    }
    if (r.status === 429) return json({ error: 'Azure te está limitando: probá en un rato.' }, 429)
    return json({ error: 'El servicio de corrección no respondió bien.' }, 502)
  }

  const datos = (await r.json()) as { choices?: { message?: { content?: string } }[] }
  const crudo = datos.choices?.[0]?.message?.content ?? ''

  /* El modelo a veces envuelve el JSON en un bloque de markdown aunque se le pida que no. */
  const limpio = crudo.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  try {
    const p = JSON.parse(limpio) as { veredicto?: string; detalle?: string; falta?: string[] }
    const veredicto = p.veredicto === 'bien' || p.veredicto === 'parcial' ? p.veredicto : 'mal'
    return json({
      veredicto,
      detalle: String(p.detalle ?? '').slice(0, 800),
      falta: Array.isArray(p.falta) ? p.falta.slice(0, 8).map((x) => String(x).slice(0, 80)) : []
    })
  } catch {
    return json({ error: 'La corrección volvió en un formato que no se pudo leer.' }, 502)
  }
}
