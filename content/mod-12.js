M.push({ id:12, titulo:"Generación de código final", parcial:"II",
  resumen:"El back-end del compilador: cómo la notación intermedia se vuelve Assembler real que corre en la máquina. Primero el marco de Aho (📘): las tres cuestiones del generador (selección de instrucciones, registros, orden), los bloques básicos y el grafo de flujo, y el generador simple con descriptores. Después lo que sí toma la cátedra (🎯): generaAssembler() invocada UNA sola vez desde la regla del start, el coprocesador matemático 8087 con su pila LIFO ST(0)..ST(7), las comparaciones con FCOMP + FSTSW AX + SAHF y los bits c3/c0, el esqueleto .MODEL/.DATA/.CODE, y un taller que pasa z := a+b*c-d/(e+f)+20 a Assembler desde el árbol, la polaca y los tercetos, mostrando que las tres convergen al mismo .asm.",
  lecciones:[
  {
    id:"12.1", titulo:"Cuestiones del generador: selección, registros, orden", aho:"§8.1 · p.506", badges:["📘"], estado:"dictada",
    html:`
<p>Llegamos al <b>back-end</b> del compilador: la última fase, donde la notación intermedia (árbol, polaca o tercetos) se convierte en el <b>código de la máquina destino</b> — en nuestro caso, Assembler. Aho abre el capítulo diciendo que un generador de código tiene <b>tres tareas principales</b>: <b>selección de instrucciones</b>, <b>asignación de registros</b> y <b>orden de evaluación</b>. Todo lo demás del módulo son detalles de estas tres.</p>

<h3>La analogía del traductor de un manuscrito ya corregido</h3>
<p>Pensá el generador como un <b>traductor</b> que recibe un manuscrito <b>ya revisado</b> (la representación intermedia, con todos los errores léxicos, sintácticos y de tipos ya resueltos) y tiene que pasarlo al <b>idioma destino</b> (el Assembler). Toma tres decisiones: <b>qué palabras usar</b> para cada frase (selección de instrucciones), <b>qué pocas notas dejar a mano sobre el escritorio</b> en vez de archivarlas (los registros, que son escasos) y <b>en qué orden</b> traducir las oraciones (orden de evaluación) para necesitar menos notas. Elegir bien las tres es la diferencia entre una traducción correcta pero torpe y una ágil.</p>

<h3>La entrada: RI + tabla de símbolos, y todo ya chequeado</h3>
<p>La entrada del generador es la <b>representación intermedia</b> del programa más la <b>tabla de símbolos</b> (que da las direcciones en tiempo de ejecución de cada nombre). Aho hace una suposición <b>clave para la cátedra</b>: cuando el código llega al generador, ya se <b>detectaron todos los errores</b> sintácticos y semánticos, ya se hizo la <b>comprobación de tipos</b> y ya se <b>insertaron las conversiones</b> donde hacían falta. Por eso el generador «no se preocupa» por los tipos — es la misma razón por la que la cátedra usa siempre <code>FLD</code> y no <code>FILD</code> (lección 12.5): a esta altura los controles de tipo ya se hicieron en etapas previas.</p>

<h3>Las tres tareas, una por una</h3>
<ul>
<li><b>Selección de instrucciones:</b> mapear cada operación de la RI a una secuencia de instrucciones de máquina. Una traducción ingenua produce cargas y almacenamientos <b>redundantes</b> (por ejemplo, guardar un valor en memoria y volver a cargarlo en la instrucción siguiente). Y a veces hay una instrucción especial: <code>a = a + 1</code> conviene con un <code>INC a</code> en vez de cargar, sumar y guardar.</li>
<li><b>Asignación de registros:</b> decidir qué valores viven en registros. Los registros son <b>lo más rápido</b> de la máquina, pero <b>no alcanzan</b> para todos los valores; lo que no entra vive en memoria. Encontrar la asignación óptima es un problema <b>NP-completo</b> (difícil incluso con un solo registro).</li>
<li><b>Orden de evaluación:</b> el orden en que se calculan las subexpresiones <b>cambia cuántos registros hacen falta</b>. Reordenar puede ahorrar registros (y las cargas y almacenamientos asociados).</li>
</ul>

<h3>El programa destino: tres formas de salida</h3>
<p>La salida puede ser código máquina <b>absoluto</b> (se ubica en una dirección fija y corre ya mismo), código <b>reubicable</b> (módulos objeto que se enlazan y cargan después, permitiendo compilación separada) o <b>Assembler</b> (código simbólico). Aho —y la cátedra— eligen <b>Assembler como salida</b>: facilita la generación (podés usar nombres simbólicos y macros) a cambio de un paso extra de ensamblado. Es exactamente lo que hace el TP: genera un archivo <code>.asm</code>.</p>

<div class="callout aho"><span class="lab">📘 de Aho, no de parcial (pero enmarca todo)</span>
Aho desarrolla estas tres tareas sobre una <b>máquina genérica tipo RISC</b> con registros e instrucciones <code>LD</code>, <code>ST</code>, <code>ADD</code>. La cátedra <b>no</b> usa esa máquina: usa el <b>coprocesador 8087</b>, que en vez de registros con nombre tiene una <b>pila</b> (lección 12.5). Por eso la «asignación de registros» prácticamente <b>desaparece</b> en el TP: en una máquina de pila no elegís registro, apilás y desapilás. Igual conviene tener el marco de Aho en la cabeza, porque explica <b>por qué</b> existe el generador y qué problemas resuelve.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>El generador de código es el <b>back-end</b>: convierte la representación intermedia en código de la máquina destino (para la cátedra, Assembler).</li>
<li>Tres tareas: <b>selección de instrucciones</b>, <b>asignación de registros</b> (escasos, NP-completo) y <b>orden de evaluación</b>.</li>
<li>La entrada es la <b>RI + la tabla de símbolos</b>, y llega con <b>todo ya chequeado</b> (léxico, sintáctico, tipos y conversiones). Por eso el generador no vuelve a controlar tipos.</li>
<li>La salida puede ser absoluta, reubicable o <b>Assembler</b>; la cátedra genera un <code>.asm</code>.</li>
</ul>`,
    qa:[
      {q:"¿Cuáles son las tres tareas principales de un generador de código?",
       a:`<p>(1) <b>Selección de instrucciones</b>: mapear cada operación de la representación intermedia a una secuencia de instrucciones de la máquina destino. (2) <b>Asignación de registros</b>: decidir qué valores se guardan en registros, que son la unidad más rápida pero <b>escasa</b> (encontrar la asignación óptima es NP-completo). (3) <b>Orden de evaluación</b>: en qué orden se calculan las operaciones, lo que afecta <b>cuántos registros</b> hacen falta. El criterio dominante por encima de las tres es que el código generado sea <b>correcto</b>; después viene que sea eficiente en velocidad y tamaño. Ejemplo de mala selección: traducir <code>a = a + 1</code> como cargar, sumar y guardar, cuando existe un <code>INC a</code> que lo hace en una sola instrucción.</p>`},
      {q:"¿Qué recibe como entrada el generador de código y en qué estado llega ese código?",
       a:`<p>Recibe la <b>representación intermedia</b> del programa (árbol, polaca, tercetos, código de tres direcciones) junto con la <b>tabla de símbolos</b>, que aporta las direcciones en tiempo de ejecución de cada nombre. Llega en un estado <b>ya limpio</b>: Aho supone que a esta altura se <b>detectaron todos los errores</b> léxicos, sintácticos y semánticos, se hizo la <b>comprobación de tipos</b> y se <b>insertaron las conversiones</b> necesarias. Por eso el generador puede trabajar «sin preocuparse» por los tipos. Esta suposición es la que justifica, en la cátedra, usar siempre <code>FLD</code> (y no distinguir <code>FILD</code> para enteros): los controles de tipo ya se hicieron.</p>`},
      {q:"¿Por qué la cátedra genera Assembler como salida y no código máquina directo?",
       a:`<p>Porque <b>facilita la generación de código</b>. Al producir Assembler podés emitir instrucciones <b>simbólicas</b> (con nombres de variables en lugar de direcciones) y apoyarte en las <b>macros del ensamblador</b>, en vez de calcular vos mismo direcciones absolutas o reubicables. El precio es un <b>paso extra de ensamblado</b> después de la generación. Las otras dos salidas posibles son código máquina <b>absoluto</b> (corre ya, en dirección fija) y <b>reubicable</b> (módulos objeto que se enlazan y cargan, permitiendo compilación separada). El TP de la cátedra sigue el camino de Aho: genera un archivo <code>.asm</code> que después se ensambla.</p>`},
      {q:"¿Por qué la asignación de registros casi desaparece en el TP de la cátedra?",
       a:`<p>Porque la cátedra no usa la máquina genérica con registros de Aho, sino el <b>coprocesador matemático 8087</b>, que es una <b>máquina de pila</b>. En una máquina de pila no hay que <b>elegir</b> en qué registro poner cada valor ni llevar descriptores: se <b>apila</b> con <code>FLD</code>, se opera siempre sobre el <b>tope</b> y se <b>desapila</b>. El difícil problema NP-completo de repartir y asignar registros —central en Aho— se vuelve casi trivial: cada operación es siempre «cargá los dos operandos, operá, guardá el resultado en una auxiliar». Por eso la generación de Assembler del TP es tan mecánica.</p>`}
    ]
  },
  {
    id:"12.2", titulo:"Bloques básicos y grafo de flujo", aho:"§8.4 · p.525", badges:["📘"], estado:"dictada",
    html:`
<p>Un <b>bloque básico</b> es una <b>secuencia máxima de instrucciones consecutivas</b> con dos propiedades: el control <b>solo puede entrar por la primera</b> instrucción (no hay saltos hacia el medio) y <b>solo puede salir por la última</b> (no hay bifurcaciones en el medio, salvo tal vez la última instrucción). El <b>grafo de flujo</b> toma esos bloques como <b>nodos</b> y los une con flechas según qué bloque puede seguir a cuál. Es la representación sobre la que se apoya casi toda la optimización.</p>

<h3>La analogía de la calle de una sola mano</h3>
<p>Un bloque básico es como una <b>calle de una sola mano y sin bocacalles en el medio</b>: si entrás por una punta, tenés la <b>garantía</b> de que vas a salir por la otra, sin desvíos ni ingresos intermedios. Podés razonar sobre todo lo que pasa adentro con total tranquilidad, porque nadie se mete ni se va a mitad de camino. El <b>grafo de flujo</b> es el <b>mapa de la ciudad</b> que conecta esas calles de una sola mano: te dice desde qué esquina se puede llegar a cuál.</p>

<h3>Cómo se parte el código: buscar los «líderes»</h3>
<p>Para partir una secuencia de tres direcciones en bloques, Aho busca primero las instrucciones <b>líderes</b> (la primera de cada bloque) con tres reglas:</p>
<ol>
<li>La <b>primera instrucción</b> del código es líder.</li>
<li>Toda instrucción que sea <b>destino de un salto</b> (condicional o incondicional) es líder.</li>
<li>Toda instrucción que venga <b>justo después de un salto</b> es líder.</li>
</ol>
<p>Cada líder arranca un bloque que llega <b>hasta (sin incluir) el próximo líder</b>. Los saltos son, entonces, los que «cortan» el código en bloques.</p>

<h3>El grafo de flujo: nodos y flechas</h3>
<p>Los bloques son los <b>nodos</b>. Hay una flecha del bloque B al C si el control puede pasar de B a C: porque B <b>termina en un salto</b> a C, o porque C <b>sigue justo después</b> de B y B no termina en un salto incondicional. Se agregan dos nodos especiales, <b>entrada</b> (apunta al primer bloque) y <b>salida</b> (adonde llegan los bloques que pueden terminar el programa). Se dice que B es <b>predecesor</b> de C y que C es <b>sucesor</b> de B.</p>

<h3>El caso borde: las interrupciones</h3>
<p>¿Y si una instrucción como <code>x = y / z</code> <b>aborta</b> el programa cuando <code>z</code> es 0? Parece romper la promesa de «una vez que entraste, salís por el final». Aho responde que <b>no hay que preocuparse</b>: si ocurre una interrupción, o se maneja y el control <b>vuelve</b> a la misma instrucción (como si nunca se hubiera desviado), o el programa <b>se detiene con error</b> — y en ese caso no importa cómo optimizamos, porque el programa igual no dio su resultado esperado. La división por cero con divisor variable, además, es un error de <b>ejecución</b>, no de compilación.</p>

<div class="callout aho"><span class="lab">📘 de Aho, no de parcial (pero es el suelo de la optimización)</span>
La cátedra no te va a pedir «partí este código en bloques básicos y dibujá el grafo de flujo». Pero el concepto es <b>el piso sobre el que se para el módulo 13</b>: cuando decimos que la redundancia se busca «mientras las variables no cambien de valor», o que hay «código muerto», o que se saca «código invariante» de un bucle, estamos razonando <b>dentro de un bloque básico</b> o sobre el grafo de flujo. Sin la garantía de una sola entrada y una sola salida, no podrías asegurar que un valor calculado sigue vigente unas líneas más abajo.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Un <b>bloque básico</b> es una secuencia máxima con <b>una sola entrada</b> (la primera instrucción) y <b>una sola salida</b> (la última): sin saltos hacia el medio ni bifurcaciones internas.</li>
<li>Se arma buscando <b>líderes</b>: la primera instrucción, los destinos de saltos y lo que sigue a un salto.</li>
<li>El <b>grafo de flujo</b> tiene los bloques como nodos y flechas según el flujo de control posible; con nodos de <b>entrada</b> y <b>salida</b>.</li>
<li>Es la base de la <b>optimización</b> (módulo 13): razonar «dentro de un bloque» exige esa única entrada / única salida.</li>
</ul>`,
    qa:[
      {q:"¿Qué es un bloque básico y qué dos propiedades lo definen?",
       a:`<p>Es una <b>secuencia máxima de instrucciones consecutivas</b> con dos propiedades: (1) el flujo de control <b>solo entra por la primera</b> instrucción del bloque —no hay saltos hacia el medio— y (2) el control <b>solo sale por la última</b> —no hay bifurcaciones en el medio, salvo tal vez la última instrucción—. «Máxima» significa que se extiende lo más posible sin violar esas reglas. En criollo: si entraste al bloque, tenés la <b>garantía</b> de ejecutar todas sus instrucciones hasta el final, en orden. Los bloques básicos son los <b>nodos</b> del grafo de flujo y la unidad sobre la que se razona para optimizar.</p>`},
      {q:"¿Cómo se encuentran los límites de los bloques básicos (los líderes)?",
       a:`<p>Se buscan las instrucciones <b>líderes</b> (la primera de cada bloque) con tres reglas: (1) la <b>primera</b> instrucción del código intermedio es líder; (2) toda instrucción que sea <b>destino de un salto</b> condicional o incondicional es líder; (3) toda instrucción que venga <b>inmediatamente después de un salto</b> es líder. Una vez identificados los líderes, el bloque de cada líder abarca desde él <b>hasta (sin incluir) el siguiente líder</b> o el fin del programa. En la práctica, los <b>saltos</b> y sus destinos son los que cortan la secuencia en bloques: donde puede desviarse el control, ahí empieza o termina un bloque.</p>`},
      {q:"¿Qué es el grafo de flujo y cuándo hay una flecha de un bloque a otro?",
       a:`<p>El <b>grafo de flujo</b> representa el flujo de control entre bloques: sus <b>nodos</b> son los bloques básicos y sus <b>flechas</b> indican qué bloque puede ejecutarse después de cuál. Hay una flecha de B a C en dos casos: (1) B <b>termina en un salto</b> (condicional o incondicional) cuyo destino es el inicio de C, o (2) C <b>sigue inmediatamente</b> a B en el orden original y B <b>no</b> termina en un salto incondicional (el control «cae» naturalmente a C). Se agregan dos nodos ficticios, <b>entrada</b> (apunta al primer bloque) y <b>salida</b> (destino de los bloques que pueden terminar el programa). B es <b>predecesor</b> de C; C es <b>sucesor</b> de B.</p>`},
      {q:"Una instrucción x = y / z puede abortar si z es 0. ¿Eso rompe la idea de bloque básico?",
       a:`<p>No, y Aho lo aclara expresamente. Es cierto que <code>x = y / z</code> parece no afectar el flujo de control pero podría abortar el programa si <code>z</code> es 0, una «interrupción» no visible en el código. Aho dice que <b>no hay que preocuparse</b>: cuando ocurre una interrupción, o bien se maneja y el control <b>regresa</b> a la misma instrucción (como si nunca se hubiera desviado), o bien el programa <b>se detiene con error</b>. En este último caso, no importa cómo hayamos optimizado el bloque, porque el programa igual no produjo su resultado. Además, la división por cero con divisor variable es un error de <b>tiempo de ejecución</b>, no algo que el generador de código deba prever.</p>`}
    ]
  },
  {
    id:"12.3", titulo:"Un generador simple: descriptores de registros y direcciones", aho:"§8.6 · p.542", badges:["📘"], estado:"dictada",
    html:`
<p>Aho cierra su parte «genérica» con un <b>generador de código simple</b> que traduce <b>un bloque básico</b>, tomando una instrucción de tres direcciones por vez y tratando de <b>no generar cargas ni almacenamientos de más</b>. Para lograrlo lleva dos estructuras de contabilidad: el <b>descriptor de registros</b> y el <b>descriptor de direcciones</b>.</p>

<h3>La analogía de los dos pizarrones</h3>
<p>Imaginá que trabajás con <b>pocos post-its</b> (los registros) y un <b>archivador</b> (la memoria). Tenés dos pizarrones para no perderte:</p>
<ul>
<li><b>Descriptor de registros</b> = «qué tengo escrito en cada post-it ahora mismo»: para cada registro, qué variable tiene su valor.</li>
<li><b>Descriptor de direcciones</b> = «para cada variable, dónde tengo una copia válida»: en un post-it (registro), en el archivador (memoria) o en <b>ambos</b>.</li>
</ul>
<p>Con esa contabilidad, antes de cargar una variable preguntás «¿ya la tengo en un post-it?»; si sí, te ahorrás la carga. Antes de pisar un post-it preguntás «¿el valor que voy a borrar está a salvo en el archivador?»; si no, lo guardás primero.</p>

<h3>El algoritmo, para x = y + z</h3>
<p>La función <code>obtenReg</code> elige los registros Rx, Ry, Rz. Después:</p>
<ol>
<li>Si <code>y</code> no está ya en Ry, generar <code>LD Ry, y</code> (cargarla desde donde diga su descriptor de direcciones).</li>
<li>Si <code>z</code> no está en Rz, generar <code>LD Rz, z</code>.</li>
<li>Generar <code>ADD Rx, Ry, Rz</code>.</li>
<li>Actualizar los descriptores: Rx ahora tiene a <code>x</code>; el valor de <code>x</code> ya <b>no</b> está en memoria (solo en Rx); y sacar Rx de los descriptores de cualquier otra variable.</li>
</ol>
<p>Al <b>terminar el bloque</b>, las variables que están <b>vivas a la salida</b> y solo viven en un registro se guardan en memoria con <code>ST x, R</code>. Las temporales locales al bloque se pueden descartar.</p>

<h3>El caso especial: la copia x = y</h3>
<p>Para una instrucción de copia <code>x = y</code>, <code>obtenReg</code> elige el <b>mismo registro</b> para las dos. Si <code>y</code> ya estaba en su registro, <b>no se genera ninguna carga</b>: solo se anota en el descriptor que ese registro ahora también contiene a <code>x</code>. Es la optimización más barata que hay: no hacer nada.</p>

<div class="callout aho"><span class="lab">📘 de Aho, no de parcial — y por qué el TP no lo usa</span>
Todo este malabar de <b>elegir registros y llevar descriptores</b> es porque la máquina de Aho tiene <b>registros con nombre y escasos</b>. La cátedra usa el <b>coprocesador 8087</b>, que es una <b>máquina de pila</b> (12.5): ahí <b>no elegís registro</b> ni llevás descriptores — apilás con <code>FLD</code>, operás sobre el tope y desapilás. Por eso en el TP la generación de Assembler es mucho más mecánica: cada operación es siempre «cargá los dos operandos, operá, guardá en una <code>@aux</code>». Ver el generador de Aho te hace apreciar <b>cuánto</b> simplifica la pila.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>El generador simple traduce <b>un bloque básico</b>, instrucción por instrucción, evitando cargas y almacenamientos redundantes.</li>
<li><b>Descriptor de registros</b>: qué variable tiene cada registro. <b>Descriptor de direcciones</b>: dónde está el valor de cada variable (registro, memoria o ambos).</li>
<li><code>obtenReg</code> elige los registros; se cargan los operandos que falten, se opera y se <b>actualizan los descriptores</b>.</li>
<li>Es la versión <b>genérica</b> de Aho; la <b>máquina de pila</b> del coprocesador (12.5) vuelve todo esto innecesario en el TP.</li>
</ul>`,
    qa:[
      {q:"¿Qué anota el descriptor de registros y qué anota el descriptor de direcciones?",
       a:`<p>El <b>descriptor de registros</b> lleva, para <b>cada registro</b>, qué variable (o variables) tiene su valor actual en ese registro en cada momento. El <b>descriptor de direcciones</b> lleva, para <b>cada variable</b> del programa, <b>dónde</b> se encuentra su valor actual: en un registro, en su dirección de memoria, o en <b>ambos</b> a la vez. Se usan juntos para tomar decisiones: antes de cargar un operando, se consulta el descriptor de direcciones para ver si ya está en un registro (y ahorrarse la carga); antes de reutilizar un registro, se consulta el descriptor de registros para saber si el valor que contiene ya está guardado en memoria.</p>`},
      {q:"¿Cómo evita el generador simple las cargas y almacenamientos redundantes?",
       a:`<p>Gracias a los descriptores. Antes de generar un <code>LD</code> (carga), pregunta al descriptor de direcciones si la variable <b>ya está en el registro</b> que va a usar: si sí, <b>omite la carga</b>. Antes de guardar un resultado en memoria, verifica si hace falta (si la variable está viva a la salida y no tiene copia en memoria). El caso más claro es la <b>copia <code>x = y</code></b>: <code>obtenReg</code> asigna el mismo registro a las dos, y si <code>y</code> ya estaba ahí, <b>no genera nada</b>, solo anota que el registro ahora también representa a <code>x</code>. Una traducción ingenua, sin descriptores, cargaría y guardaría cada operando siempre, produciendo instrucciones redundantes.</p>`},
      {q:"¿Qué pasa con las variables al terminar el bloque básico?",
       a:`<p>Hay que <b>salvar a memoria</b> lo que siga haciendo falta. Para cada variable que esté <b>viva a la salida</b> del bloque (o si no se sabe qué variables están vivas) y cuyo valor actual esté <b>solo en un registro</b> (su descriptor de direcciones no la muestra en memoria), se genera <code>ST x, R</code> para guardarla. En cambio, las variables <b>temporales locales</b> al bloque, cuyos usos ya pasaron todos, se pueden <b>descartar</b>: se olvida su valor y se considera libre su registro. Así, al cerrar el bloque, el estado de la memoria queda consistente para los bloques siguientes.</p>`},
      {q:"¿Por qué el TP de la cátedra no necesita descriptores de registros?",
       a:`<p>Porque el coprocesador 8087 es una <b>máquina de pila</b>, no una máquina de registros con nombre. En Aho, los descriptores existen para resolver el problema difícil de <b>elegir</b> qué valor va a qué registro escaso y de no perder copias. En una pila LIFO no hay elección: se <b>apila</b> con <code>FLD</code>, se opera siempre sobre el <b>tope</b> (<code>ST(0)</code> y <code>ST(1)</code>) y se <b>desapila</b>. Cada operación intermedia se guarda en una variable auxiliar <code>@aux</code> y listo. Al no haber que decidir registros ni rastrear dónde vive cada valor, los descriptores <b>sobran</b> y la generación de código se vuelve un patrón fijo y repetitivo.</p>`}
    ]
  },
  {
    id:"12.4", titulo:"La cátedra: generaAssembler() una sola vez desde el start", aho:"Apunte", badges:["🎯"], estado:"dictada",
    html:`
<p>Entramos en <b>terreno de parcial</b> 🎯. La función estrella del back-end de la cátedra es <code>generaAssembler()</code>: <b>recorre la notación intermedia</b> (árbol, polaca o tercetos, según la que te haya tocado) y <b>escribe el archivo <code>.asm</code></b> con el código del coprocesador. La pregunta clásica no es tanto «qué hace» sino <b>desde dónde y cuántas veces se llama</b>.</p>

<h3>La analogía de la receta que se cocina entera</h3>
<p>La notación intermedia es como una <b>receta que vas anotando entera</b>, paso por paso, a medida que el parser reduce reglas. <code>generaAssembler()</code> es el <b>cocinero</b>. No le pasás media receta: esperás a tener <b>el último ingrediente anotado</b> —y eso pasa exactamente cuando se reduce por la regla del <b>símbolo distinguido</b> (start), que es la señal de que <b>todo el programa se parseó y la GCI terminó</b>— y recién ahí le entregás la receta completa al cocinero, <b>una sola vez</b>, para que la convierta en movimientos concretos (las instrucciones Assembler).</p>

<div class="callout tgt"><span class="lab">🎯 la pregunta que cae seguro</span>
<code>generaAssembler()</code> se invoca <b>UNA sola vez</b>, desde la <b>acción semántica de la regla del start symbol</b>, y <b>solo cuando la generación de código intermedio terminó por completo</b>. <b>No debe existir ninguna otra función que traduzca a Assembler en el resto de las reglas.</b> Si generaras Assembler en reglas intermedias, estarías traduciendo código a medio construir, sin saber todavía qué viene después.</div>

<h3>Por qué desde el start y no antes</h3>
<p>Durante el parsing, las acciones semánticas van <b>construyendo</b> la notación intermedia (crean nodos del árbol, insertan en la polaca, arman tercetos). El Assembler se genera <b>recorriendo esa estructura ya completa</b>. Como el start symbol se reduce <b>al final</b> (es la última reducción del parsing ascendente), su acción semántica es el <b>único lugar</b> donde tenés la garantía de que la RI está entera. En la gramática se ve así:</p>
<pre><code>1. start  → sel        { generaAssembler(); }
2. sel    → IF cond THEN accion ENDIF
3. cond   → ID &lt; CTE
4. accion → ID := exp
   ...</code></pre>
<p>Solo la <b>regla 1</b> lleva la llamada. Las demás reglas construyen la RI, pero <b>ninguna</b> traduce a Assembler.</p>

<h3>Cómo recorre cada notación</h3>
<ul>
<li><b>Árbol → ASM:</b> se busca el <b>subárbol de más a la izquierda con hijos hoja</b>, se genera su código creando una <b>variable auxiliar</b> <code>@aux</code>, y se <b>reemplaza el subárbol por esa auxiliar</b>. Se repite hasta consumir el árbol. (Si el operador es <b>unario</b>, el subárbol tiene un solo hijo hoja.)</li>
<li><b>Polaca → ASM:</b> se recorre de izquierda a derecha <b>apilando operandos</b>. Ante un <b>operador binario</b>: se <b>desapilan 2</b>, se genera el código con una <code>@aux</code>, y se <b>apila la <code>@aux</code></b>. (Unario: desapilar 1.)</li>
<li><b>Tercetos → ASM:</b> se recorre desde el primero, se genera código por cada terceto creando una <code>@aux</code>, y se <b>anota en el terceto</b> qué auxiliar guarda su resultado, para que los tercetos que lo referencian usen esa auxiliar.</li>
</ul>

<h3>El detalle de las auxiliares</h3>
<p>Las variables intermedias llevan el prefijo <code>@</code> (<code>@aux1</code>, <code>@aux2</code>…) <b>para no chocar con palabras reservadas del Assembler</b>. Todas se declaran en el segmento <code>.DATA</code> (lección 12.7). El resultado de cada operación queda en su <code>@aux</code>, que se convierte en el operando de la operación siguiente.</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li><code>generaAssembler()</code> recorre la notación intermedia <b>completa</b> y produce el <code>.asm</code>.</li>
<li>🎯 Se llama <b>una sola vez</b>, desde la <b>acción semántica de la regla del start</b>, y <b>solo</b> cuando la GCI terminó. <b>Ninguna otra regla</b> traduce a Assembler.</li>
<li>Recorridos: <b>árbol</b> (subárbol más a la izquierda con hojas → <code>@aux</code>), <b>polaca</b> (apilar operandos; binario → desapilar 2, <code>@aux</code>, apilar), <b>tercetos</b> (uno por uno, anotando la <code>@aux</code>).</li>
<li>Las auxiliares llevan prefijo <code>@</code> para no chocar con reservadas del Assembler.</li>
</ul>`,
    qa:[
      {q:"¿Desde qué regla y cuántas veces se invoca generaAssembler()? ¿Por qué?",
       a:`<p>Se invoca <b>una sola vez</b>, desde la <b>acción semántica de la regla del símbolo distinguido (start)</b>, y recién cuando la generación de código intermedio <b>terminó por completo</b>. El motivo: la traducción a Assembler <b>recorre la representación intermedia ya entera</b> (el árbol completo, toda la polaca, todos los tercetos). El start symbol se reduce <b>al final</b> del parsing ascendente, así que su acción semántica es el único punto con la garantía de que la RI está completa. Si se generara Assembler en reglas intermedias, se estaría traduciendo código a medio construir. Corolario que también cae: <b>no debe existir ninguna otra función</b> que traduzca a Assembler en el resto de las reglas.</p>`},
      {q:"V/F, justificando: «En el camino por árbol, generaAssembler() se llama en cada regla que crea un nodo.»",
       a:`<p><b>Falso.</b> Las reglas que crean nodos (<code>crear_nodo</code>, <code>crear_hoja</code>) <b>construyen</b> el árbol, pero <b>no</b> generan Assembler. La traducción a Assembler ocurre <b>una sola vez</b>, al final, desde la acción semántica de la regla del <b>start</b>, cuando el árbol ya está armado por completo y apuntado por el puntero del símbolo distinguido. Recién ahí <code>generaAssembler()</code> recorre el árbol (buscando el subárbol de más a la izquierda con hijos hoja, generando una <code>@aux</code> y reemplazando el subárbol por ella, en bucle). Poner la generación en cada regla intermedia traduciría subárboles sueltos sin conocer el contexto completo, y contradice la consigna de que ninguna otra regla traduce a Assembler.</p>`},
      {q:"¿Cómo recorre generaAssembler() una polaca inversa para traducirla a Assembler?",
       a:`<p>Recorre la polaca <b>de izquierda a derecha usando una pila</b>, <b>apilando los operandos</b> a medida que aparecen. Cuando encuentra un <b>operador binario</b>, hace tres cosas: (1) <b>desapila los 2</b> operandos de arriba; (2) genera el código de la operación creando una <b>variable auxiliar</b> <code>@auxN</code> (por ejemplo <code>FLD op1</code>, <code>FLD op2</code>, la operación <code>FADD/FSUB/FMUL/FDIV</code>, <code>FSTP @auxN</code>); (3) <b>apila <code>@auxN</code></b>, que representa el resultado y servirá de operando para la siguiente operación. Si el operador es <b>unario</b>, desapila 1 en vez de 2. Es la misma pila de operandos que mencionamos como «la pila del Assembler» (distinta de la pila de celdas de las sentencias de control).</p>`},
      {q:"¿Por qué las variables auxiliares llevan el prefijo @ (@aux1, @aux2…)?",
       a:`<p>Para <b>no chocar con las palabras reservadas del Assembler</b>. Las auxiliares se inventan durante la generación de código para guardar resultados intermedios, y si se llamaran, por ejemplo, <code>add</code> o <code>mul</code>, colisionarían con mnemónicos o directivas del ensamblador y el código no compilaría. El prefijo <code>@</code> garantiza nombres que el Assembler <b>no</b> interpreta como instrucciones. Por la misma lógica, las <b>constantes</b> se declaran con prefijo <code>_</code> (por ejemplo <code>_20</code>). Todas estas auxiliares y constantes se declaran en el segmento <code>.DATA</code>.</p>`}
    ]
  },
  {
    id:"12.5", titulo:"Coprocesador 8087: pila LIFO ST(0)..ST(7)", aho:"Apunte + Lista de Comandos", badges:["🎯"], estado:"dictada",
    html:`
<p>El <b>coprocesador matemático</b> (el 8087, y sus sucesores 80287/80387) es un circuito especializado en <b>punto flotante</b> y funciones trigonométricas y logarítmicas. Internamente opera con <b>80 bits</b> de precisión. Su corazón son <b>8 registros de 80 bits organizados como una pila LIFO</b>: <code>ST(0)</code>, <code>ST(1)</code>, …, <code>ST(7)</code>. Todas sus instrucciones empiezan con <b>F</b> (de floating point): <code>FLD</code>, <code>FADD</code>, <code>FSTP</code>…</p>

<h3>La analogía de la pila de bandejas</h3>
<p>Pensá los 8 registros como una <b>torre de 8 bandejas con resorte</b>, de esas de cafetería. <code>ST(0)</code> es <b>siempre la bandeja de arriba</b>, la única que tocás. Cuando <b>cargás</b> un dato nuevo con <code>FLD</code> (un <b>push</b>), la torre entera <b>baja un nivel</b>: lo que estaba en <code>ST(0)</code> pasa a <code>ST(1)</code>, lo de <code>ST(1)</code> a <code>ST(2)</code>, y así… y <b>lo que estaba en <code>ST(7)</code> se cae y se pierde</b>. Las operaciones aritméticas toman las <b>dos bandejas de arriba</b>, las combinan y dejan <b>una</b>: la pila se achica en uno.</p>

<h3>Las instrucciones que usa la cátedra</h3>
<table>
<tr><th>Instrucción</th><th>Qué hace</th></tr>
<tr><td><code>FLD n</code></td><td><b>push</b>: carga a <code>ST(0)</code> un real desde memoria (DD, DQ o DT)</td></tr>
<tr><td><code>FILD n</code></td><td>ídem, pero desde un <b>entero</b> (lo convierte a flotante)</td></tr>
<tr><td><code>FST dest</code></td><td>copia <code>ST(0)</code> a memoria (<b>no</b> hace pop)</td></tr>
<tr><td><code>FSTP dest</code></td><td>copia <code>ST(0)</code> a memoria <b>y hace pop</b></td></tr>
<tr><td><code>FADD</code></td><td><code>ST(1) := ST(1) + ST(0)</code>, y <b>pop</b> (el resultado queda en el nuevo tope)</td></tr>
<tr><td><code>FSUB</code></td><td><code>ST(1) := ST(1) - ST(0)</code>, <b>pop</b></td></tr>
<tr><td><code>FMUL</code></td><td><code>ST(1) := ST(1) * ST(0)</code>, <b>pop</b></td></tr>
<tr><td><code>FDIV</code></td><td><code>ST(1) := ST(1) / ST(0)</code>, <b>pop</b></td></tr>
<tr><td><code>FFREE i</code></td><td>vacía el registro <code>i</code> (sin parámetro, limpia la pila)</td></tr>
</table>

<h3>Un micro-ejemplo: calcular b + c</h3>
<pre><code>FLD b        ; push b          → ST(0)=b
FLD c        ; push c          → ST(0)=c, ST(1)=b
FADD         ; ST(1):=b+c, pop → ST(0)=b+c
FSTP @aux1   ; @aux1:=b+c, pop → pila vacía</code></pre>
<p>Fijate el patrón que se repite <b>siempre</b>: cargo el operando izquierdo, cargo el derecho, opero, guardo en una <code>@aux</code>. Ese patrón es <b>toda</b> la generación de Assembler del TP (lección 12.8).</p>

<div class="callout tgt"><span class="lab">🎯 trampa 1: siempre FLD, nunca FILD</span>
Aunque existe <code>FILD</code> para enteros, la cátedra usa <b>siempre <code>FLD</code></b>. ¿Por qué? Porque los <b>controles de tipo ya se hicieron en las etapas previas</b> (12.1), y las constantes enteras se declaran directamente como reales. Como ya sabemos que todo es compatible, no hace falta distinguir <code>FLD</code> de <code>FILD</code>: con <code>FLD</code> alcanza.</div>

<div class="callout tgt"><span class="lab">🎯 trampa 2: las constantes se declaran como variables</span>
El coprocesador <b>no puede hacer <code>FLD</code> de una constante literal</b>: <code>FLD</code> lee de <b>memoria</b>, no de un número escrito en la instrucción. Entonces una constante como <code>20</code> se declara en <code>.DATA</code> como una variable —<code>_20 dd 20</code>— y se carga con <code>FLD _20</code>. El prefijo <code>_</code> es la convención para nombrar esas constantes.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>El coprocesador tiene <b>8 registros de 80 bits</b> en <b>pila LIFO</b>: <code>ST(0)</code>..<code>ST(7)</code>. <code>ST(0)</code> es el <b>tope</b>; al cargar, todo baja y se <b>pierde <code>ST(7)</code></b>.</li>
<li><code>FLD</code> = push desde memoria; <code>FST</code>/<code>FSTP</code> = guardar (FSTP además hace pop); <code>FADD/FSUB/FMUL/FDIV</code> hacen <code>ST(1) := ST(1) op ST(0)</code> y <b>pop</b>.</li>
<li>🎯 Se usa siempre <code>FLD</code> (no <code>FILD</code>) porque los controles de tipo ya se hicieron.</li>
<li>🎯 Las constantes se declaran como variables (<code>_20 dd 20</code>) porque el coprocesador <b>no puede <code>FLD</code> de un literal</b>.</li>
</ul>`,
    qa:[
      {q:"¿Cómo están organizados los registros del coprocesador y qué pasa al cargar un dato?",
       a:`<p>Son <b>8 registros de punto flotante de 80 bits</b> organizados como una <b>pila LIFO</b>: <code>ST(0)</code>, <code>ST(1)</code>, …, <code>ST(7)</code>. <code>ST(0)</code> es <b>siempre el tope</b>, y es sobre el que operan las instrucciones. Al <b>cargar</b> un dato nuevo con <code>FLD</code> (un push), se produce un <b>desplazamiento automático</b>: lo que estaba en <code>ST(0)</code> pasa a <code>ST(1)</code>, lo de <code>ST(1)</code> a <code>ST(2)</code>, y así sucesivamente, <b>perdiéndose el dato que estaba en <code>ST(7)</code></b>. Es la analogía de las bandejas con resorte: metés una arriba y toda la pila baja un nivel, cayéndose la del fondo.</p>`},
      {q:"¿Qué hace exactamente FADD y por qué el resultado queda accesible en el tope?",
       a:`<p><code>FADD</code> (sin operandos) hace <code>ST(1) := ST(1) + ST(0)</code> y luego un <b>pop</b>. Es decir: suma los dos valores de arriba de la pila, deja la suma en <code>ST(1)</code> y después descarta el tope. Como el pop hace que lo que estaba en <code>ST(1)</code> pase a ser el nuevo <code>ST(0)</code>, <b>el resultado queda en el tope</b>, listo para la próxima operación. Ejemplo: tras <code>FLD b</code> y <code>FLD c</code> tenemos <code>ST(0)=c</code>, <code>ST(1)=b</code>; <code>FADD</code> deja <code>b+c</code> en el tope. <code>FSUB</code>, <code>FMUL</code> y <code>FDIV</code> funcionan igual (<code>ST(1) := ST(1) op ST(0)</code>, pop), por eso la pila se achica en uno con cada operación.</p>`},
      {q:"¿Por qué la cátedra usa siempre FLD y no FILD, aunque haya operandos enteros?",
       a:`<p>Porque a la altura de la generación de código los <b>controles de tipo ya se hicieron</b> en las etapas previas (análisis semántico), y las constantes enteras se <b>declaran directamente como reales</b> en el segmento de datos. <code>FILD</code> existe para cargar un entero convirtiéndolo a flotante, pero como ya sabemos que todos los operandos son compatibles y se declararon como reales, <b>no hace falta distinguir</b> entre <code>FLD</code> (real) y <code>FILD</code> (entero): se usa <code>FLD</code> para todo. Simplifica el generador: una sola instrucción de carga para cualquier operando.</p>`},
      {q:"¿Por qué una constante como 20 no se puede usar directamente y hay que declararla _20 dd 20?",
       a:`<p>Porque el coprocesador <b>no puede hacer <code>FLD</code> de una constante literal</b>: la instrucción <code>FLD</code> carga desde una <b>dirección de memoria</b>, no desde un número escrito en la propia instrucción. Entonces la constante se <b>declara como una variable</b> en el segmento <code>.DATA</code> —por convención con prefijo <code>_</code>, por ejemplo <code>_20 dd 20</code>— y se la carga con <code>FLD _20</code>, que sí lee de memoria. Es la misma idea que en la GCI, donde las constantes ya aparecían como <code>_25</code>, <code>_4</code>, etc. El <code>dd</code> reserva un doubleword (4 bytes) inicializado con ese valor.</p>`}
    ]
  },
  {
    id:"12.6", titulo:"Comparaciones: FCOMP + FSTSW AX + SAHF; bits c3/c0", aho:"Apunte", badges:["🎯"], estado:"dictada",
    html:`
<p>Las <b>comparaciones</b> en el coprocesador son distintas de la aritmética: no dejan un número en la pila, dejan un <b>veredicto</b> en unas banderas internas. La instrucción es <code>FCOMP x</code>: calcula <code>ST(0) - x</code>, hace <b>pop</b>, y guarda el resultado de la comparación en los bits <b>c3, c2, c0</b> de la <b>palabra de estado</b> del coprocesador. Para lo que nos importa, mirás dos bits: <b>c3 y c0</b>.</p>

<h3>Los cuatro veredictos (c3 c0)</h3>
<table>
<tr><th>c3 c0</th><th>Significado</th></tr>
<tr><td><code>00</code></td><td><code>ST(0)</code> es <b>mayor</b> que el operando</td></tr>
<tr><td><code>01</code></td><td><code>ST(0)</code> es <b>menor</b> que el operando</td></tr>
<tr><td><code>10</code></td><td>son <b>iguales</b></td></tr>
<tr><td><code>11</code></td><td><b>incomparables</b> (por ejemplo, ante un valor no numérico)</td></tr>
</table>

<h3>La analogía del cuaderno privado y la cartelera</h3>
<p>El coprocesador escribe el veredicto en su <b>cuaderno privado</b> (la palabra de estado, bits c3/c0). Pero el que decide los saltos es la <b>CPU</b>, y la CPU <b>solo mira la cartelera compartida</b>: el registro <code>FLAGS</code>. La CPU <b>no puede leer</b> el cuaderno del coprocesador. Entonces hay que hacer un traspaso en dos pasos: <b>fotocopiar</b> el cuaderno a un registro y después <b>clavar esa hoja</b> en la cartelera.</p>

<h3>El traspaso: FSTSW AX + SAHF</h3>
<pre><code>FCOMP x      ; compara ST(0) - x, deja el veredicto en c3/c0 (pop)
FSTSW AX     ; copia la palabra de estado del coprocesador a AX
SAHF         ; copia AH (parte alta de AX) al registro FLAGS
JB  destino  ; ahora sí: salto condicional según FLAGS (JB/JE/JA/…)</code></pre>
<p>Recién <b>después</b> de <code>FSTSW AX</code> (palabra de estado → AX) y <code>SAHF</code> (AH → FLAGS) los saltos condicionales <code>JB</code> (menor), <code>JE</code> (igual), <code>JA</code> (mayor), etc., funcionan, porque ahora leen el veredicto desde <code>FLAGS</code>.</p>

<div class="callout tgt"><span class="lab">🎯 por qué hacen falta las tres instrucciones</span>
La pregunta de parcial es «después de <code>FCOMP</code>, ¿por qué no saltás directo?». Porque <code>FCOMP</code> deja el resultado en <b>c3/c0 de la palabra de estado del coprocesador</b>, y los saltos de la CPU consultan <b>FLAGS</b>, no esa palabra. <code>FSTSW AX</code> y <code>SAHF</code> son el <b>puente</b> obligatorio para pasar el veredicto de un registro al otro.</div>

<h3>Cómo se conecta con las sentencias de control</h3>
<p>Esto es la contracara, en Assembler, de lo que viste en la GCI de <code>if</code> y <code>while</code> (módulo 11): las comparaciones se hacen <b>por diferencia</b>. Comparar <code>LI &lt; LD</code> se resuelve mirando el signo de <code>LI - LD</code>: si <code>LI - LD &lt; 0</code>, se entra al bloque verdadero; si <code>LD - LI &gt;= 0</code>, se salta al fin del <code>if</code>. <code>FCOMP</code> es justamente esa resta (<code>ST(0) - x</code>), y el salto condicional posterior es el que decide a qué celda ir.</p>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li><code>FCOMP x</code> calcula <code>ST(0) - x</code>, hace pop y deja el veredicto en los bits <b>c3/c0</b> de la palabra de estado: <code>00</code> mayor, <code>01</code> menor, <code>10</code> igual, <code>11</code> incomparable.</li>
<li>🎯 La CPU <b>no lee</b> esos bits (los saltos miran <code>FLAGS</code>). Por eso: <code>FSTSW AX</code> (estado → AX) + <code>SAHF</code> (AH → FLAGS).</li>
<li>Recién después funcionan <code>JB</code> (menor), <code>JE</code> (igual), <code>JA</code> (mayor), etc.</li>
<li>Es el Assembler de las comparaciones «por diferencia» de las sentencias de control.</li>
</ul>`,
    qa:[
      {q:"¿Qué hace FCOMP y dónde deja el resultado de la comparación?",
       a:`<p><code>FCOMP x</code> <b>compara</b> el tope de la pila contra un operando: calcula <code>ST(0) - x</code> y hace <b>pop</b>. No deja un número, deja un <b>veredicto</b> en las <b>banderas c0, c1, c2, c3</b> de la <b>palabra de estado</b> del coprocesador (bits 8, 9, 10 y 14). Lo que se lee para decidir el salto son los bits <b>c3 y c0</b>: <code>00</code> = <code>ST(0)</code> mayor que el operando, <code>01</code> = menor, <code>10</code> = iguales, <code>11</code> = incomparables. Es la resta que está detrás de toda comparación «por diferencia» de las sentencias de control.</p>`},
      {q:"Después de FCOMP, ¿por qué hacen falta FSTSW AX y SAHF antes de un salto condicional?",
       a:`<p>Porque <code>FCOMP</code> deja el resultado en los bits <b>c3/c0 de la palabra de estado del coprocesador</b>, y las <b>instrucciones de salto de la CPU</b> (<code>JB</code>, <code>JE</code>, <code>JA</code>…) consultan el registro <b>FLAGS</b>, <b>no</b> la palabra de estado del coprocesador. La CPU no puede leer esos bits directamente. Por eso hay que <b>transferirlos</b> en dos pasos: <code>FSTSW AX</code> copia la palabra de estado del coprocesador al registro <code>AX</code>, y <code>SAHF</code> copia <code>AH</code> (la parte alta de <code>AX</code>) al registro <code>FLAGS</code>. Recién con el veredicto ya en <code>FLAGS</code>, el salto condicional funciona.</p>`},
      {q:"¿Qué significan los bits c3 c0 en 00, 01, 10 y 11?",
       a:`<p>Codifican el resultado de la comparación <code>ST(0) - operando</code> hecha por <code>FCOMP</code>: <b><code>00</code></b> → <code>ST(0)</code> es <b>mayor</b> que el operando; <b><code>01</code></b> → <code>ST(0)</code> es <b>menor</b>; <b><code>10</code></b> → son <b>iguales</b>; <b><code>11</code></b> → los operandos son <b>incomparables</b> (situación que se da, por ejemplo, ante un valor no numérico). Esos dos bits viven en la <b>palabra de estado</b> del coprocesador; una vez pasados a <code>FLAGS</code> con <code>FSTSW AX</code> + <code>SAHF</code>, se traducen en los saltos <code>JA</code> (mayor), <code>JB</code> (menor) y <code>JE</code> (igual).</p>`},
      {q:"¿Cómo se relaciona FCOMP con las comparaciones «por diferencia» de if y while?",
       a:`<p>En la GCI, las comparaciones de las sentencias de control se plantean <b>por diferencia</b>: para evaluar <code>LI &lt; LD</code> se mira el signo de <code>LI - LD</code> (si <code>LI - LD &lt; 0</code> se entra al bloque verdadero; si <code>LD - LI &gt;= 0</code> se salta al fin del <code>if</code>). En Assembler, esa resta es exactamente lo que hace <code>FCOMP x</code>: calcula <code>ST(0) - x</code> y guarda el signo/relación en c3/c0. Después de <code>FSTSW AX</code> + <code>SAHF</code>, el salto condicional (<code>JB</code>, <code>JE</code>, <code>JA</code>) implementa el «si es menor, entrá; si no, saltá» que en la polaca aparecía como un <code>BF</code>/<code>BLE</code> hacia un número de celda.</p>`}
    ]
  },
  {
    id:"12.7", titulo:"El esqueleto .MODEL / .DATA / .CODE", aho:"Práctica 6", badges:["🎯"], estado:"dictada",
    html:`
<p>Todo <code>.asm</code> del TP tiene el <b>mismo molde</b>: un esqueleto fijo de directivas que casi no cambia entre un programa y otro. Lo único que varía es <b>qué variables declarás</b> en <code>.DATA</code> y <b>qué secuencia de instrucciones</b> ponés en <code>.CODE</code>. Vale la pena memorizarlo entero.</p>

<h3>El esqueleto completo</h3>
<pre><code>.MODEL LARGE          ; modelo de memoria
.386                  ; juego de instrucciones (386)
.STACK 200h           ; tamaño de la pila del programa
.DATA                 ; ---- segmento de datos ----
    a  dd ?           ; variable sin inicializar (doubleword)
    _4 dd 4           ; constante declarada como variable
    @aux1 dd ?        ; auxiliar (prefijo @)
.CODE                 ; ---- segmento de código ----
    MOV AX, @DATA     ; inicializar los registros de segmento
    MOV DS, AX
    MOV ES, AX
    FLD b             ; ---- acá va el código del coprocesador ----
    FLD c
    FADD
    FSTP @aux1
    ...
    FFREE             ; liberar el coprocesador
    MOV AX, 4C00H     ; función "terminar programa"
    INT 21H           ; retorno al DOS
END                   ; fin del programa</code></pre>

<h3>La analogía del formulario con membrete</h3>
<p>Es como un <b>formulario con membrete y pie de página fijos</b>: el encabezado (<code>.MODEL</code> / <code>.386</code> / <code>.STACK</code>) y el cierre (<code>FFREE</code> / <code>MOV AX,4C00H</code> / <code>INT 21H</code> / <code>END</code>) son <b>siempre iguales</b>. Vos solo completás los dos huecos: la <b>lista de variables</b> en <code>.DATA</code> y la <b>secuencia de FLD/FADD/FSTP</b> en <code>.CODE</code>. En los apuntes ese texto fijo aparece «marcado en azul».</p>

<h3>Qué va en cada segmento</h3>
<ul>
<li><b><code>.DATA</code></b>: todas las <b>variables</b> del programa (<code>a dd ?</code> — el <code>dd</code> es define doubleword, 4 bytes; el <code>?</code> es «sin valor inicial»), las <b>constantes</b> convertidas en variables (<code>_4 dd 4</code>) y las <b>auxiliares</b> (<code>@aux1 dd ?</code>).</li>
<li><b><code>.CODE</code></b>: arranca inicializando los registros de segmento (<code>MOV AX, @DATA</code> / <code>MOV DS, AX</code> / <code>MOV ES, AX</code>), sigue con el código del coprocesador que generó <code>generaAssembler()</code>, y termina con el cierre.</li>
</ul>

<div class="callout tgt"><span class="lab">🎯 el cierre estándar</span>
Pregunta típica: «¿cómo termina el programa?». Con <code>FFREE</code> (libera y limpia la pila del coprocesador), <code>MOV AX, 4C00H</code> e <code>INT 21H</code> (la llamada al DOS que devuelve el control al sistema operativo), y la directiva <code>END</code>. Las variables auxiliares <code>@aux</code> y las constantes <code>_n</code> se declaran <b>siempre en <code>.DATA</code></b>, nunca en el código.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>Encabezado fijo: <code>.MODEL LARGE</code> / <code>.386</code> / <code>.STACK 200h</code>.</li>
<li><code>.DATA</code>: variables (<code>a dd ?</code>), constantes (<code>_4 dd 4</code>) y auxiliares (<code>@aux1 dd ?</code>).</li>
<li><code>.CODE</code>: <code>MOV AX,@DATA</code> + <code>MOV DS,AX</code> + <code>MOV ES,AX</code>, después el código del coprocesador.</li>
<li>Cierre fijo: <code>FFREE</code> / <code>MOV AX,4C00H</code> / <code>INT 21H</code> / <code>END</code>.</li>
</ul>`,
    qa:[
      {q:"¿Dónde se declaran las variables auxiliares @aux y las constantes, y con qué directiva?",
       a:`<p>En el segmento <b><code>.DATA</code></b>, junto con las variables del programa. Las auxiliares se declaran como <code>@aux1 dd ?</code>, <code>@aux2 dd ?</code>, etc. (el <code>?</code> indica «sin valor inicial»), y las constantes como <code>_4 dd 4</code>, <code>_20 dd 20</code> (con su valor). La directiva <code>dd</code> (define doubleword) reserva 4 bytes por dato. Nunca se declaran dentro de <code>.CODE</code>: el código solo contiene instrucciones. Recordá que las auxiliares llevan <code>@</code> y las constantes <code>_</code> para no chocar con palabras reservadas del Assembler.</p>`},
      {q:"¿Qué hacen las tres primeras instrucciones de .CODE (MOV AX,@DATA / MOV DS,AX / MOV ES,AX)?",
       a:`<p><b>Inicializan los registros de segmento</b> para que el programa pueda acceder a sus datos. <code>MOV AX, @DATA</code> carga en <code>AX</code> la dirección del segmento de datos (<code>@DATA</code> es el símbolo que el ensamblador resuelve a esa dirección). Después <code>MOV DS, AX</code> y <code>MOV ES, AX</code> copian esa dirección a los registros de segmento de datos <code>DS</code> y extra <code>ES</code>. Se hace vía <code>AX</code> porque no se puede mover un valor inmediato directo a <code>DS</code>/<code>ES</code>. A partir de ahí, cuando el código nombra una variable (por ejemplo <code>FLD b</code>), la CPU sabe en qué segmento buscarla. Es texto fijo: va siempre igual al comienzo de <code>.CODE</code>.</p>`},
      {q:"¿Cómo se cierra un programa Assembler del TP?",
       a:`<p>Con una secuencia fija: <code>FFREE</code> (libera/limpia la pila del coprocesador para dejarlo en un estado consistente), luego <code>MOV AX, 4C00H</code> e <code>INT 21H</code> —que es la <b>llamada al DOS</b> de «terminar el programa y devolver el control al sistema operativo» (la función 4Ch de la interrupción 21h)— y finalmente la directiva <code>END</code>, que le indica al ensamblador dónde termina el programa fuente. Ese bloque de cierre es idéntico en todos los ejercicios; lo único propio de cada programa es lo que va entre la inicialización de segmentos y el <code>FFREE</code>.</p>`},
      {q:"¿Qué significa `dd ?` en una declaración como `a dd ?`?",
       a:`<p><code>dd</code> es la directiva <b>define doubleword</b>: reserva <b>4 bytes</b> de memoria para el dato (el tamaño de un real de precisión simple que el coprocesador puede cargar con <code>FLD</code>). El <b><code>?</code></b> significa <b>«sin valor inicial»</b>: se aparta el espacio pero no se le pone un contenido de arranque, porque esa variable va a recibir su valor durante la ejecución (por ejemplo, una variable de entrada o una auxiliar donde se guardará un resultado). En cambio, una <b>constante</b> se declara con su valor, como <code>_20 dd 20</code>, porque su contenido se conoce en tiempo de compilación. También existen <code>dq</code> (8 bytes) y <code>dt</code> (10 bytes) para otras precisiones.</p>`}
    ]
  },
  {
    id:"12.8", titulo:"Taller: z := a+b*c-d/(e+f)+20 a Assembler desde las 3 notaciones", aho:"Práctica 6", badges:["⚙️","🎯"], estado:"dictada",
    html:`
<p>El taller integra todo: pasamos <b>la misma expresión</b> —<code>z := a + b*c - d/(e+f) + 20</code>— a Assembler del coprocesador, partiendo de las <b>tres notaciones</b> intermedias. El punto lindo es que <b>las tres convergen exactamente al mismo <code>.asm</code></b>: la notación intermedia es solo el camino; el destino es único.</p>

<h3>Paso 0: las tres notaciones de la expresión</h3>
<p><b>Tercetos</b> (respetando precedencia: primero <code>*</code> y <code>/</code>, después <code>+</code> y <code>-</code> de izquierda a derecha, y el paréntesis <code>e+f</code>):</p>
<pre><code>[1] (*,  b,   c)      ; b*c
[2] (+,  a,   [1])    ; a + b*c
[3] (+,  e,   f)      ; e+f
[4] (/,  d,   [3])    ; d / (e+f)
[5] (-,  [2], [4])    ; (a+b*c) - (d/(e+f))
[6] (+,  [5], _20)    ; ... + 20
[7] (:=, z,   [6])    ; z := ...</code></pre>
<p><b>Polaca inversa</b> (forma informal, la que facilita el pasaje a Assembler porque deja el destino antes del <code>:=</code>):</p>
<pre><code>a  b  c  *  +  d  e  f  +  /  -  _20  +  z  :=</code></pre>

<h3>Paso 1: la regla de oro para la polaca</h3>
<p>Se recorre la polaca de izquierda a derecha <b>apilando operandos</b>. Ante un <b>operador binario</b>:</p>
<ol>
<li><b>Desapilar 2</b> operandos (el primero que sale es el derecho, el segundo el izquierdo).</li>
<li>Generar <code>FLD izquierdo</code>, <code>FLD derecho</code>, la <b>operación</b> (<code>FMUL/FADD/FDIV/FSUB</code>), <code>FSTP @auxN</code>.</li>
<li><b>Apilar <code>@auxN</code></b>, que ahora representa el resultado y sirve de operando para la operación siguiente.</li>
</ol>

<h3>Paso 2: la resolución, token por token</h3>
<pre><code>token   PILA (tope a la derecha)   CÓDIGO GENERADO
a       a
b       a b
c       a b c
*       a @aux1                    FLD b / FLD c / FMUL / FSTP @aux1
+       @aux2                      FLD a / FLD @aux1 / FADD / FSTP @aux2
d       @aux2 d
e       @aux2 d e
f       @aux2 d e f
+       @aux2 d @aux3              FLD e / FLD f / FADD / FSTP @aux3
/       @aux2 @aux4                FLD d / FLD @aux3 / FDIV / FSTP @aux4
-       @aux5                      FLD @aux2 / FLD @aux4 / FSUB / FSTP @aux5
_20     @aux5 _20
+       @aux6                      FLD @aux5 / FLD _20 / FADD / FSTP @aux6
z       @aux6 z
:=      (vacía)                    FLD @aux6 / FSTP z</code></pre>
<p>Fijate el <b>orden de los operandos</b> en la resta y la división, que <b>sí</b> importa: para <code>d/(e+f)</code> se genera <code>FLD d</code> / <code>FLD @aux3</code> / <code>FDIV</code>, porque <code>FDIV</code> hace <code>ST(1)/ST(0)</code> = <code>d / @aux3</code>. El operando <b>izquierdo</b> (el que se carga primero) queda en <code>ST(1)</code>; el <b>derecho</b>, en <code>ST(0)</code>. Si los cargaras al revés, calcularías <code>(e+f)/d</code>, que está mal.</p>

<h3>Paso 3: el .asm completo</h3>
<p>El árbol y los tercetos producen <b>exactamente esta misma secuencia</b> (el árbol arranca por el subárbol <code>b*c</code>, que es el de más a la izquierda con dos hojas; los tercetos se recorren de <code>[1]</code> a <code>[7]</code>). Armado en el esqueleto:</p>
<pre><code>.MODEL LARGE
.386
.STACK 200h
.DATA
    z dd ?
    a dd ?
    b dd ?
    c dd ?
    d dd ?
    e dd ?
    f dd ?
    _20   dd 20
    @aux1 dd ?
    @aux2 dd ?
    @aux3 dd ?
    @aux4 dd ?
    @aux5 dd ?
    @aux6 dd ?
.CODE
    MOV AX, @DATA
    MOV DS, AX
    MOV ES, AX

    FLD b
    FLD c
    FMUL
    FSTP @aux1      ; @aux1 = b*c

    FLD a
    FLD @aux1
    FADD
    FSTP @aux2      ; @aux2 = a + b*c

    FLD e
    FLD f
    FADD
    FSTP @aux3      ; @aux3 = e+f

    FLD d
    FLD @aux3
    FDIV
    FSTP @aux4      ; @aux4 = d/(e+f)

    FLD @aux2
    FLD @aux4
    FSUB
    FSTP @aux5      ; @aux5 = (a+b*c) - (d/(e+f))

    FLD @aux5
    FLD _20
    FADD
    FSTP @aux6      ; @aux6 = ... + 20

    FLD @aux6
    FSTP z          ; z := ...

    FFREE
    MOV AX, 4C00H
    INT 21H
END</code></pre>

<div class="callout tgt"><span class="lab">🎯 lo que se lleva el parcial</span>
Tres cosas: (1) ante un <b>operador binario</b> en la polaca, <b>desapilar 2, generar FLD/FLD/op/FSTP @auxN, apilar @auxN</b>; (2) el <b>orden de carga</b> importa en <code>-</code> y <code>/</code> (el operando izquierdo primero → <code>ST(1)</code>); (3) las <b>tres notaciones dan el mismo Assembler</b>, así que podés elegir la que te resulte más cómoda de recorrer. Y no te olvides: <code>_20 dd 20</code> declarada, y las <code>@aux</code> con prefijo <code>@</code>.</div>

<h3>Lo mínimo que tenés que saber</h3>
<ul>
<li>La polaca se recorre <b>apilando operandos</b>; ante <b>binario</b>: desapilar 2, generar <code>FLD</code>/<code>FLD</code>/op/<code>FSTP @auxN</code>, apilar <code>@auxN</code>.</li>
<li>El <b>orden</b> de los <code>FLD</code> importa en <code>-</code> y <code>/</code>: el operando <b>izquierdo</b> se carga primero (queda en <code>ST(1)</code>).</li>
<li>Cada resultado intermedio va a una <b>auxiliar</b> <code>@auxN</code> declarada en <code>.DATA</code>; la constante es <code>_20 dd 20</code>. La expresión necesita <b>6 auxiliares</b> (una por operador binario aritmético).</li>
<li>🎯 <b>Árbol, polaca y tercetos convergen al mismo <code>.asm</code></b>: la notación es el camino, el Assembler es el destino.</li>
</ul>`,
    qa:[
      {q:"Al pasar la polaca a Assembler con el coprocesador, ¿qué se hace ante un operador binario?",
       a:`<p>Se recorre la polaca de izquierda a derecha <b>apilando operandos</b>; al llegar a un <b>operador binario</b> se hace: (1) <b>desapilar los 2</b> operandos de arriba (el primero en salir es el derecho, el segundo el izquierdo); (2) <b>generar el código</b> —<code>FLD izquierdo</code>, <code>FLD derecho</code>, la operación (<code>FADD/FSUB/FMUL/FDIV</code>) y <code>FSTP @auxN</code>—; (3) <b>apilar <code>@auxN</code></b>, la auxiliar con el resultado, que servirá de operando para la operación siguiente. Ejemplo con <code>b c *</code>: desapilo <code>c</code> y <code>b</code>, genero <code>FLD b</code> / <code>FLD c</code> / <code>FMUL</code> / <code>FSTP @aux1</code>, y apilo <code>@aux1</code>. Si el operador fuera unario, se desapila 1 en lugar de 2.</p>`},
      {q:"En d/(e+f), ¿por qué se genera FLD d antes que FLD @aux3, y no al revés?",
       a:`<p>Porque el <b>orden importa</b> en las operaciones no conmutativas (<code>-</code> y <code>/</code>), y hay que respetar cuál es el operando izquierdo y cuál el derecho. Queremos <code>d / (e+f)</code>, o sea <b>izquierdo <code>d</code></b> dividido por <b>derecho <code>@aux3</code></b>. <code>FDIV</code> hace <code>ST(1) := ST(1) / ST(0)</code>: divide el <b>penúltimo</b> cargado por el <b>último</b>. Entonces cargo primero el izquierdo (<code>FLD d</code> → queda en <code>ST(1)</code>) y después el derecho (<code>FLD @aux3</code> → queda en <code>ST(0)</code>), y <code>FDIV</code> calcula <code>d / @aux3</code>. Si invirtiera el orden, obtendría <code>(e+f) / d</code>, que es incorrecto. Con la suma y la multiplicación el orden no cambiaría el resultado, pero conviene mantener siempre el mismo criterio.</p>`},
      {q:"¿Cuántas variables auxiliares necesita z := a+b*c-d/(e+f)+20 y por qué?",
       a:`<p><b>Seis</b> (<code>@aux1</code> a <code>@aux6</code>): <b>una por cada operador binario aritmético</b> de la expresión. Los operadores son <code>*</code> (b*c → @aux1), <code>+</code> (a+@aux1 → @aux2), <code>+</code> (e+f → @aux3), <code>/</code> (d/@aux3 → @aux4), <code>-</code> (@aux2-@aux4 → @aux5) y <code>+</code> (@aux5+_20 → @aux6): seis operaciones, seis auxiliares. La <b>asignación final</b> <code>:=</code> <b>no</b> genera una auxiliar: solo hace <code>FLD @aux6</code> / <code>FSTP z</code>, guardando el resultado directo en <code>z</code>. Además hay que declarar la constante <code>_20 dd 20</code> y las variables <code>z, a, b, c, d, e, f</code> en <code>.DATA</code>.</p>`},
      {q:"V/F, justificando: «Cada notación intermedia (árbol, polaca, tercetos) produce un Assembler distinto.»",
       a:`<p><b>Falso.</b> Las tres notaciones <b>convergen exactamente al mismo <code>.asm</code></b>, porque las tres describen la <b>misma expresión</b> con el <b>mismo orden de evaluación</b>. El árbol se recorre buscando el subárbol de más a la izquierda con hijos hoja (arranca por <code>b*c</code>); la polaca apila operandos y opera al ver cada operador binario; los tercetos se recorren de <code>[1]</code> a <code>[7]</code>. En los tres casos el resultado es la misma secuencia <code>FLD b / FLD c / FMUL / FSTP @aux1 / …</code>. La notación intermedia es solo <b>el camino</b> que elegís para llegar al código; el <b>destino</b> (el Assembler del coprocesador) es único. Por eso podés elegir la notación que te resulte más cómoda de recorrer.</p>`}
    ]
  }
]});
