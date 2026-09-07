# Handoff — poner esto en producción

El contexto técnico está en **`CLAUDE.md`** (Claude Code lo lee solo al abrir el repo), la estrategia
de producto en **`PRODUCT.md`** y el sistema visual en **`DESIGN.md`**. Acá va el estado, lo que falta
y el runbook de deploy.

---

## 1. Estado actual (verificado)

| | |
|---|---|
| Stack | React 19 + Vite 5 + TypeScript estricto |
| Teoría | 16 módulos, **110 lecciones**, **417 preguntas** |
| Sandbox | **98 ejercicios** / **926 casos**: 32 ER, 13 acciones léxicas, 22 gramáticas, 10 parsing, 14 código intermedio, 7 Assembler |
| Plan | **16 semanas** del cronograma 2C2026 de la cátedra |
| Material | 5 transcripciones de clase, enunciados de las 6 prácticas |
| Cuenta | Supabase + Google, sincronización local-first. **Falta crear el proyecto** |
| Tests | `npm run check` en verde (tipos + banco + 24 rutas) |
| Bundle | 379 kB inicial (117 kB gzip) + 224 kB de Supabase cacheados aparte |
| Git | rama `rediseno-ts`, **sin remote configurado** |
| Deploy | todavía no desplegado |

---

## 2. Arrancar

```bash
cd "Curso Web LyC"
npm install
npm run dev          # http://localhost:5173
npm run check        # antes de cualquier commit
```

Sin variables de entorno la app arranca en **modo local**: sin login y con el progreso solo en el
navegador. Es lo que permite desarrollar y correr los tests sin credenciales.

---

## 3. Deploy — hay tres pasos y el orden importa

### Paso 1 — crear el proyecto de Supabase

