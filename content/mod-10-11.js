/* =================== MÓDULO 10 =================== */
M.push({
  id:10, titulo:"Tipos de datos", parcial:"II",
  resumen:"Cómo el compilador razona sobre los tipos: expresiones de tipos y equivalencia, dónde y cuánto ocupa cada variable, la comprobación de tipos que sintetiza el tipo hacia arriba con la tabla de síntesis, las conversiones (coerción, widening/narrowing, implícita vs explícita), qué pasa con a:=b según el lenguaje, sobrecarga/inferencia/unificación, y el taller a=b*c+d*e resuelto nodo por nodo.",
  lecciones:[
  {
    id:"10.1", titulo:"Expresiones de tipos y equivalencia", aho:"§6.3.1–6.3.2 · p.371", badges:["📘"], estado:"dictada",
    html:`
<p>📘 <b>de Aho, más de fondo que de parcial</b>, pero es el cimiento: antes de <b>comprobar</b> tipos hay que poder <b>escribir</b> un tipo de forma que el compilador lo entienda. Una <b>expresión de tipos</b> es la manera formal de anotar la estructura de un tipo, igual que una expresión aritmética anota una cuenta.</p>

<p>Una <b>expresión de tipos</b> es un <b>tipo básico</b> (<code>boolean</code>, <code>char</code>, <code>integer</code>, <code>float</code>, <code>void</code>) o se arma aplicando un <b>constructor de tipos</b> a otras expresiones de tipos. Los constructores típicos: <code>arreglo(n, T)</code>, <code>registro(campos)</code>, <code>puntero(T)</code>, la <b>función</b> <code>s → t</code> (del tipo s al tipo t) y el <b>producto</b> <code>s × t</code> (para listas de tipos, como los parámetros de una función).</p>

<h3>La analogía de la receta</h3>
<p>Pensá un tipo como una <b>receta</b>. Los tipos básicos son los <b>ingredientes crudos</b> (harina, huevo). Los constructores son <b>formas de combinar</b>: "una bandeja de 12 de X" es <code>arreglo(12, X)</code>; "un sobre con un nombre y un teléfono" es un <code>registro</code>; "una máquina que toma X y devuelve Y" es <code>X → Y</code>. Como cada constructor recibe recetas más chicas, podés describir un tipo enorme apilando constructores, igual que Thompson apilaba autómatas.</p>

<h3>El ejemplo canónico de Aho: int[2][3]</h3>
<p>El arreglo <code>int[2][3]</code> se lee "arreglo de 2 arreglos, de 3 enteros cada uno" y se escribe <code>arreglo(2, arreglo(3, integer))</code>. Como árbol, con constructores en los nodos interiores y tipos básicos en las hojas:</p>
<pre><code>arreglo
├─ 2
└─ arreglo
   ├─ 3
   └─ integer</code></pre>
<p>Los <b>nombres</b> de tipo también son expresiones de tipos, y sirven para armar <b>tipos recursivos</b> (una <code>Celda</code> con un campo <code>siguiente</code> de tipo <code>Celda</code> es una lista enlazada). Ahí el grafo del tipo tiene un ciclo.</p>

<h3>Las dos formas de decir "estos dos tipos son el mismo"</h3>
<p>Muchas reglas de comprobación tienen la forma "si los dos tipos son iguales, devolver tal tipo; si no, error". Entonces hay que definir <b>cuándo dos tipos son equivalentes</b>. Hay dos criterios:</p>
<ul>
<li><b>Equivalencia estructural</b>: dos tipos son iguales si tienen la <b>misma forma</b> — el mismo tipo básico, o el mismo constructor aplicado a componentes equivalentes — aunque se llamen distinto. <code>arreglo(3, integer)</code> es igual a <code>arreglo(3, integer)</code> venga de donde venga.</li>
<li><b>Equivalencia por nombre</b>: dos tipos son iguales solo si comparten el <b>mismo nombre</b> declarado. Es más <b>estricta</b>: dos records con los mismos campos pero distinto nombre son tipos <b>distintos</b>.</li>
</ul>

<div class="callout aho"><span class="lab">📘 dónde encaja en la materia</span>
La cátedra no te va a pedir "escribí la expresión de tipos de tal arreglo", pero esta idea es el <b>andamio</b> de todo el módulo: cuando en 10.3 digamos que "cada nodo del árbol lleva <code>(elemento, tipo)</code> y el tipo se sintetiza hacia arriba", ese "tipo" es una expresión de tipos. Y la <b>equivalencia</b> es lo que, por debajo, decide si <code>a := b</code> es compatible o tira error de tipos.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Una <b>expresión de tipos</b> es un tipo básico o un <b>constructor</b> (<code>arreglo(n,T)</code>, <code>registro</code>, <code>puntero(T)</code>, <code>s → t</code>) aplicado a otras expresiones de tipos.</li>
<li><code>int[2][3]</code> se escribe <code>arreglo(2, arreglo(3, integer))</code>.</li>
<li><b>Equivalencia estructural</b>: misma forma (mismo constructor y componentes equivalentes). <b>Equivalencia por nombre</b>: mismo nombre declarado; es más estricta.</li>
<li>Los <b>nombres</b> permiten <b>tipos recursivos</b> (listas enlazadas), cuyo grafo tiene ciclos.</li>
</ul>`,
    qa:[
      {q:"¿Qué es una expresión de tipos y cómo se escribe el tipo de int[2][3]?",
       a:`<p>Una <b>expresión de tipos</b> es la anotación formal de la estructura de un tipo: es un <b>tipo básico</b> (integer, float, char, boolean, void) o el resultado de aplicar un <b>constructor de tipos</b> (arreglo, registro, puntero, función <code>s → t</code>, producto <code>s × t</code>) a otras expresiones de tipos. Sirve para que el compilador pueda razonar sobre los tipos de forma uniforme. Ejemplo: <code>int[2][3]</code> se lee "arreglo de 2 arreglos de 3 enteros" y se escribe <b><code>arreglo(2, arreglo(3, integer))</code></b>, que como árbol tiene el constructor <code>arreglo</code> en los nodos interiores y <code>integer</code> en la hoja.</p>`},
      {q:"¿Qué diferencia hay entre equivalencia estructural y equivalencia por nombre? Dá un ejemplo.",
       a:`<p><b>Equivalencia estructural</b>: dos tipos son iguales si tienen la <b>misma forma</b> — el mismo tipo básico, o el mismo constructor aplicado a componentes equivalentes — sin importar cómo se llamen. <b>Equivalencia por nombre</b>: son iguales solo si tienen el <b>mismo nombre de tipo</b> declarado. La segunda es <b>más estricta</b>. Por qué importa: si declarás <code>tipo Metros = integer</code> y <code>tipo Segundos = integer</code>, con equivalencia estructural <code>Metros</code> y <code>Segundos</code> son intercambiables (ambos son <code>integer</code>); con equivalencia por nombre son <b>tipos distintos</b> y sumar metros con segundos da error, que suele ser lo que uno quiere.</p>`},
      {q:"¿Para qué sirven los nombres de tipo dentro de las expresiones de tipos?",
       a:`<p>Sirven para dos cosas. Una, <b>abreviar</b>: le ponés nombre a una expresión de tipos grande y la reusás. Dos, y más importante, para definir <b>tipos recursivos</b>, que son imposibles de escribir "en línea": una lista enlazada se define como <code>Celda = registro(info: int, siguiente: Celda)</code>, donde el nombre <code>Celda</code> aparece dentro de su propia definición. En el grafo del tipo, eso genera un <b>ciclo</b>. Sin nombres no se podrían describir estructuras de datos como listas o árboles.</p>`}
    ]
  },
  {
    id:"10.2", titulo:"Declaraciones y distribución del almacenamiento", aho:"§6.3.3–6.3.4 · p.373", badges:["📘"], estado:"dictada",
    html:`
<p>📘 <b>de Aho, de fondo.</b> Las <b>declaraciones</b> no generan código intermedio (dato de la cátedra), pero <b>sí</b> hacen dos trabajos silenciosos y fundamentales: le fijan a cada nombre su <b>tipo</b> y deciden <b>dónde</b> va a vivir en memoria. Todo eso queda anotado en la <b>tabla de símbolos</b>.</p>

<h3>La analogía del guardarropa</h3>
<p>Imaginá el registro de activación de un procedimiento como un <b>guardarropa</b> con casilleros consecutivos. Cuando procesás las declaraciones, vas asignando a cada variable un casillero: la primera arranca en el <b>desplazamiento (offset)</b> 0, y cada nueva variable empieza donde terminó la anterior. El <b>ancho (width)</b> del tipo dice cuántos bytes ocupa esa variable, o sea cuánto hay que correr el mostrador antes del próximo casillero.</p>

<h3>Los tres números por variable: tipo, ancho, offset</h3>
<p>Aho usa una gramática simple <code>D → T id ; D</code> y una variable <code>desplazamiento</code> que arranca en 0. Por cada declaración <code>T id</code>:</p>
<ul>
<li>calcula el <b>tipo</b> (de <code>T</code>),</li>
<li>anota en la tabla de símbolos <code>(id, tipo, desplazamiento)</code>,</li>
<li>e <b>incrementa</b> <code>desplazamiento</code> en el <b>ancho</b> del tipo.</li>
</ul>
<p>Anchos típicos: <code>int</code> 4 bytes, <code>float</code> 8 bytes. Un arreglo ocupa "cantidad × ancho del elemento": <code>arreglo(2, arreglo(3, integer))</code> mide 2 × (3 × 4) = <b>24</b> bytes.</p>
<pre><code>int   x;     tipo=integer   offset= 0   ancho=4
float y;     tipo=float     offset= 4   ancho=8
int   z;     tipo=integer   offset=12   ancho=4
                                        (total = 16 bytes)</code></pre>

<h3>El caso borde: alineación y relleno</h3>
<p>La máquina destino a veces exige que un entero empiece en una dirección múltiplo de 4. Si un dato quedaría "mal parado", el compilador deja unos bytes <b>vacíos</b> antes: eso es el <b>relleno (padding)</b>, y por eso a veces un <code>char[10]</code> ocupa 12 bytes. Aho lo menciona pero, para simplificar, lo ignora en sus cuentas.</p>

<h3>Los registros: una tabla adentro de otra</h3>
<p>Un <code>registro { ... }</code> se traduce guardando <b>sus</b> declaraciones en una <b>tabla de símbolos propia</b>, con offsets <b>relativos al inicio del registro</b> (arrancan de 0 de nuevo). Por eso el campo <code>x</code> de un record <code>p</code> y el campo <code>x</code> de otro record <code>q</code> no chocan: cada uno tiene su offset dentro de su propia área. El tipo queda como <code>registro(t)</code>, donde <code>t</code> es esa tabla interna.</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Las declaraciones no generan código intermedio, pero fijan en la <b>tabla de símbolos</b>: <b>tipo</b>, <b>ancho</b> y <b>offset</b> de cada nombre.</li>
<li>Se recorre con una variable <code>desplazamiento</code> que arranca en 0 y se <b>acumula</b> sumando el ancho de cada tipo.</li>
<li>Un arreglo mide <b>cantidad × ancho del elemento</b>; <code>int[2][3]</code> mide 24 bytes.</li>
<li><b>Relleno</b> (padding) = bytes vacíos por alineación. Los <b>registros</b> usan una tabla interna con offsets relativos, por eso los campos homónimos no chocan.</li>
</ul>`,
    qa:[
      {q:"Al procesar una secuencia de declaraciones, ¿qué calcula el compilador por cada variable y dónde lo guarda?",
       a:`<p>Calcula tres cosas y las guarda en la <b>tabla de símbolos</b>: el <b>tipo</b>, el <b>ancho</b> (cuántos bytes ocupa) y el <b>offset</b> o desplazamiento (dónde empieza, relativo al inicio del área de datos). Lo hace con una variable <code>desplazamiento</code> que arranca en 0 y se va <b>acumulando</b>: a cada nombre le asigna el desplazamiento actual y después lo incrementa en el ancho de su tipo. Por eso las declaraciones, aunque <b>no generan código intermedio</b>, son imprescindibles: sin ese tipo y ese offset no se podría chequear tipos ni generar los accesos a memoria en el Assembler.</p>`},
      {q:"¿Cuánto ocupa el tipo int[2][3] y cómo se calcula el ancho de un arreglo?",
       a:`<p>El ancho de un arreglo es <b>cantidad de elementos × ancho de cada elemento</b>. <code>int[2][3]</code> es <code>arreglo(2, arreglo(3, integer))</code>: suponiendo <code>int</code> = 4 bytes, un <code>arreglo(3, integer)</code> mide 3 × 4 = 12, y el arreglo externo mide 2 × 12 = <b>24 bytes</b>. Ese ancho es el que el compilador acumula en la tabla de símbolos y el que usa después para calcular direcciones de los elementos.</p>`},
      {q:"En un registro, ¿por qué el campo x de p no choca con el campo x de q?",
       a:`<p>Porque cada <b>registro</b> se traduce con su <b>propia tabla de símbolos</b>, y los offsets de sus campos son <b>relativos al inicio de ese registro</b> (arrancan de 0 dentro del record). Entonces el <code>x</code> de <code>p</code> tiene un desplazamiento dentro del área de <code>p</code>, y el <code>x</code> de <code>q</code> tiene su propio desplazamiento dentro de <code>q</code>: son entradas distintas, en tablas distintas, y no se pisan. Es lo mismo que pasa con el <b>alcance</b>: un nombre puede reaparecer en otro ámbito sin conflicto.</p>`}
    ]
  },
  {
    id:"10.3", titulo:"Comprobación de tipos: el tipo se sintetiza (tabla de síntesis)", aho:"§6.5.1 · p.387", badges:["🎯"], estado:"dictada",
    html:`
<p>Entramos en terreno 🎯. La <b>comprobación de tipos</b> es la parte del análisis semántico que verifica que <b>cada operador reciba operandos compatibles</b>: que no sumes un entero con un puntero, que no le pases un <code>float</code> a algo que espera un <code>boolean</code>. Es <b>estática</b> (en compilación) y usa la <b>tabla de símbolos</b> para saber el tipo de cada nombre.</p>

<h3>Síntesis vs inferencia (y por qué acá manda la síntesis)</h3>
<p>Aho dice que la comprobación toma dos formas. La <b>síntesis de tipos</b> arma el tipo de una expresión a partir de los tipos de sus <b>sub</b>expresiones, y <b>exige que los nombres estén declarados</b> antes de usarse (es el caso de C, Pascal, Java). La <b>inferencia</b> deduce el tipo por el <b>uso</b>, sin declaración (ML, Haskell — lo vemos en 10.6). En la cátedra el que importa es la <b>síntesis</b>.</p>

<div class="callout tgt"><span class="lab">🎯 el tipo es un atributo SINTETIZADO</span>
"Sintetizado" tiene un significado técnico: es un atributo que se calcula <b>de los hijos hacia el padre</b>, es decir, <b>sube por el árbol</b>. El tipo de <code>a + b</code> se calcula a partir del tipo de <code>a</code> y del tipo de <code>b</code>. Por eso, cada nodo del árbol sintáctico lleva el par <code>(elemento, tipo)</code>, y a medida que el parser <b>reduce</b>, una función consulta la tabla de síntesis y <b>propaga el tipo hacia arriba</b>. Es exactamente el mismo mecanismo con el que se arma el árbol o la polaca, pero cargando el tipo en cada nodo.</div>

<h3>La tabla de síntesis: qué es y para qué sirve</h3>
<p>La <b>tabla de síntesis</b> es una tablita de doble entrada que, dado un <b>operador</b> y los <b>tipos de sus dos operandos</b>, te dice el <b>tipo resultante</b>. Para <code>+</code> con los tipos numéricos:</p>
<pre><code>  +      int      long     float    double
int      int      long     float    double
long     long     long     float    double
float    float    float    float    double
double   double   double   double   double</code></pre>
<p>La cátedra le pide <b>tres usos</b>, y conviene decirlos así de memoria:</p>
<ul>
<li><b>Estudiar la compatibilidad</b> entre tipos (¿se pueden operar?).</li>
<li><b>Verificar si la operación es válida</b> (si la casilla existe / no es un error).</li>
<li><b>Calcular</b> el tipo resultante (el tipo que sube al nodo padre).</li>
</ul>

<h3>Cómo se ve en el árbol</h3>
<p>Para <code>b + c</code> con <code>b</code> entero y <code>c</code> long, cada hoja lleva su tipo y el nodo <code>+</code> consulta la tabla:</p>
<pre><code>   +  (long)          ← la tabla dice: int con long da long
   ├─ b (int)
   └─ c (long)</code></pre>
<p>Ese <code>long</code> sube y queda disponible para el nodo de arriba. Lo mismo se hace en <b>polaca</b> y en <b>tercetos</b>: al procesar cada operador se llama a la función que sintetiza y anota el tipo intermedio.</p>

<h3>Dónde se pone la verificación (pregunta de parcial)</h3>
<p>La comprobación se dispara en las reglas de <b>expresión</b> (<code>E → E + T</code>, <code>T → T * F</code>) y de <b>asignación</b> (<code>A → id := E</code>). Ahí es donde el nodo consulta la tabla de símbolos (para el tipo de los <code>id</code>) y la tabla de síntesis (para el tipo de la operación). Si te preguntan "¿en qué regla incorporás la verificación de tipos?", la respuesta es <b>esas</b>.</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>La <b>comprobación de tipos</b> es estática y verifica que cada operador reciba operandos <b>compatibles</b>, consultando la tabla de símbolos.</li>
<li>🎯 El tipo es un atributo <b>sintetizado</b>: se calcula de los hijos al padre y <b>sube por el árbol</b>. Cada nodo lleva <code>(elemento, tipo)</code>.</li>
<li>🎯 La <b>tabla de síntesis</b> da el <b>tipo resultante</b> de operar dos tipos, y sirve para (1) estudiar compatibilidad, (2) verificar si la operación es válida y (3) calcular el tipo.</li>
<li>La verificación se ubica en las reglas de <b>expresión y asignación</b>.</li>
</ul>`,
    qa:[
      {q:"¿Para qué sirve la tabla de síntesis y por qué se dice que el tipo «se sintetiza»?",
       a:`<p>La <b>tabla de síntesis</b> es una tabla de doble entrada que, dados un operador y los tipos de sus dos operandos, devuelve el <b>tipo resultante</b>. Sirve para tres cosas que la cátedra pide de memoria: (1) estudiar la <b>compatibilidad</b> entre tipos, (2) <b>verificar</b> si la operación es válida, y (3) <b>calcular</b> el tipo resultante. Se dice que el tipo "se sintetiza" porque es un atributo <b>sintetizado</b>: se calcula <b>de los hijos hacia el padre</b>, subiendo por el árbol. Cada nodo lleva el par <code>(elemento, tipo)</code>, y cuando el parser reduce, una función consulta la tabla y propaga el tipo hacia arriba. Ejemplo: en <code>b + c</code> con <code>b</code> int y <code>c</code> long, el nodo <code>+</code> consulta la tabla, obtiene <code>long</code> y ese tipo sube al nodo de arriba.</p>`},
      {q:"¿En qué reglas de la gramática se incorpora la verificación de tipos y por qué ahí?",
       a:`<p>En las reglas de <b>expresión</b> (<code>E → E + T</code>, <code>T → T * F</code>) y de <b>asignación</b> (<code>A → id := E</code>). Ahí es donde se combinan operandos, así que es el punto natural para consultar la <b>tabla de símbolos</b> (y obtener el tipo de cada <code>id</code>) y la <b>tabla de síntesis</b> (y obtener el tipo de la operación). En una regla de expresión se chequea que los dos operandos del operador sean compatibles; en la de asignación, que el tipo de la expresión sea compatible con el del lado izquierdo. En las declaraciones no va (esas solo fijan el tipo en la tabla).</p>`},
      {q:"¿Qué diferencia hay entre síntesis e inferencia de tipos, y cuál usa la cátedra?",
       a:`<p>La <b>síntesis</b> arma el tipo de una expresión a partir de los tipos de sus subexpresiones y <b>requiere que los nombres estén declarados</b> antes de usarse (C, Pascal, Java): el tipo de <code>E1 + E2</code> se define en función de los tipos de <code>E1</code> y <code>E2</code>. La <b>inferencia</b> deduce el tipo a partir del <b>uso</b>, sin necesidad de declaración (lenguajes como ML): si ve <code>null(x)</code> y <code>null</code> espera una lista, infiere que <code>x</code> es una lista. La cátedra trabaja con <b>síntesis</b> (por eso "el tipo se sintetiza" y por eso hay declaraciones que fijan el tipo en la tabla de símbolos).</p>`},
      {q:"¿Por qué la comprobación de tipos es estática y no en tiempo de ejecución?",
       a:`<p>Es <b>estática</b> (se hace en compilación) porque un sistema de tipos sólido permite <b>garantizar de antemano</b> que ciertos errores de tipo no van a ocurrir al ejecutar, sin tener que arrastrar el tipo de cada valor hasta la ejecución. En principio, cualquier chequeo podría hacerse en forma dinámica si el código destino llevara el tipo junto con el valor, pero eso cuesta tiempo y memoria en ejecución. Haciéndolo estáticamente, el compilador atrapa el error <b>antes</b> de generar el ejecutable, e interactúa con la <b>tabla de símbolos</b> para conocer los tipos declarados.</p>`}
    ]
  },
  {
    id:"10.4", titulo:"Conversiones: coerción, widening/narrowing, implícita vs explícita", aho:"§6.5.2 · p.388", badges:["🎯"], estado:"dictada",
    html:`
<p>Terreno 🎯 y de trampas. Una <b>conversión</b> es un <b>cambio de tipo</b> de un valor, y <b>existe para permitir la compatibilidad</b>: como el entero <code>2</code> y el real <code>3.14</code> se representan distinto por dentro (y se operan con instrucciones distintas), para sumarlos el compilador tiene que convertir uno de los dos al tipo del otro.</p>

<h3>La analogía del enchufe</h3>
<p>Dos aparatos con enchufes distintos no se conectan directo: necesitás un <b>adaptador</b>. La conversión es ese adaptador entre tipos. Y como todo adaptador, hay dos maneras de conseguirlo: que <b>venga puesto de fábrica</b> (el compilador lo mete solo) o que <b>lo compres y lo enchufes vos</b> (lo escribís a mano). Esa es toda la diferencia entre implícita y explícita.</p>

<h3>Widening vs narrowing (la dirección de la conversión)</h3>
<ul>
<li><b>Widening (ensanchamiento)</b>: pasar a un tipo <b>más amplio</b> — <code>int → float</code>, <code>float → double</code>. Es <b>seguro</b>, preserva la información. Ejemplo: <code>float x; double z; z = x;</code> ensancha el <code>float</code> a <code>double</code>.</li>
<li><b>Narrowing (angostamiento)</b>: pasar a un tipo <b>más chico</b> — <code>double → int</code>. Puede <b>perder información</b> (truncar los decimales, desbordar). Java lo restringe: la mayoría de las conversiones automáticas son solo de ensanchamiento.</li>
</ul>
<p>Aho lo dibuja como una <b>jerarquía</b>: cualquier tipo se puede ensanchar hacia uno más arriba; angostar es ir en contra y por eso hay que pedirlo explícito.</p>

<h3>Implícita vs explícita (quién la hace)</h3>
<ul>
<li><b>Implícita</b> (Aho la llama <b>coerción</b>): la hace el <b>compilador</b> solo, automáticamente. Lenguajes: C, Algol, Pascal, Fortran, Java. <b>Facilita escribir</b> (no anotás nada), pero <b>dificulta leer y mantener</b> (las conversiones están "ocultas"). Se rige por reglas de <b>promoción numérica</b>.</li>
<li><b>Explícita</b> (el <b>casting</b>): la <b>escribe el usuario</b> con claridad. Lenguajes: C++, Ada, Java. <b>Dificulta escribir</b> (tenés que anotarla), pero <b>facilita leer y mantener</b> (queda a la vista).</li>
</ul>
<p>Regla mnemotécnica: <b>implícita = cómoda para escribir, incómoda para leer; explícita = al revés</b>.</p>

<div class="callout tgt"><span class="lab">🎯 las dos trampas que caen seguro</span>
<b>Trampa 1 — las implícitas valen para TODO el lenguaje.</b> Las conversiones implícitas las gestiona el compilador dentro de las reglas <b>generales</b> de expresiones y asignación, así que aplican a <b>todo el lenguaje</b>, no a un comando puntual. Pregunta real de parcial: "¿hace falta contemplar conversiones implícitas dentro del comando <code>SWAP</code>?" → <b>No</b>: ya están resueltas en las reglas de expresión/asignación; a lo sumo importarían en una asignación posterior, nunca dentro del comando.<br><br>
<b>Trampa 2 — un truncamiento NO es una conversión.</b> Una conversión <b>convierte el valor</b> conservando su sentido; si el casting <b>trunca</b> y pierde información, ahí no hubo conversión de valor. La cátedra corrige textual: "no había conversión sino truncamiento".</div>

<h3>Cómo lo implementa Aho (para el fondo)</h3>
<p>Aho usa dos funciones en la acción semántica de <code>E → E1 + E2</code>: <code>max(t1, t2)</code> devuelve el tipo más alto de los dos en la jerarquía de ensanchamiento, y <code>ampliar(a, t, w)</code> genera la instrucción de conversión si hace falta (por ejemplo <code>t = (float) a</code>). Así el nodo suma queda con los dos operandos ya en el mismo tipo.</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li><b>Conversión = cambio de tipo</b>, existe para permitir la <b>compatibilidad</b>. La automática se llama <b>coerción</b>.</li>
<li><b>Widening</b> (a un tipo más amplio) es seguro; <b>narrowing</b> (a uno más chico) puede truncar.</li>
<li><b>Implícita</b> (compilador): facilita escribir, dificulta leer/mantener. <b>Explícita</b> (usuario): al revés.</li>
<li>🎯 Las implícitas valen para <b>todo el lenguaje</b>, no para un comando; y un <b>truncamiento no es una conversión</b>.</li>
</ul>`,
    qa:[
      {q:"¿Qué diferencia hay entre conversión implícita y explícita, y qué facilita/dificulta cada una?",
       a:`<p><b>Implícita</b> (o coerción): la hace <b>el compilador</b> de forma automática, según reglas de promoción numérica; el usuario no escribe nada. <b>Facilita la escritura</b> pero <b>dificulta la lectura y el mantenimiento</b>, porque las conversiones quedan ocultas. Lenguajes: C, Algol, Pascal, Fortran, Java. <b>Explícita</b> (el casting): la <b>escribe el usuario</b> con claridad. <b>Dificulta la escritura</b> (hay que anotarla) pero <b>facilita la lectura y el mantenimiento</b>, porque queda a la vista. Lenguajes: C++, Ada, Java. Regla: implícita cómoda para escribir e incómoda para leer; explícita, al revés.</p>`},
      {q:"¿Es necesario contemplar conversiones implícitas dentro de un comando particular como SWAP? Justificá.",
       a:`<p><b>No.</b> Las conversiones implícitas las gestiona el <b>compilador</b> como parte de las reglas <b>generales</b> de expresiones y asignación, de modo que valen para <b>todo el lenguaje</b>, no para un comando específico. Un <code>SWAP</code> que solo intercambia dos valores no necesita ningún tratamiento especial de conversiones: si las incorporaste al lenguaje, ya operan en cualquier expresión o asignación. A lo sumo importarían en una <b>asignación posterior</b> a variables de distinto tipo, pero eso ya está resuelto por las reglas generales, no por el comando.</p>`},
      {q:"V/F justificando: «Todo casting es una conversión.»",
       a:`<p><b>Falso.</b> Una <b>conversión</b> cambia el tipo <b>preservando el sentido del valor</b> (por ejemplo, ensanchar un <code>int</code> a <code>float</code>). Pero un <b>casting con narrowing</b> puede <b>truncar</b> y perder información (pasar <code>3.9</code> de <code>double</code> a <code>int</code> da <code>3</code>): en ese caso <b>no hay conversión de valor</b>, hay truncamiento. La cátedra lo corrige textual: "no había conversión sino truncamiento". Por eso no todo casting es una conversión.</p>`},
      {q:"¿Qué es el widening y por qué es seguro, a diferencia del narrowing?",
       a:`<p><b>Widening</b> (ensanchamiento) es asignar un valor a una variable de un tipo <b>más amplio</b>: por ejemplo <code>float x; double z; z = x;</code>, donde el <code>float</code> se ensancha a <code>double</code>. Es <b>seguro</b> porque el tipo destino tiene más capacidad y representa sin pérdida al valor original. El <b>narrowing</b> (angostamiento) es lo contrario, ir a un tipo <b>más chico</b> (por ejemplo <code>double → int</code>): puede <b>perder información</b> por truncamiento o desbordamiento, así que la mayoría de los lenguajes no lo hacen automáticamente y exigen un casting explícito. En la jerarquía de tipos, ensanchar es subir (permitido solo); angostar es bajar (hay que pedirlo).</p>`}
    ]
  },
  {
    id:"10.5", titulo:"Dinámicos vs estáticos vs basados en pila; boxing", aho:"Apunte", badges:["🎯"], estado:"dictada",
    html:`
<p>🎯 Del apunte, pregunta directa de parcial. La cuestión central: cuando ejecutás <code>a := b</code> (o sea <code>tipo1 := tipo2</code>) y los tipos no coinciden, <b>¿qué pasa?</b> La respuesta depende de si el lenguaje es <b>dinámico</b> o no, y es lo que más se pregunta del tema.</p>

<h3>La analogía de la caja etiquetada</h3>
<p>Pensá una variable como una <b>caja con una etiqueta</b> que dice de qué tipo es lo que guarda. Al hacer <code>a := b</code>:</p>
<ul>
<li>En un <b>lenguaje dinámico</b>, la caja <code>a</code> <b>reescribe su propia etiqueta</b> con la de <code>b</code>: el tipo de <code>b</code> <b>destruye</b> al tipo de <code>a</code>, y <code>a</code> <b>cambia de tipo</b>. Manda el lado <b>derecho</b>.</li>
<li>En un <b>lenguaje estático o basado en pila</b> (tipo Algol), la etiqueta de <code>a</code> <b>no se toca</b>: <b>manda el lado izquierdo</b>, y el valor de <code>b</code> se <b>convierte</b> al tipo de <code>a</code>. <b>No se permite cambio de tipo en tiempo de ejecución.</b></li>
</ul>

<div class="callout tgt"><span class="lab">🎯 la regla que va al parcial, en una línea</span>
En <code>a := b</code>: <b>dinámico</b> → el tipo de <code>b</code> destruye al de <code>a</code> (<code>a</code> cambia de tipo). <b>Estático / basado en pila</b> → manda el lado izquierdo, <code>b</code> se convierte al tipo de <code>a</code>, sin cambio de tipo en ejecución. Es la contracara de "el análisis semántico es estático": justamente porque el tipo se fija en compilación, no puede mutar al ejecutar.</div>

<h3>Por qué "basado en pila" va con el estático</h3>
<p>En un lenguaje orientado a la pila (tipo Algol), las variables locales viven en el <b>registro de activación</b> con un tipo y un tamaño fijos, decididos en compilación (esto es 10.2). Si <code>a</code> ocupa 4 bytes como entero, no puede de golpe pasar a ocupar 8 como double en medio de la ejecución: la distribución de memoria ya está congelada. Por eso, igual que en el estático, <b>manda el lado izquierdo</b>.</p>

<h3>Boxing y unboxing (C#)</h3>
<p>El <b>boxing</b> es "meter" un tipo valor (uno estándar, como <code>int</code>) dentro de un objeto (tipo referencia). El <b>unboxing</b> es sacarlo de vuelta: es una conversión <b>explícita</b> de un tipo objeto (referencia) a un tipo valor. La regla que cae: <b>siempre que hay un unboxing, antes hubo un boxing</b> — no podés desempaquetar algo que nunca empaquetaste.</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>🎯 En <code>a := b</code>: <b>dinámico</b> → el tipo de <code>b</code> <b>destruye</b> al de <code>a</code> y <code>a</code> cambia de tipo.</li>
<li>🎯 <b>Estático / basado en pila</b> (Algol) → <b>manda el lado izquierdo</b>: <code>b</code> se convierte al tipo de <code>a</code>, sin cambio de tipo en ejecución.</li>
<li>"Basado en pila" va con el estático porque el registro de activación fija tipo y tamaño en compilación.</li>
<li><b>Unboxing</b> (C#) = conversión explícita de tipo referencia a tipo valor; siempre que hay unboxing, antes hubo <b>boxing</b>.</li>
</ul>`,
    qa:[
      {q:"En a := b, ¿qué pasa en un lenguaje dinámico y qué en uno estático (o basado en pila)?",
       a:`<p><b>Dinámico</b>: el tipo de <code>b</code> <b>destruye</b> al de <code>a</code>, y <code>a</code> <b>cambia de tipo</b> — manda el lado derecho. <b>Estático o basado en pila</b> (tipo Algol): <b>manda el lado izquierdo</b>; el valor de <code>b</code> se <b>convierte</b> al tipo de <code>a</code> (conversión implícita si son compatibles), y <b>no se permite que <code>a</code> cambie de tipo en tiempo de ejecución</b>. La razón de fondo del segundo caso es que el tipo y el tamaño de <code>a</code> se fijaron en compilación (en el registro de activación), así que no pueden mutar mientras el programa corre.</p>`},
      {q:"¿Por qué un lenguaje basado en pila se comporta como uno estático ante a := b?",
       a:`<p>Porque en un lenguaje orientado a la pila (tipo Algol) las variables locales se ubican en el <b>registro de activación</b> con un <b>tipo y un tamaño fijos determinados en compilación</b> (el offset y el ancho de la lección 10.2). Si <code>a</code> se reservó como un entero de 4 bytes, no puede pasar a ser un double de 8 bytes en medio de la ejecución sin romper la distribución de memoria. Por eso, igual que en el estático, <b>manda el lado izquierdo</b> y el valor de <code>b</code> se convierte al tipo de <code>a</code>, sin cambio de tipo en ejecución.</p>`},
      {q:"¿Qué es el unboxing y qué relación tiene con el boxing?",
       a:`<p>El <b>unboxing</b> (en C#) es una conversión <b>explícita</b> de un tipo <b>objeto</b> (referencia) a un tipo <b>valor</b> (un tipo estándar como <code>int</code>). El <b>boxing</b> es la operación inversa: envolver un tipo valor dentro de un objeto. La relación clave, que la cátedra pregunta: <b>siempre que hay un unboxing, antes hubo un boxing</b> — desempaquetás un valor que en algún momento se empaquetó. No podés hacer unboxing de algo que nunca se "encajonó".</p>`}
    ]
  },
  {
    id:"10.6", titulo:"Sobrecarga, inferencia y unificación", aho:"§6.5.3–6.5.5 · p.390", badges:["📘"], estado:"dictada",
    html:`
<p>📘 <b>de Aho, de fondo.</b> Tres mecanismos más finos del sistema de tipos. No son el centro del parcial, pero redondean el tema y explican cosas que ya usás sin darte cuenta (como que <code>+</code> sirva para sumar y para concatenar).</p>

<h3>Sobrecarga: un símbolo, varios significados</h3>
<p>Un símbolo está <b>sobrecargado</b> cuando tiene <b>distintos significados según el contexto</b>. El caso clásico es <code>+</code> en Java: con dos números <b>suma</b>, con dos strings <b>concatena</b>. También se sobrecargan funciones: <code>err()</code> y <code>err(String s)</code> son dos funciones distintas con el mismo nombre.</p>
<p><b>Cómo la resuelve el compilador</b>: mirando los <b>tipos de los operandos</b> (que ya vienen sintetizados de abajo) y eligiendo la versión que corresponde. Se dice que la sobrecarga se "resuelve" cuando se le asigna un <b>significado único</b> a cada aparición. En lenguajes como Ada la cosa se complica porque una subexpresión puede tener un <b>conjunto</b> de tipos posibles y hace falta mirar el contexto para reducirlo a uno.</p>

<h3>Inferencia y polimorfismo</h3>
<p>La <b>inferencia de tipos</b> deduce el tipo de algo por <b>cómo se usa</b>, sin declaración explícita. Es lo que hacen ML o Haskell. Un fragmento de código es <b>polimórfico</b> si puede correr con argumentos de <b>distintos tipos</b>. Aho usa la función <code>longitud</code>: cuenta los elementos de una lista sin importar de qué tipo sean, así que su tipo se escribe con un cuantificador "para todo":</p>
<pre><code>longitud : ∀α. lista(α) → integer</code></pre>
<p>Se lee "para cualquier tipo α, <code>longitud</code> lleva una lista de elementos de tipo α a un entero". La <code>α</code> es una <b>variable de tipo</b>: un comodín que en cada uso se rellena con un tipo concreto.</p>

<h3>Unificación: el motor que hace calzar dos tipos</h3>
<p>La <b>unificación</b> es el algoritmo que determina si dos expresiones de tipos se pueden volver <b>idénticas</b> sustituyendo sus variables de tipo por expresiones. Es la generalización de "¿son iguales?": si no hay variables, unificar es simplemente comparar. Aho lo implementa con un grafo y <b>clases de equivalencia</b> (con operaciones <code>buscar</code> y <code>union</code>, como en el "conjuntos disjuntos"): dos nodos en la misma clase deben unificarse, y una variable no puede ser el representante de una clase que ya tiene un constructor.</p>

<div class="callout aho"><span class="lab">📘 el hilo que conecta con 10.1</span>
La unificación es también la forma de probar la <b>equivalencia estructural</b> de tipos (10.1), incluso para tipos recursivos con ciclos. Y el <b>unificador más general</b> es la sustitución que impone <b>menos restricciones</b>: deja los tipos lo más "abiertos" posible. Es el corazón del chequeo de tipos de los lenguajes funcionales, aunque en el parcial de la cátedra no se calcula.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li><b>Sobrecarga</b>: un símbolo con varios significados según el contexto (<code>+</code> suma o concatena). Se resuelve mirando los <b>tipos de los operandos</b>.</li>
<li><b>Inferencia</b>: deducir el tipo por el <b>uso</b>, sin declararlo (ML, Haskell).</li>
<li><b>Polimorfismo</b>: código que corre con argumentos de distintos tipos; se anota con <b>variables de tipo</b> (<code>∀α. lista(α) → integer</code>).</li>
<li><b>Unificación</b>: algoritmo que hace idénticas dos expresiones de tipos sustituyendo sus variables; generaliza la equivalencia estructural.</li>
</ul>`,
    qa:[
      {q:"¿Qué es la sobrecarga de operadores y cómo la resuelve el compilador?",
       a:`<p>La <b>sobrecarga</b> es que un mismo símbolo tenga <b>distintos significados según el contexto</b>. El ejemplo típico es <code>+</code>: con dos números <b>suma</b>, con dos strings <b>concatena</b>. También se sobrecargan funciones con el mismo nombre y distinta firma (<code>err()</code> vs <code>err(String)</code>). El compilador la <b>resuelve</b> mirando los <b>tipos de los operandos o argumentos</b> (que ya vienen sintetizados de abajo hacia arriba) y eligiendo la versión que corresponde a esa combinación de tipos. En lenguajes como Ada puede hacer falta además el contexto, porque una subexpresión puede tener un conjunto de tipos posibles.</p>`},
      {q:"¿Qué significa que la función longitud tenga el tipo ∀α. lista(α) → integer?",
       a:`<p>Significa que <code>longitud</code> es <b>polimórfica</b>: "para cualquier tipo α, toma una lista de elementos de tipo α y devuelve un entero". La <code>α</code> es una <b>variable de tipo</b>, un comodín que en cada uso concreto se reemplaza por un tipo real: aplicada a una lista de strings, α es string; aplicada a una lista de enteros, α es integer; en ambos casos el resultado es un entero (la cantidad de elementos). El cuantificador <code>∀</code> ("para todo") indica que el código funciona igual sea cual sea ese tipo. Es el resultado de la <b>inferencia de tipos</b> sobre el cuerpo de la función.</p>`},
      {q:"¿Qué es la unificación de tipos y con qué idea del módulo se conecta?",
       a:`<p>La <b>unificación</b> es el algoritmo que decide si dos expresiones de tipos pueden hacerse <b>idénticas</b> sustituyendo sus variables de tipo por expresiones. Es la generalización de "¿son iguales?": si los tipos no tienen variables, unificar equivale a comparar; si las tienen, busca una sustitución (el <b>unificador más general</b>, el que impone menos restricciones) que las iguale. Se conecta con la <b>equivalencia estructural</b> de la lección 10.1: unificar es, justamente, la forma de probar que dos tipos son estructuralmente equivalentes, incluso con tipos recursivos. Aho lo implementa con un grafo y clases de equivalencia (operaciones buscar/union).</p>`}
    ]
  },
  {
    id:"10.7", titulo:"Taller: a = b*c + d*e con int/long/float/double", aho:"Apunte", badges:["⚙️","🎯"], estado:"dictada",
    html:`
<p>⚙️🎯 El ejercicio clásico del tema, que junta todo: comprobación de tipos (10.3), tabla de síntesis y conversiones (10.4). El enunciado de la cátedra:</p>
<pre><code>int    b, d;
long   c;
float  e;
double a;
...
a = b * c + d * e;</code></pre>
<p>La consigna es <b>resolver el tipo de cada subexpresión nodo por nodo</b> y decir <b>dónde va cada conversión</b>. La herramienta es la <b>tabla de síntesis</b> (qué tipo resulta) más la <b>tabla de conversiones ampliada</b> (qué lado hay que convertir).</p>

<h3>Paso a paso, de las hojas a la raíz</h3>
<p>El tipo se <b>sintetiza hacia arriba</b>, así que arrancamos por los productos:</p>
<ul>
<li><code>b * c</code> = <b>int × long</b>. La tabla de síntesis da <b>long</b>. Hay que convertir el operando <code>int</code> (<code>b</code>) a <code>long</code>. Es <b>widening</b>, seguro.</li>
<li><code>d * e</code> = <b>int × float</b>. La tabla da <b>float</b>. Se convierte <code>d</code> (int) a <code>float</code>. Widening.</li>
<li><code>(b*c) + (d*e)</code> = <b>long × float</b>. La tabla da <b>float</b>. Se convierte el resultado <code>long</code> a <code>float</code>. Widening.</li>
<li>Asignar ese <code>float</code> a <code>a</code> (<b>double</b>): <b>widening</b> de float a double.</li>
</ul>

<h3>El árbol con los tipos sintetizados</h3>
<pre><code>        :=  (double)
        ├─ a  (double)
        └─ +  (float)              ← long + float da float
           ├─ *  (long)           ← int * long da long
           │  ├─ b (int → long)
           │  └─ c (long)
           └─ *  (float)          ← int * float da float
              ├─ d (int → float)
              └─ e (float)</code></pre>
<p>Fijate que cada nodo lleva <code>(elemento, tipo)</code> y el tipo va subiendo. Las conversiones aparecen en las hojas <code>b</code> y <code>d</code>, en el resultado del <code>*</code> izquierdo, y en la asignación final.</p>

<div class="callout tgt"><span class="lab">🎯 dónde vive la conversión según la notación</span>
En el <b>árbol</b>, la conversión es un <b>nodo insertado</b> (un nodo <code>inttofloat</code> / <code>inttolong</code> entre la hoja y su padre). En <b>polaca</b> y <b>tercetos</b>, es una <b>instrucción de conversión</b> que se emite <b>antes</b> de operar (una celda o un terceto que convierte el operando y deja el resultado en el tipo correcto). El "cuándo" es siempre en la <b>acción semántica</b> de la regla de expresión, cuando el nodo consulta la tabla y descubre que los tipos no coinciden.</div>

<h3>El detalle de la tabla de conversiones ampliada</h3>
<p>La tabla de síntesis dice "int × long → long", pero <b>no</b> dice a quién convertir. Para eso está la <b>tabla ampliada</b>: para <code>int * long</code> indica "convertir el <b>int</b> a long" (el operando de tipo más bajo sube al más alto). Por eso en <code>b * c</code> se convierte <code>b</code> y no <code>c</code>.</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Se resuelve <b>de las hojas a la raíz</b>, sintetizando el tipo con la tabla de síntesis en cada nodo.</li>
<li><code>b*c</code> → <b>long</b> (convertir <code>b</code>); <code>d*e</code> → <b>float</b> (convertir <code>d</code>); <code>long+float</code> → <b>float</b>; asignar a <code>a</code> double → <b>widening</b> a double.</li>
<li>La <b>tabla ampliada</b> dice <b>qué lado</b> convertir (el de tipo más bajo sube al más alto).</li>
<li>La conversión es un <b>nodo</b> en el árbol, o una <b>instrucción de conversión</b> en polaca/tercetos, emitida en la acción semántica.</li>
</ul>`,
    qa:[
      {q:"Para a = b*c + d*e (int b,d; long c; float e; double a), decí el tipo de cada subexpresión y dónde van las conversiones.",
       a:`<p>Sintetizando de las hojas a la raíz: <code>b*c</code> es <b>int × long → long</b> (se convierte <code>b</code> a long, widening); <code>d*e</code> es <b>int × float → float</b> (se convierte <code>d</code> a float); <code>(b*c)+(d*e)</code> es <b>long × float → float</b> (se convierte el resultado long a float); y asignar ese float a <code>a</code>, que es <b>double</b>, es un <b>widening</b> de float a double. En total, cuatro conversiones, todas de ensanchamiento (seguras). En el árbol cada una es un nodo insertado; en polaca o tercetos, una instrucción de conversión previa al operador.</p>`},
      {q:"La tabla de síntesis dice que int * long da long, pero ¿cómo sabés que hay que convertir el int y no el long?",
       a:`<p>La <b>tabla de síntesis</b> solo da el <b>tipo resultante</b> (long), no dice a quién convertir. Para eso está la <b>tabla de conversiones ampliada</b>, que para <code>int * long</code> indica "convertir el <b>int</b> a long". La regla general es que el operando del tipo <b>más bajo</b> en la jerarquía sube (por widening) al tipo <b>más alto</b>, porque así no se pierde información. Por eso en <code>b * c</code> se convierte <code>b</code> (int) a long y <code>c</code> (long) queda igual.</p>`},
      {q:"¿En qué momento y en qué lugar del árbol/polaca/tercetos se inserta una conversión?",
       a:`<p>El <b>momento</b> es siempre la <b>acción semántica</b> de la regla de expresión (o asignación), cuando el nodo consulta la tabla de síntesis y detecta que los tipos de los operandos no coinciden. El <b>lugar</b> depende de la notación: en el <b>árbol sintáctico</b>, la conversión es un <b>nodo nuevo</b> insertado entre el operando y su operador (por ejemplo un nodo <code>intToLong</code>); en <b>polaca inversa</b> y en <b>tercetos</b>, es una <b>instrucción de conversión</b> que se emite <b>antes</b> de la operación, dejando el operando ya en el tipo correcto. Así, cuando el operador se ejecuta, sus dos operandos ya son del mismo tipo.</p>`}
    ]
  }
]});

