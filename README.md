# Curso de Lenguajes y Compiladores (UNLaM)

Curso interactivo y **offline-first** de Lenguajes y Compiladores (UNLaM, cód. 1124/3663), estructurado sobre el libro de **Aho, Lam, Sethi, Ullman** (*Compiladores: principios, técnicas y herramientas*, 2ª ed.) y los apuntes de la cátedra.

**106 lecciones en profundidad** en 15 módulos, con **405 preguntas** de práctica, un modo de **ejercitación** interactivo y una **mesa de trabajo** con teclado de símbolos y constructor de árboles de derivación.

Es un sitio **100% estático** (HTML + CSS + JavaScript, sin framework, sin build obligatorio, sin backend). El progreso de cada persona se guarda en **su propio navegador** (`localStorage`): al desplegarlo, cada quien lleva su seguimiento por separado.

---

## Qué incluye

- **Contenido**: los 15 módulos van del panorama del compilador hasta la optimización, cubriendo ambos parciales. Cada lección trae explicación con analogías, marcas de lo que entra al parcial (🎯) y de la profundidad extra de Aho (📘), y preguntas con respuesta modelo.
- **Ejercitación** (`#/ejercitar`): te tira preguntas al azar (Verdadero/Falso, a desarrollar, prácticas), las resolvés de memoria, revelás la respuesta y te autoevaluás (*la sabía* / *repasar*). Filtros por módulo y tipo. Progreso persistente por navegador.
- **Mesa de trabajo** (`tools/mesa-de-trabajo.html`): teclado de símbolos categorizado (gramáticas, ítems SLR con el punto, GCI/polaca/tercetos, coprocesador), bloc monoespaciado con plantillas (tabla SLR, traza LR, tercetos, esqueleto Assembler, primeros/siguientes) y un constructor de árbol de derivación que renderiza SVG a partir de notación `nodo(hijo, hijo)`.
- **Visualizadores** (`artifacts/`): explicadores interactivos embebidos en lecciones concretas.
- **Barra de progreso** del curso, en la barra lateral y en la portada.

---

## Correr localmente

**Opción rápida:** abrí `index.html` en el navegador (doble clic). Funciona sin conexión.

**Opción con servidor** (recomendada, evita restricciones de `file://` en algunos navegadores):

```bash
npm run dev        # levanta un servidor estático en http://localhost:3000
# o, sin npm:
python3 -m http.server 8000
```

---

## Estructura

```
index.html                 App: navegación, buscador, tema, ejercitación, progreso.
data.js                    Contenido compilado (GENERADO por build.js — no editar a mano).
build.js                   Junta content/*.js → data.js y valida.
content/
  mod-00.js … mod-14.js    Fuente de verdad del contenido: un módulo por archivo.
artifacts/                 Visualizadores interactivos autocontenidos.
tools/
  mesa-de-trabajo.html     Teclado de símbolos + bloc + constructor de árboles.
```

## Editar o ampliar el contenido

1. Editá el archivo correspondiente en `content/` (cada `mod-*.js` hace `M.push({ ...módulo... })` con sus lecciones y preguntas).
2. Regenerá el contenido compilado:

```bash
npm run build      # o: node build.js
```

`build.js` valida que no haya lecciones ni módulos duplicados e imprime el avance por módulo. Recargá la web para ver los cambios.

---

## Deploy en Vercel

El proyecto es estático, así que Vercel lo sirve tal cual (sin comando de build necesario, porque `data.js` ya está generado y versionado).

**Camino A — con la CLI de Vercel:**

```bash
npm i -g vercel
vercel            # primera vez: seguí las preguntas (scope, nombre del proyecto)
vercel --prod     # publica a producción
```

**Camino B — con GitHub + panel de Vercel:**

1. Creá un repo en GitHub y subí este proyecto (ver abajo).
2. En [vercel.com](https://vercel.com) → *Add New… → Project* → importá el repo.
3. *Framework Preset*: **Other** (estático). Dejá *Build Command* vacío y *Output Directory* en la raíz.
4. *Deploy*. Cada `git push` vuelve a desplegar solo.

**Subir a GitHub (primera vez):**

```bash
git remote add origin https://github.com/TU_USUARIO/curso-lenguajes-y-compiladores.git
git branch -M main
git push -u origin main
```

---

## Sobre el seguimiento de progreso

El progreso (preguntas sabidas / a repasar) se guarda en el `localStorage` del navegador de cada persona. Es **individual y privado**: no se comparte ni se envía a ningún servidor. Si en el futuro se quisiera un seguimiento **centralizado** (por ejemplo, que un docente vea el avance del grupo), haría falta agregar autenticación y una base de datos — no está incluido en esta versión estática.

---

## Aviso sobre el contenido

Material con fines **educativos y de estudio**. Las explicaciones se apoyan en el libro de Aho, Lam, Sethi y Ullman y en los apuntes de la cátedra de la UNLaM; **este repositorio no incluye ni redistribuye** esos PDFs con derechos de autor. El **código** del sitio se publica bajo licencia **MIT**.