1. Entrá a [supabase.com](https://supabase.com) y creá un proyecto. Elegí la región más cercana
   (`South America (São Paulo)`).
2. Abrí **SQL Editor** y pegá el contenido de **`supabase/esquema.sql`**. Correlo. Crea la tabla
   `progreso` y las políticas de seguridad por fila.
3. Andá a **Authentication → Providers → Google** y activalo. Vas a necesitar un client ID y un
   client secret de Google Cloud:
   - [console.cloud.google.com](https://console.cloud.google.com) → *APIs y servicios → Credenciales
     → Crear credenciales → ID de cliente de OAuth → Aplicación web*.
   - En **URI de redireccionamiento autorizados** poné la que te muestra el panel de Supabase:
     `https://TU-PROYECTO.supabase.co/auth/v1/callback`.
   - Copiá el client ID y el secret al panel de Supabase.
4. En **Authentication → URL Configuration** poné:
   - *Site URL*: la URL de producción de Vercel.
   - *Redirect URLs*: agregá también `http://localhost:5173` para poder probar el login en local.
5. En **Project Settings → API** copiá la **URL** y la **anon key**.

> La anon key es **pública** y viaja en el bundle: la seguridad la da RLS, no ocultarla. Nunca pongas
> la `service_role` key en el frontend.

### Paso 2 — subir a GitHub

Creá un repositorio **vacío** en GitHub (sin README ni .gitignore) y después:

```bash
cd "Curso Web LyC"
git checkout main
git merge rediseno-ts
git remote add origin https://github.com/TU_USUARIO/curso-lenguajes-y-compiladores.git
git push -u origin main
```

### Paso 3 — publicar en Vercel

1. [vercel.com](https://vercel.com) → *Add New… → Project* → importá el repositorio.
2. Vercel detecta **Vite**. Dejá *Build Command* en `npm run build` y *Output Directory* en `dist`.
   El `vercel.json` ya trae el rewrite a `index.html` (hace falta: las rutas son reales, no hash) y
   los headers de caché de fuentes y assets.
3. En **Environment Variables** agregá, para *Production* y *Preview*:

   ```
   VITE_SUPABASE_URL       = https://TU-PROYECTO.supabase.co
   VITE_SUPABASE_ANON_KEY   = eyJhbGciOi...
   ```

4. *Deploy*. Desde ahí, cada `git push` a `main` republica solo.
5. Volvé al paso 1.4 y poné la URL real de Vercel como *Site URL* en Supabase. Si no, el login
   redirige a otro lado.

### Probar el login en local

```bash
cp .env.example .env.local     # y completá las dos variables
npm run dev
```

### Antes de cada deploy

```bash
npm run check && npm run build
```

Si `npm run check` falla, no deployes: el banco de ejercicios quedó inconsistente.

### Verificación después de publicar

1. Abrí la URL en una ventana privada: tiene que aparecer la pantalla de entrada, no la app.
2. Entrá con Google. Tiene que caer en **Hoy**, con la semana 1 activa.
3. Marcá una lección como leída y resolvé un ejercicio del sandbox. En el sidebar, el indicador de
   abajo tiene que pasar de "guardando…" a "guardado".
4. Abrí la misma URL en otro navegador con la misma cuenta: el progreso tiene que estar ahí.
5. Poné el navegador en modo avión y recargá: la app tiene que seguir andando con lo que hay en
   `localStorage`.
6. Probá una lección con visualizador (0.1 o 0.2) y confirmá que el iframe carga.
7. Instalala desde el navegador (icono de instalar en la barra de direcciones) y abrila sin conexión.

---

## 4. Lo que quedó pendiente

Por orden de valor:

1. **Visualizadores.** Hay solo 2 en `public/artifacts/` y las lecciones ya soportan embeberlos. Los
   que más rinden: la tabla SLR llenándose paso a paso, las tres notaciones intermedias en paralelo,
   la pila de celdas del backpatching, la pila `ST(0)..ST(7)` del coprocesador, y el autómata del
   léxico.
2. **Tabla SLR cargable por el alumno** en la solapa de parsing. Hoy se corrigen los conjuntos y la
   tabla se muestra como solución; falta que la pueda llenar celda por celda y se le corrija.
3. **Más ejercicios de las prácticas 3 a 6**, que son las que menos tienen (10, 14 y 7).
4. **Las 4 transcripciones que faltan.** La carpeta padre tiene 9 clases (`[1]` a `[9]`) y en el repo
   hay 5. Se agregan a `src/data/transcripciones.ts`.
5. **Linter y CI.** Un `eslint` con `eslint-plugin-react-hooks` habría agarrado el bug del componente
   declarado adentro de otro. Y un workflow de GitHub Actions que corra `npm run check` en cada push.
6. **Revisar los `nivel`.** Están cargados a ojo; ahora que se guardan los intentos por ejercicio se
   puede ver cuáles cuestan de verdad y recalibrarlos.

---

## 5. Si algo se rompe

| Síntoma | Causa probable |
|---|---|
| `npm test` falla en un ejercicio | La respuesta modelo no acepta/rechaza lo que declara el ejercicio. Revisá `ac`/`rc` o `casos`, no el motor. |
| Un ejercicio no aparece en el índice | Le falta la entrada en `src/data/ejercicios/meta.ts`. |
| La teoría no refleja un cambio | Editaste `content/` pero no corriste `npm run data`. |
| Una lección nueva no aparece en el plan | Su módulo no está asignado a ninguna semana en `src/lib/plan.ts`. |
| 404 al recargar en una ruta interna | Falta el rewrite de `vercel.json`, o lo pisó una config del panel. |
| El login redirige a `localhost` en producción | *Site URL* mal puesta en Supabase (Authentication → URL Configuration). |
| "Sin guardar" permanente en el sidebar | Faltan las variables de entorno, o no corriste `esquema.sql` y no existe la tabla. |
| El progreso no se sincroniza pero no hay error | Revisá que RLS esté activo y las políticas creadas: sin ellas el `select` devuelve vacío. |
| Página en blanco tras el build | Mirá la consola: casi siempre es un import roto. `npm run smoke` lo detecta antes. |
| Los iframes de los visualizadores no cargan | Los archivos tienen que estar en `public/artifacts/` y referenciarse sin barra inicial. |

---

## 6. Material de origen (no está en el repo)

La carpeta padre tiene el libro de Aho, los apuntes de la cátedra, las prácticas, los parciales
viejos, el **Cronograma 2026_2C.pdf** —de donde sale el plan de estudio— y el proyecto del TP
(`g1-2c-2026`, lenguaje **L1_aho**, notación polaca inversa, temas especiales matchPatterns y
powerSpaceship). **Ese material tiene derechos de autor y por eso no se versiona.** Si hace falta
ampliar la teoría, está ahí para consultarlo, pero no debe commitearse al repo.