/* =================== MÓDULO 11 =================== */
M.push({
  id:11, titulo:"Sentencias de control y backpatching", parcial:"II",
  resumen:"Cómo se traduce el flujo de control: expresiones booleanas por valor o por flujo y el código de corto circuito, la traducción de if/if-else/while, el backpatching formal de Aho (makelist/merge/backpatch) y la versión de la cátedra con pila de celdas y BF/BI, las comparaciones por diferencia y por qué el anidamiento obliga a usar una pila, el taller con estructuras anidadas, y las instrucciones switch.",
  lecciones:[
  {
    id:"11.1", titulo:"Booleanas: valor vs flujo; código de corto circuito", aho:"§6.6.1–6.6.2 · p.399", badges:["📘"], estado:"dictada",
    html:`
<p>📘 <b>de Aho.</b> Antes de traducir un <code>if</code> o un <code>while</code> hay que decidir <b>cómo</b> se traduce la condición. Una expresión booleana (con <code>&amp;&amp;</code>, <code>||</code>, <code>!</code> y comparaciones <code>E rel E</code>) se puede usar de dos maneras muy distintas, y eso cambia el código que se genera.</p>

<div class="callout aho"><span class="lab">📘 la cátedra hace esto con la "pila de celdas"</span>
Esta lección y las dos que siguen (11.2, 11.3) son la versión <b>formal de Aho</b>. La cátedra <b>hace lo mismo</b> pero con su <b>pila de números de celda</b> (lección 11.4): donde Aho pone etiquetas y listas de saltos, la cátedra apila y desapila celdas. El concepto es idéntico (dejar el destino del salto en blanco y completarlo después); cambia la implementación. Por eso 11.1–11.3 van marcadas 📘.</div>

<h3>Los dos usos de una booleana</h3>
<ul>
<li><b>Como valor lógico</b>: te interesa el <b>resultado</b> (1 o 0). Se evalúa como una expresión aritmética más y se guarda en un temporal. Es lo que pasa en <code>x := a &lt; b;</code>.</li>
<li><b>Como flujo de control</b>: no te interesa el valor en sí, sino <b>a dónde saltar</b>. En <code>if (E) S</code>, el "valor" de <code>E</code> está implícito en <b>la posición del programa a la que llegás</b>: si llegaste a <code>S</code>, es porque <code>E</code> fue verdadera. Se traduce con <b>saltos</b>, no con un temporal.</li>
</ul>
<p>El contexto sintáctico decide cuál: una booleana después de <code>if</code> es flujo; a la derecha de una asignación es valor.</p>

<h3>Código de corto circuito (el que importa para las condiciones)</h3>
<p>En el <b>código de corto circuito</b> (o de salto), los operadores <code>&amp;&amp;</code>, <code>||</code> y <code>!</code> <b>se traducen en saltos</b> y <b>no aparecen</b> como operaciones en el código. La idea, que ya conocés de programar:</p>
<ul>
<li>En <code>A &amp;&amp; B</code>, si <code>A</code> es <b>falso</b>, ya sabés que todo es falso: <b>no evaluás <code>B</code></b>, saltás directo a la salida falsa.</li>
<li>En <code>A || B</code>, si <code>A</code> es <b>verdadero</b>, ya sabés que todo es verdadero: <b>no evaluás <code>B</code></b>.</li>
</ul>
<p>La analogía: es como <b>tildar una checklist para entrar a un lugar</b>. Si el primer requisito ya te descalifica (<code>&amp;&amp;</code> con A falso), no seguís revisando los demás: te vas. Si el primero ya te habilita (<code>||</code> con A verdadero), tampoco: entrás. Ahorrás trabajo y, ojo, evitás <b>efectos colaterales</b> del segundo operando (si <code>B</code> llamaba a una función que modifica algo, no se ejecuta).</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Una booleana se traduce <b>por valor</b> (guardás 1/0 en un temporal) o <b>por flujo</b> (saltos). El contexto decide: <code>if</code> → flujo, asignación → valor.</li>
<li>En el <b>código de corto circuito</b>, <code>&amp;&amp;</code>/<code>||</code>/<code>!</code> se traducen en <b>saltos</b> y no aparecen como operaciones.</li>
<li><code>A &amp;&amp; B</code>: si A es falso, no se evalúa B. <code>A || B</code>: si A es verdadero, no se evalúa B.</li>
<li>📘 La cátedra logra lo mismo con la <b>pila de celdas</b> (11.4) en vez de las etiquetas y listas de Aho.</li>
</ul>`,
    qa:[
      {q:"¿Cuáles son las dos maneras de traducir una expresión booleana y qué decide cuál se usa?",
       a:`<p>Se traduce <b>como valor lógico</b> (se calcula el resultado 1 o 0 y se guarda en un temporal, igual que una expresión aritmética) o <b>como flujo de control</b> (se genera código de <b>saltos</b>, donde el valor de la booleana está implícito en la posición del programa a la que se llega). Lo decide el <b>contexto sintáctico</b>: una booleana que va después de <code>if</code> o <code>while</code> se usa para <b>alterar el flujo</b> (saltos); una que va a la derecha de una asignación se usa como <b>valor</b>. En las condiciones de control se prefiere la traducción por flujo con código de corto circuito.</p>`},
      {q:"¿Qué es el código de corto circuito y qué ventaja tiene?",
       a:`<p>Es traducir los operadores booleanos <code>&amp;&amp;</code>, <code>||</code> y <code>!</code> con <b>saltos</b> en lugar de calcular el valor completo: los operadores no aparecen como operaciones en el código. La idea es <b>no evaluar de más</b>: en <code>A &amp;&amp; B</code>, si <code>A</code> es falso ya se sabe que todo es falso y se salta sin evaluar <code>B</code>; en <code>A || B</code>, si <code>A</code> es verdadero se salta sin evaluar <code>B</code>. La ventaja es doble: <b>ahorra trabajo</b> (menos evaluaciones) y <b>evita efectos colaterales</b> del segundo operando cuando el resultado ya está decidido (por ejemplo, si <code>B</code> contuviera una llamada a función que modifica una variable global).</p>`},
      {q:"En if (E) S, ¿dónde queda «guardado» el valor de la condición E si no se calcula en un temporal?",
       a:`<p>Queda <b>implícito en la posición del programa a la que se llega</b>. Con la traducción por flujo, <code>E</code> genera saltos: si <code>E</code> es verdadera, el control cae en la primera instrucción de <code>S</code>; si es falsa, salta por encima de <code>S</code>. No hace falta un temporal con 1 o 0: el solo hecho de <b>haber llegado a <code>S</code></b> significa que <code>E</code> fue verdadera. Por eso Aho dice que el valor de la booleana es "implícito en una posición a la que se llega en el programa".</p>`}
    ]
  },
  {
    id:"11.2", titulo:"Traducción de if, if-else y while con etiquetas", aho:"§6.6.3–6.6.4 · p.401", badges:["📘"], estado:"dictada",
    html:`
<p>📘 <b>de Aho.</b> Ahora sí, cómo se arma el código de las tres estructuras. Aho usa <b>etiquetas</b> (nombres de posiciones, como <code>L1</code>, <code>L2</code>) y un puñado de atributos. Es el mismo esquema que la cátedra hace con números de celda; conviene verlo primero "con nombres" porque es más legible.</p>

<div class="callout aho"><span class="lab">📘 etiquetas (Aho) = números de celda (cátedra)</span>
Donde Aho escribe <code>goto L1</code> con una etiqueta simbólica, la cátedra escribe un salto a un <b>número de celda</b> concreto. Es la misma idea con otra notación. Esta lección es la de las etiquetas; la 11.4 es la de las celdas.</div>

<h3>Los tres atributos clave</h3>
<ul>
<li><code>B.true</code>: la etiqueta a la que se salta si la condición <code>B</code> es <b>verdadera</b>.</li>
<li><code>B.false</code>: la etiqueta a la que se salta si <code>B</code> es <b>falsa</b>.</li>
<li><code>S.siguiente</code>: la etiqueta de la instrucción que va <b>justo después</b> de la sentencia <code>S</code>.</li>
</ul>

<h3>if (B) S1 — el más simple</h3>
<p>Si <code>B</code> es verdadera, cae en <code>S1</code>; si es falsa, saltea <code>S1</code> y sigue. Se logra poniendo <code>B.true</code> al inicio de <code>S1</code>, y <code>B.false = S.siguiente</code>:</p>
<pre><code>        código de B  (con saltos a B.true / B.false)
B.true: código de S1
        ...           (acá cae también el B.false)</code></pre>

<h3>if (B) S1 else S2 — aparece un salto extra</h3>
<p>Si <code>B</code> es verdadera va a <code>S1</code>, si es falsa va a <code>S2</code>. Y al final de <code>S1</code> hay que <b>saltar por encima</b> de <code>S2</code> con un <code>goto S.siguiente</code>, para que después del bloque verdadero no se ejecute también el falso:</p>
<pre><code>         código de B
B.true:  código de S1
         goto S.siguiente     ← saltea el else
B.false: código de S2
S.siguiente: ...</code></pre>

<h3>while (B) S1 — el ciclo con el salto hacia atrás</h3>
<p>Hay una etiqueta <code>inicio</code> antes de la condición. Si <code>B</code> es falsa, sale (<code>B.false = S.siguiente</code>). Al final del cuerpo, un <code>goto inicio</code> vuelve a <b>reevaluar la condición</b>:</p>
<pre><code>inicio:  código de B
B.true:  código de S1
         goto inicio          ← salto hacia atrás, reevalúa B
S.siguiente: ...              (acá cae B.false, la salida)</code></pre>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Tres atributos: <code>B.true</code> (salto si verdadera), <code>B.false</code> (salto si falsa), <code>S.siguiente</code> (lo que va después de <code>S</code>).</li>
<li><b>if</b>: <code>B.true</code> al inicio de <code>S1</code>, <code>B.false = S.siguiente</code>.</li>
<li><b>if-else</b>: además un <code>goto S.siguiente</code> al final de <code>S1</code> para <b>saltear el else</b>.</li>
<li><b>while</b>: etiqueta <code>inicio</code> antes de <code>B</code>, salida por <code>B.false</code>, y <code>goto inicio</code> al final del cuerpo (salto hacia atrás).</li>
</ul>`,
    qa:[
      {q:"En la traducción de un while con etiquetas, ¿a dónde salta la condición si es falsa y a dónde el final del cuerpo?",
       a:`<p>Si la condición <code>B</code> es <b>falsa</b>, salta a <code>S.siguiente</code>, es decir, <b>sale del bucle</b> (por eso <code>B.false = S.siguiente</code>). El <b>final del cuerpo</b> <code>S1</code> lleva un <code>goto inicio</code> que salta <b>hacia atrás</b>, a la etiqueta que está antes de la condición, para <b>reevaluar <code>B</code></b>. Así se cierra el ciclo: mientras <code>B</code> sea verdadera se ejecuta el cuerpo y se vuelve a la condición; cuando es falsa, se escapa a la instrucción siguiente.</p>`},
      {q:"¿Por qué en la traducción del if-else hace falta un goto que no aparece en el if simple?",
       a:`<p>Porque en el <b>if-else</b>, después de ejecutar el bloque verdadero <code>S1</code> hay que <b>saltar por encima</b> del bloque falso <code>S2</code>: si no, el control "caería" dentro de <code>S2</code> y se ejecutarían <b>los dos</b> bloques. Por eso al final de <code>S1</code> se emite un <code>goto S.siguiente</code> que saltea el else. En el <b>if simple</b> no hace falta, porque no hay bloque falso: si la condición es verdadera se ejecuta <code>S1</code> y el control ya sigue naturalmente en <code>S.siguiente</code>.</p>`},
      {q:"¿Qué representan los atributos B.true, B.false y S.siguiente?",
       a:`<p><code>B.true</code> es la <b>etiqueta a la que salta el control si la condición <code>B</code> es verdadera</b> (normalmente, el inicio del cuerpo). <code>B.false</code> es la <b>etiqueta si <code>B</code> es falsa</b> (en el <code>if</code> simple y el <code>while</code> es la salida; en el <code>if-else</code>, el inicio del else). <code>S.siguiente</code> es la <b>etiqueta de la instrucción que va justo después de la sentencia <code>S</code></b>. Con estos tres atributos se arma todo el ruteo de saltos de las estructuras de control, dejando el destino de cada salto ligado a la etiqueta correcta.</p>`}
    ]
  },
  {
    id:"11.3", titulo:"Backpatching formal: makelist, merge, backpatch", aho:"§6.7.1–6.7.3 · p.410", badges:["📘"], estado:"dictada",
    html:`
<p>📘 <b>de Aho, el nombre "oficial" de lo que hace la cátedra.</b> El problema que resuelve el <b>backpatching</b> (parcheo de retroceso) es el corazón de todo el módulo, y es idéntico al de la pila de celdas.</p>

<h3>El problema: generar en una sola pasada</h3>
<p>Cuando generás código en <b>una sola pasada</b> (leés el programa una vez y vas emitiendo), al llegar a un <code>if (B) S</code> tenés que emitir el salto "si <code>B</code> es falsa, saltear <code>S</code>" <b>antes</b> de haber visto <code>S</code>. Y ahí está el drama: <b>todavía no sabés a qué dirección saltar</b>, porque el destino está más adelante y aún no lo generaste.</p>

<h3>La analogía del formulario con espacios en blanco</h3>
<p>Es como llenar un formulario donde una pregunta dice "ver respuesta en la línea ___" pero esa línea todavía no la escribiste. La solución obvia: <b>dejás el espacio en blanco</b>, anotás en un papelito "tengo que completar el hueco de la línea 5", y cuando por fin sabés el número, volvés y <b>rellenás todos los huecos anotados</b>. Eso es exactamente el backpatching: emitís el salto con el destino <b>en blanco</b>, guardás su posición en una <b>lista</b>, y cuando conocés el destino, <b>parcheás</b> toda la lista de una.</p>

<h3>Las tres operaciones (los nombres van al parcial)</h3>
<ul>
<li><b>makelist(i)</b> (crearLista): crea una lista nueva que contiene una sola posición <code>i</code> — el índice de un salto incompleto. Devuelve un puntero a esa lista.</li>
<li><b>merge(p1, p2)</b> (combinar): concatena las dos listas <code>p1</code> y <code>p2</code> en una sola. Se usa cuando <b>varios saltos van a ir al mismo destino</b>.</li>
<li><b>backpatch(p, i)</b>: rellena con la dirección <code>i</code> el destino de <b>todas</b> las instrucciones de la lista <code>p</code>. Es el momento en que se completan los huecos.</li>
</ul>

<h3>Cómo lo usa Aho: truelist y falselist</h3>
<p>Aho le pone a cada booleana <code>B</code> dos atributos sintetizados: <code>B.truelist</code> (los saltos que hay que rellenar con "a dónde ir si <code>B</code> es verdadera") y <code>B.falselist</code> (ídem para el caso falso). Mientras genera código, los saltos quedan incompletos, en esas listas. Y cada sentencia <code>S</code> tiene una <code>S.nextlist</code> con los saltos a "lo que sigue después de <code>S</code>".</p>
<p>Ejemplo del propio Aho para <code>x &lt; 100 || x &gt; 200 &amp;&amp; x != y</code>: emite pares "if... goto _" / "goto _" con los destinos en blanco (instrucciones 100 a 105), y a medida que reduce por las reglas va llamando a <code>backpatch</code> para completar los que ya puede. Los que quedan abiertos se rellenan más adelante, cuando se sabe qué hacer si la condición es verdadera o falsa.</p>

<div class="callout aho"><span class="lab">📘 esto ES la pila de celdas de la cátedra</span>
Cambiá "lista de saltos" por "número de celda apilado" y tenés la versión de la cátedra (11.4). <code>makelist</code> ≈ apilar la celda del salto en blanco; <code>backpatch</code> ≈ desapilar y escribir el destino en esa celda; <code>merge</code> ≈ cuando varios saltos comparten destino. En el parcial de la cátedra se usa la pila; el vocabulario de Aho (truelist/falselist, makelist/merge/backpatch) es el "nombre formal" del mismo mecanismo.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>El <b>backpatching</b> resuelve que, en generación de <b>una pasada</b>, los saltos hacia adelante se emiten <b>antes</b> de conocer su destino.</li>
<li>Se emite el salto con el destino <b>en blanco</b>, se guarda su posición en una <b>lista</b>, y se rellena después.</li>
<li>Tres operaciones: <b>makelist(i)</b> (lista con un salto), <b>merge(p1,p2)</b> (unir listas al mismo destino), <b>backpatch(p,i)</b> (rellenar toda la lista con la dirección).</li>
<li>Aho usa <b>truelist</b> / <b>falselist</b>. 📘 Es exactamente la <b>pila de celdas</b> de la cátedra con otro nombre.</li>
</ul>`,
    qa:[
      {q:"¿Qué problema resuelve el backpatching y con qué tres operaciones?",
       a:`<p>Resuelve que, al generar código en <b>una sola pasada</b>, los <b>saltos hacia adelante</b> se tienen que emitir <b>antes</b> de conocer su dirección de destino (que está más adelante y todavía no se generó). La solución: emitir el salto con el destino <b>en blanco</b> y completarlo después. Las tres operaciones son <b>makelist(i)</b> (crea una lista con la posición <code>i</code> de un salto incompleto), <b>merge(p1, p2)</b> (une dos listas de saltos que irán al mismo destino) y <b>backpatch(p, i)</b> (rellena con la dirección <code>i</code> el destino de todas las instrucciones de la lista <code>p</code>). Aho maneja las condiciones con dos listas por booleana: <code>truelist</code> y <code>falselist</code>.</p>`},
      {q:"¿Por qué en generación de una sola pasada no se puede escribir el destino del salto en el momento de emitirlo?",
       a:`<p>Porque en <b>una pasada</b> el compilador lee el programa <b>una sola vez</b> y va emitiendo código sobre la marcha. Cuando llega a un <code>if (B) S</code>, tiene que emitir el salto "si <code>B</code> es falsa, saltear <code>S</code>" <b>antes</b> de haber procesado <code>S</code>, así que la dirección a la que hay que saltar (lo que viene <b>después</b> de <code>S</code>) <b>todavía no existe</b>: aún no se generó ese código. Por eso el destino se deja en blanco, se anota la posición del salto en una lista, y se parchea (backpatch) recién cuando el destino se conoce.</p>`},
      {q:"¿Qué relación hay entre el backpatching de Aho y la «pila de celdas» de la cátedra?",
       a:`<p>Son <b>el mismo mecanismo</b> con distinta implementación y distinto nombre. Aho usa <b>listas de saltos</b> (truelist/falselist) y las operaciones makelist/merge/backpatch; la cátedra usa una <b>pila de números de celda</b>. La correspondencia: <b>makelist</b> ≈ apilar la celda del salto que quedó en blanco; <b>backpatch</b> ≈ desapilar esa celda y escribirle el destino ya conocido; <b>merge</b> ≈ el caso en que varios saltos comparten destino. En el parcial se resuelve con la pila; el vocabulario formal de Aho es simplemente cómo se llama "por afuera" a lo que la cátedra hace apilando y desapilando celdas.</p>`}
    ]
  },
  {
    id:"11.4", titulo:"La versión de la cátedra: pila de celdas, BF/BI", aho:"Apunte", badges:["🎯"], estado:"dictada",
    html:`
<p>🎯 <b>El corazón del tema en el parcial.</b> La cátedra hace backpatching con una <b>pila de números de celda</b>. La polaca se escribe en celdas <b>numeradas</b> (11, 12, 13...) porque los saltos referencian números de celda; los saltos condicionales e incondicionales dejan un <b>hueco</b> (el destino en blanco) que se rellena más tarde desapilando.</p>

<h3>Dos marcadores de salto: BF y BI</h3>
<ul>
<li><b>BF = branch if false</b> (salto por falso): salta al destino <b>si la condición fue falsa</b>. Es el que saca del <code>if</code> o del <code>while</code> cuando la condición no se cumple.</li>
<li><b>BI = branch incondicional</b>: salta <b>siempre</b>. Es el que saltea el <code>else</code> y el que vuelve al inicio del <code>while</code>.</li>
</ul>
<p>Convención que uso acá: en la celda del <code>BF</code>/<code>BI</code> queda el <b>hueco del destino</b>; "la celda actual" es el número de la próxima celda libre. Al fin de la condición se <b>apila</b> la celda del salto en blanco; al cerrar el bloque se <b>desapila</b> y se escribe el destino en esa celda.</p>

<h3>IF sin else — el patrón base (ejemplo completo)</h3>
<p>Programa: <code>if a &lt; 3 then b := c + 1 endif</code>. La polaca, celda por celda:</p>
<pre><code>celda  contenido
 1     a
 2     3
 3     CMP            (compara por diferencia: a - 3)
 4     BF  _          ← FIN DE CONDICIÓN: apilar 4     Pila: [4]
 5     c
 6     1
 7     +
 8     b
 9     :=
                      ← FIN DEL VERDADERO: celda actual = 10
                        desapilar 4, escribir 10 en la celda 4     Pila: [ ]
10     ...siguiente</code></pre>
<p>Resultado: la celda 4 queda como <code>BF 10</code>. Si <code>a &lt; 3</code> es falso, saltea el bloque verdadero (celdas 5–9) y cae en la 10.</p>
<div class="callout tgt"><span class="lab">🎯 la regla del IF sin else, tal cual va</span>
<b>Fin de condición</b>: apilar el número de celda actual (la del <code>BF</code> en blanco).<br>
<b>Fin del bloque verdadero</b>: desapilar X (el tope) y escribir en la celda X el número de la <b>celda actual</b>.</div>

<h3>IF con else — dos huecos</h3>
<p>Ahora hay que ubicar el <code>else</code> y, al final del verdadero, un <code>BI</code> que lo saltee. Las reglas de la cátedra:</p>
<div class="callout tgt"><span class="lab">🎯 la regla del IF con else</span>
<b>Fin de condición</b>: apilar la celda actual (el <code>BF</code>).<br>
<b>Fin del bloque verdadero</b>: desapilar X, escribir en X el número de <b>celda actual + 1</b>, y <b>apilar</b> la celda actual (el <code>BI</code> que saltea el else).<br>
<b>Fin del bloque falso</b>: desapilar X y escribir en X el número de <b>celda actual + 1</b>.</div>
<p>El "+1" está porque el <code>BF</code> (por falso) tiene que saltar <b>por encima</b> del <code>BI</code> para caer en el else, y el <code>BI</code> tiene que saltar por encima del bloque falso. Los dos huecos se apilan y se rellenan en orden.</p>

<h3>WHILE — apila dos veces</h3>
<p>El <code>while</code> necesita <b>dos</b> direcciones: a dónde <b>volver</b> (el inicio, para reevaluar) y por dónde <b>salir</b> (si la condición es falsa). Por eso apila al comienzo y al fin de condición:</p>
<div class="callout tgt"><span class="lab">🎯 la regla del WHILE</span>
<b>Comienzo</b>: apilar la celda actual (a dónde volver).<br>
<b>Fin de condición</b>: apilar la celda actual (el <code>BF</code> de salida).<br>
<b>Fin del ciclo</b>: desapilar Z y escribir en Z el número de <b>celda actual + 1</b>; desapilar Z otra vez y escribir Z en la <b>celda actual</b> (el <code>BI</code> de salto hacia atrás).</div>
<p>Ejemplo del apunte: <code>while a * 3 - 7 &lt;= b * 4 { a := a + 2 }</code>. Lo resolvemos numerado en la lección 11.6.</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>La polaca se escribe en <b>celdas numeradas</b>; los saltos <b>BF</b> (branch if false) y <b>BI</b> (branch incondicional) dejan un <b>hueco</b> que se rellena desapilando.</li>
<li>🎯 <b>IF sin else</b>: fin de condición → apilar celda actual; fin del verdadero → desapilar X, escribir en X la celda actual.</li>
<li>🎯 <b>IF con else</b>: fin verdadero → desapilar X, escribir celda actual+1, apilar celda actual (el BI); fin del falso → desapilar X, escribir celda actual+1.</li>
<li>🎯 <b>WHILE</b>: apilar al comienzo y al fin de condición; al fin del ciclo desapilar dos veces (salida = celda actual+1; y BI hacia atrás en la celda actual).</li>
</ul>`,
    qa:[
      {q:"En un IF sin else en polaca, ¿qué se apila al fin de la condición y qué se hace al fin del bloque verdadero?",
       a:`<p>Al <b>fin de la condición</b> se <b>apila el número de la celda actual</b>: la celda donde quedó el <code>BF</code> (branch if false) con el destino en blanco. Al <b>fin del bloque verdadero</b> se <b>desapila</b> esa celda X (el tope de la pila) y se <b>escribe en la celda X el número de la celda actual</b> (la próxima celda libre, que es la primera después del bloque verdadero). Así el <code>BF</code> queda completo: si la condición fue falsa, salta por encima del bloque verdadero y cae en la instrucción siguiente. Ejemplo: en <code>if a&lt;3 then b:=c+1 endif</code>, se apila la celda del BF y al cerrar se le escribe la celda de "lo que sigue".</p>`},
      {q:"¿Qué son BF y BI, y en qué se diferencian?",
       a:`<p><b>BF</b> es "branch if false" (salto por falso): salta a su destino <b>solo si la condición resultó falsa</b>. Es el salto que saca del <code>if</code> (saltea el bloque verdadero) o que sale del <code>while</code> cuando la condición no se cumple. <b>BI</b> es "branch incondicional": salta <b>siempre</b>, sin condición. Se usa en dos lugares: para <b>saltear el else</b> al final del bloque verdadero de un <code>if-else</code>, y para <b>volver al inicio</b> del <code>while</code> y reevaluar la condición (salto hacia atrás). En resumen: el <code>BF</code> depende de la comparación; el <code>BI</code> es un salto fijo.</p>`},
      {q:"¿Por qué el while apila dos veces (al comienzo y al fin de la condición)?",
       a:`<p>Porque un <code>while</code> necesita recordar <b>dos direcciones</b> distintas, y las dos son huecos que se rellenan al final. La primera, apilada <b>al comienzo</b>, es <b>a dónde volver</b>: el inicio del código de la condición, para reevaluarla en cada iteración (el destino del <code>BI</code> hacia atrás). La segunda, apilada <b>al fin de la condición</b>, es el <b>hueco del <code>BF</code> de salida</b>: a dónde saltar cuando la condición es falsa. Al <b>fin del ciclo</b> se desapilan las dos: primero se completa la salida (celda actual + 1) y después se escribe el salto hacia atrás en la celda del <code>BI</code>. Con una sola dirección no alcanzaría.</p>`},
      {q:"En el IF con else, ¿por qué al fin del bloque verdadero se escribe «celda actual + 1» y no «celda actual»?",
       a:`<p>Porque al final del bloque verdadero de un <code>if-else</code> se emite un <b>BI</b> que debe <b>saltear el else</b>. El <code>BF</code> (por falso) que había quedado pendiente tiene que llevar el control al <b>inicio del bloque falso</b>, pero justo antes del else está ese <code>BI</code>. Entonces el destino del <code>BF</code> no es la "celda actual" (donde va el <code>BI</code>) sino <b>una más adelante</b>: <b>celda actual + 1</b>, que es donde arranca realmente el else, salteando la celda del <code>BI</code>. Por eso también, en el mismo paso, se <b>apila</b> la celda del <code>BI</code> para completarla al fin del bloque falso.</p>`}
    ]
  },
  {
    id:"11.5", titulo:"Comparaciones por diferencia; anidamiento; por qué una pila", aho:"Apunte", badges:["🎯"], estado:"dictada",
    html:`
<p>🎯 Dos preguntas conceptuales que caen seguido: <b>cómo se compara</b> en el código intermedio/Assembler, y <b>por qué se usa una pila</b> y no una simple variable para los saltos pendientes.</p>

<h3>Las comparaciones se hacen por diferencia</h3>
<p>En Assembler no hay un "¿es menor?" directo que devuelva verdadero/falso: se <b>resta</b> y se mira el <b>signo</b> del resultado. Para una condición <code>LI rel LD</code> (LI = lado izquierdo, LD = lado derecho), se calcula la <b>diferencia</b> y se decide según el signo. La cátedra lo enuncia así, tal cual:</p>
<div class="callout tgt"><span class="lab">🎯 la regla, textual</span>
Para <code>LI &lt; LD</code>:<br>
<b>LI - LD &lt; 0 → bloque verdadero</b> (se cumple, entra al cuerpo).<br>
<b>LD - LI &gt;= 0 → fin del if</b> (no se cumple, el <code>BF</code> salta a la salida).</div>
<p>La analogía: comparar por diferencia es como pesar dos cosas en una <b>balanza</b> y mirar para qué lado se inclina. No te dice "A es más pesado" con palabras; te da el <b>signo</b> de la diferencia, y de ese signo deducís la relación. Por eso el <code>CMP</code> calcula <code>LI - LD</code> y el <code>BF</code> mira el signo para decidir si salta.</p>
<p>(En el coprocesador esto se hace con <code>FCOMP</code>, que deja el resultado en los bits de estado, y después <code>FSTSW AX</code> + <code>SAHF</code> para que la CPU pueda leerlo — eso es del módulo de Assembler.)</p>

<h3>Por qué una pila y no una variable (el anidamiento)</h3>
<p>Esta es <b>la</b> pregunta del tema. Si nunca hubiera estructuras adentro de otras, con una sola <b>variable</b> que guardara "el salto pendiente" alcanzaría. Pero las sentencias de control se <b>anidan</b>: un <code>if</code> adentro de un <code>while</code> adentro de otro <code>if</code>. En el momento en que entrás al <code>if</code> interno, todavía tenés <b>saltos pendientes</b> del <code>while</code> y del <code>if</code> externo sin rellenar.</p>
<div class="callout tgt"><span class="lab">🎯 la respuesta que esperan</span>
Se usa una <b>pila</b> (y no una variable) <b>por el anidamiento</b>. Una sola variable se <b>pisaría</b>: al guardar el hueco de la estructura interna, perderías el de la externa. La pila guarda <b>todos</b> los huecos pendientes en orden <b>LIFO</b>, y los va rellenando en el orden correcto: <b>primero se cierra la estructura más interna</b> (la última que se abrió), que es justo el tope de la pila.</div>
<p>El orden LIFO no es casualidad: en estructuras bien anidadas, la última que <b>abrís</b> es la primera que <b>cerrás</b> — exactamente el comportamiento de una pila. Por eso desapilás el tope y siempre te toca el salto de la estructura que estás por cerrar.</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>🎯 Las comparaciones se hacen <b>por diferencia</b>: <code>LI - LD &lt; 0</code> → bloque verdadero; <code>LD - LI &gt;= 0</code> → fin del if (salta el <code>BF</code>).</li>
<li>El <code>CMP</code> calcula la resta y el <code>BF</code> decide mirando el <b>signo</b>.</li>
<li>🎯 Se usa una <b>pila</b> y no una variable <b>por el anidamiento</b>: una variable se pisaría; la pila guarda todos los huecos pendientes.</li>
<li>El orden <b>LIFO</b> encaja con el anidamiento: la última estructura abierta es la primera que se cierra (el tope).</li>
</ul>`,
    qa:[
      {q:"¿Cómo se traducen las comparaciones y por qué se dice que se hacen «por diferencia»?",
       a:`<p>Porque en Assembler no hay una operación que devuelva directamente verdadero/falso: se <b>resta</b> un operando del otro y se mira el <b>signo</b> del resultado. Para una condición <code>LI &lt; LD</code> (LI izquierdo, LD derecho): si <b><code>LI - LD &lt; 0</code></b> la condición se cumple y entra al <b>bloque verdadero</b>; si <b><code>LD - LI &gt;= 0</code></b> no se cumple y el <code>BF</code> salta al <b>fin del if</b>. Concretamente, la instrucción <code>CMP</code> calcula la diferencia y el salto condicional <code>BF</code> decide según el signo. Es como una balanza: no te dice el resultado con palabras, te da el signo de la diferencia y de ahí se deduce la relación.</p>`},
      {q:"¿Por qué el relleno con retroceso usa una pila y no una simple variable?",
       a:`<p>Por el <b>anidamiento</b> de las sentencias de control. Si nunca hubiera estructuras dentro de otras, una sola <b>variable</b> con "el salto pendiente" bastaría. Pero puede haber un <code>if</code> dentro de un <code>while</code> dentro de otro <code>if</code>: al entrar a la estructura interna, todavía hay saltos <b>sin rellenar</b> de las externas. Una sola variable se <b>pisaría</b> (perderías el hueco externo al guardar el interno). La <b>pila</b> guarda <b>todos</b> los huecos pendientes en orden <b>LIFO</b> y los rellena en el orden correcto: como la última estructura que se abre es la primera que se cierra, el hueco que hay que completar siempre está en el <b>tope</b>.</p>`},
      {q:"¿Por qué el orden LIFO de la pila encaja justo con las estructuras de control anidadas?",
       a:`<p>Porque las estructuras bien anidadas cumplen exactamente la regla de una pila: la <b>última</b> estructura que se <b>abre</b> es la <b>primera</b> que se <b>cierra</b>. Si tenés un <code>if</code> externo que contiene un <code>while</code> que contiene un <code>if</code> interno, cerrás primero el <code>if</code> interno, después el <code>while</code>, y por último el <code>if</code> externo — el orden inverso al de apertura. Una pila (LIFO: last in, first out) entrega siempre el <b>tope</b>, que es el hueco de la estructura más interna, justo la que estás por cerrar. Por eso al desapilar siempre te toca el salto correcto, sin mezclar niveles.</p>`}
    ]
  },
  {
    id:"11.6", titulo:"Taller: if-else anidado + while (Mínimo, Selección, Predecessor)", aho:"Práctica 5", badges:["⚙️","🎯"], estado:"dictada",
    html:`
<p>⚙️🎯 Taller de la Práctica 5. Acá se junta todo 11.4 y 11.5: traducir a polaca estructuras <b>anidadas</b>, numerando las celdas y mostrando <b>el estado de la pila en cada punto de relleno</b>. La cátedra usa comandos como <code>Mínimo</code>, <code>Selección</code> y <code>Predecessor</code>; el método es siempre el mismo.</p>

<div class="callout tgt"><span class="lab">🎯 lo que NO hay que olvidar mostrar</span>
En el parcial no alcanza con la polaca final: hay que mostrar la <b>numeración de celdas</b> y el <b>estado de la pila</b> en cada punto clave (comienzo, fin de condición, fin de bloque), indicando <b>qué se apila</b> y <b>qué celda se rellena</b> con qué destino. Así queda demostrado el backpatching, no solo el resultado.</p></div>

<h3>Ejemplo 1: WHILE simple, numerado y con pila</h3>
<p>Programa: <code>while a &lt; b { a := a + 1 }</code>.</p>
<pre><code>celda  contenido        acción / pila
                        COMIENZO: apilar 1        Pila: [1]
 1     a
 2     b
 3     CMP
 4     BF  _            FIN DE CONDICIÓN: apilar 4  Pila: [1, 4]
 5     a
 6     1
 7     +
 8     a
 9     :=
                        FIN DEL CICLO (celda actual = 10):
                          desapilar 4  → celda 4 = 10+1 = 11   Pila: [1]
                          desapilar 1  → celda 10 = 1          Pila: [ ]
10     BI  1            (salto hacia atrás: vuelve a reevaluar)
11     ...siguiente</code></pre>
<p>Queda: celda 4 = <code>BF 11</code> (si <code>a &lt; b</code> es falso, sale a la 11) y celda 10 = <code>BI 1</code> (vuelve a la condición). Comprobá la regla del while: salida = celda actual + 1; el <code>BI</code> hacia atrás se escribe en la celda actual.</p>

<h3>Ejemplo 2: WHILE con un IF adentro (anidamiento, dos huecos vivos)</h3>
<p>Programa: <code>while a &lt; b { if c &lt; d then x := 1 endif }</code>. Acá se ve por qué hace falta la pila:</p>
<pre><code>celda  contenido        acción / pila
                        COMIENZO: apilar 1          Pila: [1]
 1     a
 2     b
 3     CMP
 4     BF  _            FIN COND. WHILE: apilar 4    Pila: [1, 4]
 5     c
 6     d
 7     CMP
 8     BF  _            FIN COND. IF: apilar 8       Pila: [1, 4, 8]
 9     x
10     1
11     :=
                        FIN DEL VERDADERO (if), celda actual = 12:
                          desapilar 8 → celda 8 = 12   Pila: [1, 4]
                        FIN DEL CICLO (while), celda actual = 12:
                          desapilar 4 → celda 4 = 12+1 = 13   Pila: [1]
                          desapilar 1 → celda 12 = 1          Pila: [ ]
12     BI  1            (vuelve a la condición del while)
13     ...siguiente</code></pre>
<p>Mirá el momento clave: en la celda 8 la pila tenía <b>tres</b> huecos vivos, <code>[1, 4, 8]</code>. Se rellenan en orden <b>LIFO</b>: primero el <code>if</code> interno (celda 8 → 12), después el <code>BF</code> de salida del <code>while</code> (celda 4 → 13) y por último el salto hacia atrás (celda 12 → 1). Los destinos son <b>distintos</b> (12, 13, 1): por eso una sola variable no alcanzaría y hace falta la <b>pila</b>.</p>

<h3>Cómo encarar el IF con else anidado</h3>
<p>Si en vez del <code>if</code> simple hubiera un <code>if-else</code>, al fin del bloque verdadero se agrega un <code>BI</code> que saltea el else, y se apila su celda (regla de 11.4). El resto es igual: numerás, y en cada fin de bloque desapilás el tope y rellenás. Comandos típicos de la cátedra para practicar esto: <code>Mínimo</code> (compara dos y se queda con el menor → <code>if-else</code>), <code>Selección</code> y <code>Predecessor</code>.</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Traducir anidados = numerar celdas + aplicar las reglas de apilar/desapilar de 11.4 en cada punto.</li>
<li>🎯 Siempre mostrar el <b>estado de la pila</b> y <b>qué celda se rellena</b> con qué destino, no solo la polaca final.</li>
<li>En el <b>while con if adentro</b>, la pila llega a tener <b>3 huecos</b> vivos y se rellenan en <b>LIFO</b> (interno primero).</li>
<li>El <b>if-else</b> anidado agrega el <code>BI</code> que saltea el else (se apila su celda). Comandos: <b>Mínimo</b>, <b>Selección</b>, <b>Predecessor</b>.</li>
</ul>`,
    qa:[
      {q:"Al traducir estructuras anidadas a polaca, ¿qué hay que mostrar además del resultado para no perder puntos?",
       a:`<p>Hay que mostrar la <b>numeración de las celdas</b> y el <b>estado de la pila</b> en cada punto clave (comienzo, fin de condición, fin de cada bloque), indicando explícitamente <b>qué se apila</b> y, al cerrar cada estructura, <b>qué celda se desapila y con qué destino se rellena</b>. Es lo que demuestra que el <b>backpatching</b> se hizo bien: la cátedra evalúa el <b>procedimiento</b>, no solo la polaca final. Mostrar solo el resultado deja sin justificar cómo se resolvieron los saltos, que es justamente lo que se está evaluando.</p>`},
      {q:"En un while que contiene un if, ¿cuántos huecos llega a tener la pila y en qué orden se rellenan?",
       a:`<p>Llega a tener <b>tres huecos vivos</b> en el punto más profundo: el de "a dónde volver" del while (apilado al comienzo), el del <code>BF</code> de salida del while (apilado al fin de su condición) y el del <code>BF</code> del if interno (apilado al fin de su condición). Se rellenan en orden <b>LIFO</b>: primero el <b>if interno</b> (el tope, la última estructura abierta), después el <code>BF</code> de salida del while, y por último el salto hacia atrás del while. Como los tres destinos son distintos, este caso muestra por qué hace falta una <b>pila</b> y no una variable: una variable se pisaría y perdería los huecos externos.</p>`},
      {q:"Resolvé la polaca de «while a < b { a := a + 1 }» indicando el estado de la pila.",
       a:`<p>Se apila al comienzo (celda 1, a dónde volver): Pila [1]. Se emite la condición en las celdas 1 (<code>a</code>), 2 (<code>b</code>), 3 (<code>CMP</code>) y 4 (<code>BF _</code>); al <b>fin de condición</b> se apila la celda del <code>BF</code>: Pila [1, 4]. El cuerpo va en 5–9 (<code>a</code>, <code>1</code>, <code>+</code>, <code>a</code>, <code>:=</code>). Al <b>fin del ciclo</b> (celda actual = 10) se desapila 4 y se escribe en la celda 4 el valor "celda actual + 1" = 11 (salida del <code>BF</code>), quedando Pila [1]; después se desapila 1 y se escribe en la celda actual (10) ese valor 1, dejando <code>BI 1</code>. Resultado: celda 4 = <code>BF 11</code> (si <code>a&lt;b</code> es falso, sale a la 11), celda 10 = <code>BI 1</code> (vuelve a reevaluar), Pila vacía.</p>`}
    ]
  },
  {
    id:"11.7", titulo:"Instrucciones switch", aho:"§6.8 · p.418", badges:["📘"], estado:"dictada",
    html:`
<p>📘 <b>de Aho.</b> El <code>switch</code> (o <code>case</code>) es una <b>bifurcación de n vías</b>: se evalúa una expresión selectora y, según su valor, se ejecuta uno de varios bloques. Es un buen cierre del módulo porque muestra cómo una misma estructura se puede traducir de varias formas según convenga.</p>

<h3>Qué tiene que hacer la traducción</h3>
<ol>
<li><b>Evaluar</b> la expresión selectora <code>E</code> y guardarla en un temporal <code>t</code>.</li>
<li><b>Buscar</b> en la lista de casos el valor <code>Vj</code> igual a <code>t</code> (el <code>default</code> coincide si ninguno matchea).</li>
<li><b>Ejecutar</b> la instrucción <code>Sj</code> asociada a ese valor.</li>
</ol>

<h3>La analogía del portero con lista</h3>
<p>El paso 2 es una <b>bifurcación de n vías</b>, y hay varias formas de implementarla, como un portero que tiene que mandar a cada persona a una sala distinta según un número:</p>
<ul>
<li><b>Pocos casos (hasta ~10): cadena de comparaciones.</b> El portero pregunta uno por uno: "¿sos el 1? ¿el 2?...". Son saltos condicionales encadenados. Simple, pero <b>lineal</b> (en el peor caso mira todos).</li>
<li><b>Muchos casos (&gt;10): tabla de hash.</b> Una tabla que mapea valor → etiqueta; si no está, va al <code>default</code>.</li>
<li><b>Valores en un rango chico y denso: tabla de saltos.</b> Un arreglo de "baldes" indexado por <code>valor - mínimo</code>: se calcula el índice y se salta <b>directo</b> (O(1)), sin comparar. Es lo más eficiente cuando los valores están juntos (por ejemplo, un <code>char</code>).</li>
</ul>

<h3>Cómo lo arma la traducción dirigida por sintaxis</h3>
<p>Aho pone <b>todas las pruebas al final</b>. Al ver <code>switch</code> genera dos etiquetas (<code>prueba</code> y <code>siguiente</code>) y un temporal <code>t</code>; evalúa <code>E</code> en <code>t</code> y emite <code>goto prueba</code>. Por cada <code>case Vi: Si</code> emite la etiqueta <code>Li</code>, el código de <code>Si</code> y un <code>goto siguiente</code>, y guarda el par <code>(Vi, Li)</code> en una cola. Al final, en la etiqueta <code>prueba</code>, vuelca la cola como una serie de instrucciones:</p>
<pre><code>       código para evaluar E en t
       goto prueba
L1:    código de S1
       goto siguiente
L2:    código de S2
       goto siguiente
       ...
prueba: case t V1 L1
        case t V2 L2
        ...
        case t Vn-1 Ln-1
        goto Ln            (default)
siguiente: ...</code></pre>
<p>La instrucción <code>case t Vi Li</code> es un sinónimo de <code>if t = Vi goto Li</code>, pero se escribe como <code>case</code> a propósito: así el <b>generador de código final la reconoce</b> como una bifurcación de n vías y elige la mejor implementación (cadena, hash o tabla de saltos).</p>

<div class="callout aho"><span class="lab">📘 por qué las pruebas van al final (y no al principio)</span>
En un compilador de <b>una sola pasada</b> no conviene poner la bifurcación arriba, porque en ese momento el compilador <b>todavía no vio</b> el código de cada <code>Si</code> ni conoce sus etiquetas. Poniendo el código de cada caso primero (a medida que lo lee) y las pruebas al final (cuando ya tiene todos los pares valor-etiqueta), todo sale en una pasada. Es la misma lógica de "generar y parchear después" del backpatching.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>El <code>switch</code> es una <b>bifurcación de n vías</b>: evaluar <code>E</code> en <code>t</code>, buscar el caso igual, ejecutar su bloque (el <code>default</code> matchea si ninguno lo hace).</li>
<li>Tres implementaciones: <b>cadena de comparaciones</b> (pocos casos), <b>tabla de hash</b> (muchos), <b>tabla de saltos</b> (rango chico y denso → O(1)).</li>
<li>La traducción pone el <b>código de cada caso primero</b> y <b>todas las pruebas al final</b>, para poder generar en <b>una pasada</b>.</li>
<li><code>case t Vi Li</code> = <code>if t = Vi goto Li</code>, escrito así para que el generador final elija la implementación más eficiente.</li>
</ul>`,
    qa:[
      {q:"¿De qué dos (o tres) formas se puede traducir un switch y cuándo conviene cada una?",
       a:`<p>La bifurcación de n vías se puede implementar de tres formas. (1) <b>Cadena de saltos condicionales</b> (if-else encadenados que comparan <code>t</code> con cada valor): simple, conviene con <b>pocos casos</b> (hasta ~10), pero es <b>lineal</b>. (2) <b>Tabla de hash</b> valor→etiqueta: conviene con <b>muchos casos</b> (más de ~10), y si el valor no está, salta al <code>default</code>. (3) <b>Tabla de saltos</b> (un arreglo de "baldes" indexado por <code>valor - mínimo</code>): conviene cuando los valores caen en un <b>rango chico y denso</b>, porque permite saltar <b>directo</b> al caso correcto en O(1) sin comparar, indexando el arreglo. La elección depende de cuántos casos hay y de cómo están distribuidos los valores.</p>`},
      {q:"¿Por qué la traducción del switch pone el código de los casos primero y las pruebas al final?",
       a:`<p>Para poder generar en <b>una sola pasada</b>. Si la bifurcación se pusiera al principio, el compilador tendría que saltar a las etiquetas de cada bloque <code>Si</code> <b>antes</b> de haberlos leído, y en ese momento <b>no conoce ni el código ni las etiquetas</b>. En cambio, emitiendo el código de cada caso <b>a medida que lo lee</b> (y guardando cada par valor-etiqueta en una cola), al llegar al final ya tiene <b>todos</b> los pares y puede volcar la serie de pruebas <code>case t Vi Li</code>. Es la misma idea de "generar ahora, resolver los saltos después" del backpatching.</p>`},
      {q:"¿Qué es la instrucción «case t Vi Li» y por qué se escribe así en vez de un if?",
       a:`<p>La instrucción <code>case t Vi Li</code> es un <b>sinónimo</b> de <code>if t = Vi goto Li</code>: si el valor de la expresión selectora (guardado en <code>t</code>) es igual a <code>Vi</code>, salta a la etiqueta <code>Li</code> del caso correspondiente. Se escribe como <code>case</code> a propósito para que el <b>generador de código final la reconozca</b> fácilmente como parte de una <b>bifurcación de n vías</b>, y así pueda elegir la implementación más eficiente según cuántos casos haya y cómo estén distribuidos (cadena de comparaciones, tabla de hash o tabla de saltos). Con un <code>if</code> común, esa intención se perdería entre las demás instrucciones.</p>`}
    ]
  }
]});
