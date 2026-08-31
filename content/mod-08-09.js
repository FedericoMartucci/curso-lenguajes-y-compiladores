/* =================== MÓDULO 8 =================== */
M.push({
  id:8, titulo:"Traducción dirigida por sintaxis", parcial:"II",
  resumen:"Cómo el análisis semántico cuelga información (atributos) de la gramática y la calcula mientras parsea: atributos sintetizados (suben) vs heredados (bajan), grafos de dependencias, S-atribuidas y L-atribuidas, esquemas de traducción con acciones embebidas y postfijas, la pila del parser, la notación postfija y los recorridos del árbol (INORDER = programa, POSTORDER = polaca), cómo se arma el árbol con crear_nodo/crear_hoja, y la comprobación estática.",
  lecciones:[
  {
    id:"8.1", titulo:"Atributos sintetizados vs heredados", aho:"§5.1.1 · p.304", badges:["🎯","📘"], estado:"dictada",
    html:`
<p>Terminado el Parcial I, el parser ya te devuelve la <b>lista de reglas</b>. Ahora empieza la parte que traduce eso a código. La herramienta base se llama <b>definición dirigida por la sintaxis (DDS)</b>: es una gramática libre de contexto a la que le <b>colgás dos cosas</b> en cada regla: <b>atributos</b> (información) y <b>reglas semánticas</b> (cómo se calcula esa información). Un <b>atributo</b> es cualquier dato que asociás a un símbolo de la gramática: un tipo, un valor numérico, un puntero a un nodo del árbol, un pedazo de código intermedio. Se escribe <code>X.a</code> = «el atributo <code>a</code> del símbolo <code>X</code> en tal nodo».</p>

<h3>La analogía de la empresa familiar</h3>
<p>Pensá el árbol como una empresa con jefes (nodos de arriba) y subgerencias (los hijos). Hay dos formas de que la información viaje por el organigrama:</p>
<ul>
<li>Un <b>atributo sintetizado</b> es un <b>informe que sube</b>: cada subgerencia le pasa su número al jefe, y el jefe arma el suyo combinando los de abajo. Se calcula en el nodo <b>a partir de sus hijos</b> (y de sí mismo).</li>
<li>Un <b>atributo heredado</b> es una <b>directiva que baja</b>: el jefe (el padre) o un colega de al lado (un hermano) te pasa un dato de contexto. Se calcula en el nodo <b>a partir de su padre, sus hermanos</b> (y de sí mismo).</li>
</ul>
<p>Regla mnemotécnica: <b>sintetizado sube, heredado baja o viene de al lado</b>.</p>

<h3>Por qué te importa (y por qué la cátedra vive de esto)</h3>
<p>Los atributos <b>sintetizados se calculan solos</b> durante el parsing <b>ascendente</b>: justo cuando el parser <b>reduce</b> por una regla, ya tiene listos los atributos de todos los hijos, así que puede armar el del padre. Esto es <b>exactamente</b> lo que la cátedra llama «la acción semántica se dispara cuando el parser reduce por esa regla». Toda la generación de notación intermedia (árbol, polaca, tercetos) se hace con atributos sintetizados: cada puntero, índice o celda es un atributo que <b>sube</b>.</p>

<h3>Los terminales solo tienen sintetizados</h3>
<p>Un terminal (un token, como <code>id</code> o <code>cte</code>) <b>no puede tener atributos heredados</b>, porque no hay ninguna regla semántica que se los defina: su único atributo es el <b>valor léxico</b> que le trajo el analizador léxico (por ejemplo, el número que representa <code>cte</code>, o el puntero a la tabla de símbolos de <code>id</code>). Ese valor léxico es un atributo sintetizado que entra «desde afuera».</p>

<h3>Ejemplo: la calculadora de Aho</h3>
<p>Con la gramática de expresiones y un atributo <code>val</code> en cada no terminal, todas las reglas calculan <code>val</code> desde los hijos:</p>
<pre><code>PRODUCCIÓN     REGLA SEMÁNTICA
E  -> E1 + T   E.val = E1.val + T.val
E  -> T        E.val = T.val
T  -> T1 * F   T.val = T1.val * F.val
F  -> ( E )    F.val = E.val
F  -> digito   F.val = digito.valex</code></pre>
<p>Todo es sintetizado: cada <code>val</code> se arma con los <code>val</code> de los hijos. Una DDS así (solo sintetizados) se llama <b>S-atribuida</b> y es la que encaja de una con el parser LR (lo vemos en 8.2).</p>

<div class="callout tgt"><span class="lab">🎯 esto es lo que hacés en el TP</span>
Cuando en Bison escribís <code>T -> T * F  { Tptr = crear_nodo(*, Tptr, Fptr) }</code>, estás definiendo un <b>atributo sintetizado</b> (el puntero <code>Tptr</code>) que se calcula desde los hijos al <b>reducir</b>. Por eso la cátedra dice que «las declaraciones no generan código pero el resto sí se genera al reducir»: reducir = tener los hijos listos = poder sintetizar el atributo del padre. Casi todo lo del Parcial II es sintetizar atributos hacia arriba.</div>

<div class="callout aho"><span class="lab">📘 los heredados existen, pero la cátedra no los toma</span>
Aho usa <b>heredados</b> cuando la forma del árbol de parsing <b>no coincide</b> con la estructura natural de la expresión: por ejemplo, en una gramática factorizada para LL, el operando izquierdo de un <code>*</code> queda en <b>otro subárbol</b>, así que hay que <b>pasarlo hacia abajo</b> como atributo heredado. En la práctica de la cátedra vos parseás con LR y sintetizás todo hacia arriba, así que los heredados casi no aparecen; alcanza con saber que <b>existen</b> y que <b>bajan/vienen de al lado</b>.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Una <b>DDS</b> = gramática + <b>atributos</b> (datos colgados de los símbolos) + <b>reglas semánticas</b> (cómo se calculan).</li>
<li><b>Sintetizado</b>: se calcula desde los hijos y <b>sube</b>. <b>Heredado</b>: se calcula desde padre/hermanos y <b>baja o viene de al lado</b>.</li>
<li>Los <b>terminales</b> solo tienen sintetizados: el <b>valor léxico</b> que trae el AL.</li>
<li>🎯 La notación intermedia se genera con <b>atributos sintetizados</b>, que se calculan al <b>reducir</b> (parsing ascendente). Es el corazón del Parcial II.</li>
</ul>`,
    qa:[
      {q:"¿Qué es un atributo sintetizado y qué es uno heredado? Definilos y decí en qué dirección viaja cada uno.",
       a:`<p>Un <b>atributo</b> es cualquier dato que se le cuelga a un símbolo de la gramática (un valor, un tipo, un puntero a un nodo, un pedazo de código). Un atributo es <b>sintetizado</b> si su valor en un nodo se calcula a partir de los atributos de los <b>hijos</b> de ese nodo (y del propio nodo): <b>viaja hacia arriba</b>. Es <b>heredado</b> si su valor se calcula a partir de los atributos del <b>padre, los hermanos</b> y el propio nodo: <b>viaja hacia abajo o de costado</b>. Ejemplo sintetizado: <code>E.val = E1.val + T.val</code> (el valor sube desde los operandos). Los sintetizados son los que usás para generar la notación intermedia, porque se calculan solos al reducir en un parser ascendente.</p>`},
      {q:"¿Por qué un terminal solo puede tener atributos sintetizados y nunca heredados?",
       a:`<p>Porque un atributo heredado se define mediante una <b>regla semántica asociada a la producción del padre</b>, y los terminales <b>no se definen con reglas</b> de la gramática: son átomos que llegan desde el léxico. Lo único que un terminal trae es su <b>valor léxico</b> (el número de una <code>cte</code>, el puntero a la tabla de símbolos de un <code>id</code>), y ese valor lo suministra el <b>analizador léxico</b>, no una regla semántica. Como ese valor entra «desde afuera» y se usa hacia arriba, se considera un atributo <b>sintetizado</b>. No hay ningún mecanismo que le baje información a un terminal, así que no puede tener heredados.</p>`},
      {q:"V/F justificando: «Para generar la notación intermedia con un parser ascendente conviene usar atributos sintetizados.»",
       a:`<p><b>Verdadero.</b> El parser ascendente (LR) reconoce primero las partes chicas y va <b>reduciendo</b> hacia arriba. Cuando reduce por una regla como <code>T -> T * F</code>, ya tiene reconocidos y con sus atributos listos a <b>todos los hijos</b> (<code>T</code> y <code>F</code>). Justo ahí puede calcular el atributo del padre a partir de los hijos, que es precisamente la definición de <b>atributo sintetizado</b>. Por eso las acciones semánticas que arman el árbol, la polaca o los tercetos se enganchan naturalmente con el parser LR: se disparan al reducir y sintetizan el resultado hacia arriba, sin necesidad de construir el árbol aparte ni de pasar información hacia abajo.</p>`},
      {q:"¿En qué situación harían falta atributos heredados, aunque la cátedra casi no los tome?",
       a:`<p>Hacen falta cuando la <b>estructura del árbol de parsing no coincide</b> con la estructura natural de lo que estás traduciendo, cosa que pasa típicamente con gramáticas <b>factorizadas para parsing descendente (LL)</b>. Por ejemplo, en una versión no recursiva por izquierda de la gramática de expresiones, el operando izquierdo de un <code>*</code> queda en un subárbol <b>distinto</b> del operador. Para poder operar, hay que <b>pasar ese operando hacia abajo</b> hasta donde está el <code>*</code>, y eso solo se puede con un atributo <b>heredado</b>. Como en la práctica de la cátedra se parsea con LR y se sintetiza todo hacia arriba, los heredados casi no aparecen; alcanza con saber que existen y para qué sirven.</p>`}
    ]
  },
  {
    id:"8.2", titulo:"Grafos de dependencias; S-atribuidas y L-atribuidas", aho:"§5.1.2 + §5.2 · p.306", badges:["📘"], estado:"dictada",
    html:`
<p>📘 <b>de Aho, de profundidad.</b> Una vez que tenés atributos colgados por todos lados (8.1), aparece una pregunta práctica: <b>¿en qué orden los calculo?</b> No podés calcular un atributo antes de tener listos los atributos de los que depende. El <b>grafo de dependencias</b> es la herramienta que responde eso.</p>

<h3>Qué es un grafo de dependencias</h3>
<p>Es un grafo que muestra el <b>flujo de información</b> entre los atributos de un árbol: se dibuja una <b>flecha del atributo <code>b</code> al atributo <code>c</code></b> cuando, para calcular <code>c</code>, necesitás <code>b</code>. Un orden de evaluación válido es cualquiera que respete todas las flechas (un «orden topológico»): calculás algo solo después de haber calculado todo lo que le apunta.</p>

<h3>La analogía de la receta</h3>
<p>Es la lista de «qué tiene que estar listo antes de esto». No podés glasear la torta antes de hornearla; no podés hornear antes de mezclar. El grafo de dependencias es ese diagrama de precedencias. Y ojo con el detalle importante: <b>si las flechas forman un círculo, no hay por dónde empezar</b>. Si la regla dijera «para glasear necesito la torta horneada» y «para hornear necesito el glaseado puesto», estás trabado. Eso es una <b>dependencia circular</b>:</p>
<pre><code>PRODUCCIÓN   REGLAS
A -> B       A.s = B.i        (A.s necesita B.i)
             B.i = A.s + 1     (B.i necesita A.s)</code></pre>
<p>Imposible: cada uno espera al otro. Una DDS con ciclos <b>no se puede evaluar</b>.</p>

<h3>Dos clases que garantizan que el orden existe</h3>
<p>Para no tener que dibujar el grafo cada vez y rezar que no haya ciclos, se definen dos clases de DDS que <b>siempre</b> tienen orden de evaluación:</p>
<ul>
<li><b>S-atribuida</b> (S de <i>sintetizados</i>): usa <b>solo atributos sintetizados</b>. Todas las flechas van de hijos a padre, así que siempre se evalúa de <b>abajo hacia arriba</b>, en un recorrido <b>postorden</b>. Encaja perfecto con el <b>parsing ascendente LR</b>: se calcula al reducir. <b>Es la clase que usa la cátedra.</b></li>
<li><b>L-atribuida</b> (L de <i>izquierda</i>, <i>left</i>): admite heredados, pero con una restricción: cada atributo heredado de un símbolo del cuerpo puede depender <b>solo</b> del padre y de los <b>hermanos que están a su izquierda</b> (más los sintetizados de sí mismo). Como el parser lee de izquierda a derecha, cuando llega a un símbolo ya calculó todo lo que tiene a la izquierda. Encaja con el <b>parsing descendente LL</b>.</li>
</ul>
<p>Relación clave: <b>toda DDS S-atribuida es también L-atribuida</b> (si no hay heredados, la restricción de «solo hermanos izquierdos» se cumple sola). La S-atribuida es el caso más simple y el más usado en la materia.</p>

<div class="callout aho"><span class="lab">📘 por qué esto no es de parcial pero conviene entenderlo</span>
La cátedra no te va a pedir «clasificá esta DDS como S o L». Pero este es el <b>fundamento</b> de por qué las acciones semánticas se pueden ejecutar <b>durante</b> el parsing sin construir el árbol aparte: como todo es S-atribuido (sintetizado), el orden de evaluación es simplemente el <b>orden de las reducciones</b>. En el TP, Bison evalúa tus acciones en ese orden postorden automáticamente. Si intentaras algo que necesita mirar «hacia adelante» o hacia los hijos que todavía no reduciste, el grafo tendría una dependencia imposible de resolver durante el parsing.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>El <b>grafo de dependencias</b> dibuja flechas de «lo que necesito» hacia «lo que calculo»; un orden válido respeta todas las flechas.</li>
<li>Si hay un <b>ciclo</b>, la DDS <b>no se puede evaluar</b>.</li>
<li><b>S-atribuida</b>: solo sintetizados, se evalúa en <b>postorden</b> / al <b>reducir</b> (LR). Es lo de la cátedra.</li>
<li><b>L-atribuida</b>: heredados que dependen solo de padre + hermanos izquierdos, encaja con <b>LL</b>. Toda S-atribuida es L-atribuida.</li>
</ul>`,
    qa:[
      {q:"¿Qué es un grafo de dependencias y para qué sirve?",
       a:`<p>Es un grafo que muestra el <b>flujo de información entre los atributos</b> de un árbol: se pone una flecha de un atributo <code>b</code> a otro <code>c</code> cuando para calcular <code>c</code> hace falta <code>b</code>. Sirve para <b>determinar en qué orden</b> se pueden evaluar los atributos: cualquier orden que respete todas las flechas (un orden topológico) es válido, porque garantiza que cada atributo se calcula después de aquellos de los que depende. Además revela problemas: si el grafo tiene un <b>ciclo</b>, no existe ningún orden posible y la definición dirigida por la sintaxis no se puede evaluar.</p>`},
      {q:"¿Qué es una DDS S-atribuida y por qué encaja tan bien con el parsing ascendente?",
       a:`<p>Una DDS <b>S-atribuida</b> es la que usa <b>únicamente atributos sintetizados</b> (nada de heredados). Como todo sintetizado se calcula a partir de los <b>hijos</b>, todas las dependencias van de abajo hacia arriba y siempre se puede evaluar en un recorrido <b>postorden</b>. Encaja perfecto con el <b>parsing ascendente (LR)</b> porque el parser reduce de abajo hacia arriba: cada vez que reduce por una regla, ya reconoció y calculó los atributos de todos los hijos, así que puede sintetizar el atributo del padre <b>en ese mismo momento</b>. Por eso las acciones semánticas de la cátedra (armar árbol, polaca, tercetos) son S-atribuidas y se disparan al reducir.</p>`},
      {q:"¿Qué es una DDS L-atribuida y en qué se diferencia de una S-atribuida?",
       a:`<p>Una DDS <b>L-atribuida</b> admite atributos <b>heredados</b>, pero con una restricción: cada heredado de un símbolo del cuerpo de una regla puede depender <b>solo</b> de los atributos del <b>padre</b> y de los <b>hermanos ubicados a su izquierda</b> (más sus propios sintetizados). Gracias a esa restricción se puede evaluar en un recorrido de <b>izquierda a derecha</b>, que es como lee un parser <b>descendente (LL)</b>. La diferencia con la S-atribuida es que esta última <b>no permite heredados en absoluto</b>. De hecho, <b>toda S-atribuida es también L-atribuida</b> (si no hay heredados, la restricción se cumple trivialmente): la S es el caso particular más simple.</p>`},
      {q:"Mostrá un caso en el que una definición dirigida por la sintaxis no se pueda evaluar.",
       a:`<p>Cuando el grafo de dependencias tiene un <b>ciclo</b>. El ejemplo clásico de Aho es la producción <code>A -> B</code> con las reglas <code>A.s = B.i</code> y <code>B.i = A.s + 1</code>. Para calcular <code>A.s</code> necesitás <code>B.i</code>, pero para calcular <code>B.i</code> necesitás <code>A.s</code>: cada uno espera al otro y no hay por dónde arrancar. Es como una receta que dice «para hornear necesito el glaseado puesto» y «para glasear necesito la torta horneada». Ninguna DDS con dependencias circulares tiene un orden de evaluación válido, así que no se puede traducir. Las clases S-atribuida y L-atribuida se definen justamente para <b>garantizar</b> que nunca aparezcan estos ciclos.</p>`}
    ]
  },
  {
    id:"8.3", titulo:"Esquemas de traducción: acciones embebidas", aho:"§5.4 · p.323", badges:["🎯"], estado:"dictada",
    html:`
<p>La DDS (8.1) es <b>declarativa</b>: dice <i>qué</i> vale cada atributo, pero no <i>cuándo</i> ni <i>dónde</i> se ejecuta el código. Un <b>esquema de traducción</b> arregla eso: es una gramática libre de contexto con <b>fragmentos de programa incrustados dentro del cuerpo de las producciones</b>, escritos entre llaves <code>{ }</code>. Esos fragmentos son las <b>acciones semánticas</b>, y su <b>posición</b> dentro de la regla determina el momento en que corren.</p>

<h3>La analogía de la receta con pasos</h3>
<p>Si la DDS es la <b>lista de ingredientes</b> («la torta lleva 2 huevos y harina»), el esquema de traducción es la <b>receta con los pasos en orden</b>: «batí los huevos, <b>después</b> agregá la harina, <b>después</b> horneá». Una acción escrita <b>en el medio</b> del cuerpo se ejecuta en ese punto del proceso; una escrita <b>al final</b> se ejecuta al terminar de reconocer toda la regla.</p>

<h3>La regla de oro: la acción corre cuando lo de su izquierda ya se reconoció</h3>
<p>Una acción embebida <b>se ejecuta apenas el parser terminó de reconocer todos los símbolos que están a su izquierda</b> dentro de la regla. Formalmente, en:</p>
<pre><code>B -> X { a } Y</code></pre>
<p>la acción <code>a</code> corre <b>después</b> de reconocer <code>X</code> (o todo lo que <code>X</code> derive) y <b>antes</b> de encarar <code>Y</code>. Un truco para razonarlo: cada acción embebida se puede pensar como un <b>no terminal marcador</b> <code>M</code> con una única producción vacía <code>M -> </code> (épsilon), metido en esa posición.</p>

<h3>No todo esquema se puede ejecutar durante el parsing</h3>
<p>Ejemplo de Aho que <b>no</b> funciona: querer imprimir la forma <b>prefija</b> (operador antes que operandos) mientras parseás. Para <code>3 * 5</code> habría que imprimir el <code>*</code> <b>antes</b> de haber leído siquiera el <code>5</code>, es decir, antes de saber que había un <code>*</code>. Con marcadores <code>M -> </code> aparecen conflictos desplazar/reducir. Moraleja: la <b>posición</b> de la acción no es libre; tiene que ser compatible con lo que el parser ya sabe en ese momento.</p>

<div class="callout tgt"><span class="lab">🎯 dónde ponés la acción en el TP</span>
La regla clásica de la cátedra: <code>generaAssembler()</code> se invoca <b>una sola vez, desde la acción de la regla del start symbol</b>, y esa acción va <b>al final</b> del cuerpo, para que se dispare <b>cuando la GCI ya terminó por completo</b>. Es una acción embebida ubicada a propósito al final: si la pusieras en el medio de otra regla, se ejecutaría antes de tiempo, cuando la notación intermedia todavía no está armada. La posición de la acción <b>es</b> la respuesta a «¿en qué momento se genera el Assembler?».</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Un <b>esquema de traducción</b> = gramática + <b>acciones semánticas</b> <code>{ código }</code> incrustadas en el cuerpo de las producciones.</li>
<li>Una acción se ejecuta <b>cuando el parser ya reconoció todo lo que está a su izquierda</b> en la regla.</li>
<li>La <b>DDS declara</b> (qué); el <b>esquema de traducción ordena</b> (cuándo/dónde). La posición importa.</li>
<li>🎯 En el TP, la acción que llama a <code>generaAssembler()</code> va <b>al final de la regla del start</b>, para dispararse al terminar toda la generación.</li>
</ul>`,
    qa:[
      {q:"¿Qué es un esquema de traducción y en qué se diferencia de una definición dirigida por la sintaxis?",
       a:`<p>Un <b>esquema de traducción</b> es una gramática libre de contexto con <b>acciones semánticas</b> (fragmentos de programa entre llaves <code>{ }</code>) <b>incrustadas dentro del cuerpo</b> de las producciones. La diferencia con una <b>DDS</b> es que la DDS es <b>declarativa</b>: dice qué valor tiene cada atributo mediante ecuaciones, sin fijar un orden de ejecución. El esquema de traducción, en cambio, es <b>operacional</b>: la <b>posición</b> de cada acción dentro de la regla determina el <b>momento</b> exacto en que se ejecuta. La DDS es la lista de ingredientes; el esquema de traducción es la receta con los pasos ordenados.</p>`},
      {q:"En la producción B -> X { a } Y, ¿cuándo se ejecuta la acción a?",
       a:`<p>La acción <code>a</code> se ejecuta <b>apenas el parser terminó de reconocer <code>X</code></b> (si <code>X</code> es terminal, en cuanto aparece; si es no terminal, en cuanto se reconoció todo lo que deriva), y <b>antes</b> de empezar con <code>Y</code>. La regla general es: una acción embebida corre cuando <b>todos los símbolos a su izquierda</b> en la regla ya tienen coincidencia. Una forma cómoda de pensarlo es reemplazar la acción por un <b>no terminal marcador</b> <code>M</code> con producción vacía <code>M -> </code> en esa posición: el parser «pasa» por <code>M</code> justo en ese punto y ahí dispara la acción.</p>`},
      {q:"¿Por qué generaAssembler() se ubica en la acción de la regla del start symbol y al final del cuerpo?",
       a:`<p>Porque el Assembler solo se puede generar <b>cuando la generación de código intermedio terminó por completo</b>. La regla del <b>start symbol</b> es la <b>última</b> que reduce el parser (es la raíz del árbol de parsing), así que una acción ubicada <b>al final</b> del cuerpo de esa regla se dispara recién cuando <b>toda</b> la notación intermedia ya está armada. Por eso la cátedra insiste en que <code>generaAssembler()</code> se llama <b>una sola vez</b> desde ahí y que <b>no debe haber ninguna otra función</b> que traduzca a Assembler en las demás reglas: si estuviera en el medio de otra regla, correría antes de tiempo, con la notación intermedia a medio construir.</p>`},
      {q:"Dá un ejemplo de esquema de traducción que NO se pueda ejecutar durante el parsing y explicá por qué.",
       a:`<p>El ejemplo de Aho es imprimir la <b>forma prefija</b> (operador antes que operandos) mientras se parsea. Para la entrada <code>3 * 5</code>, la forma prefija es <code>* 3 5</code>, así que habría que <b>imprimir el <code>*</code> antes de leer el <code>5</code></b>, es decir, antes de que el parser tenga forma de saber que ese <code>*</code> aparece. Al modelar las acciones con marcadores <code>M -> </code>, el parser encuentra <b>conflictos desplazar/reducir</b>: no puede decidir si reducir un marcador (y ejecutar la impresión) o seguir leyendo. En cambio, la forma <b>postfija</b> (operandos primero, operador al final) sí se puede, porque cuando corresponde imprimir el operador ya se reconocieron sus dos operandos. Conclusión: la posición de la acción tiene que ser compatible con lo que el parser ya conoce en ese instante.</p>`}
    ]
  },
  {
    id:"8.4", titulo:"Esquemas postfijos y la pila del parser", aho:"§5.4.1–5.4.2 · p.324", badges:["🎯"], estado:"dictada",
    html:`
<p>De todos los esquemas de traducción (8.3), el más simple y el que usás en el TP es el <b>postfijo</b>: aquel donde <b>todas las acciones van al final del cuerpo</b> de la producción. Corre cuando la regla se <b>reduce</b>. Funciona siempre que se cumplan dos condiciones que ya conocés: la gramática es <b>LR</b> (parsing ascendente) y los atributos son <b>sintetizados</b>. Es, palabra por palabra, el caso S-atribuido de 8.2.</p>

<h3>La analogía de la caja del supermercado</h3>
<p>El parser tiene una <b>pila</b>, como la cinta de la caja. Vas apilando productos (los símbolos, cada uno <b>con su atributo pegado</b>). Cuando el cajero «reduce» un combo (aplica una regla), agarra los <b>últimos</b> productos de la cinta, calcula el precio y deja <b>el resultado en el mismo lugar</b>. La clave: en la pila, <b>cada símbolo viaja junto con sus atributos</b>.</p>

<h3>Cómo encuentra el parser los atributos al reducir</h3>
<p>Supongamos que vas a reducir por <code>A -> X Y Z</code>. En ese momento, los tres símbolos <code>X Y Z</code> están en el <b>tope de la pila</b>, cada uno con su atributo, en posiciones conocidas:</p>
<pre><code>            posición        símbolo   atributo
tope   -->  pila[tope]        Z        Z.z
            pila[tope-1]      Y        Y.y
            pila[tope-2]      X        X.x</code></pre>
<p>La acción calcula el atributo de <code>A</code> combinando <code>pila[tope-2]</code>, <code>pila[tope-1]</code> y <code>pila[tope]</code>, y lo deja donde estaba <code>X</code> (dos posiciones abajo). Después baja el tope, porque los tres símbolos se reemplazaron por uno solo (<code>A</code>). Ejemplo con la calculadora:</p>
<pre><code>PRODUCCIÓN     ACCIÓN (manipulando la pila)
E -> E1 + T    pila[tope-2].val = pila[tope-2].val + pila[tope].val;
               tope = tope - 2;
T -> T1 * F    pila[tope-2].val = pila[tope-2].val * pila[tope].val;
               tope = tope - 2;</code></pre>
<p>En <code>E -> E1 + T</code> el valor de <code>E1</code> está dos lugares abajo del tope y el de <code>T</code> en el tope; el <code>+</code> del medio no lleva valor. La suma se guarda donde va a quedar <code>E</code> después de reducir.</p>

<div class="callout tgt"><span class="lab">🎯 esto es literalmente Bison</span>
Los famosos <code>$1</code>, <code>$2</code>, <code>$3</code> de Bison <b>son</b> <code>pila[tope-2]</code>, <code>pila[tope-1]</code>, <code>pila[tope]</code>, y <code>$$</code> es el atributo del encabezado que queda en el tope tras reducir. Cuando escribís <code>T -> T * F { $$ = crear_nodo(*, $1, $3) }</code>, estás haciendo exactamente lo de la figura de Aho: tomás el atributo de <code>T</code> (que es <code>$1</code>) y el de <code>F</code> (que es <code>$3</code>), armás el nodo y lo dejás como atributo de la nueva <code>T</code>. El <code>$2</code> (el <code>*</code>) no lo usás. Los punteros/índices de la cátedra (<code>Tptr</code>, <code>Find</code>) son estos atributos sintetizados sobre la pila.</div>

<h3>El caso borde: atributos grandes</h3>
<p>Si un atributo es chico (un número, un índice) se guarda directo en la pila. Pero si es <b>grande</b> —por ejemplo una cadena larga de código intermedio— no conviene meterlo entero en la pila: se guarda un <b>puntero</b> al valor en la pila y el valor real en otra zona de memoria. Por eso en la práctica los atributos de código se manejan como <b>punteros a nodos</b> o índices de celda, no como cadenas apiladas.</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Un <b>esquema postfijo</b> tiene todas las acciones <b>al final</b>; se ejecutan al <b>reducir</b>. Necesita gramática <b>LR</b> + atributos <b>sintetizados</b>.</li>
<li>La <b>pila del parser</b> guarda cada símbolo <b>junto con su atributo</b>.</li>
<li>Al reducir <code>A -> X Y Z</code>, los atributos están en <code>pila[tope-2]</code>, <code>pila[tope-1]</code>, <code>pila[tope]</code>; el resultado queda donde estaba <code>X</code>.</li>
<li>🎯 Es el mecanismo de Bison (<code>$1</code>, <code>$2</code>, <code>$3</code> -> <code>$$</code>) y de los punteros/índices de la cátedra.</li>
</ul>`,
    qa:[
      {q:"¿Qué es un esquema de traducción postfijo y qué dos condiciones necesita para funcionar durante el parsing?",
       a:`<p>Es un esquema de traducción en el que <b>todas las acciones semánticas están al final</b> del cuerpo de las producciones, de modo que cada acción se ejecuta <b>junto con la reducción</b> de esa regla. Necesita dos condiciones: (1) que la gramática se pueda analizar de <b>abajo hacia arriba (LR)</b>, es decir, con parsing ascendente; y (2) que los atributos sean <b>sintetizados</b> (que cada atributo se calcule a partir de los hijos). Cuando se cumplen ambas —el caso S-atribuido—, en el momento de reducir ya están calculados los atributos de todos los hijos, así que la acción puede sintetizar el atributo del padre sin problemas.</p>`},
      {q:"Al reducir por A -> X Y Z, ¿dónde están los atributos de X, Y y Z y dónde queda el resultado?",
       a:`<p>Están en el <b>tope de la pila</b> del parser, cada símbolo con su atributo pegado: <code>Z</code> en <code>pila[tope]</code>, <code>Y</code> en <code>pila[tope-1]</code> y <code>X</code> en <code>pila[tope-2]</code>. La acción calcula el atributo de <code>A</code> combinando esos tres y lo <b>deja en la posición de <code>X</code></b> (dos lugares abajo del tope). Después se <b>baja el tope</b> en dos posiciones, porque los tres símbolos del cuerpo se reemplazan por un único símbolo <code>A</code>, que queda ahora en el tope con su atributo ya calculado. Así el parser puede seguir reduciendo hacia arriba.</p>`},
      {q:"¿Cómo se relacionan los $1, $2, $3 y $$ de Bison con la pila del parser?",
       a:`<p>Son exactamente las posiciones de la pila. Al reducir por una regla de tres símbolos, <code>$1</code> es <code>pila[tope-2]</code> (el primer símbolo del cuerpo), <code>$2</code> es <code>pila[tope-1]</code> y <code>$3</code> es <code>pila[tope]</code> (el último). <code>$$</code> es el atributo del <b>encabezado</b>, que queda en el tope después de reducir. Por eso, cuando escribís <code>T -> T * F { $$ = crear_nodo(*, $1, $3) }</code>, estás tomando el atributo de <code>T</code> (<code>$1</code>) y el de <code>F</code> (<code>$3</code>) —ignorando el <code>*</code>, que es <code>$2</code>— para construir el nodo y dejarlo como atributo de la nueva <code>T</code>. Es la implementación literal del esquema postfijo sobre la pila.</p>`},
      {q:"¿Qué se hace cuando un atributo sintetizado es muy grande, como una cadena larga de código?",
       a:`<p>No se guarda el valor entero en la pila del parser, porque agrandaría cada registro de la pila innecesariamente. En su lugar se coloca en la pila un <b>puntero (o referencia)</b> al valor, y el valor real se almacena en una <b>zona de memoria aparte</b>, compartida y más amplia, que no forma parte de la pila. Con atributos chicos (un número, un índice de celda) sí conviene guardarlos directo. Por eso, en la práctica, los atributos que representan código intermedio se manejan como <b>punteros a nodos del árbol</b> o como <b>índices de tercetos/celdas</b>, no como cadenas apiladas: son referencias chicas y baratas de mover.</p>`}
    ]
  },
  {
    id:"8.5", titulo:"Notación postfija (polaca) y recorridos del árbol", aho:"§2.3.1 + §2.3.4 · p.53", badges:["🎯"], estado:"dictada",
    html:`
<p>La <b>notación postfija</b> —lo que la cátedra llama <b>polaca inversa</b>— pone el <b>operador después de sus operandos</b>. Es una de las tres representaciones intermedias que vas a usar, y sale directo de recorrer el árbol sintáctico de cierta manera. Definición inductiva:</p>
<ul>
<li>Si <code>E</code> es una variable o constante, su postfija es <b>ella misma</b>.</li>
<li>Si <code>E</code> es <code>E1 op E2</code>, su postfija es <b>E1' E2' op</b> (primero las dos postfijas de los operandos, después el operador).</li>
<li>Si <code>E</code> es <code>( E1 )</code>, su postfija es la misma que la de <code>E1</code> (los paréntesis desaparecen).</li>
</ul>

<h3>La analogía de la calculadora HP</h3>
<p>Es como decir «9 y 5, restalos» en vez de «9 menos 5». El operador es una <b>orden que llega cuando los dos ingredientes ya están sobre la mesa</b>. Las calculadoras HP y la máquina virtual de Java trabajan así, y tienen una ventaja enorme: <b>nunca necesitan paréntesis</b>. La posición y la <b>aridad</b> (cuántos operandos toma cada operador) alcanzan para decodificar la expresión sin ambigüedad.</p>
<p>Para <b>evaluar</b> una polaca a mano: recorrés de izquierda a derecha hasta el <b>primer operador</b>; sus operandos son los <b>dos elementos a su izquierda</b>; los reemplazás por el resultado y seguís. Ejemplo: <code>9 5 - 2 +</code> -> (9-5)=4 -> <code>4 2 +</code> -> 6.</p>

<h3>Los recorridos del árbol</h3>
<p>Un árbol se recorre «primero en profundidad», y según el orden en que visitás padre e hijos tenés tres recorridos:</p>
<ul>
<li><b>INORDER</b> (hijo izquierdo, <b>padre</b>, hijo derecho): pone el operador <b>entre</b> sus operandos -> notación <b>infija</b>, que es como escribimos normalmente.</li>
<li><b>POSTORDER</b> (hijo izquierdo, hijo derecho, <b>padre</b>): pone el operador <b>después</b> -> notación <b>postfija</b> = polaca inversa.</li>
<li><b>PREORDER</b> (<b>padre</b>, hijo izquierdo, hijo derecho): pone el operador <b>antes</b> -> notación <b>prefija</b>.</li>
</ul>

<h3>El resultado que cae en el parcial</h3>
<p>Usemos la gramática canónica y el programa de siempre:</p>
<pre><code>1. A -> id := E      4. T -> T * F      6. F -> id
2. E -> E + T        5. T -> F          7. F -> cte
3. E -> T

Programa:  id1 := id2 * cte1 + cte2
Lista de reglas:  6 5 7 4 3 7 5 2 1</code></pre>
<p>Su árbol sintáctico (achicado, subiendo cada operador lo más alto posible):</p>
<pre><code>:=
├─ id1
└─ +
   ├─ *
   │  ├─ id2
   │  └─ cte1
   └─ cte2</code></pre>
<ul>
<li><b>INORDER</b> = <code>id1 := id2 * cte1 + cte2</code> -> <b>el programa original</b>.</li>
<li><b>POSTORDER</b> = <code>id1 id2 cte1 * cte2 + :=</code> -> <b>la polaca inversa</b>.</li>
</ul>

<div class="callout tgt"><span class="lab">🎯 memorizá esta dupla</span>
<b>INORDER del árbol = programa original. POSTORDER del árbol = polaca inversa.</b> Es pregunta directa de parcial. La razón conceptual: el inorder pone el operador <b>entre</b> los operandos (infija, como escribís el programa), y el postorder lo pone <b>después</b> (postfija). Y ojo: esta polaca que sale del postorder —<code>id1 id2 cte1 * cte2 + :=</code>, con el destino <code>id1</code> al principio— es la <b>polaca formal</b>; hay otra versión (informal) que vemos en 9.4.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>La <b>polaca inversa</b> (postfija) pone el operador <b>después</b> de los operandos y <b>no necesita paréntesis</b>.</li>
<li>Se <b>evalúa</b> recorriendo hasta el primer operador y tomando los dos operandos a su izquierda.</li>
<li>🎯 <b>INORDER del árbol = programa original</b>; <b>POSTORDER = polaca inversa</b>.</li>
<li>PREORDER = forma prefija (operador antes). Por eso el postorden es el que evalúa los <b>atributos sintetizados</b>.</li>
</ul>`,
    qa:[
      {q:"¿Qué es la notación postfija (polaca inversa) y por qué no necesita paréntesis?",
       a:`<p>Es una forma de escribir expresiones donde el <b>operador va después de sus operandos</b>: <code>9 5 -</code> significa <code>9 - 5</code>. Se define inductivamente: una variable o constante es ella misma; <code>E1 op E2</code> se escribe <code>E1' E2' op</code>; y los paréntesis se descartan. <b>No necesita paréntesis</b> porque la <b>posición</b> de cada operando y la <b>aridad</b> de cada operador (cuántos operandos toma) permiten decodificar la expresión de una sola manera: al recorrer de izquierda a derecha, el primer operador que aparece se aplica a los dos elementos inmediatamente a su izquierda, sin ninguna ambigüedad. Por eso las calculadoras HP y la máquina virtual de Java usan esta notación.</p>`},
      {q:"Con el árbol de id1 := id2 * cte1 + cte2, ¿qué recorrido da el programa original y cuál la polaca inversa?",
       a:`<p>El recorrido <b>INORDER</b> (hijo izquierdo, padre, hijo derecho) da el <b>programa original</b>: <code>id1 := id2 * cte1 + cte2</code>, porque pone cada operador <b>entre</b> sus operandos, que es la notación infija con la que escribimos. El recorrido <b>POSTORDER</b> (hijo izquierdo, hijo derecho, padre) da la <b>polaca inversa</b>: <code>id1 id2 cte1 * cte2 + :=</code>, porque pone cada operador <b>después</b> de sus operandos. Es un resultado que la cátedra pregunta tal cual: INORDER = original, POSTORDER = polaca. La polaca que sale así, con el destino <code>id1</code> al principio, es la llamada polaca <b>formal</b>.</p>`},
      {q:"Evaluá a mano la polaca 9 5 - 2 +.",
       a:`<p>Se recorre de izquierda a derecha hasta el <b>primer operador</b> y se aplica a los <b>dos elementos a su izquierda</b>. Paso 1: el primer operador es <code>-</code>; sus operandos son <code>9</code> y <code>5</code>; <code>9 - 5 = 4</code>. Reemplazamos y queda <code>4 2 +</code>. Paso 2: el operador <code>+</code> se aplica a <code>4</code> y <code>2</code>; <code>4 + 2 = 6</code>. Resultado: <b>6</b>. Fijate que corresponde a <code>(9 - 5) + 2</code>, y en ningún momento hicieron falta paréntesis: el orden de los símbolos ya codifica el agrupamiento.</p>`},
      {q:"¿Por qué el recorrido postorden es el que sirve para evaluar atributos sintetizados?",
       a:`<p>Porque un atributo <b>sintetizado</b> se calcula en un nodo a partir de los atributos de sus <b>hijos</b>, así que para poder evaluarlo primero hay que haber evaluado a todos los hijos. El recorrido <b>postorden</b> (hijo izquierdo, hijo derecho, padre) hace exactamente eso: visita completamente a los dos hijos <b>antes</b> de visitar al padre. Cuando llega al padre, ya tiene listos los atributos de abajo y puede sintetizar el suyo. Es el mismo orden en que un parser ascendente <b>reduce</b> las reglas, y por eso la polaca (que es el postorden) y la generación de notación intermedia con atributos sintetizados encajan tan bien con el parsing LR.</p>`}
    ]
  },
  {
    id:"8.6", titulo:"Construir el árbol con acciones: crear_nodo / crear_hoja", aho:"§5.3.1 + §2.8.2 · p.318", badges:["🎯"], estado:"dictada",
    html:`
<p>Una de las tres notaciones intermedias es el <b>árbol sintáctico</b>. Para armarlo mientras parseás, usás <b>dos rutinas constructoras</b> que devuelven un puntero al nodo recién creado:</p>
<ul>
<li><b>crear_hoja(op, val)</b>: crea una <b>hoja</b> (un <code>id</code> o una <code>cte</code>). Guarda el valor léxico (el número de la constante, o el puntero a la tabla de símbolos del identificador).</li>
<li><b>crear_nodo(op, izq, der)</b>: crea un <b>nodo interior</b> (un operador). Recibe los punteros a los dos hijos y los cuelga del nuevo nodo etiquetado con el operador.</li>
</ul>

<h3>La analogía del móvil de cuna</h3>
<p>Armás un móvil colgante. <b>crear_hoja</b> te da una <b>pieza suelta</b> (una figurita: un <code>id</code>, una <code>cte</code>). <b>crear_nodo</b> toma dos piezas <b>ya colgadas</b> y las cuelga juntas de una barra nueva (el operador). Para no perder de vista de qué pieza te estás agarrando en cada momento, tenés <b>un puntero por cada no terminal</b>: <code>Aptr</code>, <code>Eptr</code>, <code>Tptr</code>, <code>Fptr</code>. Ese puntero es un <b>atributo sintetizado</b> (sube, se calcula al reducir).</p>

<h3>Las acciones, regla por regla</h3>
<p>Con la gramática canónica, colgás una acción de cada regla:</p>
<pre><code>PRODUCCIÓN     ACCIÓN
F -> id        Fptr = crear_hoja(id)
F -> cte       Fptr = crear_hoja(cte)
T -> F         Tptr = Fptr
T -> T * F     Tptr = crear_nodo(*, Tptr, Fptr)
E -> T         Eptr = Tptr
E -> E + T     Eptr = crear_nodo(+, Eptr, Tptr)
A -> id := E   Aptr = crear_nodo(:=, crear_hoja(id), Eptr)</code></pre>
<p>Fijate el detalle: las reglas <b>de copia</b> (<code>T -> F</code>, <code>E -> T</code>) <b>no crean ningún nodo</b>: solo pasan el puntero hacia arriba, porque un factor «es» el término, no agrega estructura. Lo mismo haría <code>F -> ( E )</code>: los paréntesis solo agruparon, ya cumplieron su función, no quedan en el árbol.</p>

<h3>El árbol que queda</h3>
<p>Para el programa <code>id1 := id2 * cte1 + cte2</code>:</p>
<pre><code>:=
├─ id1
└─ +
   ├─ *
   │  ├─ id2
   │  └─ cte1
   └─ cte2</code></pre>
<p>Se arma <b>de modo que se pueda recorrer desde el subárbol de más a la izquierda con dos hojas</b> (acá, <code>* (id2, cte1)</code>). Esto es a propósito: así, cuando después generás Assembler, buscás ese subárbol, lo resolvés en una variable auxiliar, lo reemplazás por la auxiliar y repetís. El árbol nace listo para traducirse.</p>

<div class="callout tgt"><span class="lab">🎯 los errores clásicos de parcial</span>
Dos cosas que se preguntan: (1) es <b>un puntero por cada NO terminal</b> (<code>Aptr</code>, <code>Eptr</code>, <code>Tptr</code>, <code>Fptr</code>), <b>no</b> uno por regla; (2) <b>crear_hoja</b> es para <code>id</code> y <code>cte</code> (las hojas), <b>crear_nodo</b> es para los operadores (los nodos interiores). Y las reglas de copia como <code>E -> T</code> <b>no</b> crean nodo: simplemente <code>Eptr = Tptr</code>. Si en el parcial ponés un <code>crear_nodo</code> en <code>E -> T</code>, metés un nodo de más que no representa ninguna operación.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li><b>crear_hoja(op, val)</b> = hoja (<code>id</code>/<code>cte</code>); <b>crear_nodo(op, izq, der)</b> = nodo interior (operador).</li>
<li>Un <b>puntero por no terminal</b> (<code>Aptr</code>, <code>Eptr</code>, <code>Tptr</code>, <code>Fptr</code>); es un atributo <b>sintetizado</b>, se arma al <b>reducir</b>.</li>
<li>Las reglas de <b>copia</b> (<code>T -> F</code>, <code>E -> T</code>, <code>F -> ( E )</code>) <b>no crean nodo</b>: pasan el puntero para arriba.</li>
<li>🎯 El árbol se arma para recorrerlo <b>desde el subárbol de más a la izquierda con dos hojas</b>, para que el Assembler salga fácil.</li>
</ul>`,
    qa:[
      {q:"¿Qué hacen crear_nodo y crear_hoja, y cuántos punteros hacen falta para armar el árbol?",
       a:`<p><b>crear_hoja(op, val)</b> crea una <b>hoja</b> del árbol: se usa para los terminales <code>id</code> y <code>cte</code>, y guarda el valor léxico (el número de la constante o el puntero a la tabla de símbolos del identificador). <b>crear_nodo(op, izq, der)</b> crea un <b>nodo interior</b>: se usa para los operadores (<code>*</code>, <code>+</code>, <code>:=</code>) y recibe los punteros a los dos hijos, que cuelga del nuevo nodo. Hacen falta <b>un puntero por cada no terminal</b> de la gramática —<code>Aptr</code>, <code>Eptr</code>, <code>Tptr</code>, <code>Fptr</code>—, no uno por regla. Cada puntero es un atributo <b>sintetizado</b>: la acción que lo arma se dispara al <b>reducir</b> por la regla.</p>`},
      {q:"Escribí las acciones semánticas para T -> T * F y para A -> id := E.",
       a:`<p>Para <code>T -> T * F</code>: <code>Tptr = crear_nodo(*, Tptr, Fptr)</code>. Se crea un nodo interior etiquetado con <code>*</code> cuyos hijos son el subárbol del término (<code>Tptr</code>) y el del factor (<code>Fptr</code>), y el resultado queda en <code>Tptr</code>. Para <code>A -> id := E</code>: <code>Aptr = crear_nodo(:=, crear_hoja(id), Eptr)</code>. Se crea el nodo raíz <code>:=</code>, cuyo hijo izquierdo es una <b>hoja nueva</b> para el identificador destino (por eso el <code>crear_hoja(id)</code> anidado) y cuyo hijo derecho es el subárbol de la expresión (<code>Eptr</code>). Ambas acciones sintetizan el puntero del no terminal del encabezado a partir de los punteros de los hijos.</p>`},
      {q:"¿Por qué la regla E -> T no crea ningún nodo?",
       a:`<p>Porque es una regla de <b>copia</b>: no representa ninguna operación, solo dice que una expresión puede ser un término «tal cual». Por eso su acción es simplemente <code>Eptr = Tptr</code>: se pasa el puntero del término hacia arriba, sin construir estructura nueva. Si crearas un nodo ahí, meterías en el árbol un nodo interior que <b>no corresponde a ningún operador</b>, ensuciando el árbol y complicando la generación de Assembler. Lo mismo pasa con <code>T -> F</code> y con <code>F -> ( E )</code>: los paréntesis ya cumplieron su función de agrupar durante el parsing y no necesitan quedar en el árbol sintáctico.</p>`},
      {q:"El puntero que arman las acciones, ¿es un atributo sintetizado o heredado? ¿En qué momento se dispara la acción?",
       a:`<p>Es un atributo <b>sintetizado</b>: el puntero de cada no terminal se calcula a partir de los punteros de sus <b>hijos</b> (por ejemplo, <code>Tptr</code> se arma con <code>Tptr</code> y <code>Fptr</code> de abajo), así que viaja <b>hacia arriba</b> por el árbol. La acción se dispara <b>cuando el parser reduce</b> por esa regla, que es justo el momento en que los hijos ya fueron reconocidos y tienen sus punteros listos. Como el parsing es ascendente y todo es sintetizado, el árbol se va construyendo solo de abajo hacia arriba, en el mismo orden en que el parser reduce (un recorrido postorden), sin necesidad de una pasada extra.</p>`}
    ]
  },
  {
    id:"8.7", titulo:"Comprobación estática (semántica estática)", aho:"§2.8.3 · p.97", badges:["🎯"], estado:"dictada",
    html:`
<p>Mientras arma la notación intermedia, el front-end también <b>revisa que el programa tenga sentido</b>. A eso se le llama <b>comprobación estática</b>: son chequeos de consistencia que hace <b>el compilador, en tiempo de compilación</b>. La palabra clave es <b>estático = lo hace el compilador</b> (su opuesto, <b>dinámico</b>, significa «pasa mientras el programa se ejecuta»). Esto es exactamente lo que la cátedra llama «el análisis semántico es estático e interactúa con la tabla de símbolos».</p>

<h3>La analogía del control de calidad</h3>
<p>Es la inspección en la <b>fábrica, antes</b> de que el producto salga a la calle (compilación), no la garantía que recién se activa cuando el cliente lo usa (ejecución). Todo lo que el compilador puede detectar <b>leyendo</b> el programa, sin correrlo, es estático. Lo que solo se sabe corriéndolo (una división por cero con un divisor que se lee del teclado) es <b>dinámico</b>.</p>

<h3>Qué incluye la comprobación estática</h3>
<ul>
<li><b>Chequeos sintácticos que la gramática no captura</b>: que un identificador esté <b>declarado</b> antes de usarse, que un <code>break</code> esté <b>dentro</b> de un ciclo. Son reglas de forma que no se codifican en la gramática de parsing.</li>
<li><b>Comprobación de tipos</b>: que un operador reciba operandos del tipo correcto, que una asignación sea compatible.</li>
</ul>

<h3>L-value vs R-value</h3>
<p>Hay una diferencia entre el lado izquierdo y el derecho de una asignación:</p>
<ul>
<li>Un <b>r-value</b> es un <b>valor</b> (qué guardar). Es lo que normalmente llamamos «valor».</li>
<li>Un <b>l-value</b> es una <b>ubicación</b> (dónde guardar).</li>
</ul>
<p>La comprobación estática exige que el <b>lado izquierdo</b> de una asignación sea un <b>l-value</b>. Un <code>id</code> o un acceso <code>a[2]</code> tienen l-value (son lugares donde guardar). Pero una <b>constante</b> como <code>2</code> tiene r-value pero <b>no</b> l-value: por eso <code>2 := x</code> es un error estático (no podés «guardar en el 2»).</p>

<h3>Coerción y sobrecarga</h3>
<ul>
<li><b>Coerción</b>: conversión <b>automática</b> de tipo que inserta el compilador. En <code>2 * 3.14</code>, el <code>2</code> entero se convierte a <code>2.0</code> antes de multiplicar. El comprobador de tipos <b>inserta un nodo de conversión</b> en el árbol (un <code>inttofloat</code>) que no estaba en el fuente.</li>
<li><b>Sobrecarga</b>: un mismo símbolo con <b>varios significados</b> según los tipos. El <code>+</code> de Java suma enteros pero concatena cadenas; para saber cuál es, hay que mirar los tipos de los operandos.</li>
</ul>

<div class="callout tgt"><span class="lab">🎯 la pregunta de «¿en qué etapa y momento?»</span>
<b>Estático = en compilación, lo hace el compilador.</b> Por eso <b>variable no declarada</b> e <b>incompatibilidad de tipos</b> se detectan en el <b>análisis semántico / GCI</b>, en <b>tiempo de compilación</b>, consultando la <b>tabla de símbolos</b>. En cambio, una <b>división por cero con divisor variable</b> o una <b>cota superada por un dato leído</b> son <b>dinámicas</b>: solo se saben en <b>ejecución</b>. La herramienta concreta del chequeo de tipos es la <b>tabla de síntesis</b> (operador + dos tipos -> tipo resultante), y el tipo se <b>sintetiza</b> hacia arriba (atributo sintetizado, como en 8.1). La verificación de tipos se coloca en las reglas de <b>expresión y asignación</b>.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li><b>Comprobación estática</b> = la hace el <b>compilador en tiempo de compilación</b> (vs. dinámica = ejecución).</li>
<li>Incluye chequeos sintácticos extra (<b>id declarado</b>, <code>break</code> en ciclo) y <b>de tipos</b>.</li>
<li><b>l-value</b> (ubicación, va a la izquierda) vs <b>r-value</b> (valor, va a la derecha): una constante no puede ir a la izquierda del <code>:=</code>.</li>
<li>🎯 <b>Coerción</b> = conversión automática (inserta un nodo); <b>sobrecarga</b> = símbolo con varios significados. Variable no declarada e incompatibilidad de tipos son estáticas, en compilación.</li>
</ul>`,
    qa:[
      {q:"¿Qué es la comprobación estática y qué significa exactamente «estático»?",
       a:`<p>La <b>comprobación estática</b> es el conjunto de chequeos de consistencia que hace el <b>compilador</b> para asegurar que el programa sea correcto, atrapando errores <b>antes</b> de ejecutarlo. <b>Estático significa «realizado por el compilador», en tiempo de compilación</b>; su opuesto, <b>dinámico</b>, significa «mientras el programa se ejecuta». Incluye chequeos sintácticos que la gramática no captura (que un identificador esté declarado, que un <code>break</code> esté dentro de un ciclo) y la <b>comprobación de tipos</b> (que los operadores reciban operandos compatibles). Es la inspección en la fábrica antes de que el producto salga, no la garantía que se activa cuando el cliente lo usa.</p>`},
      {q:"¿Qué es un l-value y qué es un r-value? ¿Por qué 2 := x es inválido?",
       a:`<p>Un <b>r-value</b> es un <b>valor</b> (lo que normalmente entendemos por «valor»: el resultado que se va a guardar). Un <b>l-value</b> es una <b>ubicación</b>: un lugar donde se puede almacenar algo. En una asignación, el lado <b>derecho</b> aporta un r-value y el lado <b>izquierdo</b> tiene que ser un <b>l-value</b>. Un identificador como <code>x</code> o un acceso <code>a[2]</code> son l-values (son lugares). Una constante como <code>2</code> tiene r-value pero <b>no</b> tiene l-value: no representa ningún lugar de almacenamiento. Por eso <code>2 := x</code> es un <b>error estático</b>: estarías pidiendo «guardar en el número 2», que no es una ubicación. La comprobación estática detecta esto al construir el árbol.</p>`},
      {q:"¿Qué es una coerción y quién la inserta?",
       a:`<p>Una <b>coerción</b> es una <b>conversión de tipo automática</b> que ocurre cuando un operando se transforma al tipo que espera el operador. Por ejemplo, en <code>2 * 3.14</code> el entero <code>2</code> se convierte a <code>2.0</code> para poder multiplicarlo con el número de punto flotante. Quien la inserta es el <b>comprobador de tipos</b> (el análisis semántico), que al detectar la incompatibilidad agrega un <b>nodo de conversión</b> en el árbol sintáctico —un operador como <code>inttofloat</code>— que no estaba en el programa fuente. La definición del lenguaje especifica qué coerciones están permitidas. Es un ejemplo de cómo la comprobación estática no solo detecta errores, sino que también <b>completa</b> el árbol con información de tipos.</p>`},
      {q:"¿En qué etapa y en qué momento se detecta una variable no declarada, y en qué se diferencia de una división por cero con divisor variable?",
       a:`<p>Una <b>variable no declarada</b> se detecta en el <b>análisis semántico / generación de código intermedio</b>, en <b>tiempo de compilación</b>, consultando la <b>tabla de símbolos</b>: si el identificador no está registrado, es un error estático. En cambio, una <b>división por cero con divisor variable</b> es un error <b>dinámico</b>: el compilador no puede saber, leyendo el programa, qué valor va a tener el divisor (podría venir de un dato leído del teclado), así que solo se detecta en <b>tiempo de ejecución</b>. La diferencia es justamente la de estático vs. dinámico: lo que el compilador puede resolver leyendo el código es estático; lo que depende de valores concretos que solo existen al correr es dinámico.</p>`}
    ]
  }
]});

