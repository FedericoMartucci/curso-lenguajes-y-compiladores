# Pendientes

## Diagrama de estados arrastrable (parsing SLR)

Postergado a propósito. El ejercicio de parsing ya se resuelve por etapas —gramática
aumentada, PRIMEROS, SIGUIENTES y tabla SLR celda por celda—, y los estados se pueden
consultar como texto en el escalón "Ver los estados (ítems LR(0))".

Lo que falta es que el alumno **arme** el autómata, con dos modos:

1. **Escrito.** Cargar cada estado con sus ítems LR(0) y las transiciones como texto
   (`I0: A' -> · A` … `I0 --A--> I1`). El motor ya calcula `estados` y `trans` en
   `tablaSLR()`, así que la corrección es una comparación de conjuntos: qué ítems tiene
   cada estado y a dónde va cada transición. Es el modo barato y cubre el 90% del valor.

2. **Arrastrando las piezas**, tipo draw.io: nodos con los ítems adentro, aristas
   etiquetadas con el símbolo, ruteo y layout. Es un editor de grafos completo.

### Por qué no está

En el parcial el autómata se dibuja en papel, y las tres etapas que sí se evalúan ya están
cubiertas. La clase de parsing dice que el error se arrastra desde el armado del autómata,
así que tiene valor pedagógico real — pero el modo escrito captura casi todo ese valor a
una fracción del costo del editor gráfico.

### Cuando se haga

- Empezar por el modo escrito y medir si el modo arrastrar sigue haciendo falta.
- Reusar `automataLR0()` y `textoItem()` de `src/engines/parsing.ts`: la respuesta no se
  guarda, la calcula el motor, igual que el resto del panel.
- El switch entre modos tiene que preservar lo cargado: pasar de texto a diagrama y volver
  no puede perder el trabajo.
- Layout: los autómatas van de 7 a 21 estados según la gramática (ver la tabla de tamaños
  en el historial de git), así que hace falta auto-layout, no sólo arrastre libre.
