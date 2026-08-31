M.push({ id:1, titulo:"Analizador léxico", parcial:"I",
  resumen:"Qué hace el léxico, por qué se separa del sintáctico, la tríada token/patrón/lexema, los atributos y la tabla de símbolos, los errores léxicos y el búfer de entrada.",
  lecciones:[
  {
    id:"1.1", titulo:"La función del analizador léxico y por qué se separa", aho:"§3.1.1 · p.110", badges:["🎯"], estado:"dictada",
    html:`
<p>El <b>analizador léxico (AL)</b> es la primera fase del compilador. Su trabajo es leer el programa fuente como un <b>chorro de caracteres</b> y agruparlos en piezas con significado propio, los <b>tokens</b>. Todo lo demás del compilador ya no ve caracteres sueltos: ve tokens.</p>

<h3>La analogía</h3>
<p>Cuando leés esta oración no procesás letra por letra: tu ojo agrupa las letras en palabras de un saque. Si tuvieras que pensar "e-l... el; a-n-a-l-i-z-a-d-o-r... analizador", no llegarías nunca. El AL es ese agrupador: convierte <code>posicion=inicial+velocidad</code> (una tira de caracteres) en las palabras del lenguaje: el identificador <code>posicion</code>, el operador <code>=</code>, el identificador <code>inicial</code>, y así. Le saca al resto del compilador el trabajo sucio de mirar carácter por carácter.</p>

<h3>Qué hace, además de reconocer tokens</h3>
<p>Como es la única fase que toca el texto original, se le cuelgan varias tareas de limpieza y registro:</p>
<ul>
<li><b>Eliminar</b> espacios en blanco, tabulaciones y saltos de línea (no son tokens: no le interesan al sintáctico).</li>
<li><b>Eliminar los comentarios.</b></li>
<li><b>Contar los saltos de línea</b>, para poder decir "error en la línea 42" y correlacionar los mensajes con el fuente.</li>
<li><b>Crear la tabla de símbolos</b> y la base de palabras reservadas.</li>
<li><b>Informar los errores léxicos</b> que pueda (son pocos, lo vemos en 1.4).</li>
<li>Si el lenguaje usa un preprocesador de macros, <b>expandir las macros</b> puede caer también acá (Aho).</li>
</ul>

<div class="callout tgt"><span class="lab">🎯 dato de parcial: quién le pide a quién</span>El AL <b>no</b> recorre todo el programa y entrega una <b>lista</b> de tokens. Devuelve <b>un token cada vez que el analizador sintáctico se lo pide</b> (la llamada que Aho llama <code>obtenerSiguienteToken</code> y que en Flex es <code>yylex()</code>). El que <b>conduce</b> la compilación es el sintáctico: va pidiendo tokens hasta el fin de archivo. El léxico es un empleado que entrega "de a uno, cuando le tocan el timbre".</div>

<h3>Por qué se separa del analizador sintáctico</h3>
<p>Se podría hacer todo junto, pero Aho da tres razones para partirlo:</p>
<ul>
<li><b>Sencillez de diseño</b> (la más importante). Si el sintáctico tuviera que lidiar con blancos y comentarios como si fueran parte de la gramática, sería muchísimo más complejo. Separar deja cada tarea limpia.</li>
<li><b>Eficiencia.</b> El escaneo carácter a carácter admite trucos propios (búferes, centinelas: ver 1.5) que aceleran mucho y no tienen nada que ver con el parsing.</li>
<li><b>Portabilidad.</b> Las rarezas del alfabeto de entrada y de los dispositivos quedan encerradas en el léxico; el resto del compilador no se entera.</li>
</ul>

<div class="callout aho"><span class="lab">📘 el léxico por dentro: dos subprocesos</span>Aho aclara que a veces el AL se parte en cascada: un <b>escaneo</b> tonto (borra comentarios y compacta espacios) y el <b>análisis léxico</b> propiamente dicho (el que arma la secuencia de tokens). Y menciona algo que en el TP vas a usar: en algunos casos el léxico <b>lee de la tabla de símbolos</b> para decidir qué token devolver.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>El AL es la <b>primera fase</b>: caracteres → tokens.</li>
<li>🎯 <b>No devuelve una lista</b>: devuelve un token por pedido del sintáctico, que es el que dirige.</li>
<li>Además de reconocer tokens: <b>elimina</b> blancos y comentarios, <b>cuenta líneas</b>, <b>crea la tabla de símbolos</b> e informa errores léxicos.</li>
<li>Se separa por <b>sencillez</b>, <b>eficiencia</b> y <b>portabilidad</b>.</li>
</ul>`,
    qa:[
      {q:"V/F justificando: «El analizador léxico recorre todo el programa fuente y le entrega al sintáctico la lista completa de tokens.»",
       a:`<p><b>Falso.</b> El AL entrega <b>un token por vez</b>, y solo <b>cuando el analizador sintáctico se lo pide</b> (la llamada <code>obtenerSiguienteToken</code> / <code>yylex()</code>). El que dirige el proceso es el <b>sintáctico</b>: pide tokens de a uno hasta llegar al fin de archivo. La idea de que el léxico arma toda la lista de una y la entrega es la trampa clásica.</p>`},
      {q:"Dá las razones por las que conviene separar el análisis léxico del análisis sintáctico.",
       a:`<p>Aho da tres. (1) <b>Sencillez de diseño</b> (la más importante): el sintáctico no se ensucia con blancos ni comentarios, que ya eliminó el léxico. (2) <b>Eficiencia</b>: el escaneo carácter a carácter usa técnicas propias (búferes) que lo aceleran sin tocar el parser. (3) <b>Portabilidad</b>: las peculiaridades del alfabeto y de los dispositivos de entrada quedan aisladas en el léxico. La justificación que más puntúa es la primera.</p>`},
      {q:"Además de reconocer tokens, ¿qué otras tareas hace el analizador léxico? Nombrá al menos tres.",
       a:`<p>Como es la única fase que lee el texto original, se le asignan tareas de limpieza y registro: <b>eliminar</b> espacios, tabulaciones y saltos de línea; <b>eliminar comentarios</b>; <b>contar los saltos de línea</b> para correlacionar los errores con el fuente (poder decir en qué línea falló); <b>crear la tabla de símbolos</b> y la base de palabras reservadas; e <b>informar los errores léxicos</b>. En lenguajes con macros, también puede <b>expandir</b> el preprocesador.</p>`},
      {q:"¿Quién «conduce» la compilación, el léxico o el sintáctico? Justificá con el mecanismo.",
       a:`<p>La conduce el <b>sintáctico</b>. Mecanismo: el sintáctico está tratando de armar la estructura del programa según la gramática, y cada vez que necesita el siguiente símbolo <b>llama</b> al léxico (<code>obtenerSiguienteToken</code>). El léxico es <b>reactivo</b>: lee caracteres solo hasta formar ese token, lo devuelve y se queda esperando el próximo pedido. Por eso no tiene sentido pensar en "la lista de tokens": el flujo lo marca el sintáctico.</p>`}
    ]
  },
  {
    id:"1.2", titulo:"Token, patrón y lexema", aho:"§3.1.2 · p.111", badges:["🎯"], estado:"dictada",
    html:`
<p>Al hablar del léxico, Aho usa <b>tres</b> palabras que parecen sinónimos pero no lo son. Tenerlas separadas es media materia:</p>
<ul>
<li><b>Token</b>: el <b>nombre de la categoría</b>, un símbolo abstracto. <code>ID</code>, <code>CTE</code>, <code>OP_ASIG</code>, <code>IF</code>. Es lo que el sintáctico usa en sus reglas. (Formalmente, un token es un par: el nombre más un valor de atributo opcional; ver 1.3.)</li>
<li><b>Patrón</b>: la <b>regla que describe la forma</b> de los lexemas de ese token. Casi siempre es una <b>expresión regular</b>. El patrón de <code>ID</code> es "una letra seguida de letras o dígitos".</li>
<li><b>Lexema</b>: la <b>cadena concreta</b> del programa fuente que casó con el patrón. <code>posicion</code>, <code>unlam</code>, <code>Cont1</code> son lexemas del token <code>ID</code>.</li>
</ul>

<h3>La analogía del molde de galletas</h3>
<p>El <b>patrón</b> es el molde con forma de estrella. El <b>token</b> es el nombre de esa clase de galleta: "galleta-estrella". Cada <b>galleta</b> concreta que sacás con el molde es un <b>lexema</b>: todas distintas en el detalle, todas de la misma forma. Un molde, un nombre de clase, muchas galletas.</p>

<h3>Un token, ¿uno o muchos lexemas?</h3>
<p>Depende del token:</p>
<ul>
<li>Tokens con <b>un solo lexema</b>: <code>OP_ASIG</code> siempre es <code>:=</code>; <code>PAR_ABRE</code> siempre es <code>(</code>; <code>PYC</code> siempre es <code>;</code>; la palabra clave <code>IF</code> siempre es <code>if</code>. El patrón <b>es</b> esa cadena fija.</li>
<li>Tokens con <b>muchos lexemas</b>: <code>ID</code> (<code>lyc</code>, <code>unlam</code>, <code>Cont1</code>) y <code>CTE</code> (<code>18</code>, <code>23</code>, <code>035</code>). El patrón es una estructura que casa con infinitas cadenas.</li>
</ul>
<p>Esta distinción es la que va a decidir, en 1.3, <b>qué</b> se guarda en la tabla de símbolos y qué no.</p>

<h3>Las cinco clases de tokens</h3>
<p>Aho dice que en casi cualquier lenguaje los tokens caen en cinco grupos: (1) uno por cada <b>palabra clave</b>; (2) los <b>operadores</b>, sueltos o en clases (como <code>comparacion</code>); (3) uno para todos los <b>identificadores</b>; (4) uno o más para las <b>constantes</b> (números, cadenas literales); (5) uno por cada <b>signo de puntuación</b> (paréntesis, coma, punto y coma).</p>
<p>Ejemplo de Aho sobre <code>printf("Total = %d", puntuacion)</code>: tanto <code>printf</code> como <code>puntuacion</code> son <b>lexemas</b> que casan con el patrón del token <code>id</code>, y <code>"Total = %d"</code> es un <b>lexema</b> del token <code>literal</code>.</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li><b>Token</b> = nombre de la categoría (lo que ve el sintáctico). <b>Patrón</b> = la forma (la ER). <b>Lexema</b> = la cadena concreta del fuente.</li>
<li>Un token puede representar <b>uno</b> (<code>:=</code>) o <b>muchos</b> lexemas (<code>ID</code>, <code>CTE</code>).</li>
<li>El <b>nombre</b> del token guía el análisis sintáctico; el <b>lexema/atributo</b> guía la traducción posterior.</li>
</ul>`,
    qa:[
      {q:"Distinguí token, patrón y lexema en el caso de la constante entera CTE, con lexemas 18, 23, 035.",
       a:`<p><b>Token</b>: <code>CTE</code>, el nombre abstracto de la categoría (lo que el sintáctico manipula). <b>Patrón</b>: la regla que describe su forma, "una o más cifras", que se escribe <code>{DIGITO}+</code>. <b>Lexema</b>: cada cadena concreta que apareció en el fuente y casó con el patrón: <code>18</code>, <code>23</code>, <code>035</code>. Resumen: el token es <b>uno</b>, el patrón es <b>uno</b>, los lexemas son <b>muchos</b>.</p>`},
      {q:"¿Cuántos lexemas puede tener el token OP_ASIG y cuántos el token ID? ¿Por qué esa diferencia importa?",
       a:`<p><code>OP_ASIG</code> tiene <b>un único lexema</b>: <code>:=</code>. <code>ID</code> tiene <b>infinitos</b> lexemas: <code>lyc</code>, <code>unlam</code>, <code>Cont1</code>… Importa porque marca qué información hay que <b>guardar</b>: cuando un token representa muchos lexemas, el léxico tiene que arrastrar un atributo que diga <b>cuál</b> apareció (y por eso ese elemento va a la tabla de símbolos). Cuando representa uno solo, no hay nada que recordar: el nombre del token ya lo dice todo.</p>`},
      {q:"Separá printf(«Total = %d», puntuacion) en tokens y lexemas.",
       a:`<p><code>printf</code> → token <code>id</code> (lexema <code>printf</code>); <code>(</code> → token de paréntesis izquierdo; <code>"Total = %d"</code> → token <code>literal</code> (ese es su lexema); <code>,</code> → token coma; <code>puntuacion</code> → token <code>id</code> (lexema <code>puntuacion</code>); <code>)</code> → paréntesis derecho. Fijate que <code>printf</code> y <code>puntuacion</code> comparten <b>token</b> (<code>id</code>) pero tienen <b>lexemas</b> distintos: es la muestra de que un token representa muchos lexemas.</p>`},
      {q:"¿Por qué el analizador sintáctico trabaja con el nombre del token y no con el lexema concreto?",
       a:`<p>Porque al sintáctico le importa la <b>categoría</b>, no el detalle. Para decidir si <code>a := b + c</code> es una asignación válida, necesita saber que hay un <code>id</code>, un <code>:=</code>, un <code>id</code>, un <code>+</code>, un <code>id</code>; le da igual si el id era <code>a</code> o <code>peras</code>. Por eso Aho dice que el <b>nombre</b> del token influye en las decisiones del <b>análisis sintáctico</b>, mientras que el <b>valor del atributo</b> (el lexema) influye en la <b>traducción</b> posterior (generar código, chequear tipos). Cada fase usa lo que necesita.</p>`}
    ]
  },
  {
    id:"1.3", titulo:"Atributos del token y la tabla de símbolos", aho:"§3.1.3 · p.112", badges:["🎯"], estado:"dictada",
    html:`
<p>Un token como <code>ID</code> representa muchos lexemas. Entonces, cuando el léxico reconoce uno, no alcanza con avisar "esto es un <code>id</code>": hay que decir <b>cuál</b>. Esa información extra es el <b>valor de atributo</b> del token.</p>
<p>Aho lo enuncia limpio: el <b>nombre</b> del token influye en las decisiones del <b>análisis sintáctico</b>; el <b>valor del atributo</b> influye en la <b>traducción</b> posterior (la generación de código). El sintáctico necesita saber "es un id"; el generador de código necesita saber "es el id <code>puntuacion</code>, de tipo entero, declarado en tal lugar".</p>

<h3>El atributo del identificador es un puntero</h3>
<p>¿Qué guarda el léxico como atributo de un <code>id</code>? No el lexema suelto, sino un <b>puntero a la entrada de ese identificador en la tabla de símbolos</b>. La tabla es donde vive toda la información: el lexema, el tipo, dónde se lo vio por primera vez, etc. El token lleva solo la "dirección" a esa ficha.</p>

<h3>Qué es la tabla de símbolos</h3>
<p>Es una <b>estructura de datos con un registro por cada elemento</b> que puede representar más de un lexema, más sus <b>atributos</b>: nombre/lexema, tipo, valor, longitud, ubicación. En el TP suele arrancar como un archivo (<code>symbol-table.txt</code>) que después se baja a memoria. El léxico la <b>crea</b>; el análisis <b>semántico</b> la termina de completar (por ejemplo, una declaración cambia el <b>tipo</b> del id en la tabla, aunque no genere código intermedio).</p>

<div class="callout tgt"><span class="lab">🎯 trampa clásica: qué NO va a la tabla</span>A la tabla de símbolos van <b>solo los tokens que pueden tener más de un lexema</b>: los <b>identificadores</b> y las <b>constantes</b>. <b>Las palabras reservadas NO van</b>. ¿Por qué? Porque cada palabra reservada tiene <b>un único lexema fijo</b> (<code>if</code> siempre es <code>if</code>): no hay nada que distinguir ni ningún atributo que recordar. El nombre del token ya lo dice todo.</div>

<h3>Por qué existe la tabla: la compilación es destructiva</h3>
<p>Cada fase transforma una representación en la siguiente y <b>tira</b> la anterior: cuando el léxico convierte <code>posicion</code> en el par ⟨id, puntero⟩, el nombre <code>posicion</code> ya no aparece en el flujo que sigue. Por eso el apunte dice que la compilación es un <b>proceso destructivo</b>. La tabla de símbolos es <b>lo único que sobrevive de costado</b>, a través de todas las fases, guardando los atributos que se van a necesitar más adelante (para chequear tipos y generar código). Sin tabla, esa información se perdería.</p>

<h3>Ejemplo de Aho</h3>
<p>La instrucción <code>E = M * C ** 2</code> sale del léxico como una secuencia de pares:</p>
<pre><code>⟨id, puntero a la entrada de E⟩
⟨op_asig⟩
⟨id, puntero a la entrada de M⟩
⟨op_mult⟩
⟨id, puntero a la entrada de C⟩
⟨op_exp⟩
⟨numero, valor 2⟩</code></pre>
<p>Fijate que los operadores <b>no llevan atributo</b> (su nombre basta), y los <code>id</code> llevan un <b>puntero</b> a la tabla.</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>El <b>atributo</b> del token dice <b>cuál</b> lexema apareció; para <code>id</code> es un <b>puntero a la tabla de símbolos</b>.</li>
<li>🎯 A la tabla van <b>identificadores y constantes</b> (más de un lexema). <b>Las palabras reservadas no.</b></li>
<li>La tabla existe porque la compilación es <b>destructiva</b>: es lo único que preserva los atributos entre fases.</li>
<li>La <b>crea el léxico</b>; la <b>completa el semántico</b>.</li>
</ul>`,
    qa:[
      {q:"¿Qué elementos van a la tabla de símbolos y cuáles no? Justificá.",
       a:`<p><b>Van</b> los tokens que pueden representar <b>más de un lexema</b>: los <b>identificadores</b> y las <b>constantes</b>. Justificación: de ellos hay que guardar atributos (tipo, valor, longitud, ubicación) que las fases siguientes van a necesitar. <b>No van</b> las <b>palabras reservadas</b>: cada una tiene un <b>único lexema fijo</b>, así que no hay ningún atributo que distinguir ni recordar; con el nombre del token alcanza. Meterlas sería guardar información que nunca cambia y nunca se consulta.</p>`},
      {q:"Si el compilador «ya leyó» el programa, ¿por qué necesita una tabla de símbolos?",
       a:`<p>Porque la compilación es un <b>proceso destructivo</b>: cada fase produce una representación nueva y descarta la anterior, así que el texto fuente (con los nombres de las variables, sus tipos, etc.) <b>se pierde</b> a medida que se avanza. La tabla de símbolos es la <b>única estructura que persiste lateralmente</b> a través de todas las fases; ahí quedan guardados los atributos (tipo, valor, longitud) que el análisis semántico y la generación de código van a consultar mucho después de que el fuente ya no exista.</p>`},
      {q:"¿Cuál es el atributo de un token id y por qué se guarda un puntero y no el lexema completo?",
       a:`<p>El atributo de un <code>id</code> es un <b>puntero a su entrada en la tabla de símbolos</b>. Se usa un puntero (y no el lexema suelto) porque de un identificador hay que arrastrar <b>mucha</b> información —lexema, tipo, dónde se lo vio primero— y esa información se va <b>completando</b> en fases posteriores. Si cada aparición del id cargara una copia del lexema, habría datos duplicados y desincronizados; con un puntero, todas las apariciones apuntan a la <b>misma ficha única</b>, que el semántico actualiza una sola vez.</p>`},
      {q:"En la secuencia de pares que el léxico produce para E = M * C ** 2, ¿por qué los operadores no llevan valor de atributo y los identificadores sí?",
       a:`<p>Porque un operador como <code>*</code> o <code>:=</code> tiene <b>un único lexema</b>: el nombre del token (<code>op_mult</code>, <code>op_asig</code>) ya identifica exactamente qué es, no hay nada más que aclarar. Un <code>id</code>, en cambio, representa <b>muchos</b> lexemas posibles, así que necesita un atributo —un puntero a la tabla— que diga <b>cuál</b> identificador es (<code>E</code>, <code>M</code>, <code>C</code>). Regla general: llevan atributo los tokens con más de un lexema; los de lexema único, no.</p>`}
    ]
  },
  {
    id:"1.4", titulo:"Errores léxicos y por qué el AL detecta tan poco", aho:"§3.1.4 · p.113", badges:["🎯"], estado:"dictada",
    html:`
<p>Puede sonar raro, pero el analizador léxico detecta <b>muy pocos</b> errores. La razón es su <b>vista corta</b>: mira caracteres, de a uno o de a puñados, pero no ve la <b>estructura</b> del programa ni conoce los <b>tipos</b>. Con tan poca información, casi nada le "parece" un error.</p>

<h3>El ejemplo de Aho: fi</h3>
<p>Supongamos este arranque en C:</p>
<pre><code>fi ( a == f(x) ) ...</code></pre>
<p>¿<code>fi</code> es <code>if</code> mal escrito, o es el nombre de una función que no declaraste? El léxico <b>no puede saberlo</b>: <code>fi</code> es un lexema perfectamente válido para el token <code>id</code>. Entonces devuelve <code>id</code> y sigue de largo. El error (si lo hay) lo va a cazar una fase más tardía, con más contexto. Moraleja: el léxico, ante la duda, <b>no inventa</b> un error; entrega el token válido que reconoce.</p>

<h3>Los pocos errores que sí detecta</h3>
<ul>
<li><b>Carácter inválido</b>: aparece un símbolo que no encaja en ningún patrón (ningún token empieza así).</li>
<li><b>Constante fuera de rango</b>: el número casó la forma, pero se pasa de la cota (lo valida una función asociada).</li>
<li><b>Identificador demasiado largo</b>: excede la longitud permitida.</li>
<li><b>Comentario sin cerrar</b>: se abrió un comentario y llegó el fin de archivo sin cierre.</li>
</ul>

<div class="callout tgt"><span class="lab">🎯 la trampa del estado final</span>Pregunta real de parcial (2016): "el autómata llega al estado final y, al devolver el token STRING, arroja «CHAR inválido en la string». ¿Es posible?" <b>No.</b> Si el autómata <b>llegó al estado final</b>, es porque el lexema <b>ya concordó</b> con el patrón: está reconocido. Un carácter inválido hace que el autómata <b>no llegue</b> al estado final, así que no se devuelve ni token ni ese error. Lo que <b>sí</b> puede fallar en el estado final es la <b>acción léxica</b> (una cota superada, una longitud excedida): pero eso es <b>otro</b> tipo de error, no un "carácter inválido".</div>

<h3>Rango y longitud: la acción léxica, no la ER</h3>
<p>Un detalle que vuelve en 2.5: que un número esté "fuera de rango" o un id sea "demasiado largo" no se chequea con la expresión regular, sino con la <b>acción léxica</b> (un pedacito de código que corre cuando ya se reconoció el token). Y ojo con el <b>cuándo</b>: ese error ocurre en <b>tiempo de compilación</b>, en la <b>etapa léxica</b>. No es un error de ejecución.</p>

<h3>Recuperación de errores</h3>
<p>Cuando ningún patrón casa, la estrategia más simple es la <b>recuperación en modo pánico</b>: descartar caracteres hasta encontrar uno con el que se pueda volver a arrancar un token bien formado. Aho menciona otras reparaciones puntuales (borrar un carácter, insertar uno que falta, sustituir, o transponer dos adyacentes), porque la mayoría de los errores léxicos son de <b>un solo carácter</b>.</p>

<h3>Comparación con las otras etapas</h3>
<table>
<tr><th>Error</th><th>Etapa</th><th>Cuándo</th></tr>
<tr><td>Carácter inválido, comentario sin cerrar</td><td>Léxica (autómata)</td><td>Compilación</td></tr>
<tr><td>Constante fuera de rango, id demasiado largo</td><td>Léxica (acción léxica)</td><td>Compilación</td></tr>
<tr><td>Falta un punto y coma, paréntesis desbalanceado</td><td>Sintáctica</td><td>Compilación</td></tr>
<tr><td>Variable no declarada, tipos incompatibles</td><td>Semántica</td><td>Compilación</td></tr>
<tr><td>División por cero con divisor variable</td><td>—</td><td>Ejecución</td></tr>
</table>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>El léxico detecta poco porque solo ve <b>caracteres</b>, no estructura ni tipos.</li>
<li>Errores léxicos: <b>carácter inválido</b>, <b>constante fuera de rango</b>, <b>id demasiado largo</b>, <b>comentario sin cerrar</b>.</li>
<li>🎯 Si el autómata llegó al <b>estado final</b>, ya reconoció el lexema: <b>no</b> puede tirar "carácter inválido". Lo de la cota/longitud es la <b>acción léxica</b>.</li>
<li>Esos errores son de <b>compilación</b>, etapa léxica.</li>
</ul>`,
    qa:[
      {q:"El autómata llega a su estado final y, al devolver el token STRING, arroja «CHAR inválido en la string». ¿Es posible? Justificá. (Parcial 2016)",
       a:`<p><b>No es posible.</b> Llegar al <b>estado final</b> significa que el lexema <b>concordó con el patrón</b>: el token ya está reconocido. Un carácter inválido habría <b>impedido</b> alcanzar el estado final —el autómata se habría trabado antes—, con lo cual no se devuelve ningún token ni ese error. Es una contradicción: no se puede a la vez "haber reconocido la string" y "haber encontrado un carácter inválido en ella". Lo único que <b>sí</b> puede fallar estando en el estado final es la <b>acción léxica</b> (por ejemplo, que la string supere una longitud máxima), pero ese es otro error, no "carácter inválido".</p>`},
      {q:"¿En qué momento (compilación o ejecución) y en qué etapa se dispara el error de «constante fuera de rango»?",
       a:`<p>En <b>tiempo de compilación</b>, en la <b>etapa léxica</b>, dentro de la <b>acción léxica</b> del token de la constante. Mecanismo: la expresión regular reconoce la <b>forma</b> del número (dígitos), y una vez reconocido, la acción léxica ejecuta una función de validación que compara el valor contra la <b>cota</b>; si se pasa, lanza el error ahí mismo. No es de ejecución porque la constante es un <b>literal fijo</b> en el fuente: su valor se conoce al compilar.</p>`},
      {q:"Ante fi ( a == f(x) ), ¿por qué el léxico devuelve fi como identificador en lugar de reportar un error?",
       a:`<p>Porque <code>fi</code> es un <b>lexema válido</b> para el token <code>id</code> (letra seguida de letras/dígitos), y el léxico no tiene forma de saber si quisiste escribir <code>if</code> o si es una función. Su vista es local: no ve que después viene una condición ni conoce las declaraciones. Ante la duda, <b>no inventa</b> un error; entrega el token válido que reconoció (<code>id</code>) y deja que una fase con más contexto (el sintáctico o el semántico) decida si algo está mal. Es el principio de que el léxico detecta poco justamente porque ve poco.</p>`},
      {q:"Dá un ejemplo de error léxico, uno sintáctico y uno semántico, e indicá en qué etapa se detecta cada uno.",
       a:`<p><b>Léxico:</b> un <code>@</code> suelto que no arranca ningún token, o un comentario <code>/*</code> que nunca cierra — lo caza el <b>autómata</b> del léxico. <b>Sintáctico:</b> <code>a := b + ;</code> (falta el operando) o un paréntesis desbalanceado — ninguna <b>regla de la gramática</b> acepta esa secuencia de tokens, lo detecta el sintáctico. <b>Semántico:</b> usar una variable <b>no declarada</b>, o sumar tipos incompatibles sin casteo en un lenguaje estático — se detecta consultando la <b>tabla de símbolos</b> en el análisis semántico. Los tres son de <b>compilación</b>; lo que cambia es qué información tiene cada fase para verlos.</p>`}
    ]
  },
  {
    id:"1.5", titulo:"Búfer de entrada: pares de búferes y centinelas", aho:"§3.2 · p.115", badges:["📘"], estado:"dictada",
    html:`
<p>Esta lección es <b>📘 de Aho</b>: la cátedra no la toma en el parcial, pero explica por qué Flex es tan rápido y por qué el léxico "mira para adelante". Vale entenderla.</p>

<h3>El problema: leer es caro, y hay que espiar</h3>
<p>Dos dolores de cabeza al leer el fuente:</p>
<ul>
<li><b>Leer cuesta.</b> Pedirle al sistema operativo <b>un carácter por vez</b> sería lentísimo (una llamada al sistema por letra). Conviene traer <b>bloques grandes</b> de una.</li>
<li><b>Hay que mirar por adelantado</b> (lookahead). Para saber dónde <b>termina</b> un lexema, casi siempre tenés que leer el carácter <b>siguiente</b>. No sabés que <code>posicion</code> terminó hasta ver un carácter que no es letra ni dígito. En C, un <code>-</code> puede ser el inicio de <code>-&gt;</code>; un <code>&lt;</code>, de <code>&lt;=</code>. Hay que espiar para no cortar mal.</li>
</ul>

<h3>La analogía</h3>
<p>Si tenés que leer un libro pesadísimo, no vas a la biblioteca a pedir <b>una letra</b> y volvés, y otra vez, y otra. Traés un <b>capítulo entero</b> y lo leés tranquilo. Y para entender una palabra a veces tenés que <b>echar un ojo</b> a la que sigue. Eso hace el léxico.</p>

<h3>Pares de búferes</h3>
<p>Se usan <b>dos mitades</b> de búfer, cada una de tamaño N (típicamente un bloque de disco, unos 4096 bytes), que se <b>recargan alternadamente</b>. Y dos punteros:</p>
<ul>
<li><code>inicioLexema</code>: marca dónde <b>empieza</b> el lexema que estoy armando.</li>
<li><code>avance</code>: <b>explora</b> hacia adelante hasta encontrar el final del lexema.</li>
</ul>
<p>Cuando <code>avance</code> llega al final de una mitad, se <b>recarga la otra</b> y sigue. ¿Por qué <b>dos</b> mitades y no una sola grande? Porque cuando espiaste hacia adelante y cruzaste el límite, todavía necesitás <b>el principio del lexema</b> que quedó atrás; si recargaras un único búfer, lo pisarías. Con dos mitades, mientras leés una, la otra conserva lo que venías armando.</p>

<h3>Centinelas</h3>
<p>Sin ayuda, por <b>cada</b> carácter habría que preguntar dos cosas: "¿se acabó la mitad del búfer?" y "¿qué carácter es?". El truco del <b>centinela</b> es poner un carácter especial <code>eof</code> al <b>final de cada mitad</b> (un carácter que no puede aparecer en el fuente). Así, con <b>un solo test</b> alcanza: si el carácter leído es el centinela, recién ahí me fijo si fue fin de búfer o fin de entrada; si no, sigo de largo. Un chequeo por carácter en vez de dos.</p>
<pre><code>switch ( siguiente_caracter ) {
   case eof:
      si avance esta al final de una mitad: recargar la otra mitad;
      si no: es fin de entrada, terminar el analisis;
      break;
   ... casos de los demas caracteres ...
}</code></pre>

<div class="callout aho"><span class="lab">📘 fuera del parcial</span>Ni los pares de búferes ni los centinelas se toman en el parcial. Son una optimización de bajo nivel. Te sirven para entender por qué el escaneo carácter a carácter puede ser <b>tan veloz</b> (una de las tres razones para separar el léxico del sintáctico, ¿te acordás de 1.1?).</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>El léxico lee en <b>bloques</b>, no de a un carácter, por eficiencia.</li>
<li><b>Pares de búferes</b>: dos mitades que se recargan alternadamente, con punteros <code>inicioLexema</code> y <code>avance</code>.</li>
<li>Hacen falta <b>dos</b> por el <b>lookahead</b>: hay que espiar adelante sin perder el arranque del lexema.</li>
<li>El <b>centinela</b> (<code>eof</code> al final de cada mitad) reduce a <b>un test por carácter</b> el chequeo de fin de búfer.</li>
</ul>`,
    qa:[
      {q:"¿Para qué sirve el centinela en el búfer de entrada?",
       a:`<p>Para reducir a <b>un solo test por carácter</b> la detección de fin de búfer. Sin centinela, en cada carácter habría que preguntar <b>dos</b> cosas: si se terminó la mitad del búfer y, aparte, qué carácter es. El centinela —un <code>eof</code> colocado al final de cada mitad, un símbolo que no puede aparecer en el fuente— <b>unifica</b> ambos chequeos: solo cuando el carácter leído es el centinela hace falta averiguar si fue fin de búfer o fin de entrada. Es una optimización de velocidad.</p>`},
      {q:"¿Por qué el esquema usa dos búferes (dos mitades) y no un único búfer grande?",
       a:`<p>Por el <b>lookahead</b>. Para reconocer un lexema, el puntero <code>avance</code> tiene que <b>espiar hacia adelante</b>, a veces cruzando el límite del búfer. Si hubiera un solo búfer y lo recargaras, <b>pisarías</b> el principio del lexema que todavía estás armando (el que marca <code>inicioLexema</code>). Con <b>dos mitades</b>, cuando <code>avance</code> pasa a la segunda para seguir espiando, la primera <b>conserva intacto</b> el arranque del lexema hasta que termines de reconocerlo. Vale mientras el lexema no sea más largo que N.</p>`},
      {q:"¿Por qué el analizador léxico necesita «mirar por adelantado» (lookahead)? Dá un ejemplo.",
       a:`<p>Porque el <b>final</b> de un lexema casi nunca se conoce hasta ver el carácter <b>siguiente</b>. Ejemplo: no sabés que el identificador <code>posicion</code> terminó hasta leer un carácter que <b>no</b> es letra ni dígito (un espacio, un <code>=</code>). Otro: en C, al leer <code>&lt;</code> no sabés si el token es <code>&lt;</code> o si es el comienzo de <code>&lt;=</code>; hay que espiar el próximo carácter. Por eso el léxico lee de más y, si se pasó, hace <b>retroceso</b> devolviendo el carácter sobrante a la entrada.</p>`}
    ]
  }
]});

