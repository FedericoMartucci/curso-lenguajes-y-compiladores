M.push({
  "id": 0,
  "titulo": "Panorama",
  "parcial": "I y II",
  "resumen": "Qué es un compilador, las fases, y por qué existe el código intermedio.",
  "lecciones": [
    {
      "id": "0.1",
      "titulo": "Compilador, intérprete, híbrido y JIT",
      "aho": "§1.1 · p.1",
      "badges": [
        "🎯"
      ],
      "estado": "dictada",
      "artifact": "artifacts/01-compilador-vs-interprete.html",
      "artifactTitle": "compilador vs intérprete vs híbrido vs JIT",
      "artifactH": 640,
      "html": "\n<p>Un <b>compilador</b> es un programa que lee un programa escrito en un lenguaje (el <b>fuente</b>) y lo traduce a un programa <b>equivalente</b> en otro lenguaje (el <b>destino</b>). Y tiene una segunda función que suele pasarse por alto: <b>reportar los errores</b> del fuente que detecte durante la traducción.</p>\n<p>Un <b>intérprete</b> no produce ningún programa destino. Toma el fuente y las entradas del usuario, y <b>da la apariencia de ejecutar directamente</b> las operaciones que el fuente especifica.</p>\n<p>La asimetría lo explica casi todo: el compilador es una función <b>de programa a programa</b>; el intérprete es una función <b>de programa + datos a resultados</b>.</p>\n\n<h3>La analogía</h3>\n<ul>\n<li><b>Compilador = traductor de libros.</b> Traduce el libro entero al alemán y te lo entrega. El lector alemán lo lee rápido. Pero si algo quedó raro, el libro alemán ya no sabe de qué página del original vino.</li>\n<li><b>Intérprete = traductor simultáneo.</b> Va oración por oración, en vivo. Más lento, pero sabe exactamente en qué oración está y puede señalar el error.</li>\n<li><b>Híbrido = traducir a un idioma franco.</b> Traducís el libro a esperanto una vez; cada país lo lee con su traductor de esperanto. Eso es Java: <code>javac</code> produce <b>bytecodes</b>, y la máquina virtual de cada plataforma los interpreta.</li>\n<li><b>JIT</b> = el traductor nota que el capítulo 3 se lee todo el tiempo y lo traduce entero de una vez. Compila <b>en tiempo de ejecución</b>, justo antes de correr.</li>\n</ul>\n\n<div class=\"callout tgt\"><span class=\"lab\">🎯 el punto que casi nadie engancha</span>\nAho dice que el intérprete da <b>mejores diagnósticos de error</b> porque ejecuta instrucción por instrucción. Esto es <b>el mismo hecho</b> que tu apunte enuncia como “la compilación es un proceso destructivo”. El compilador destruye el fuente al traducir: cuando termina hay un binario sin variables llamadas <code>posicion</code>, sin líneas, sin la estructura del <code>while</code>. Por eso no puede decir “error en la línea 42”. El intérprete nunca destruyó nada. Y de acá sale por qué existe la <b>tabla de símbolos</b>: es lo único que el compilador se guarda antes de destruir todo.</div>\n\n<h3>El “casi” que la cátedra remarca</h3>\n<p>Tu apunte dice: “el fuente se transforma <b>por completo (o casi)</b>”, según “si el compilador es totalmente compilador o tiene partes interpretadas”. Y pone, sin explicar, esta línea:</p>\n<pre><code>printf(\"Color %s, Numero %d, Real %6.2f\", \"verde\", 127, 3.14);</code></pre>\n<p>El compilador de C <b>no traduce</b> esa cadena de formato: la deja como texto en el binario. En ejecución, la biblioteca recorre <code>%s</code>, <code>%d</code>, <code>%6.2f</code> carácter por carácter y decide qué hacer. Eso es un intérprete. 🎯 <b>Un binario compilado tiene un intérprete adentro.</b> La dicotomía compilar/interpretar es falsa: es un espectro.</p>\n\n<h3>Lo mínimo que tenés que saber</h3>\n<ul>\n<li><b>Compilador</b>: fuente → destino. Además, reporta errores.</li>\n<li><b>Intérprete</b>: fuente + entrada → salida. No produce destino.</li>\n<li>🎯 Compilador más rápido al ejecutar; intérprete mejor diagnóstico, porque ejecuta sobre el fuente que no destruyó.</li>\n<li><b>Híbrido</b>: compila a <b>bytecodes</b> que una <b>VM</b> interpreta. Los bytecodes de una máquina se interpretan en otra.</li>\n<li><b>JIT</b>: traduce bytecodes a máquina justo antes de ejecutar.</li>\n</ul>",
      "qa": [
        {
          "q": "Dame una ventaja del compilador sobre el intérprete y una del intérprete sobre el compilador, explicando el mecanismo de cada una. (Aho 1.1.2)",
          "a": "<p><b>Compilador &gt; intérprete:</b> el programa destino corre <b>más rápido</b>. Mecanismo: todo el trabajo de traducción se paga una sola vez, antes de ejecutar; en ejecución la CPU corre código máquina nativo sin re-analizar el fuente.</p>\n          <p><b>Intérprete &gt; compilador:</b> <b>mejor diagnóstico de error</b>. Mecanismo: ejecuta el fuente instrucción por instrucción, así que en todo momento sabe en qué punto del programa original está parado (línea, variable, valor). El compilador ya destruyó esa información.</p>"
        },
        {
          "q": "V/F justificando: «Un programa compilado a lenguaje máquina no ejecuta ninguna interpretación en tiempo de ejecución.»",
          "a": "<p><b>Falso.</b> Un binario puede tener partes interpretadas. El caso clásico es <code>printf</code>: la cadena de formato <code>\"%s %d\"</code> no se traduce, queda como texto y la biblioteca de C la <b>recorre e interpreta</b> carácter por carácter en ejecución. Compilar e interpretar no son excluyentes.</p>"
        },
        {
          "q": "Para un programa Java, ordená y clasificá en compilación/ejecución: (a) la VM interpreta bytecodes, (b) javac produce bytecodes, (c) el JIT traduce bytecodes a máquina, (d) el programador escribe el .java.",
          "a": "<p>Orden: <b>d → b → a/c</b>.</p><ul><li>(d) escribir el .java — antes de todo.</li><li>(b) <b>tiempo de compilación</b>: javac produce bytecodes.</li><li>(a) <b>tiempo de ejecución</b>: la VM interpreta.</li><li>(c) <b>tiempo de ejecución</b>: el JIT compila los tramos calientes a máquina.</li></ul>"
        },
        {
          "q": "El apunte dice que el intérprete «da la apariencia de ejecutar directamente». ¿Por qué “apariencia”?",
          "a": "<p>Porque la CPU <b>nunca</b> ejecuta el fuente: lo que corre físicamente es el <b>intérprete</b> (un programa en código máquina) que lee tu fuente como dato y actúa en consecuencia. La ilusión de que “tu Python corre” es en realidad el binario de Python ejecutándose y usando tu script como entrada.</p>"
        }
      ]
    },
    {
      "id": "0.2",
      "titulo": "Análisis vs síntesis · las fases · la tabla de símbolos",
      "aho": "§1.2 · p.4",
      "badges": [
        "🎯"
      ],
      "estado": "dictada",
      "artifact": "artifacts/00-fases-compilador.html",
      "artifactTitle": "las 7 fases sobre posicion = inicial + velocidad * 60",
      "artifactH": 640,
      "html": "\n<p>El visualizador es la <b>figura 1.7 de Aho</b>: la sentencia <code>posicion = inicial + velocidad * 60</code> bajando por todo el pipeline. Mirá cómo cambia la representación en cada paso. Eso <i>es</i> un compilador: una cadena de traductores, cada uno convierte una representación en otra.</p>\n\n<h3>Tres ideas y su porqué</h3>\n<h4>1. El compilador se parte en dos: análisis y síntesis.</h4>\n<p>El <b>análisis</b> (front-end) desarma el fuente, le impone estructura gramatical y produce una <b>representación intermedia</b> + la <b>tabla de símbolos</b>. La <b>síntesis</b> (back-end) construye el destino a partir de eso.</p>\n<div class=\"callout tgt\"><span class=\"lab\">🎯 por qué te importa</span>\nEs lo que hace que la cosa escale. Para 3 lenguajes × 4 arquitecturas, sin representación intermedia necesitás <b>12 compiladores</b>. Con la partición: 3 front-ends + 4 back-ends = <b>7 piezas</b>. Esa es la razón de fondo del código intermedio, más que optimizar sobre él es más fácil. Es la respuesta a “¿por qué generar código intermedio y no Assembler directo?”.</div>\n\n<h4>2. Cada fase transforma una representación en otra.</h4>\n<p>caracteres → tokens → árbol → árbol con tipos → tres direcciones → tres direcciones optimizado → código máquina. Ninguna fase mira el fuente original: solo consume lo que le dejó la anterior.</p>\n<p>Por eso 🎯 <b>la compilación es un proceso destructivo</b>: cuando el léxico convierte <code>posicion</code> en <code>⟨id,1⟩</code>, el nombre se perdió para el sintáctico. La <b>tabla de símbolos</b> es lo único que sobrevive lateralmente — por eso en el visualizador está al costado, no adentro del flujo.</p>\n\n<h4>3. Dónde se detecta cada error depende de qué información tiene cada fase.</h4>\n<p>El léxico no detecta <code>x = ;</code> porque solo ve tokens sueltos. El sintáctico no detecta que <code>x</code> no está declarada porque solo verifica la forma. Por eso la variable no declarada se detecta en el <b>semántico</b>. Si entendés <i>qué ve</i> cada fase, nunca te equivocás en “¿en qué etapa?”.</p>\n<p>Mirá el paso del semántico: aparece un nodo <code>inttofloat</code> que no estaba antes. Es una <b>coerción</b> — el compilador vio que <code>*</code> recibe un float y un int, e insertó la conversión. El sintáctico no podía: no sabe de tipos.</p>\n\n<div class=\"callout aho\"><span class=\"lab\">📘 Aho ≠ cátedra</span>\n<b>Salida del parser:</b> Aho dibuja un <b>árbol</b> explícito; la cátedra dice que el parser devuelve una <b>lista de reglas</b> y “el árbol es abstracto”. Los dos tienen razón: Bison no construye el árbol, <b>ejecuta tu acción semántica cada vez que reduce</b>. La lista de reglas <i>es</i> el árbol en postorden.<br><br>\n<b>Optimización:</b> Aho pone dos optimizadores (sobre la intermedia y sobre el final). La cátedra habla de <b>tres momentos</b> (a la entrada, en la intermedia, a la salida). El “a la entrada” (optimizar dentro de la acción semántica) <b>no existe en Aho</b>: es invento didáctico de la cátedra, y es pregunta de parcial.</div>\n\n<h3>Lo mínimo que tenés que saber</h3>\n<ul>\n<li>Análisis (front-end) = léxico + sintáctico + semántico + GCI. Síntesis (back-end) = generador de código. La tabla de símbolos atraviesa todo.</li>\n<li>🎯 Compilación <b>destructiva</b> → por eso la tabla de símbolos guarda los atributos.</li>\n<li>El <b>intérprete</b> da mejor diagnóstico; los <b>híbridos</b> (Java) compilan a bytecodes que una VM interpreta.</li>\n<li>Alrededor del compilador: <b>preprocesador</b> (macros) → compilador → <b>ensamblador</b> → <b>enlazador</b> → cargador.</li>\n</ul>",
      "qa": [
        {
          "q": "¿Por qué generar código intermedio en vez de traducir el fuente directo a Assembler? Dá la razón estructural, no solo «para optimizar».",
          "a": "<p>Por <b>reutilización front-end/back-end</b>. La representación intermedia desacopla el lenguaje de la máquina: para N lenguajes y M arquitecturas necesitás <b>N + M</b> piezas (N front-ends + M back-ends) en vez de <b>N × M</b> compiladores. Además, optimizar sobre una representación neutra sirve para todas las máquinas de una sola vez.</p>"
        },
        {
          "q": "El nodo inttofloat(60) lo inserta el analizador semántico. ¿Por qué NO podría haberlo hecho el léxico, y por qué tampoco el sintáctico?",
          "a": "<p>El <b>léxico</b> solo ve un token a la vez: reconoce que <code>60</code> es una constante entera, pero no sabe que se está multiplicando por un float — no ve la operación. El <b>sintáctico</b> ve la estructura (que hay un <code>*</code> con dos operandos) pero <b>no conoce los tipos</b>: no sabe que <code>velocidad</code> es float y <code>60</code> es int. Recién el <b>semántico</b>, que consulta la tabla de símbolos, tiene ambas cosas — estructura + tipos — y puede decidir que hace falta la coerción.</p>"
        },
        {
          "q": "¿En qué etapa se detecta cada uno? (a) 3 ++ 4 · (b) total * ; · (c) usar una variable nunca declarada · (d) un /* que no cierra · (e) vector[500] con vector de 10.",
          "a": "<ul><li>(a) <b>léxico/sintáctico</b>: <code>++</code> no forma un token válido en ese contexto; si el léxico lo tokeniza, el sintáctico rechaza la forma.</li><li>(b) <b>sintáctico</b>: falta el operando, ninguna regla acepta <code>* ;</code>.</li><li>(c) <b>semántico</b>: se consulta la tabla de símbolos y no está.</li><li>(d) <b>léxico</b>: comentario sin cerrar.</li><li>(e) <b>ejecución</b>: el índice depende de un valor; salvo que sea constante, el compilador no puede saberlo.</li></ul>"
        },
        {
          "q": "V/F justificando: «Como el sintáctico construye el árbol y se lo pasa al semántico, en el TP con Bison el árbol se arma solo.»",
          "a": "<p><b>Falso.</b> Bison <b>no construye</b> ningún árbol por su cuenta: solo reconoce la gramática y <b>ejecuta la acción semántica</b> que vos escribís en cada regla. Si querés el árbol, tenés que armarlo vos llamando a <code>crear_nodo()</code>/<code>crear_hoja()</code> dentro de esas acciones. Aho dibuja el árbol como concepto; en la práctica de la cátedra el parser devuelve la <b>lista de reglas</b>.</p>"
        }
      ]
    },
    {
      "id": "0.3",
      "titulo": "Pasadas · front-end/back-end · por qué la representación intermedia",
      "aho": "§1.2.8 · p.11",
      "badges": [
        "🎯"
      ],
      "estado": "dictada",
      "html": "\n<p>Ya vimos que un compilador son <b>fases</b> encadenadas. Pero las fases son una división <b>lógica</b> (conceptual): no siempre se corresponden una a una con cómo el compilador <b>lee</b> el programa. Ahí entra la idea de <b>pasada</b>.</p>\n\n<h3>La analogía</h3>\n<p>Pensá en corregir un ensayo. Una <b>pasada</b> es una lectura completa del texto de punta a punta. En la primera pasada corregís ortografía y gramática; en una segunda, el estilo; en una tercera, la coherencia global. Podés hacer <b>varias cosas en una misma pasada</b> (ortografía y gramática juntas) o necesitar <b>pasadas separadas</b> (no podés juzgar la coherencia global hasta haber leído todo). El compilador es igual: varias <b>fases</b> se agrupan en una <b>pasada</b> (una lectura de la representación).</p>\n\n<h4>Qué es una pasada, y por qué a veces hacen falta varias</h4>\n<p>Una <b>pasada</b> es un recorrido completo de la entrada (o de una representación intermedia) por parte del compilador. Un compilador de <b>una sola pasada</b> es rápido y usa poca memoria, pero está limitado: no puede optimizar mirando “el futuro” del programa. Un compilador de <b>varias pasadas</b> puede, por ejemplo, recorrer el código intermedio una vez para detectar código muerto y otra vez para generarlo — cosas que necesitan haber visto <b>todo</b> antes de decidir.</p>\n\n<h4>Front-end y back-end: el corte que importa</h4>\n<p>Las fases se agrupan en dos mitades según <b>de qué dependen</b>:</p>\n<ul>\n<li><b>Front-end</b> (parte del <i>análisis</i>): depende del <b>lenguaje fuente</b> y es <b>independiente de la máquina</b>. Incluye léxico, sintáctico, semántico y la generación de código <b>intermedio</b>.</li>\n<li><b>Back-end</b> (parte de la <i>síntesis</i>): depende de la <b>máquina destino</b>. Incluye la generación de código final y las optimizaciones dependientes de la máquina.</li>\n</ul>\n<p>En el medio, como bisagra, está la <b>representación intermedia</b> (RI) + la tabla de símbolos.</p>\n\n<div class=\"callout tgt\"><span class=\"lab\">🎯 la cuenta N + M vs N × M</span>\nEsta es la razón de fondo de que exista el código intermedio, y una pregunta de parcial. Si tenés <b>N</b> lenguajes y <b>M</b> arquitecturas y compilás cada uno directo a máquina, necesitás <b>N × M</b> compiladores. Con una RI común, un mismo front-end de C alimenta todos los back-ends, y un mismo back-end de x86 recibe la RI de todos los lenguajes: <b>N front-ends + M back-ends = N + M</b> piezas. Para 3 lenguajes y 4 máquinas: 12 compiladores contra 7 piezas. Ese desacople es lo que hace práctico construir compiladores.</div>\n\n<p>Hay una segunda ventaja, más chica pero real: <b>optimizar sobre la RI</b> (que es neutra) sirve para <b>todas</b> las máquinas de una sola vez. Si optimizaras sobre el Assembler de x86, tendrías que rehacer ese trabajo para ARM.</p>\n\n<h3>Lo mínimo que tenés que saber</h3>\n<ul>\n<li><b>Fase</b> = etapa lógica; <b>pasada</b> = una lectura completa. Una pasada agrupa varias fases; algunas optimizaciones exigen varias pasadas.</li>\n<li><b>Front-end</b> depende del lenguaje fuente (léxico → sintáctico → semántico → GCI). <b>Back-end</b> depende de la máquina (generación de código final).</li>\n<li>🎯 La RI existe para pasar de <b>N × M</b> a <b>N + M</b>, y para optimizar una sola vez de forma neutra.</li>\n</ul>",
      "qa": [
        {
          "q": "¿Qué diferencia hay entre una fase y una pasada del compilador?",
          "a": "<p>Una <b>fase</b> es una etapa <b>lógica</b> del proceso (léxico, sintáctico, semántico…). Una <b>pasada</b> es un <b>recorrido completo</b> de la entrada o de una representación intermedia. Una sola pasada puede <b>agrupar varias fases</b>, y ciertas optimizaciones necesitan <b>varias pasadas</b> porque requieren haber visto todo el programa antes de decidir.</p>"
        },
        {
          "q": "¿Por qué conviene generar código intermedio en vez de traducir el fuente directo a Assembler? Dá la razón estructural.",
          "a": "<p>Por la <b>reutilización front-end/back-end</b>. Con una representación intermedia común, para <b>N</b> lenguajes y <b>M</b> máquinas alcanzan <b>N + M</b> piezas (N front-ends + M back-ends) en lugar de <b>N × M</b> compiladores completos. Además, las optimizaciones hechas sobre la RI (neutra) sirven para todas las máquinas de una sola vez.</p>"
        },
        {
          "q": "Clasificá en front-end o back-end: análisis léxico, asignación de registros, análisis semántico, generación de código intermedio.",
          "a": "<p><b>Front-end:</b> análisis léxico, análisis semántico, generación de código intermedio (dependen del lenguaje fuente, no de la máquina). <b>Back-end:</b> asignación de registros (depende de la arquitectura destino).</p>"
        },
        {
          "q": "V/F justificando: «Un compilador de una sola pasada puede aplicar cualquier optimización.»",
          "a": "<p><b>Falso.</b> Muchas optimizaciones (código muerto, movimiento de código invariante, subexpresiones comunes globales) requieren <b>haber visto todo el programa</b> antes de decidir, lo que obliga a <b>varias pasadas</b> sobre la representación intermedia. Con una sola pasada solo se pueden hacer optimizaciones locales.</p>"
        }
      ]
    },
    {
      "id": "0.4",
      "titulo": "El entorno: preprocesador, ensamblador, enlazador, cargador",
      "aho": "fig. 1.5 · p.4",
      "badges": [
        "🎯"
      ],
      "estado": "dictada",
      "html": "\n<p>El compilador no produce un ejecutable solo: es un eslabón en una cadena de herramientas. Conocerla te explica de dónde salen “vinculación”, “compilación separada”, “autocompiladores” y los “diagramas T” de la unidad 4 del programa.</p>\n\n<h3>La cadena completa</h3>\n<pre><code>fuente\n  │  Preprocesador     expande macros, resuelve #include (junta módulos)\n  ▼\nfuente modificado\n  │  Compilador        produce Assembler\n  ▼\nprograma en ensamblador\n  │  Ensamblador       produce código máquina RELOCALIZABLE\n  ▼\ncódigo máquina relocalizable  ──┐\n                                │  Enlazador (linker)  resuelve direcciones\nlibrerías + otros .obj  ────────┘  entre archivos\n  ▼\n  │  Cargador          lo pone en memoria para ejecutar\n  ▼\nejecución</code></pre>\n\n<h4>Qué hace cada eslabón, y por qué</h4>\n<ul>\n<li><b>Preprocesador</b>: junta el programa que puede estar partido en varios archivos y expande abreviaturas frecuentes (<b>macros</b>). Trabaja a nivel de texto, antes de compilar.</li>\n<li><b>Compilador</b>: traduce a Assembler (no directo a máquina — ver el callout).</li>\n<li><b>Ensamblador</b>: traduce el Assembler a <b>código máquina relocalizable</b>. “Relocalizable” = las direcciones todavía no son definitivas, porque no se sabe en qué parte de la memoria va a terminar este módulo.</li>\n<li><b>Enlazador (linker)</b>: cuando el código de un archivo <b>referencia</b> algo definido en otro (una función de una librería, una variable global de otro módulo), el enlazador <b>resuelve esas direcciones externas</b> y arma un solo programa. Es lo que permite la <b>compilación separada</b>: compilás cada módulo por su cuenta y recién al final se unen.</li>\n<li><b>Cargador</b>: ubica el ejecutable en memoria (fija las direcciones finales) y lo lanza.</li>\n</ul>\n\n<div class=\"callout tgt\"><span class=\"lab\">🎯 por qué el compilador produce Assembler y no máquina directo (Aho 1.1.3)</span>\nDos razones, y es exactamente lo que hace tu TP. (1) El Assembler es <b>texto legible</b>: es más fácil de <b>producir</b> y sobre todo de <b>depurar</b> que una tira de bytes. (2) Delega en el <b>ensamblador</b> el trabajo sucio de codificar cada instrucción y calcular direcciones, así el compilador no reimplementa eso. Tu compilador genera un <code>.asm</code> y lo ensamblás aparte con Turbo Assembler.</div>\n\n<h4>Tres términos del programa que ahora cierran</h4>\n<ul>\n<li><b>Autocompilador</b>: un compilador <b>escrito en el mismo lenguaje que compila</b> (un compilador de C escrito en C). Se arranca con una versión mínima (<i>bootstrapping</i>).</li>\n<li><b>Metacompilador</b>: un programa que <b>genera</b> compiladores (o partes). <b>Flex</b> y <b>Bison</b> son metaherramientas: les das especificaciones y te devuelven código de un analizador.</li>\n<li><b>Diagramas T</b>: una notación para dibujar de qué lenguaje a cuál traduce un compilador y en qué lenguaje está implementado. Sirven para razonar sobre bootstrapping y compilación cruzada.</li>\n</ul>\n\n<h3>Lo mínimo que tenés que saber</h3>\n<ul>\n<li>Cadena: preprocesador → compilador → ensamblador → enlazador → cargador.</li>\n<li>🎯 El compilador produce <b>Assembler</b> porque es legible/depurable y delega la codificación al ensamblador.</li>\n<li>El <b>enlazador</b> resuelve referencias entre archivos → habilita <b>compilación separada</b> y <b>vinculación</b>.</li>\n<li><b>Autocompilador</b> = escrito en su propio lenguaje; <b>metacompilador</b> = genera compiladores (Flex/Bison).</li>\n</ul>",
      "qa": [
        {
          "q": "¿Qué hace el enlazador y por qué es necesario con compilación separada?",
          "a": "<p>Resuelve las <b>referencias externas</b>: cuando el código de un archivo usa una función o variable <b>definida en otro</b> archivo objeto o librería, el enlazador ubica esas direcciones y conecta los módulos en un solo programa. Es lo que permite <b>compilar cada módulo por separado</b> (compilación separada) y recién al final unirlos; sin él, cada módulo tendría referencias sin resolver.</p>"
        },
        {
          "q": "¿Qué ventaja tiene que el compilador produzca Assembler en vez de código máquina directo? (Aho 1.1.3)",
          "a": "<p>(1) El Assembler es <b>texto legible</b>, mucho más fácil de <b>producir</b> y de <b>depurar</b> que bytes de código máquina. (2) Delega en el <b>ensamblador</b> la codificación de instrucciones y el cálculo de direcciones, evitando reimplementarlo. Es lo que hace el TP: genera un <code>.asm</code> que se ensambla aparte.</p>"
        },
        {
          "q": "¿Qué es un metacompilador y qué herramientas de tu TP lo son?",
          "a": "<p>Un <b>metacompilador</b> es un programa que <b>genera</b> compiladores (o partes de ellos) a partir de una especificación. <b>Flex</b> (genera el analizador léxico desde expresiones regulares) y <b>Bison</b> (genera el sintáctico desde una gramática) son metaherramientas: vos les das las reglas y te devuelven el código del analizador.</p>"
        },
        {
          "q": "¿Qué significa que el código máquina que produce el ensamblador sea «relocalizable»?",
          "a": "<p>Que sus <b>direcciones todavía no son definitivas</b>: el módulo no sabe en qué zona de memoria va a terminar, así que las direcciones quedan expresadas de forma relativa. El <b>enlazador/cargador</b> las fija después, al ubicar el módulo junto con los demás en el ejecutable final.</p>"
        }
      ]
    },
    {
      "id": "0.5",
      "titulo": "Estático vs dinámico · entornos, estados y alcance",
      "aho": "§1.6 · p.25",
      "badges": [
        "📘"
      ],
      "estado": "dictada",
      "html": "\n<p>Esta distinción atraviesa toda la materia (tipos, alcance, binding), así que conviene fijarla temprano aunque la unidad de binding (12) hoy no se dicte.</p>\n\n<div class=\"callout aho\"><span class=\"lab\">📘 fuera del cronograma actual</span>Corresponde a la unidad 12 del programa (binding, entornos, estructura en tiempo de ejecución), que <b>hoy no se dicta</b>. Es material de profundidad y de examen libre/final. Igual el concepto estático/dinámico se usa todo el tiempo.</div>\n\n<h3>La regla de oro: ¿en compilación o en ejecución?</h3>\n<p>Una decisión es <b>estática</b> si el compilador puede tomarla mirando <b>solo el texto</b> del programa, antes de ejecutar. Es <b>dinámica</b> si depende de lo que pasa <b>al correr</b>, con datos concretos.</p>\n<p>Ejemplo con el <b>alcance</b> (a qué declaración se refiere un nombre):</p>\n<ul>\n<li><b>Alcance estático (o léxico)</b>: se decide leyendo el programa. Mirás la estructura de bloques anidados y sabés a qué <code>x</code> se refiere cada uso. Es lo que usan casi todos los lenguajes modernos.</li>\n<li><b>Alcance dinámico</b>: depende de la <b>cadena de llamadas</b> en ejecución — a qué <code>x</code> te referís depende de quién llamó a quién. Más difícil de razonar; casi extinto.</li>\n</ul>\n\n<h3>Entorno y estado: dos mapeos que no hay que confundir</h3>\n<p>Aho separa dos cosas que parecen la misma:</p>\n<ul>\n<li><b>Entorno</b>: mapeo de <b>nombres → ubicaciones</b> de almacenamiento. “La variable <code>x</code> vive en la celda 1024.”</li>\n<li><b>Estado</b>: mapeo de <b>ubicaciones → valores</b>. “La celda 1024 contiene el número 7.”</li>\n</ul>\n\n<div class=\"callout tgt\"><span class=\"lab\">🎯 qué cambia cada cosa</span>\nUna <b>asignación</b> <code>x = 5</code> cambia el <b>estado</b> (el valor en la ubicación de <code>x</code>), no el entorno: <code>x</code> sigue viviendo en la misma celda. Una <b>declaración</b> o entrar a un <b>bloque</b> nuevo cambia el <b>entorno</b> (aparece un nombre nuevo, o uno tapa a otro). Confundirlos es un error clásico.</div>\n\n<h4>Por qué te importa para lo que viene</h4>\n<p>La <b>tabla de símbolos</b> es, en el fondo, el <b>entorno</b> del compilador: nombres con su ubicación y atributos. El chequeo de tipos usa información <b>estática</b> (la que sale de leer el programa). Y la diferencia entre lenguajes <b>estáticos y dinámicos</b> que vas a ver en tipos (Módulo 10) es exactamente esta regla aplicada al tipo de una variable.</p>\n\n<h3>Lo mínimo que tenés que saber</h3>\n<ul>\n<li><b>Estático</b> = se decide en compilación, mirando el texto. <b>Dinámico</b> = se decide en ejecución, con datos.</li>\n<li><b>Entorno</b>: nombres → ubicaciones. <b>Estado</b>: ubicaciones → valores.</li>\n<li>🎯 La asignación cambia el <b>estado</b>; la declaración/bloque cambia el <b>entorno</b>.</li>\n<li>El <b>alcance estático</b> (léxico) se resuelve leyendo el programa; el dinámico depende de la cadena de llamadas.</li>\n</ul>",
      "qa": [
        {
          "q": "Definí entorno y estado, y decí cuál cambia la asignación x = 5.",
          "a": "<p><b>Entorno</b>: mapeo de <b>nombres → ubicaciones</b> (dónde vive cada variable). <b>Estado</b>: mapeo de <b>ubicaciones → valores</b> (qué contiene cada celda). <code>x = 5</code> cambia el <b>estado</b> (el valor guardado en la ubicación de <code>x</code>); el entorno no cambia, <code>x</code> sigue en la misma celda.</p>"
        },
        {
          "q": "¿Qué significa que una decisión del compilador sea «estática» y qué que sea «dinámica»? Dá un ejemplo de cada una.",
          "a": "<p><b>Estática</b>: se resuelve en <b>compilación</b> mirando solo el texto del programa (ej.: el chequeo de tipos en un lenguaje estático, o el alcance léxico). <b>Dinámica</b>: depende de lo que pasa <b>en ejecución</b> con datos concretos (ej.: el valor de una variable, o el alcance dinámico que depende de la cadena de llamadas).</p>"
        },
        {
          "q": "¿Qué relación tiene la tabla de símbolos con el concepto de «entorno»?",
          "a": "<p>La <b>tabla de símbolos es el entorno del compilador</b>: guarda los <b>nombres</b> con su <b>ubicación</b> y atributos (tipo, alcance). Es la estructura donde el compilador registra “qué nombre existe y dónde/qué es”, que es justamente la definición de entorno (nombres → ubicaciones).</p>"
        }
      ]
    }
  ]
});