/* =================== MÓDULO 9 =================== */
M.push({
  id:9, titulo:"Código intermedio", parcial:"II",
  resumen:"Las representaciones intermedias: árbol sintáctico vs GDA (subexpresiones comunes) y número de valor, código de tres direcciones, cuádruplos (cuartetos) vs tripletas (tercetos) con su versión optimizada, la polaca inversa formal vs informal en celdas numeradas, un taller con las tres notaciones en paralelo del mismo programa, la traducción incremental de expresiones y el direccionamiento de arreglos.",
  lecciones:[
  {
    id:"9.1", titulo:"Árbol sintáctico vs GDA (DAG); número de valor", aho:"§6.1 · p.358", badges:["📘"], estado:"dictada",
    html:`
<p>📘 <b>de Aho, de profundidad.</b> El árbol sintáctico (8.6) tiene un defecto: si una misma subexpresión aparece dos veces, se <b>dibuja dos veces</b>. El <b>GDA</b> (grafo dirigido acíclico, en inglés <b>DAG</b>) lo arregla: es como el árbol, pero <b>identifica las subexpresiones comunes</b> y las representa <b>una sola vez</b>. Un nodo que representa una subexpresión repetida tiene <b>más de un padre</b> (en vez de duplicarse).</p>

<h3>La analogía de la red vs el organigrama</h3>
<p>El árbol es un <b>organigrama</b>: cada persona tiene un solo jefe, y si dos áreas usan el mismo cálculo, lo repiten cada una por su lado. El GDA es una <b>red</b>: si dos partes necesitan el mismo resultado (por ejemplo <code>b - c</code>), en vez de calcularlo dos veces, <b>ambas apuntan al mismo nodo</b>. Ahorrás trabajo: <code>b - c</code> se calcula una vez sola.</p>

<h3>Ejemplo</h3>
<p>Para <code>a + a * (b - c) + (b - c) * d</code>: la subexpresión <code>b - c</code> aparece dos veces, así que en el GDA es <b>un único nodo con dos padres</b> (los usos en <code>a * (b - c)</code> y en <code>(b - c) * d</code>). El identificador <code>a</code> también tiene dos padres.</p>

<h3>Cómo se construye</h3>
<p>Igual que el árbol (con <code>crear_nodo</code> / <code>crear_hoja</code>), con <b>una diferencia</b>: antes de crear un nodo, la rutina <b>chequea si ya existe uno idéntico</b> (misma etiqueta, mismos hijos). Si existe, <b>devuelve el que ya estaba</b> en vez de crear uno nuevo. Ese chequeo es lo que fusiona las subexpresiones comunes.</p>

<h3>El número de valor</h3>
<p>Los nodos se guardan en un arreglo, y a cada nodo lo referenciás por su <b>índice</b> en ese arreglo: ese índice es el <b>número de valor</b> del nodo. La <b>firma</b> de un nodo interior es la terna <code>(op, izq, der)</code>, donde <code>izq</code> y <code>der</code> son los números de valor de los hijos. El algoritmo para construir el GDA es: dada una firma, <b>buscala</b> en el arreglo; si existe, devolvé su número de valor; si no, creá el nodo y devolvé el nuevo número. (Para que la búsqueda sea rápida se usa una <b>tabla hash</b>.)</p>

<div class="callout aho"><span class="lab">📘 la cátedra usa otra representación (pero conecta)</span>
Aho arma <b>árbol / GDA</b> y luego <b>código de tres direcciones</b>. La <b>cátedra</b> usa como representación intermedia principal la <b>polaca inversa</b> y los <b>tercetos</b> (según el camino asignado a tu grupo), no el código de tres direcciones. Pero el concepto encaja perfecto: el <b>número de valor</b> del GDA es exactamente el <b>[n]</b> de un terceto, y la <b>firma <code>(op, izq, der)</code> es un terceto</b>. Por eso —lo vas a ver en Optimización— la <b>eliminación de redundancias</b> se implementa tan bien sobre tercetos: buscar «dos tercetos con la misma firma» es buscar una subexpresión común, igual que en el GDA.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>El <b>GDA (DAG)</b> es un árbol que <b>comparte las subexpresiones comunes</b>: un nodo repetido tiene <b>varios padres</b>.</li>
<li>Se construye como el árbol, pero <b>reusando</b> un nodo si ya existe uno idéntico.</li>
<li>El <b>número de valor</b> es el índice/posición del nodo; su <b>firma</b> es <code>(op, izq, der)</code>. Se corresponde con el <b>[n]</b> de un terceto.</li>
<li>📘 La cátedra usa <b>polaca/tercetos</b> como RI; Aho usa árbol/GDA/tres direcciones. Un <b>terceto ≡ una firma del GDA</b>.</li>
</ul>`,
    qa:[
      {q:"¿Qué diferencia a un GDA (DAG) de un árbol sintáctico?",
       a:`<p>Un <b>árbol sintáctico</b> representa cada subexpresión de forma independiente: si una subexpresión aparece varias veces en la expresión, se <b>replica</b> tantas veces como aparezca, y cada nodo tiene <b>un solo padre</b>. Un <b>GDA</b> (grafo dirigido acíclico) <b>identifica las subexpresiones comunes</b> y las representa <b>una sola vez</b>: el nodo de una subexpresión repetida tiene <b>más de un padre</b>, uno por cada lugar donde se usa. Por ejemplo, en <code>a + a * (b - c) + (b - c) * d</code>, el nodo de <code>b - c</code> es único y tiene dos padres. La ventaja es doble: la representación es más compacta y le da al compilador una pista para <b>calcular la subexpresión una sola vez</b>, generando código más eficiente.</p>`},
      {q:"¿Cómo se construye un GDA reusando nodos?",
       a:`<p>Se usa el mismo mecanismo que para el árbol (las rutinas <code>crear_nodo</code> y <code>crear_hoja</code>), pero con un chequeo adicional: <b>antes de crear un nodo nuevo, la rutina verifica si ya existe uno idéntico</b> (misma etiqueta de operador y mismos hijos, en el mismo orden). Si ese nodo ya existe, <b>devuelve el que ya estaba</b> en lugar de crear uno duplicado; si no existe, lo crea. Ese simple chequeo hace que todas las apariciones de una misma subexpresión terminen apuntando al <b>mismo nodo</b>, que es lo que convierte el árbol en un GDA. Para que la búsqueda de nodos existentes sea eficiente se guarda todo en una <b>tabla hash</b>.</p>`},
      {q:"¿Qué es el número de valor y con qué elemento de los tercetos se corresponde?",
       a:`<p>El <b>número de valor</b> de un nodo es el <b>índice (o posición)</b> del registro de ese nodo dentro del arreglo donde se guardan todos los nodos del GDA. Sirve para referenciar nodos: la <b>firma</b> de un nodo interior es la terna <code>(op, izq, der)</code>, donde <code>izq</code> y <code>der</code> son los números de valor de los hijos. Se corresponde <b>exactamente</b> con el <b>[n]</b> de un terceto: cuando un terceto referencia a otro escribiendo <code>[11]</code>, ese <code>[11]</code> es un número de valor, y la firma <code>(op, izq, der)</code> es la estructura misma del terceto <code>(operador, arg1, arg2)</code>. Por eso los tercetos y el GDA son representaciones equivalentes para las expresiones.</p>`},
      {q:"¿Por qué el GDA (y su equivalente en tercetos) sirve para eliminar redundancias?",
       a:`<p>Porque un nodo del GDA con <b>más de un padre</b> es, por definición, una <b>subexpresión común</b>: un cálculo que aparece en varios lugares pero se representa una sola vez. Eso es precisamente lo que busca la <b>eliminación de redundancias</b>: detectar que un mismo cálculo se hace más de una vez para hacerlo <b>una sola</b>. Como el terceto es equivalente a la firma <code>(op, izq, der)</code> del GDA, buscar «dos tercetos con la misma firma» equivale a encontrar una subexpresión común. Por eso la cátedra dice que la redundancia se implementa <b>bien sobre tercetos</b> (se da de baja lógica el segundo terceto igual y se redirigen las referencias) y es en cambio difícil sobre polaca o árbol binario.</p>`}
    ]
  },
  {
    id:"9.2", titulo:"Código de tres direcciones", aho:"§6.2.1 · p.364", badges:["📘"], estado:"dictada",
    html:`
<p>📘 <b>de Aho, de profundidad.</b> El <b>código de tres direcciones</b> es la representación intermedia estrella de Aho (y de casi todos los compiladores reales). La idea: cada instrucción tiene <b>a lo sumo un operador</b> y la forma <code>x = y op z</code>. Se llama «tres direcciones» porque hay <b>tres</b>: dos para los operandos (<code>y</code>, <code>z</code>) y una para el resultado (<code>x</code>).</p>

<h3>La analogía del borrador paso a paso</h3>
<p>Es desarmar una cuenta larga en pasos de a uno, como cuando resolvés algo «por partes» en un borrador. La expresión <code>x + y * z</code> no se hace de un saque; primero calculás la multiplicación en un resultado temporal, después la suma:</p>
<pre><code>t1 = y * z
t2 = x + t1</code></pre>
<p>Los <code>t1</code>, <code>t2</code> son <b>nombres temporales</b> que <b>genera el compilador</b> para guardar los resultados intermedios. Cada línea toca un solo operador.</p>

<h3>De qué está hecho</h3>
<p>Una <b>dirección</b> puede ser: un <b>nombre</b> (una variable del programa), una <b>constante</b>, o un <b>temporal</b> generado por el compilador. Las <b>instrucciones</b> típicas: la binaria <code>x = y op z</code>, la unaria <code>x = menos y</code>, la copia <code>x = y</code>, los saltos (<code>if x relop y goto L</code>, <code>goto L</code>) y las de arreglos (<code>x = y[i]</code>, <code>x[i] = y</code>).</p>
<p>Conceptualmente, el código de tres direcciones es una <b>linealización</b> del árbol o del GDA: cada nodo interior del grafo se convierte en una instrucción con un <b>nombre explícito</b> (el temporal).</p>

<div class="callout aho"><span class="lab">📘 esta NO es la notación de la cátedra (pero es prima de los tercetos)</span>
El código de tres direcciones es la RI de <b>Aho</b> y la base de las representaciones intermedias modernas (como el IR de LLVM). La <b>cátedra no lo usa</b> como notación principal: usa <b>polaca inversa</b>, <b>tercetos</b> o <b>árbol</b>, según el camino asignado. Pero es la <b>prima hermana de los tercetos</b>: la instrucción <code>t1 = y * z</code> es casi idéntica al terceto <code>(*, y, z)</code>. La única diferencia es cómo se referencia el resultado: el código de tres direcciones le pone un <b>nombre</b> (<code>t1</code>) y el terceto lo referencia por su <b>posición</b> <code>[11]</code>.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li><b>Tres direcciones</b>: a lo sumo <b>un operador por línea</b>, forma <code>x = y op z</code>; usa <b>temporales</b> <code>t1</code>, <code>t2</code>.</li>
<li>Desarma las expresiones largas (<code>x + y * z</code> -> <code>t1 = y * z ; t2 = x + t1</code>).</li>
<li>Es una <b>linealización</b> del árbol / GDA: cada nodo interior pasa a ser una instrucción con nombre.</li>
<li>📘 Es la RI de <b>Aho</b>; la cátedra usa <b>polaca/tercetos</b>. Un temporal <code>t1</code> ≈ un terceto referenciado por <code>[n]</code>.</li>
</ul>`,
    qa:[
      {q:"¿Qué es el código de tres direcciones y de dónde viene el nombre?",
       a:`<p>Es una representación intermedia formada por una secuencia de instrucciones simples, cada una con <b>a lo sumo un operador</b> y la forma general <code>x = y op z</code>. El nombre viene de que cada instrucción maneja <b>tres direcciones</b>: dos para los <b>operandos</b> (<code>y</code> y <code>z</code>) y una para el <b>resultado</b> (<code>x</code>). Su característica central es que <b>no</b> permite expresiones aritméticas acumuladas: una cuenta con varios operadores se descompone en varias instrucciones, usando <b>nombres temporales</b> generados por el compilador para los resultados intermedios. Esa forma «desenmarañada» es cómoda para optimizar y generar código destino.</p>`},
      {q:"Traducí x + y * z a código de tres direcciones.",
       a:`<p>Como el código de tres direcciones admite un solo operador por instrucción, hay que respetar la precedencia (primero el <code>*</code>, después el <code>+</code>) y usar un temporal para el resultado intermedio: <code>t1 = y * z</code> y luego <code>t2 = x + t1</code>. El resultado final queda en <code>t2</code>. Los nombres <code>t1</code> y <code>t2</code> son <b>temporales</b> que genera el compilador. Fijate que esto es la linealización del árbol de la expresión: primero se resuelve el subárbol de la multiplicación (el más profundo a la izquierda) y su resultado alimenta la suma, igual que se recorre un árbol para generar código.</p>`},
      {q:"¿Por qué se dice que el código de tres direcciones es una «representación lineal» del árbol o del GDA?",
       a:`<p>Porque es la <b>misma información del árbol/GDA pero escrita como una secuencia de instrucciones</b>, sin estructura jerárquica explícita. Cada <b>nodo interior</b> del grafo (cada operador) se convierte en <b>una instrucción</b>, y el resultado de ese nodo recibe un <b>nombre explícito</b> (un temporal) que las instrucciones siguientes usan como operando. Así, la anidación del árbol —qué se calcula antes de qué— queda codificada en el <b>orden</b> de las instrucciones y en el uso de los temporales, en lugar de en la forma de un grafo. Recorrer el árbol en postorden y emitir una instrucción por nodo interior produce justamente esta representación lineal.</p>`},
      {q:"¿En qué se parece y en qué se diferencia el código de tres direcciones de los tercetos de la cátedra?",
       a:`<p><b>Se parecen</b> en que ambos descomponen las expresiones en operaciones con un solo operador: la instrucción de tres direcciones <code>t1 = y * z</code> y el terceto <code>(*, y, z)</code> representan la misma operación. <b>Se diferencian</b> en cómo referencian el resultado: el código de tres direcciones le da un <b>nombre</b> al resultado (el temporal <code>t1</code>) que aparece explícito, mientras que el terceto <b>no nombra</b> el resultado, sino que lo referencia por su <b>posición</b> (por ejemplo <code>[11]</code>). Además, el código de tres direcciones es la representación de <b>Aho</b>, mientras que los tercetos son una de las notaciones que usa la <b>cátedra</b>. En el fondo, un terceto es un código de tres direcciones en el que el «nombre» del resultado es su número de posición.</p>`}
    ]
  },
  {
    id:"9.3", titulo:"Cuádruplos (cuartetos) vs tripletas (tercetos)", aho:"§6.2.2–6.2.3 · p.366", badges:["🎯"], estado:"dictada",
    html:`
<p>Una vez que decidís representar el programa con instrucciones de un operador, falta decidir <b>cómo las guardás</b> en memoria. Hay dos formas clásicas, y la cátedra las llama <b>cuartetos</b> y <b>tercetos</b>:</p>
<ul>
<li><b>Cuádruplo (cuarteto)</b>: <b>cuatro</b> campos <code>(op, arg1, arg2, resultado)</code>. La instrucción <code>x = y + z</code> se guarda como <code>(+, y, z, x)</code>. El resultado tiene un <b>nombre explícito</b> (un temporal).</li>
<li><b>Tripleta (terceto)</b>: <b>tres</b> campos <code>(op, arg1, arg2)</code>. <b>No</b> hay campo resultado: el resultado se referencia por la <b>posición</b> del terceto (su número <code>[n]</code>).</li>
</ul>

<h3>La analogía de la factura</h3>
<p>El cuarteto es una factura que dice «hacé esto y guardá el resultado en la caja <code>t1</code>»: nombra la caja. El terceto no nombra ninguna caja: dice «el resultado de esto <b>es la fila [11]</b>, y quien lo necesite que apunte a [11]». El terceto ahorra el nombre del temporal, pero <b>se ata a la posición</b>.</p>

<h3>El ejemplo canónico</h3>
<p>Para <code>id1 := id2 * cte1 + cte2</code> (lista de reglas <code>6 5 7 4 3 7 5 2 1</code>), los <b>tercetos sin optimizar</b> (numerados desde la celda 11):</p>
<pre><code>[11]  (id2,  _,    _   )
[12]  (cte1, _,    _   )
[13]  (*,    [11], [12])
[14]  (cte2, _,    _   )
[15]  (+,    [13], [14])
[16]  (:=,   id1,  [15])</code></pre>
<p>Fijate que <code>[11]</code>, <code>[12]</code> y <code>[14]</code> solo <b>cargan un operando</b>: no hacen ninguna operación. Se pueden <b>absorber</b> metiendo el operando directo en el terceto del operador. Los <b>tercetos optimizados</b>:</p>
<pre><code>[11]  (*,  id2,  cte1)
[12]  (+,  [11], cte2)
[13]  (:=, id1,  [12])</code></pre>
<p>De 6 tercetos pasamos a 3, y se <b>renumeran</b> desde [11].</p>

<h3>Cuándo conviene cada uno</h3>
<p>El cuarteto es <b>mejor para un optimizador que mueve instrucciones de lugar</b>: si movés la instrucción que calcula <code>t1</code>, las que usan <code>t1</code> <b>no cambian</b> (siguen nombrando <code>t1</code>). Con los tercetos, al mover una instrucción cambia su <b>posición</b>, y hay que <b>reajustar todas las referencias</b> <code>[n]</code> que apuntaban a ella. La solución de Aho a esto son las <b>tripletas indirectas</b> (una lista de punteros a tercetos: reordenás la lista sin tocar los tercetos).</p>

<div class="callout tgt"><span class="lab">🎯 lo que te toman en el parcial</span>
Te dan un comando, te piden armar los <b>tercetos</b> y después <b>optimizarlos</b>. La optimización <b>elimina los tercetos «de carga»</b> —los que solo tienen un operando, como <code>[11] (id2, _, _)</code>— metiendo el operando <b>directo</b> en el terceto del operador: <code>[11] (*, id2, cte1)</code>. Después se renumera todo desde la primera celda. Ojo: esto es distinto de la <b>redundancia</b> (dos tercetos <b>iguales</b>), que se hace por <b>baja lógica</b> sin correr las celdas.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li><b>Cuádruplo (cuarteto)</b>: <code>(op, arg1, arg2, resultado)</code> — el resultado tiene <b>nombre</b> (temporal).</li>
<li><b>Tripleta (terceto)</b>: <code>(op, arg1, arg2)</code> — el resultado se referencia por <b>posición</b> <code>[n]</code>.</li>
<li>Sin optimizar hay un terceto <b>de carga</b> por cada operando; optimizados, el operando va <b>directo</b> en el terceto del operador.</li>
<li>🎯 Los cuartetos toleran mejor <b>mover instrucciones</b>; los tercetos no (salvo las <b>indirectas</b>).</li>
</ul>`,
    qa:[
      {q:"¿Cuál es la diferencia entre un cuádruplo (cuarteto) y una tripleta (terceto)?",
       a:`<p>Un <b>cuádruplo</b> tiene <b>cuatro campos</b>: <code>(op, arg1, arg2, resultado)</code>. La instrucción <code>x = y + z</code> se guarda como <code>(+, y, z, x)</code>, es decir, el <b>resultado tiene un nombre explícito</b> (un temporal como <code>t1</code>). Una <b>tripleta</b> tiene solo <b>tres campos</b>: <code>(op, arg1, arg2)</code>, <b>sin</b> campo de resultado. En una tripleta, el resultado de una operación se referencia por la <b>posición</b> de esa tripleta en la estructura (su número <code>[n]</code>): cuando otra operación necesita ese resultado, escribe <code>[11]</code> en un argumento. En resumen: el cuarteto nombra el resultado, el terceto lo referencia por posición.</p>`},
      {q:"Armá los tercetos de id1 := id2 * cte1 + cte2 y después optimizalos.",
       a:`<p><b>Sin optimizar</b> (numerando desde [11]): <code>[11] (id2, _, _)</code>, <code>[12] (cte1, _, _)</code>, <code>[13] (*, [11], [12])</code>, <code>[14] (cte2, _, _)</code>, <code>[15] (+, [13], [14])</code>, <code>[16] (:=, id1, [15])</code>. Los tercetos <code>[11]</code>, <code>[12]</code> y <code>[14]</code> solo <b>cargan un operando</b> y no operan nada. <b>Optimizados</b>, se absorben metiendo el operando directo en el terceto del operador, y se renumera desde [11]: <code>[11] (*, id2, cte1)</code>, <code>[12] (+, [11], cte2)</code>, <code>[13] (:=, id1, [12])</code>. Pasamos de 6 tercetos a 3.</p>`},
      {q:"¿Por qué los cuádruplos son más cómodos que las tripletas para un optimizador que mueve instrucciones?",
       a:`<p>Porque en un cuádruplo el resultado se identifica por un <b>nombre</b> (el temporal), no por su posición. Si el optimizador <b>mueve</b> de lugar la instrucción que calcula el temporal <code>t</code>, todas las instrucciones que usan <code>t</code> lo <b>siguen nombrando igual</b>: no hace falta tocarlas. En cambio, en las tripletas el resultado se referencia por la <b>posición</b> <code>[n]</code>; al mover una tripleta, su número cambia, y entonces hay que <b>reajustar todas las referencias</b> que apuntaban a esa posición. Aho resuelve esto con las <b>tripletas indirectas</b>: se mantiene una lista de punteros a las tripletas y se reordena esa lista, sin modificar las tripletas ni sus referencias.</p>`},
      {q:"¿Qué terceto se elimina al optimizar y cómo? ¿En qué se diferencia esto de la eliminación de redundancias?",
       a:`<p>Al optimizar se eliminan los tercetos <b>«de carga»</b>: los que tienen la forma <code>[n] (operando, _, _)</code> y no hacen ninguna operación, solo traen un <code>id</code> o una <code>cte</code>. Se los absorbe metiendo ese operando <b>directamente</b> como argumento del terceto del operador que lo usaba: por ejemplo, <code>[11] (id2, _, _)</code> y <code>[12] (cte1, _, _)</code> desaparecen y el <code>*</code> pasa a ser <code>[11] (*, id2, cte1)</code>. Después se <b>renumera</b> todo. Esto es <b>distinto</b> de la <b>eliminación de redundancias</b>, que busca dos tercetos <b>iguales</b> (misma firma) y da de baja el segundo por <b>baja lógica</b> —sin correr las celdas, para no romper referencias— redirigiendo quien lo usaba al primero.</p>`}
    ]
  },
  {
    id:"9.4", titulo:"Polaca inversa: formal vs informal, celdas numeradas", aho:"Apunte", badges:["🎯"], estado:"dictada",
    html:`
<p>La <b>polaca inversa</b> (notación postfija: operador después de los operandos) es una de las tres representaciones intermedias. Ya viste en 8.5 que sale del <b>postorden</b> del árbol. Pero hay un detalle que la cátedra remarca: existen <b>dos versiones</b> de la asignación, según de dónde la derives, y ambas son válidas.</p>

<h3>Formal vs informal</h3>
<p>Para el programa <code>id1 := id2 * cte1 + cte2</code>:</p>
<ul>
<li><b>Formal</b> (derivada del <b>árbol</b>, por postorden): <code>id1 id2 cte1 * cte2 + :=</code>. El destino <code>id1</code> queda <b>al principio</b>.</li>
<li><b>Informal</b> (derivada de la <b>lista de reglas</b>): <code>id2 cte1 * cte2 + id1 :=</code>. El destino <code>id1</code> queda <b>justo antes del <code>:=</code></b>, y esto <b>facilita el pasaje a Assembler</b>.</li>
</ul>

<h3>La analogía de los dos dialectos</h3>
<p>Es la misma frase dicha de dos maneras. La <b>formal</b> es la que sale «naturalmente» de leer el árbol en postorden: el <code>:=</code> queda último y el destino viaja adelante. La <b>informal</b> reordena para que, cuando barrés la polaca <b>apilando operandos</b>, el destino aparezca <b>justo cuando lo necesitás</b> para hacer la asignación. Es como acomodar los ingredientes en el orden en que los vas a usar en la receta.</p>

<h3>Celdas numeradas</h3>
<p>La polaca se escribe en <b>celdas consecutivas</b> (11, 12, 13, ...). Esto es fundamental para las <b>sentencias de control</b>: los <b>saltos</b> (los <code>BF</code>, <code>BI</code>, etc. de un <code>if</code> o un <code>while</code>) apuntan a <b>números de celda</b>. Por eso, cuando después optimizás, <b>no podés borrar celdas</b>: se harían un <b>baja lógica</b> (marcar la celda como muerta sin sacarla), porque si corrés las celdas para atrás, <b>rompés todas las referencias de los saltos</b>.</p>

<h3>Cómo se evalúa</h3>
<p>Se recorre de izquierda a derecha <b>apilando operandos</b>; al encontrar un <b>operador binario</b>, se <b>desapilan 2</b>, se opera y se <b>apila el resultado</b>. Un operador unario desapila 1. Es el mismo mecanismo que después usás para generar Assembler desde la polaca.</p>

<div class="callout tgt"><span class="lab">🎯 la dupla formal / informal</span>
<b>Formal</b> = destino al principio (sale del árbol / postorden). <b>Informal</b> = destino antes del <code>:=</code> (sale de la lista de reglas), y es la que <b>facilita el Assembler</b>. Las dos son válidas; si el parcial no aclara cuál, se suele usar la <b>informal</b>. Y recordá: la polaca va en <b>celdas numeradas</b> porque los <b>saltos</b> referencian celdas, así que al optimizar <b>no se borran celdas</b> (baja lógica).</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>La polaca inversa como RI va en <b>celdas numeradas</b> (los saltos apuntan a números de celda).</li>
<li><b>Formal</b> (del árbol, postorden): destino <b>al principio</b> — <code>id1 id2 cte1 * cte2 + :=</code>.</li>
<li><b>Informal</b> (de la lista de reglas): destino <b>antes del <code>:=</code></b> — <code>id2 cte1 * cte2 + id1 :=</code>; facilita el Assembler.</li>
<li>🎯 Al optimizar <b>no se borran celdas</b> (baja lógica) para no romper los saltos.</li>
</ul>`,
    qa:[
      {q:"¿Cuál es la diferencia entre la polaca formal y la informal, y cuál facilita el pasaje a Assembler?",
       a:`<p>Ambas son polaca inversa del mismo programa, pero se derivan de fuentes distintas y ubican el destino en lugares distintos. La <b>formal</b> se deriva del <b>árbol sintáctico</b> leído en <b>postorden</b>: para <code>id1 := id2 * cte1 + cte2</code> da <code>id1 id2 cte1 * cte2 + :=</code>, con el destino <code>id1</code> <b>al principio</b>. La <b>informal</b> se deriva de la <b>lista de reglas</b>: da <code>id2 cte1 * cte2 + id1 :=</code>, con el destino <code>id1</code> <b>justo antes del <code>:=</code></b>. La que <b>facilita el pasaje a Assembler</b> es la <b>informal</b>, porque cuando recorrés la polaca apilando operandos, el destino aparece justo en el momento en que hace falta para resolver la asignación. Las dos son válidas.</p>`},
      {q:"¿Por qué la polaca inversa se escribe en celdas numeradas?",
       a:`<p>Porque las <b>sentencias de control</b> (<code>if</code>, <code>if-else</code>, <code>while</code>) se traducen con <b>saltos</b>, y esos saltos necesitan indicar <b>a qué instrucción saltar</b>. La forma de referenciar el destino de un salto es por el <b>número de celda</b>: por ejemplo, «si la condición es falsa, saltá a la celda 29». Por eso la polaca se dispone en celdas consecutivas numeradas (11, 12, 13, ...): los saltos apuntan a esos números. Una consecuencia importante es que, al <b>optimizar</b>, no se pueden <b>borrar</b> celdas y correr las demás para atrás, porque eso <b>rompería las referencias</b> de todos los saltos; en su lugar se hace una <b>baja lógica</b> (se marca la celda como muerta sin quitarla).</p>`},
      {q:"Escribí la polaca inversa (informal) de id1 := id2 * cte1 + cte2 y explicá el orden.",
       a:`<p>La polaca informal es: <code>id2 cte1 * cte2 + id1 :=</code>. El orden se entiende pensando en cómo se evalúa apilando: primero van los dos operandos de la multiplicación (<code>id2 cte1</code>) seguidos del <code>*</code>, que los combina; después el operando <code>cte2</code> y el <code>+</code>, que suma el resultado anterior con <code>cte2</code>; y al final el destino <code>id1</code> seguido del <code>:=</code>, que asigna el resultado de toda la expresión al identificador. El destino <code>id1</code> aparece <b>justo antes del <code>:=</code></b> (esa es la marca de la versión informal), lo que hace directo el pasaje a Assembler: cuando llegás al <code>:=</code>, ya tenés el valor calculado y el lugar donde guardarlo.</p>`},
      {q:"¿Por qué al optimizar una polaca no se pueden borrar celdas?",
       a:`<p>Porque las celdas están <b>numeradas</b> y los <b>saltos</b> de las sentencias de control apuntan a esos números de celda. Si al optimizar borraras una celda y corrieras todas las siguientes una posición hacia atrás, <b>todos los números de celda cambiarían</b>, y los saltos que apuntaban, por ejemplo, a la celda 29 ahora estarían apuntando a la instrucción equivocada: se rompería el flujo de control del programa. Por eso, en polaca, la optimización se hace por <b>baja lógica</b>: la celda «eliminada» se marca como muerta pero <b>no se saca</b> de su posición, de modo que las celdas siguientes conservan su número y las referencias de los saltos siguen siendo válidas.</p>`}
    ]
  },
  {
    id:"9.5", titulo:"Taller: lista de reglas → las tres notaciones en paralelo", aho:"Prácticas 3–4", badges:["⚙️","🎯"], estado:"dictada",
    html:`
<p>⚙️ <b>Taller.</b> Juntemos todo el módulo en un solo ejercicio: partir de <b>una</b> lista de reglas y generar las <b>tres</b> notaciones intermedias en paralelo. Vas a ver que las tres salen del <b>mismo</b> recorrido de reducciones; lo único que cambia es <b>qué rutina llamás</b> en cada reducción.</p>

<h3>El punto de partida</h3>
<pre><code>1. A -> id := E      4. T -> T * F      6. F -> id
2. E -> E + T        5. T -> F          7. F -> cte
3. E -> T

Programa:  id1 := id2 * cte1 + cte2
Lista de reglas:  6 5 7 4 3 7 5 2 1</code></pre>

<h3>La analogía de la misma melodía en tres instrumentos</h3>
<p>La partitura (la lista de reglas) es una sola. Según el instrumento que elijas —<b>árbol</b>, <b>polaca</b> o <b>tercetos</b>— suena distinto, pero dice lo mismo. Y podés pasar de un instrumento a otro. En cada reducción disparás una acción distinta según la notación: <code>crear_nodo</code>/<code>crear_hoja</code> para el árbol, <code>insertar_en_polaca</code> para la polaca, <code>crear_terceto</code> para los tercetos.</p>

<h3>La resolución, reducción por reducción</h3>
<table>
<tr><th>#</th><th>Regla</th><th>Árbol (punteros)</th><th>Polaca inserta</th><th>Terceto</th></tr>
<tr><td>1</td><td>6: F -> id</td><td>Fptr = crear_hoja(id2)</td><td>id2</td><td>[11] (id2, _, _)</td></tr>
<tr><td>2</td><td>5: T -> F</td><td>Tptr = Fptr</td><td>—</td><td>Tind = [11]</td></tr>
<tr><td>3</td><td>7: F -> cte</td><td>Fptr = crear_hoja(cte1)</td><td>cte1</td><td>[12] (cte1, _, _)</td></tr>
<tr><td>4</td><td>4: T -> T * F</td><td>Tptr = crear_nodo(*, Tptr, Fptr)</td><td>*</td><td>[13] (*, [11], [12])</td></tr>
<tr><td>5</td><td>3: E -> T</td><td>Eptr = Tptr</td><td>—</td><td>Eind = [13]</td></tr>
<tr><td>6</td><td>7: F -> cte</td><td>Fptr = crear_hoja(cte2)</td><td>cte2</td><td>[14] (cte2, _, _)</td></tr>
<tr><td>7</td><td>5: T -> F</td><td>Tptr = Fptr</td><td>—</td><td>Tind = [14]</td></tr>
<tr><td>8</td><td>2: E -> E + T</td><td>Eptr = crear_nodo(+, Eptr, Tptr)</td><td>+</td><td>[15] (+, [13], [14])</td></tr>
<tr><td>9</td><td>1: A -> id := E</td><td>Aptr = crear_nodo(:=, hoja(id1), Eptr)</td><td>id1 :=</td><td>[16] (:=, id1, [15])</td></tr>
</table>

<h3>Los tres resultados</h3>
<pre><code>ÁRBOL                    POLACA (informal)              TERCETOS
:=                       id2 cte1 * cte2 + id1 :=       [11] (id2,  _,    _   )
├─ id1                                                  [12] (cte1, _,    _   )
└─ +                     POLACA (formal)                [13] (*,    [11], [12])
   ├─ *                  id1 id2 cte1 * cte2 + :=        [14] (cte2, _,    _   )
   │  ├─ id2                                             [15] (+,    [13], [14])
   │  └─ cte1                                            [16] (:=,   id1,  [15])
   └─ cte2</code></pre>
<p>Las tres describen el mismo cálculo. Fijate: la <b>polaca formal</b> es el <b>postorden</b> del árbol; los <b>tercetos</b> son las firmas de los nodos del árbol numeradas. Todo sale de la misma lista de reglas.</p>

<div class="callout tgt"><span class="lab">🎯 lo que te van a pedir</span>
En el parcial te dan un <b>comando</b> (con su gramática) y te piden generar <b>la notación asignada a tu grupo</b>, más las <b>acciones semánticas</b> que la generan. Pero también te pueden pedir <b>convertir</b> entre notaciones o decir <b>dónde conviene optimizar</b>: la <b>redundancia</b> se hace bien en <b>tercetos</b>; la <b>reducción simple</b> conviene <b>a la entrada</b> (dentro de la acción semántica, antes de escribir en la notación). Por eso conviene dominar las tres aunque uses una sola.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Las <b>tres notaciones salen de la misma lista de reglas</b>: cambia solo qué rutina disparás en cada reducción.</li>
<li><b>Árbol</b>: <code>crear_nodo</code>/<code>crear_hoja</code> + punteros. <b>Polaca</b>: <code>insertar_en_polaca</code>. <b>Tercetos</b>: <code>crear_terceto</code> + variables índice.</li>
<li>La <b>polaca formal</b> es el <b>postorden</b> del árbol; los <b>tercetos</b> son las firmas de los nodos numeradas.</li>
<li>🎯 Dominá las tres: el parcial pide convertir entre ellas y comparar dónde conviene optimizar.</li>
</ul>`,
    qa:[
      {q:"Las tres notaciones intermedias salen de la misma lista de reglas. ¿Qué es lo único que cambia entre generar una u otra?",
       a:`<p>Lo único que cambia es <b>qué acción semántica (qué rutina) disparás en cada reducción</b> y qué estructura auxiliar usás para guardar el resultado. El <b>recorrido de reducciones es el mismo</b> para las tres (la lista de reglas <code>6 5 7 4 3 7 5 2 1</code>). Para el <b>árbol</b> llamás a <code>crear_nodo</code> / <code>crear_hoja</code> y guardás <b>punteros</b> por no terminal; para la <b>polaca</b> llamás a <code>insertar_en_polaca</code> y vas escribiendo tokens en <b>celdas</b>; para los <b>tercetos</b> llamás a <code>crear_terceto</code> y guardás <b>variables índice</b>. La estructura del cálculo (qué se opera con qué y en qué orden) es idéntica; solo cambia el «instrumento» con que la anotás.</p>`},
      {q:"Convertí el árbol de id1 := id2 * cte1 + cte2 a polaca. ¿Qué versión obtenés?",
       a:`<p>Recorriendo el árbol en <b>postorden</b> (hijo izquierdo, hijo derecho, padre) obtenés <code>id1 id2 cte1 * cte2 + :=</code>, que es la <b>polaca formal</b> (el destino <code>id1</code> queda <b>al principio</b>). Se ve claro sobre el árbol: bajás al hijo izquierdo del <code>:=</code> (<code>id1</code>), después al derecho (el subárbol del <code>+</code>, cuyo postorden es <code>id2 cte1 * cte2 +</code>) y por último el padre <code>:=</code>. Si en cambio querés la polaca <b>informal</b> —la que facilita el Assembler—, reordenás para que el destino quede antes del <code>:=</code>: <code>id2 cte1 * cte2 + id1 :=</code>. Ambas son válidas; la formal es literalmente el postorden.</p>`},
      {q:"En este taller, ¿en qué reducciones NO se crea nodo ni se inserta nada, y por qué?",
       a:`<p>En las reducciones por las reglas de <b>copia</b>: <code>5: T -> F</code> (pasos 2 y 7) y <code>3: E -> T</code> (paso 5). En esas reducciones no se crea ningún nodo del árbol ni se inserta ningún token en la polaca: solo se <b>propaga el puntero/índice</b> hacia arriba (<code>Tptr = Fptr</code>, <code>Eptr = Tptr</code>; o <code>Tind = Find</code>, <code>Eind = Tind</code>). La razón es que esas reglas <b>no representan ninguna operación</b>: un factor «es» un término y un término «es» una expresión, sin agregar ningún operador. Solo las reglas con operador (<code>*</code>, <code>+</code>, <code>:=</code>) y las hojas (<code>id</code>, <code>cte</code>) generan algo concreto en cada notación.</p>`},
      {q:"Si te dan un comando nuevo en el parcial, ¿cómo generás la notación intermedia asignada?",
       a:`<p>Se sigue el mismo procedimiento del taller: (1) escribís la <b>gramática</b> del comando y obtenés la <b>lista de reglas</b> del programa de ejemplo (el orden de reducciones del parsing ascendente); (2) a cada regla le <b>colgás una acción semántica</b> según la notación asignada —<code>crear_nodo</code>/<code>crear_hoja</code> para árbol, <code>insertar_en_polaca</code> para polaca, <code>crear_terceto</code> para tercetos—, recordando que las reglas de <b>copia no generan nada</b> y las de operador sí; (3) recorrés la lista de reglas disparando cada acción al <b>reducir</b>, y vas armando la estructura (punteros, celdas o índices). El resultado es la notación pedida. Si además te piden optimizar o convertir a otra notación, aplicás lo de 9.3/9.4.</p>`}
    ]
  },
  {
    id:"9.6", titulo:"Traducción incremental de expresiones", aho:"§6.4.1–6.4.2 · p.378", badges:["🎯"], estado:"dictada",
    html:`
<p>Veamos cómo Aho traduce una asignación a código intermedio con una DDS, porque es <b>lo mismo</b> que hacen tus acciones semánticas. Se usan dos atributos sobre cada expresión <code>E</code>:</p>
<ul>
<li><b>E.dir</b>: la <b>dirección donde queda el valor</b> de <code>E</code>. Puede ser un nombre de variable, una constante o un <b>temporal</b> generado por el compilador.</li>
<li><b>E.codigo</b>: el <b>código</b> de tres direcciones que calcula <code>E</code>.</li>
</ul>

<h3>Las reglas</h3>
<pre><code>PRODUCCIÓN       REGLA SEMÁNTICA
S -> id = E      gen( tope.get(id.lexema) = E.dir )
E -> E1 + E2     E.dir = new Temp();  gen( E.dir = E1.dir + E2.dir )
E -> menos E1    E.dir = new Temp();  gen( E.dir = menos E1.dir )
E -> ( E1 )      E.dir = E1.dir
E -> id          E.dir = tope.get(id.lexema)</code></pre>
<p>Leelo así: cuando <code>E</code> es un solo <code>id</code>, su valor <b>ya está</b> en esa variable, así que <code>E.dir</code> apunta a la entrada de la tabla de símbolos (no genera código). Cuando <code>E</code> es <code>E1 + E2</code>, se crea un <b>temporal nuevo</b> con <code>new Temp()</code> y se <b>emite</b> la instrucción <code>E.dir = E1.dir + E2.dir</code>.</p>

<h3>La analogía de escribir directo en limpio</h3>
<p><b>Traducción incremental</b> significa que <code>gen</code> <b>emite cada instrucción al toque</b>, en el momento en que se genera, en lugar de acumular una cadena gigante en <code>E.codigo</code> y recién imprimirla al final. Es la diferencia entre escribir toda la carta en un borrador y pasarla en limpio después (acumular <code>E.codigo</code>) vs. <b>escribir directo en la hoja final</b>, línea por línea (incremental). Es más eficiente: no cargás cadenas enormes en los atributos.</p>

<h3>Por qué te importa</h3>
<p>Esto es <b>exactamente</b> lo que hacés en el TP: <code>crear_terceto</code> o <code>insertar_en_polaca</code> <b>emiten</b> su terceto o su celda <b>directo</b> en la estructura, cada vez que reducís, sin acumular nada. Y <code>new Temp()</code> es el <b>temporal</b> —la <code>@aux</code> del Assembler, o el número de terceto <code>[n]</code>—. Además, el mismo esquema, con un pequeño cambio, <b>arma el árbol</b>: si en vez de <code>gen</code> ponés <code>E.dir = new Nodo(+, E1.dir, E2.dir)</code>, el atributo <code>dir</code> pasa a ser un <b>puntero a nodo</b> (esto es 8.6).</p>

<div class="callout tgt"><span class="lab">🎯 incremental = emitir al reducir, sin acumular</span>
<b>Traducción incremental</b> = cada acción semántica <b>escribe su instrucción directo</b> en la notación intermedia al momento de reducir, sin guardar una cadena <code>E.codigo</code> gigante. Es lo que hacen <code>crear_terceto</code> e <code>insertar_en_polaca</code>. <code>new Temp()</code> genera el temporal <code>t1</code>, <code>t2</code>, ... que en el Assembler es la variable auxiliar <code>@aux1</code>, y en tercetos es el número de celda <code>[n]</code>. Es el mismo mecanismo de atributos sintetizados que venís usando en todo el Parcial II.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li><b>E.dir</b> = dónde queda el valor de <code>E</code> (nombre, constante o temporal); <b>E.codigo</b> = el código que lo calcula.</li>
<li><code>E -> E1 + E2</code>: crea un <b>temporal</b> (<code>new Temp()</code>) y emite <code>E.dir = E1.dir + E2.dir</code>.</li>
<li><b>Incremental</b> = <code>gen</code> emite cada instrucción <b>al toque</b>, sin acumular <code>E.codigo</code>.</li>
<li>🎯 Es lo que hacen <code>crear_terceto</code> / <code>insertar_en_polaca</code> en el TP; <code>new Temp()</code> es el temporal / la <code>@aux</code> / el <code>[n]</code>.</li>
</ul>`,
    qa:[
      {q:"¿Qué representan los atributos E.dir y E.codigo en la traducción de expresiones?",
       a:`<p><b>E.dir</b> es la <b>dirección donde va a quedar el valor</b> de la expresión <code>E</code> una vez calculada: puede ser el nombre de una variable del programa, una constante, o un <b>temporal</b> generado por el compilador. <b>E.codigo</b> es la <b>secuencia de instrucciones</b> de tres direcciones necesaria para calcular ese valor. Por ejemplo, cuando <code>E</code> es un simple <code>id</code>, el valor ya está en esa variable, así que <code>E.dir</code> apunta a su entrada en la tabla de símbolos y <code>E.codigo</code> queda vacío. Cuando <code>E</code> es <code>E1 + E2</code>, <code>E.dir</code> es un temporal nuevo y <code>E.codigo</code> es el código de <code>E1</code>, el de <code>E2</code> y la instrucción que los suma. Ambos son atributos sintetizados.</p>`},
      {q:"¿Qué es la traducción incremental y qué ventaja tiene sobre acumular E.codigo?",
       a:`<p>La <b>traducción incremental</b> consiste en que la función <code>gen</code> <b>emite cada instrucción en el momento en que se genera</b>, agregándola directamente a la secuencia de código que se está produciendo, en lugar de ir armando una cadena de texto gigante en el atributo <code>E.codigo</code> para imprimirla toda al final. La ventaja es de <b>eficiencia</b>: los atributos de código pueden ser cadenas muy largas, y acumularlas y concatenarlas una y otra vez es costoso; emitiendo al toque, el atributo <code>codigo</code> ni siquiera hace falta, porque hay una sola secuencia de salida que va creciendo. Es la diferencia entre pasar todo en limpio al final y escribir directo en la hoja definitiva, línea por línea.</p>`},
      {q:"¿Cómo se genera un temporal en estas reglas y con qué se corresponde en el TP de la cátedra?",
       a:`<p>Se genera con <code>new Temp()</code>, que produce un <b>nombre temporal nuevo</b> y distinto cada vez que se llama (<code>t1</code>, <code>t2</code>, ...), para guardar el resultado de una operación intermedia. En el TP de la cátedra ese temporal se corresponde con: la <b>variable auxiliar <code>@aux</code></b> del código Assembler (por ejemplo <code>@aux1</code>), que guarda el resultado de cada operación; y, en la notación de <b>tercetos</b>, con el <b>número de celda <code>[n]</code></b> que identifica el resultado de un terceto. En todos los casos es lo mismo: un nombre fresco para el valor intermedio que después usan las instrucciones siguientes.</p>`},
      {q:"El mismo esquema de traducción sirve para construir el árbol sintáctico. ¿Cómo?",
       a:`<p>Cambiando qué hace la acción con el atributo <code>dir</code>. En la versión que genera código de tres direcciones, la regla <code>E -> E1 + E2</code> crea un temporal y emite la instrucción <code>E.dir = E1.dir + E2.dir</code>. Para construir el <b>árbol</b> en su lugar, se reemplaza esa acción por <code>E.dir = new Nodo(+, E1.dir, E2.dir)</code>: ahora <code>dir</code> no es la dirección de un valor sino un <b>puntero al nodo</b> del árbol, y en vez de emitir una instrucción se crea un nodo interior con los dos subárboles como hijos. Es exactamente el <code>crear_nodo</code> de la lección 8.6. Esto muestra que las tres notaciones comparten el mismo esqueleto de acciones sintetizadas; solo cambia la rutina que se invoca en cada regla.</p>`}
    ]
  },
  {
    id:"9.7", titulo:"Arreglos: direccionamiento y traducción de referencias", aho:"§6.4.3–6.4.4 · p.381", badges:["📘"], estado:"dictada",
    html:`
<p>📘 <b>de Aho, de profundidad.</b> Los arreglos merecen un tratamiento aparte porque <b>una referencia como <code>A[i]</code> no es un solo paso</b>: hay que <b>calcular una dirección</b>. La clave es que los elementos de un arreglo se guardan en <b>ubicaciones consecutivas</b>, así que llegar al elemento <code>i</code> es pura aritmética.</p>

<h3>La analogía de los casilleros</h3>
<p>Un arreglo es una fila de <b>casilleros del mismo tamaño</b>, pegados uno al lado del otro. Para encontrar el casillero <code>i</code> no buscás de a uno: <b>multiplicás <code>i</code> por el ancho <code>w</code> de cada casillero y sumás desde dónde arranca la fila</b>. La dirección del elemento <code>i</code> (contando desde 0) de un arreglo <code>A</code> es:</p>
<pre><code>base + i * w</code></pre>
<p>donde <code>base</code> es la dirección del primer elemento (<code>A[0]</code>) y <code>w</code> es el ancho de cada elemento (por ejemplo 4 bytes).</p>

<h3>Dos dimensiones</h3>
<p>Para <code>A[i1][i2]</code>, con <code>w1</code> el tamaño de una fila y <code>w2</code> el de un elemento:</p>
<pre><code>base + i1 * w1 + i2 * w2</code></pre>
<p>Y se generaliza a más dimensiones sumando un término por cada índice.</p>

<h3>Row-major vs column-major</h3>
<p>Un arreglo 2D se puede guardar de dos formas: <b>por filas</b> (row-major: fila por fila; lo usan <b>C y Java</b>) o <b>por columnas</b> (column-major: columna por columna; lo usa <b>Fortran</b>). La fórmula de la dirección cambia según cuál uses.</p>

<h3>La traducción de una referencia</h3>
<p>Una referencia <code>A[i][j]</code> se <b>expande en varias instrucciones</b> de tres direcciones que calculan la dirección, y después una <b>copia indexada</b> (<code>x = A[dir]</code> para leer, <code>A[dir] = x</code> para escribir; son las instrucciones de arreglo que viste en 9.2). Un truco de optimización: la parte <code>c = base - inferior * w</code> se puede <b>precalcular en tiempo de compilación</b> (si el arreglo arranca en un índice fijo), y entonces <code>A[i]</code> queda en <code>i * w + c</code>. Pero si el arreglo es de <b>tamaño dinámico</b> (no conocés los límites en compilación), la fórmula se evalúa <b>en ejecución</b>.</p>

<div class="callout aho"><span class="lab">📘 lo que importa de esto para la cátedra</span>
Esto es material de <b>Aho</b> (la cátedra usa polaca/tercetos y toca poco los arreglos). Lo importante de fondo: una referencia a un arreglo <b>NO es una operación atómica</b>, se traduce a <b>varias</b> instrucciones que calculan <code>base + i * w</code> y después una copia indexada. Y conecta con Optimización: la constante <code>c = base - inferior * w</code> es un cálculo entre constantes que se puede <b>adelantar a compilación</b> (reducción simple), <b>salvo</b> que el arreglo sea de tamaño dinámico, en cuyo caso la cuenta queda para ejecución.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Un arreglo se guarda en posiciones <b>consecutivas</b>; <code>A[i]</code> está en <b><code>base + i * w</code></b> (<code>w</code> = ancho del elemento).</li>
<li>2D: <code>base + i1 * w1 + i2 * w2</code>. <b>Row-major</b> (C/Java) vs <b>column-major</b> (Fortran).</li>
<li>Una referencia <code>A[i][j]</code> genera <b>varias</b> instrucciones (calcular dirección + copia indexada), no una.</li>
<li>📘 <code>c = base - inferior * w</code> se <b>precalcula en compilación</b>, salvo que el arreglo sea de <b>tamaño dinámico</b>.</li>
</ul>`,
    qa:[
      {q:"¿Cómo se calcula la dirección del elemento A[i] de un arreglo?",
       a:`<p>Como los elementos de un arreglo se almacenan en <b>ubicaciones consecutivas</b>, la dirección del elemento <code>i</code> (contando desde 0) es <b><code>base + i * w</code></b>, donde <code>base</code> es la dirección relativa del primer elemento (<code>A[0]</code>) y <code>w</code> es el <b>ancho</b> de cada elemento (cuántas unidades de memoria ocupa, por ejemplo 4 bytes). Es aritmética de direcciones: multiplicás el índice por el tamaño de cada «casillero» y lo sumás al inicio de la fila. Si el arreglo no arranca en el índice 0 sino en un <code>inferior</code>, la fórmula es <code>base + (i - inferior) * w</code>, que se puede reescribir como <code>i * w + c</code> con <code>c = base - inferior * w</code> precalculado.</p>`},
      {q:"¿Qué diferencia hay entre row-major y column-major, y quién usa cada uno?",
       a:`<p>Son las dos formas de guardar un arreglo bidimensional en la memoria, que es unidimensional. En <b>row-major</b> (orden por filas) los elementos se guardan <b>fila por fila</b>: primero toda la primera fila, después toda la segunda, etc. Lo usan <b>C y Java</b>. En <b>column-major</b> (orden por columnas) se guardan <b>columna por columna</b>: primero toda la primera columna, después la segunda. Lo usa la familia <b>Fortran</b>. La diferencia importa porque la <b>fórmula de la dirección</b> de <code>A[i1][i2]</code> depende de cuál se use: cambia cómo se combinan los índices y los anchos de fila/columna. Elegir mal la fórmula da una dirección equivocada.</p>`},
      {q:"¿Por qué una referencia a un arreglo genera varias instrucciones y no una sola?",
       a:`<p>Porque acceder a <code>A[i][j]</code> requiere primero <b>calcular la dirección</b> del elemento, y ese cálculo (<code>base + i1 * w1 + i2 * w2</code>) involucra multiplicaciones y sumas que, en código de tres direcciones, no entran en una sola instrucción (cada instrucción admite un solo operador). Entonces la referencia se <b>expande</b> en una secuencia: varias instrucciones que van calculando la dirección en temporales, y al final una <b>copia indexada</b> (<code>x = A[dir]</code> si se lee, o <code>A[dir] = y</code> si se escribe). Por eso una referencia a un arreglo, que en el fuente parece un paso único, se traduce a un bloque de instrucciones intermedias.</p>`},
      {q:"¿Qué parte del cálculo de la dirección se puede precalcular en compilación y cuándo no se puede?",
       a:`<p>Se puede precalcular la constante <b><code>c = base - inferior * w</code></b>, de modo que la dirección de <code>A[i]</code> queda simplemente <code>i * w + c</code>, con <code>c</code> ya resuelto y guardado en la entrada de la tabla de símbolos del arreglo. Esto es posible cuando se conocen en <b>tiempo de compilación</b> el límite inferior del arreglo y el ancho del elemento (arreglo de tamaño estático); es un caso de <b>reducción simple</b>, porque <code>c</code> es una operación entre constantes. <b>No se puede</b> precalcular cuando el arreglo es de <b>tamaño dinámico</b>: si no se conocen los límites (<code>inferior</code>, <code>superior</code>) hasta ejecutar el programa, la constante <code>c</code> no se puede computar en compilación y la fórmula debe evaluarse <b>en tiempo de ejecución</b>.</p>`}
    ]
  }
]});