M.push({ id:2, titulo:"Teoría de lenguajes y expresiones regulares", parcial:"I",
  resumen:"Alfabetos, cadenas y lenguajes, la clausura de Kleene, las expresiones regulares y su precedencia, las definiciones regulares (bloque CONJUNTO), las extensiones y el taller de ER de parcial con acción léxica.",
  lecciones:[
  {
    id:"2.1", titulo:"Alfabetos, cadenas, lenguajes y clausura de Kleene", aho:"§3.3.1–3.3.2 · p.117", badges:["🎯"], estado:"dictada",
    html:`
<p>Antes de escribir expresiones regulares hace falta un vocabulario mínimo. Son tres nociones encadenadas: <b>alfabeto</b>, <b>cadena</b> y <b>lenguaje</b>.</p>
<ul>
<li><b>Alfabeto</b> (se escribe Σ, sigma): un <b>conjunto finito de símbolos</b>. Ejemplos: el alfabeto binario {0, 1}; el conjunto ASCII; Unicode.</li>
<li><b>Cadena</b> sobre Σ: una <b>secuencia finita</b> de símbolos de ese alfabeto. Su <b>longitud</b> |s| es cuántos símbolos tiene. <code>banana</code> es una cadena de longitud 6. La <b>cadena vacía</b>, que se escribe ε (épsilon), es la de longitud 0.</li>
<li><b>Lenguaje</b> sobre Σ: <b>cualquier conjunto de cadenas</b> formadas con ese alfabeto. Puede ser el conjunto vacío ∅, el conjunto {ε} (que contiene solo la cadena vacía), "todos los programas C bien formados", etc.</li>
</ul>

<h3>La analogía del Scrabble</h3>
<p>El <b>alfabeto</b> son las fichas con letras que hay en la caja. Una <b>cadena</b> es cualquier hilera de fichas que armes (tenga sentido o no). El <b>lenguaje</b> es el conjunto de hileras que valen según cierta regla —por ejemplo, "las que están en el diccionario". La <b>cadena vacía</b> ε es no poner ninguna ficha.</p>

<h3>Operaciones sobre lenguajes</h3>
<p>Como un lenguaje es un conjunto, se combina con operaciones. Las tres que importan en el léxico:</p>
<ul>
<li><b>Unión</b> <code>L ∪ M</code>: las cadenas que están en L <b>o</b> en M (la unión de conjuntos de siempre).</li>
<li><b>Concatenación</b> <code>L M</code>: pegar una cadena de L con una de M, en <b>todas</b> las combinaciones posibles. Si L = {super} y M = {mercado}, entonces LM = {supermercado}.</li>
<li><b>Clausura de Kleene</b> <code>L*</code>: concatenar cadenas de L <b>cero o más</b> veces. Incluye ε (que es "concatenar cero veces").</li>
</ul>
<p>Y una cuarta muy usada, la <b>clausura positiva</b> <code>L+</code>: igual que la de Kleene pero <b>una o más</b> veces; <b>no</b> incluye ε (salvo que ε ya esté en L).</p>

<div class="callout tgt"><span class="lab">🎯 L* contra L+</span>La diferencia entra al parcial: <code>L*</code> incluye la <b>cadena vacía</b> (cero repeticiones); <code>L+</code> <b>no</b> (arranca en una). Las relaciones que conviene tener: <code>L* = L+ ∪ {ε}</code> y <code>L+ = L L*</code>. Traducido: "cero o más" = "una o más, o nada"; y "una o más" = "una, seguida de cero o más".</div>

<h3>Los ejemplos de Aho</h3>
<p>Sea L el conjunto de letras y D el de dígitos. Con las operaciones de arriba:</p>
<ul>
<li><b>L ∪ D</b>: letras o dígitos (62 cadenas de longitud 1).</li>
<li><b>L D</b>: una letra seguida de un dígito (520 cadenas de longitud 2).</li>
<li><b>L*</b>: todas las cadenas de letras, incluida ε.</li>
<li><b>L(L ∪ D)*</b>: una letra, y después letras o dígitos, cualquier cantidad. <b>Eso es exactamente un identificador.</b></li>
<li><b>D+</b>: una o más cifras. <b>Eso es una constante entera.</b></li>
</ul>

<div class="callout aho"><span class="lab">📘 por qué te importa</span>Los lexemas de cada token forman un <b>lenguaje regular</b>: un lenguaje que se puede describir combinando unión, concatenación y clausura. Toda la teoría de esta lección existe para poder decir, con precisión matemática, "qué cadenas son un identificador válido". La ER de la próxima lección es la <b>notación</b> para escribir estos lenguajes.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li><b>Alfabeto</b> Σ: conjunto finito de símbolos. <b>Cadena</b>: secuencia finita de símbolos. <b>Lenguaje</b>: conjunto de cadenas.</li>
<li><b>ε</b> es la cadena vacía, longitud 0. No confundir con ∅, el lenguaje sin ninguna cadena.</li>
<li>Operaciones: <b>unión</b>, <b>concatenación</b>, <b>clausura de Kleene</b> <code>L*</code> (cero o más) y <b>positiva</b> <code>L+</code> (una o más).</li>
<li>🎯 <code>L*</code> incluye ε; <code>L+</code> no. <code>L(L∪D)*</code> = identificador; <code>D+</code> = constante entera.</li>
</ul>`,
    qa:[
      {q:"¿Cuál es la diferencia entre L* y L+?",
       a:`<p><code>L*</code> (clausura de Kleene) es concatenar cadenas de L <b>cero o más</b> veces, así que <b>incluye la cadena vacía ε</b> (el caso de cero concatenaciones). <code>L+</code> (clausura positiva) es <b>una o más</b> veces, así que <b>no incluye ε</b> (salvo que ε ya pertenezca a L). Las relaciones formales: <code>L* = L+ ∪ {ε}</code> y <code>L+ = L L*</code>. Ejemplo: si L = {a}, entonces L* = {ε, a, aa, aaa, …} y L+ = {a, aa, aaa, …}.</p>`},
      {q:"¿Qué es la cadena vacía, qué longitud tiene y pertenece a L*?",
       a:`<p>La <b>cadena vacía</b>, escrita ε, es la cadena que <b>no tiene ningún símbolo</b>: su longitud |ε| es <b>0</b>. Sí, <b>pertenece a L*</b> para cualquier lenguaje L, porque L* incluye el caso de "concatenar cero veces", que por definición da ε. En cambio, ε <b>no</b> pertenece a L+ a menos que ε ya esté en el propio L. Ojo con no confundir ε (una cadena, la vacía) con ∅ (un lenguaje, el conjunto sin ninguna cadena).</p>`},
      {q:"Definí alfabeto, cadena y lenguaje, con un ejemplo de cada uno.",
       a:`<p><b>Alfabeto</b> (Σ): conjunto <b>finito</b> de símbolos; por ejemplo el binario {0, 1}. <b>Cadena</b> sobre Σ: secuencia <b>finita</b> de símbolos de Σ; por ejemplo <code>1011</code> sobre el alfabeto binario. <b>Lenguaje</b> sobre Σ: un <b>conjunto</b> de cadenas; por ejemplo "todas las cadenas de ceros y unos que empiezan con 1". Cada nivel se apoya en el anterior: los símbolos forman cadenas, y las cadenas forman lenguajes. Notá que un lenguaje no necesita que las cadenas "signifiquen" algo.</p>`},
      {q:"¿Qué lenguaje describe L(L ∪ D)* y por qué coincide con la forma de un identificador?",
       a:`<p>Con L = letras y D = dígitos, <code>L(L ∪ D)*</code> describe: <b>una letra</b> (la L de adelante), <b>seguida de</b> cero o más símbolos que sean letra o dígito (el <code>(L ∪ D)*</code>). Eso es <b>exactamente</b> la regla de un identificador: tiene que <b>empezar con letra</b> y después puede llevar letras o dígitos en cualquier cantidad. La <code>*</code> permite el caso del identificador de una sola letra (cero símbolos después). Por eso esta expresión es la base de la ER <code>{LETRA}({LETRA}|{DIGITO})*</code> que vas a escribir en el parcial.</p>`}
    ]
  },
  {
    id:"2.2", titulo:"Expresiones regulares: definición y precedencia", aho:"§3.3.3 · p.120", badges:["🎯"], estado:"dictada",
    html:`
<p>Una <b>expresión regular (ER)</b> es una <b>notación</b> para describir un lenguaje regular: en vez de listar todas las cadenas válidas (imposible si son infinitas), escribís una fórmula que las genera a todas. Es el metalenguaje con el que se especifican los patrones de los tokens.</p>

<h3>La analogía de la receta</h3>
<p>Una ER es como una <b>receta</b> que dice cómo se arma cualquier cadena válida: "poné una letra; después, si querés, agregá más letras o dígitos". No enumera los platos; describe <b>cómo cocinarlos</b>. El operador <code>*</code> es el "repetí esto las veces que quieras, incluso ninguna".</p>

<h3>Definición inductiva (así la da Aho)</h3>
<p>Las ER se construyen desde piezas chiquitas. Cada ER <code>r</code> denota un lenguaje <code>L(r)</code>.</p>
<p><b>Base:</b></p>
<ul>
<li>ε es una ER, y denota el lenguaje {ε}.</li>
<li>Cada símbolo <code>a</code> del alfabeto es una ER, y denota {a}.</li>
</ul>
<p><b>Inducción</b> (si <code>r</code> y <code>s</code> ya son ER):</p>
<ul>
<li><code>r|s</code> es una ER y denota la <b>unión</b> L(r) ∪ L(s).</li>
<li><code>rs</code> es una ER y denota la <b>concatenación</b> L(r) L(s).</li>
<li><code>r*</code> es una ER y denota la <b>clausura</b> (L(r))*.</li>
<li><code>(r)</code> es una ER y denota lo mismo que <code>r</code> (los paréntesis solo agrupan).</li>
</ul>

<h3>Precedencia: quién liga más fuerte</h3>
<p>Para poder sacar paréntesis sin ambigüedad, hay un orden. De <b>mayor a menor</b> precedencia: primero la <b>clausura</b> <code>*</code>, después la <b>concatenación</b>, y por último la <b>unión</b> <code>|</code>. Las tres asocian a izquierda.</p>
<p>Por eso <code>a|b*c</code> se lee como <code>a | ( (b*) c )</code>: el <code>*</code> se aplica solo a <code>b</code>, después se concatena con <code>c</code>, y al final la alternativa con <code>a</code>. Denota: "una sola <code>a</code>, o bien cero o más <code>b</code> seguidas de una <code>c</code>".</p>

<div class="callout aho"><span class="lab">📘 leyes algebraicas</span>Como cualquier notación, las ER tienen leyes: <code>|</code> es <b>conmutativa</b> (<code>r|s = s|r</code>) y <b>asociativa</b>; la <b>concatenación</b> es asociativa y <b>distribuye</b> sobre <code>|</code>; ε es la <b>identidad</b> de la concatenación (<code>εr = rε = r</code>). Dos ER que denotan el mismo lenguaje son <b>equivalentes</b>: por ejemplo <code>(a|b) = (b|a)</code>.</div>

<h3>El metalenguaje de la cátedra</h3>
<p>La cátedra usa estos operadores (algunos son extensiones que vemos en 2.4):</p>
<ul>
<li><code>x*</code>: cero o más ocurrencias.</li>
<li><code>x+</code>: una o más.</li>
<li><code>x?</code>: cero o una.</li>
<li><code>r|s</code>: una u otra (alternativa).</li>
<li><code>r.s</code>: concatenación (a veces con el punto explícito).</li>
</ul>
<p>Ejemplos canónicos que aparecen una y otra vez:</p>
<pre><code>uno o mas 0 seguidos de uno o mas 1:   0+.1+
0 y 1 intercalados (al menos uno):     (0|1)+
constante entera:                      (0|1|2|3|4|5|6|7|8|9)+   o   {DIGITO}+
constante real:                        {DIGITO}+ . {DIGITO}+
identificador:                         {LETRA}({LETRA}|{DIGITO})*</code></pre>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Una <b>ER</b> es una fórmula que denota un <b>lenguaje regular</b>: los patrones de los tokens.</li>
<li>Se define por <b>inducción</b>: base (ε y los símbolos) + reglas para <b>unión</b>, <b>concatenación</b> y <b>clausura</b>.</li>
<li>🎯 <b>Precedencia</b>: <code>*</code> liga más fuerte, después la concatenación, y al final <code>|</code>.</li>
<li>Metalenguaje: <code>* + ? | .</code>; el identificador es <code>{LETRA}({LETRA}|{DIGITO})*</code>.</li>
</ul>`,
    qa:[
      {q:"¿Cómo se agrupa a|bc* según la precedencia de las expresiones regulares?",
       a:`<p>Se agrupa como <code>a | ( b ( c* ) )</code>. El orden de precedencia, de mayor a menor, es: <b>clausura</b> <code>*</code>, después <b>concatenación</b>, después <b>unión</b> <code>|</code>. Entonces el <code>*</code> se pega primero a <code>c</code> (da <code>c*</code>); luego la concatenación une <code>b</code> con <code>c*</code> (da <code>bc*</code>); y por último la alternativa separa <code>a</code> de <code>bc*</code>. El lenguaje que denota: la cadena <code>a</code> sola, o una <code>b</code> seguida de cero o más <code>c</code>.</p>`},
      {q:"Escribí la ER de un identificador y la de una constante entera, y explicá cada operador.",
       a:`<pre><code>identificador:      {LETRA}({LETRA}|{DIGITO})*
constante entera:   {DIGITO}+</code></pre><p>En el identificador: <code>{LETRA}</code> obliga a <b>empezar con letra</b>; el paréntesis con <code>|</code> es la <b>alternativa</b> "letra o dígito"; el <code>*</code> es "cero o más" de eso, así que después de la primera letra puede venir cualquier combinación de letras y dígitos, o nada. En la constante entera, <code>{DIGITO}</code> es una cifra y <code>+</code> es "una o más", es decir al menos una cifra. Se usa <code>+</code> (y no <code>*</code>) porque una constante <b>no puede</b> ser vacía.</p>`},
      {q:"Dá la definición inductiva de expresión regular (base e inducción).",
       a:`<p><b>Base:</b> ε es una ER (denota el lenguaje {ε}); y cada símbolo <code>a</code> del alfabeto es una ER (denota {a}). <b>Inducción:</b> si <code>r</code> y <code>s</code> ya son ER, entonces también lo son <code>r|s</code> (denota la <b>unión</b> de sus lenguajes), <code>rs</code> (la <b>concatenación</b>), <code>r*</code> (la <b>clausura</b> de Kleene) y <code>(r)</code> (lo mismo que <code>r</code>, los paréntesis solo agrupan). Se llama inductiva porque las ER grandes se arman combinando ER más chicas con esas cuatro reglas.</p>`},
      {q:"¿Qué significa que dos expresiones regulares sean equivalentes? Dá un ejemplo.",
       a:`<p>Dos ER son <b>equivalentes</b> cuando <b>denotan el mismo lenguaje</b>, es decir, generan exactamente el mismo conjunto de cadenas, aunque estén escritas distinto. Se anota <code>r = s</code>. Ejemplo simple: <code>(a|b) = (b|a)</code>, porque la unión es conmutativa y ambas describen el conjunto {a, b}. Otro: <code>(a|b)(a|b)</code> es equivalente a <code>aa|ab|ba|bb</code>: las dos describen todas las cadenas de longitud dos sobre {a, b}. La forma cambia; el lenguaje, no.</p>`}
    ]
  },
  {
    id:"2.3", titulo:"Definiciones regulares (el bloque CONJUNTO)", aho:"§3.3.4 · p.123", badges:["🎯"], estado:"dictada",
    html:`
<p>Escribir <code>(0|1|2|3|4|5|6|7|8|9)</code> cada vez que querés "un dígito" es insoportable. Una <b>definición regular</b> resuelve eso: le pone un <b>nombre</b> a una ER para poder reusarla. Es, tal cual, el bloque <b>CONJUNTO</b> del parcial.</p>

<h3>La analogía del atajo</h3>
<p>Es como declarar una constante antes de usarla. Escribís una vez <code>DIGITO = [0-9]</code> y de ahí en más usás <code>{DIGITO}</code>. Igual que en programación definís <code>PI = 3.14</code> arriba y después la llamás por nombre, acá definís tus "ladrillos" arriba y armás los tokens con ellos.</p>

<h3>La forma (Aho)</h3>
<p>Una definición regular es una secuencia:</p>
<pre><code>d1 -> r1
d2 -> r2
...
dn -> rn</code></pre>
<p>con dos condiciones: (1) cada <code>di</code> es un <b>nombre nuevo</b>, que no está en el alfabeto; (2) cada <code>ri</code> usa solo símbolos del alfabeto y <b>nombres definidos antes</b> (los <code>d</code> anteriores). Ejemplo de Aho, identificadores de C:</p>
<pre><code>letra_  -> [A-Za-z_]
digito  -> [0-9]
id      -> letra_ ( letra_ | digito )*</code></pre>

<div class="callout tgt"><span class="lab">🎯 el formato que espera la cátedra</span>En el parcial esto se escribe como dos bloques: primero <b>CONJUNTO</b> (tus definiciones, los ladrillos), después la tabla <b>TOKEN / EXP. REG.</b> (los tokens armados con esos ladrillos, entre llaves).<pre><code>CONJUNTO
DIGITO   [0-9]
DIGITO1  [1-9]
LETRA    [A-Za-z]

TOKEN   EXP. REG.
ID      {LETRA}({LETRA}|{DIGITO})*</code></pre></div>

<h3>Por qué no puede haber recursión</h3>
<p>La regla "cada nombre se define solo con símbolos y nombres <b>anteriores</b>" prohíbe que una definición se use a sí misma. ¿Por qué? Porque así se garantiza que cada nombre se puede <b>expandir</b> hasta una ER que solo tiene símbolos del alfabeto (vas reemplazando de arriba hacia abajo). Si <code>A</code> se definiera usando <code>A</code>, la expansión no terminaría nunca. Además, las definiciones regulares describen <b>lenguajes regulares</b>, y la recursión daría algo más potente (una gramática), que ya no es "regular".</p>

<h3>Un ejemplo más rico (Aho): número sin signo</h3>
<pre><code>digito   -> [0-9]
digitos  -> digito digito*
numero   -> digitos ( . digitos )? ( E ( + | - )? digitos )?</code></pre>
<p>Se lee: un número es una tira de dígitos, con una parte decimal <b>opcional</b> (punto y más dígitos) y un exponente <b>opcional</b> (una E, un signo opcional, y más dígitos). Cada ladrillo se apoya en el anterior.</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Una <b>definición regular</b> le da <b>nombre</b> a una ER para reusarla; es el bloque <b>CONJUNTO</b>.</li>
<li>Cada nombre se define con símbolos del alfabeto y nombres <b>ya definidos</b> (<b>sin recursión</b>).</li>
<li>🎯 Formato de parcial: <b>CONJUNTO</b> (ladrillos: <code>DIGITO [0-9]</code>) y tabla <b>TOKEN / EXP. REG.</b> con los nombres entre llaves <code>{DIGITO}</code>.</li>
</ul>`,
    qa:[
      {q:"Escribí las definiciones regulares para un identificador (letra seguida de letras o dígitos), en el formato de la cátedra.",
       a:`<pre><code>CONJUNTO
LETRA   [A-Za-z]
DIGITO  [0-9]

TOKEN   EXP. REG.
ID      {LETRA}({LETRA}|{DIGITO})*</code></pre><p>En el bloque <b>CONJUNTO</b> defino los ladrillos <code>LETRA</code> y <code>DIGITO</code> con clases de caracteres. Después, en la tabla <b>TOKEN / EXP. REG.</b>, armo <code>ID</code>: obliga a empezar con <code>{LETRA}</code> y admite cero o más <code>{LETRA}</code> o <code>{DIGITO}</code> con el <code>*</code>. Los nombres van entre llaves para distinguirlos de los símbolos sueltos.</p>`},
      {q:"¿Por qué las definiciones regulares no pueden ser recursivas?",
       a:`<p>Porque cada definición <code>di</code> debe escribirse usando solo símbolos del alfabeto y nombres <b>definidos antes</b>. Esa restricción garantiza que todo nombre se puede <b>expandir</b> —sustituyendo de arriba hacia abajo— hasta una ER que contiene <b>únicamente símbolos del alfabeto</b>. Si un nombre se usara a sí mismo, esa expansión no terminaría. Además, permitir recursión daría poder de <b>gramática</b> (capaz de describir lenguajes no regulares, como paréntesis balanceados), y las definiciones regulares tienen que quedar dentro de lo <b>regular</b>.</p>`},
      {q:"Escribí una definición regular para un número sin signo (entero o con decimales y exponente opcionales).",
       a:`<pre><code>digito   -> [0-9]
digitos  -> digito digito*
numero   -> digitos ( . digitos )? ( E ( + | - )? digitos )?</code></pre><p>Un <code>numero</code> es una tira de <code>digitos</code> (al menos uno), con una <b>parte decimal opcional</b> —el <code>?</code> sobre <code>( . digitos )</code>— y un <b>exponente opcional</b> —la <code>E</code>, un signo <code>+</code> o <code>-</code> también opcional, y más dígitos—. El <code>?</code> es lo que hace "opcional" cada bloque: puede aparecer o no. Así casan <code>5280</code>, <code>0.01234</code> y <code>6.336E4</code>, pero no <code>1.</code> (falta el dígito después del punto).</p>`},
      {q:"¿Qué relación hay entre el bloque CONJUNTO del parcial y lo que Aho llama «definición regular»?",
       a:`<p>Son <b>lo mismo</b>, con otro nombre. Lo que Aho llama <b>definición regular</b> —darle un nombre a una ER para reusarla, sin recursión— es exactamente lo que la cátedra te hace escribir en el bloque <b>CONJUNTO</b> (los <code>DIGITO</code>, <code>LETRA</code>, <code>DIGITO1</code>) para después usarlos entre llaves en la tabla <b>TOKEN / EXP. REG.</b>. El formato de parcial es la versión práctica de la definición teórica de Aho.</p>`}
    ]
  },
  {
    id:"2.4", titulo:"Extensiones: +, ?, clases [a-z]", aho:"§3.3.5 · p.124", badges:["🎯"], estado:"dictada",
    html:`
<p>Las ER básicas tienen solo tres operadores: unión <code>|</code>, concatenación y clausura <code>*</code>. Con eso alcanza para describir cualquier lenguaje regular, pero escribir se vuelve tedioso. Las <b>extensiones</b> que agregaron herramientas de Unix como Lex son <b>abreviaturas</b> cómodas.</p>

<h3>Las tres extensiones</h3>
<ul>
<li><b>Una o más</b>, <code>r+</code>. Equivale a <code>rr*</code> (una <code>r</code> obligatoria, seguida de cero o más). Leyes útiles: <code>r* = r+|ε</code> y <code>r+ = rr*</code>.</li>
<li><b>Cero o una</b>, <code>r?</code>. Equivale a <code>r|ε</code>: la cosa aparece, o no. Sirve para lo <b>opcional</b> (el signo de un número, la parte decimal).</li>
<li><b>Clases de caracteres</b>, <code>[...]</code>. <code>[abc]</code> abrevia <code>a|b|c</code>. Y si los símbolos son una secuencia lógica, se usa un guion: <code>[a-z]</code> abrevia <code>a|b|...|z</code>, y <code>[0-9]</code> son los dígitos.</li>
</ul>

<h3>La analogía del "etcétera"</h3>
<p>Cuando decís "del 1 al 9" en vez de "1, 2, 3, 4, 5, 6, 7, 8 o 9", no estás diciendo nada <b>nuevo</b>: lo estás diciendo más <b>corto</b>. Eso son las extensiones. <code>[a-z]</code> es "de la a a la z, ya sabés"; <code>r+</code> es "por lo menos uno"; <code>r?</code> es "si querés".</p>

<div class="callout aho"><span class="lab">📘 no agregan poder expresivo</span>Todo lo que escribís con <code>+</code>, <code>?</code> o <code>[a-z]</code> se puede reescribir con solo <code>|</code>, concatenación y <code>*</code>. Es decir, describen <b>exactamente los mismos</b> lenguajes regulares: no permiten expresar nada que antes no pudieras. Son <b>azúcar sintáctico</b> (comodidad de escritura), no más potencia. Por eso <code>r+</code> es apenas una forma corta de <code>rr*</code>.</div>

<h3>El ejemplo de Aho, ya con extensiones</h3>
<pre><code>letra_  -> [A-Za-z_]
digito  -> [0-9]
id      -> letra_ ( letra_ | digito )*

digitos -> digito+
numero  -> digitos ( . digitos )? ( E [+-]? digitos )?</code></pre>
<p>Compará con la versión sin extensiones de 2.3: dice lo mismo, más limpio. <code>digito digito*</code> se volvió <code>digito+</code>; el signo <code>( + | - )?</code> se volvió <code>[+-]?</code>.</p>

<div class="callout tgt"><span class="lab">🎯 dónde aparecen en el parcial</span>Dos usos que caen seguido: <code>[1-9]</code> como primer símbolo para <b>prohibir el cero inicial</b> (un código postal <code>1234</code> sí, <code>0027</code> no), y el <code>?</code> para partes <b>opcionales</b>. Ojo con la distinción: la clase <code>[1-9]</code> restringe la <b>forma</b>, así que va <b>en la ER</b>; en cambio una <b>longitud máxima</b> no es forma, y va en la acción léxica (lo vemos en 2.5).</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li><code>r+</code> = una o más (<code>rr*</code>); <code>r?</code> = cero o una (<code>r|ε</code>); <code>[a-z]</code> = clase/rango (una unión).</li>
<li>🎯 Son <b>abreviaturas</b>: <b>no agregan poder expresivo</b>, solo comodidad.</li>
<li>El <code>?</code> sirve para lo <b>opcional</b>; <code>[1-9]</code> para vetar el cero inicial, y eso sí va en la ER.</li>
</ul>`,
    qa:[
      {q:"Reescribí [1-9][0-9]? usando solo unión, concatenación y clausura.",
       a:`<p><code>[1-9][0-9]?</code> = <code>(1|2|3|4|5|6|7|8|9) ( (0|1|2|3|4|5|6|7|8|9) | ε )</code>. Paso a paso: la clase <code>[1-9]</code> es la unión <code>(1|2|…|9)</code>; la clase <code>[0-9]</code> es <code>(0|1|…|9)</code>; y el <code>?</code> significa "eso o nada", o sea <code>( … | ε )</code>. Al concatenar, queda "un dígito del 1 al 9, seguido opcionalmente de un dígito del 0 al 9" —es decir, un número de una o dos cifras que no empieza con cero.</p>`},
      {q:"¿Qué quiere decir que las extensiones +, ? y [a-z] «no agregan poder expresivo»?",
       a:`<p>Quiere decir que <b>no permiten describir ningún lenguaje que no se pudiera describir ya</b> con los tres operadores básicos (unión, concatenación, clausura). Cualquier ER con extensiones se puede <b>traducir</b> a una equivalente sin ellas: <code>r+</code> es <code>rr*</code>, <code>r?</code> es <code>r|ε</code>, <code>[abc]</code> es <code>a|b|c</code>. Denotan el mismo conjunto de cadenas. Son <b>azúcar sintáctico</b>: ganás legibilidad y brevedad, no capacidad. El conjunto de lenguajes describibles sigue siendo el de los <b>lenguajes regulares</b>.</p>`},
      {q:"Escribí, con clases y operadores + / ?, la ER de un número real con parte decimal opcional.",
       a:`<pre><code>DIGITO   [0-9]
REAL     {DIGITO}+ ( . {DIGITO}+ )?</code></pre><p><code>{DIGITO}+</code> es la parte entera (una o más cifras). El bloque <code>( . {DIGITO}+ )?</code> es la parte decimal <b>opcional</b>: el <code>?</code> hace que pueda estar o no, y si está, exige un punto seguido de <b>al menos una</b> cifra (por eso <code>{DIGITO}+</code> y no <code>*</code>: no querés aceptar <code>3.</code>). Así casan <code>42</code> y <code>3.14</code>, pero no <code>3.</code> ni <code>.5</code>.</p>`},
      {q:"¿Cómo se usa [1-9] para prohibir el cero inicial de un código postal, y por qué esa restricción sí va en la ER?",
       a:`<p>Poniendo <code>[1-9]</code> (o <code>{DIGITO1}</code>) como <b>primer símbolo</b> y <code>[0-9]</code> en el resto: <code>{DIGITO1}{DIGITO}{DIGITO}{DIGITO}</code>. Así, la <b>forma</b> misma del token impide que el primer dígito sea <code>0</code>: <code>0027</code> ni siquiera casa el patrón. Va en la ER —y no en la acción léxica— porque es una restricción sobre la <b>forma</b> de la cadena (qué símbolo puede ocupar la primera posición), y eso es justamente lo que las expresiones regulares saben expresar. En cambio, una condición de <b>longitud o rango</b> no es forma, y va en la acción léxica.</p>`}
    ]
  },
  {
    id:"2.5", titulo:"Taller: ER de parcial + acción léxica", aho:"Práctica 1", badges:["⚙️","🎯"], estado:"dictada",
    html:`
<p>Esta es la lección-taller: juntamos todo lo de módulo 2 en el <b>formato exacto</b> que la cátedra pide en el parcial y en la Práctica 1. Son tres bloques, siempre los mismos.</p>

<h3>Los tres bloques</h3>
<ul>
<li><b>CONJUNTO</b>: tus ladrillos (definiciones regulares): <code>DIGITO [0-9]</code>, <code>DIGITO1 [1-9]</code>, <code>LETRA [A-Za-z]</code>.</li>
<li><b>TOKEN / EXP. REG.</b>: el token armado con esos ladrillos entre llaves.</li>
<li><b>ACCIÓN LÉXICA</b>: el pseudocódigo que corre <b>cuando el token ya se reconoció</b>, donde van las validaciones de <b>longitud</b> y <b>rango</b>.</li>
</ul>

<div class="callout tgt"><span class="lab">🎯 la regla de oro del parcial</span>Lo que es cuestión de <b>longitud</b> o de <b>rango</b> <b>NO</b> va en la expresión regular: va en la <b>acción léxica</b>. Y ese error ocurre en <b>tiempo de compilación</b>, en la <b>etapa léxica</b>. La ER describe la <b>forma</b>; la acción léxica chequea las <b>condiciones numéricas</b> (cuántos caracteres, si se pasa de una cota).</div>

<h3>Ejemplo 1 — código postal (1234 sí, 0027 no)</h3>
<pre><code>CONJUNTO
DIGITO   [0-9]
DIGITO1  [1-9]

TOKEN     EXP. REG.
COD_POST  {DIGITO1}{DIGITO}{DIGITO}{DIGITO}

ACCION LEXICA
{
   if ( len(yytext) == 4 ) return COD_POST;
   else error("Codigo postal invalido");
}</code></pre>
<p>El <code>{DIGITO1}</code> del principio descarta el <b>cero inicial</b> en la propia ER (eso es forma). La <b>longitud exacta</b> se refuerza en la acción con <code>len(yytext)</code>.</p>

<h3>Ejemplo 2 — coordenadas del parcial 2024 (99:45%33:27#)</h3>
<p>Enunciado: pares de dos dígitos a cada lado de <code>:</code>, los dos primeros no pueden ser cero, <code>%</code> separa varios pares, <code>#</code> cierra, máximo 64 caracteres.</p>
<pre><code>CONJUNTO
DIGITO   [0-9]
DIGITO1  [1-9]

TOKEN      EXP. REG.
D1D1       {DIGITO1}{DIGITO1}
DD         {DIGITO}{DIGITO}
COORD      ({D1D1}:{DD}%)*{D1D1}:{DD}#

ACCION LEXICA
{
   if ( len(yytext) &gt; 64 ) error("Supera los 64 caracteres");
   else return COORD;
}</code></pre>
<p>"Los dos primeros no cero" es forma → <code>{DIGITO1}{DIGITO1}</code> en la ER. El <b>tope de 64</b> es longitud → <b>acción léxica</b>.</p>

<h3>Ejemplo 3 — patente Mercosur (AA386NX o DMS109)</h3>
<p>Dos formatos: <b>2 letras, 3 dígitos, 2 letras</b> (autos nuevos) o <b>3 letras, 3 dígitos</b> (formato viejo). Se resuelven con una <b>alternativa</b>:</p>
<pre><code>CONJUNTO
LETRA    [A-Za-z]
DIGITO   [0-9]

TOKEN     EXP. REG.
PATENTE   {LETRA}{LETRA}{DIGITO}{DIGITO}{DIGITO}{LETRA}{LETRA} | {LETRA}{LETRA}{LETRA}{DIGITO}{DIGITO}{DIGITO}

ACCION LEXICA
{
   return PATENTE;
}</code></pre>
<p>Acá <b>todo es forma</b> (cantidades fijas de letras y dígitos), así que la ER sola alcanza y la acción solo devuelve el token. No hay cota que chequear.</p>

<h3>Cómo encarar cualquiera de estos</h3>
<ul>
<li>Definí el <b>alfabeto</b> y separá los <b>ladrillos</b> (dígitos, letras, dígitos-no-cero).</li>
<li>Escribí la <b>forma</b> con la ER: posiciones fijas, alternativas, repeticiones, prohibición del cero inicial.</li>
<li>Mandá a la <b>acción léxica</b> lo que sea <b>longitud</b> o <b>rango</b>.</li>
<li>Acordate: si algo falla, es error de <b>compilación</b>, etapa <b>léxica</b>.</li>
</ul>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Formato: <b>CONJUNTO</b> → <b>TOKEN / EXP. REG.</b> → <b>ACCIÓN LÉXICA</b>.</li>
<li>🎯 <b>Forma</b> (posiciones, cero inicial, alternativas) va en la <b>ER</b>; <b>longitud y rango</b> van en la <b>acción léxica</b>.</li>
<li>El error de la acción léxica es de <b>compilación</b>, etapa léxica.</li>
</ul>`,
    qa:[
      {q:"Definí con expresiones regulares las «constantes coordenada» del parcial 2024: dos dígitos a cada lado de «:», los dos primeros no cero, «%» separa varios pares, «#» cierra, máximo 64 caracteres.",
       a:`<pre><code>CONJUNTO
DIGITO   [0-9]
DIGITO1  [1-9]

TOKEN      EXP. REG.
D1D1       {DIGITO1}{DIGITO1}
DD         {DIGITO}{DIGITO}
COORD      ({D1D1}:{DD}%)*{D1D1}:{DD}#

ACCION LEXICA
{
   if ( len(yytext) &gt; 64 ) error("Supera los 64 caracteres");
   else return COORD;
}</code></pre><p>La <b>forma</b> va en la ER: <code>{DIGITO1}{DIGITO1}</code> impone "los dos primeros no cero", el bloque <code>( ... % )*</code> repite pares separados por <code>%</code>, y <code>#</code> cierra. El <b>máximo de 64</b> es una restricción de <b>longitud</b>, así que va en la <b>acción léxica</b> con <code>len(yytext)</code>, no en la ER. Si se pasa, es error de compilación en la etapa léxica.</p>`},
      {q:"¿Por qué la cota de longitud no se pone en la expresión regular?",
       a:`<p>Por dos razones. Una <b>práctica</b>: una ER que enumere exactamente "hasta 64 caracteres" sería enorme e ingobernable (habría que escribir todas las longitudes posibles). Y una <b>conceptual</b>: la longitud no es parte de la <b>forma</b> del token —de qué símbolos lleva y en qué orden—, sino una <b>condición numérica</b> sobre lo ya reconocido. Las ER describen forma; las condiciones de <b>longitud o rango</b> se validan en la <b>acción léxica</b> con <code>len(yytext)</code>, en tiempo de compilación, etapa léxica.</p>`},
      {q:"Escribí las expresiones regulares para una patente Mercosur, que puede ser AA386NX (2 letras, 3 dígitos, 2 letras) o DMS109 (3 letras, 3 dígitos).",
       a:`<pre><code>CONJUNTO
LETRA    [A-Za-z]
DIGITO   [0-9]

TOKEN     EXP. REG.
PATENTE   {LETRA}{LETRA}{DIGITO}{DIGITO}{DIGITO}{LETRA}{LETRA} | {LETRA}{LETRA}{LETRA}{DIGITO}{DIGITO}{DIGITO}

ACCION LEXICA
{
   return PATENTE;
}</code></pre><p>Los dos formatos se resuelven con una <b>alternativa</b> <code>|</code>: a la izquierda el formato nuevo (2 letras, 3 dígitos, 2 letras), a la derecha el viejo (3 letras, 3 dígitos). Acá <b>todo es forma</b> —cantidades fijas de letras y dígitos—, así que la ER sola alcanza y la acción léxica solo devuelve el token; no hay longitud ni rango que validar.</p>`},
      {q:"En una constante entera de tipo short int (rango -32768 a 32767), ¿qué va en la ER y qué en la acción léxica? ¿Cuándo se dispara el error?",
       a:`<p>En la <b>ER</b> va la <b>forma</b>: que sea una tira de dígitos, con un signo opcional; por ejemplo <code>[+-]? {DIGITO}+</code>. En la <b>acción léxica</b> va el <b>rango</b>: una función que toma el valor de <code>yytext</code>, lo convierte a número y verifica que esté entre -32768 y 32767; si se pasa, lanza el error. El error se dispara en <b>tiempo de compilación</b>, en la <b>etapa léxica</b>, porque la constante es un <b>literal fijo</b> en el fuente y su valor se conoce sin ejecutar el programa. (Distinto sería una cota superada por un dato <b>leído</b> en ejecución: eso sí sería error de ejecución.)</p>`}
    ]
  }
]});
