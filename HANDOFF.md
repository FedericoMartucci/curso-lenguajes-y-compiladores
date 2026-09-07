# Handoff — seguir el proyecto con Claude Code y deployar

Este documento es para retomar el proyecto desde cero en otra sesión. El contexto técnico que Claude
Code necesita está en **`CLAUDE.md`** (lo lee automáticamente al abrir el repo); acá va el estado, el
backlog y el runbook de deploy.

---

## 1. Estado actual (verificado)

| | |
|---|---|
| Stack | React 18 + Vite 5, sin backend, sin variables de entorno |
| Teoría | 16 módulos, **110 lecciones**, **417 preguntas** |
| Sandbox | **98 ejercicios** / **926 casos de prueba**: 32 ER, 13 acciones léxicas, 22 gramáticas, 10 parsing, 14 código intermedio, 7 Assembler |
| Material | 5 transcripciones de clase, enunciados de las 6 prácticas |
| Tests | `npm run check` en verde (banco + render de las 13 rutas) |
| Git | rama `main`, 6 commits, árbol limpio, **sin remote configurado** |
| Deploy | todavía no desplegado |

Funciona todo offline: el progreso del alumno (preguntas sabidas, ejercicios resueltos, tema) vive en
`localStorage`, así que al publicarlo **cada persona lleva su propio seguimiento** sin backend.

---

## 2. Arrancar

```bash
cd "Curso Web LyC"
npm install
npm run dev          # http://localhost:5173
npm run check        # antes de cualquier commit
```

---

## 3. Trabajar con Claude Code

Abrí Claude Code parado en la carpeta del repo:

```bash
cd "Curso Web LyC"
claude
```

Levanta `CLAUDE.md` solo. Dos costumbres que hacen la diferencia:

- **Pedile que corra `npm run check` antes de dar por terminado.** El banco de ejercicios se
  autovalida: si un modelo nuevo está mal planteado, el test lo caza.
- **Trabajá de a un cambio y commiteá.** El repo no tiene CI ni linter, así que los tests son la
  única red.

### Prompts que funcionan bien

> Agregá 5 ejercicios de expresiones regulares al sandbox, en el estilo de los que ya están, con sets
> de aceptación y rechazo que incluyan casos borde. Sumalos a `meta.js` y corré `npm test`.

> En la solapa de parsing, además de PRIMEROS y SIGUIENTES quiero poder cargar yo la tabla SLR celda
> por celda y que me la corrijas contra la que calcula el motor.

> El bundle pesa 1.36 MB en un solo chunk. Separá la teoría (`src/data/curso.js`) con `import()`
> dinámico para que el sandbox cargue rápido, sin romper el router por hash.

> Creá un visualizador interactivo para la lección 6.7 (tabla SLR llenándose paso a paso) como archivo
> autocontenido en `public/artifacts/`, y enlazalo desde `content/mod-06-07.js` con los campos
> `artifact`, `artifactTitle` y `artifactH`.

### Qué NO tocar sin pensarlo

- `src/data/curso.js` es generado (se edita `content/` + `npm run data`).
- Los tests de `tests/run.js`: si algo falla, el problema suele estar en el ejercicio nuevo, no en el test.
- El router por hash y `base: './'` en `vite.config.js`: sacarlos rompe el deploy y el uso offline.

---

## 4. Backlog sugerido, por orden de valor

1. **Visualizadores.** Hay solo 2 (`public/artifacts/`) y las lecciones ya soportan embeberlos. Los que
   más rinden: tabla SLR llenándose, las tres notaciones intermedias en paralelo, la pila de celdas del
   backpatching, la pila `ST(0)..ST(7)` del coprocesador, y el autómata del léxico.
2. **Tabla SLR cargable por el alumno** en la solapa de parsing (hoy solo se corrigen los conjuntos;
   la tabla se muestra como solución).
3. **Más ejercicios**, sobre todo de las prácticas 3 a 6, que son las que menos tienen (10, 14 y 7).
4. **Code splitting** del bundle (ver limitaciones en `CLAUDE.md`).
5. **Modo examen**: tanda cronometrada que mezcle ejercicios de todas las solapas y tire un puntaje.
6. **Exportar/importar el progreso** en JSON, para no perderlo al cambiar de navegador.
7. Nice to have: linter (`eslint`) y un workflow de GitHub Actions que corra `npm run check` en cada push.

---

## 5. Deploy

El proyecto es estático: Vercel lo detecta como Vite, corre `npm run build` y publica `dist/`.
No hay variables de entorno ni servicios que configurar.

### Paso 1 — subir a GitHub (todavía no hay remote)

Creá un repositorio **vacío** en GitHub (sin README ni .gitignore) y después:

```bash
cd "Curso Web LyC"
git remote add origin https://github.com/TU_USUARIO/curso-lenguajes-y-compiladores.git
git push -u origin main
```

### Paso 2 — publicar en Vercel

**Opción A, desde el panel (recomendada, deja el redeploy automático):**

1. Entrá a [vercel.com](https://vercel.com) → *Add New… → Project*.
2. Importá el repositorio.
3. Vercel detecta **Vite**. Dejá *Build Command* en `npm run build` y *Output Directory* en `dist`.
4. *Deploy*. Desde ahí, cada `git push` a `main` republica solo.

**Opción B, desde la terminal:**

```bash
npm i -g vercel
vercel          # la primera vez: preguntas de scope y nombre del proyecto
vercel --prod   # publica a producción
```

### Antes de cada deploy

```bash
npm run check && npm run build
```

Si `npm run check` falla, no deployes: el banco de ejercicios quedó inconsistente.

### Verificación después de publicar

1. Abrí la URL y confirmá que carga la portada con la barra de progreso.
2. Entrá a **Sandbox** y validá un ejercicio de cada solapa (que aparezca el ✓ verde).
3. Recargá la página: el progreso guardado tiene que seguir ahí (`localStorage`).
4. Probá una lección con visualizador (0.1 o 0.2) y confirmá que el iframe carga.

---

## 6. Si algo se rompe

| Síntoma | Causa probable |
|---|---|
| `npm test` falla en un ejercicio | La respuesta modelo no acepta/rechaza lo que declara el ejercicio. Revisá `ac`/`rc` o `casos`, no el motor. |
| Un ejercicio no aparece en el selector | Le falta la entrada en `src/data/ejercicios/meta.js`. |
| La teoría no refleja un cambio | Editaste `content/` pero no corriste `npm run data`. |
| Página en blanco tras el build | Mirá la consola: casi siempre es un import roto en un componente. `npm run smoke` lo detecta antes. |
| Los iframes de los visualizadores no cargan | Los archivos tienen que estar en `public/artifacts/` y referenciarse sin barra inicial. |

---

## 7. Material de origen (no está en el repo)

La carpeta padre tiene el libro de Aho, los apuntes de la cátedra, las prácticas, los parciales viejos
y el proyecto del TP (`g1-2c-2026`, lenguaje **L1_aho**, notación polaca inversa, temas especiales
matchPatterns y powerSpaceship). **Ese material tiene derechos de autor y por eso no se versiona.**
Si hace falta ampliar la teoría, está ahí para consultarlo, pero no debe commitearse al repo.
