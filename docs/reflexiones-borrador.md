# Reflexiones del equipo (borrador)

> **Léanme antes de usar esto.** La reflexión tiene que ser **personal**: el documento dice que una reflexión que podría haber escrito cualquiera no cumple. Yo no conozco cómo usaba la IA cada uno antes del diplomado, así que esa parte (**Antes**) la dejé en blanco con ayudas para completarla con su experiencia real. Las partes **Ahora** y **Proceso** las redacté a partir de lo que de verdad pasó en este proyecto; léanlas y cambien lo que no piensen así, porque van firmadas con su nombre. Lo que no sientan suyo, bórrenlo.
>
> Reparto del tema (para que no suenen iguales): Jorge habla del arnés, Cristian de los agentes y Juan David de la calidad. Cada uno reflexiona sobre la parte que expone.
>
> Cada reflexión cabe en una página: tres en total, que es el máximo. Al terminar, junten las tres en un solo documento, con el nombre de cada uno como título, y expórtenlo a PDF.

---

## Reflexión de Jorge

**Antes.** [COMPLETA con tu experiencia: ¿para qué usabas la IA antes del diplomado? ¿Pegabas código y esperabas que funcionara? ¿Qué te salió bien y qué te salió mal alguna vez? Cuenta una situación concreta, con tu nombre y tu proyecto.]

**Ahora.** Lo que más me cambió fue entender que la IA no sabe nada de mi proyecto hasta que yo se lo digo. En Cuentas Claras escribimos un archivo, `AGENTS.md`, con cómo se corre el proyecto, cómo se llaman las cosas y lo que no se debe tocar, y unas reglas y skills para las tareas que se repiten. Después de eso la IA dejó de inventar: cada tabla nacía con seguridad por filas y cada pantalla traía su estado vacío, sin que yo se lo repitiera. De ahora en adelante, antes de pedirle código a la IA voy a dedicar un rato a escribirle el contexto, como le explicaría el proyecto a alguien nuevo en el equipo.

**Proceso.** Creo que la IA sí mejora el proceso, pero sobre todo en las tareas que se repiten y tienen una forma clara, como crear una migración o una pantalla parecida a otra. Ahí va rápido y consistente. Donde necesita límites es en lo que no puede saber: no sabe qué es importante para el negocio ni qué se puede borrar. Un ejemplo nuestro: en el resumen anual el plan decía pedir los gastos hasta el 31 de diciembre, pero la consulta no incluye la fecha final y se perdía ese día. Lo encontró quien ejecutó el código, no quien lo planeó. Por eso sigo pensando que una persona debe aprobar el plan y revisar lo que sale. Mi límite es este: la IA propone y acelera, pero la responsabilidad de que esté bien sigue siendo mía.

---

## Reflexión de Cristian

**Antes.** [COMPLETA con tu experiencia: ¿cómo usabas la IA antes del diplomado? ¿Un solo chat para todo? ¿Le pedías que hiciera y revisara lo mismo? Cuenta algo que te pasó de verdad, con un ejemplo concreto.]

**Ahora.** Antes yo veía la IA como una sola cosa que hacía de todo. En este proyecto la dividimos en roles, como un equipo: uno que busca lo que ya existe, otro que escribe las pruebas sin ver el código, otro que escribe el código y dos que revisan. Cada uno solo puede tocar lo suyo. Lo que más me sorprendió fue que no basta con decirle a un agente qué herramientas tiene: puede usarlas en cualquier carpeta. Por eso hubo que agregar un programa, un hook, que revisa cada acción y la bloquea si el agente se sale de su carpeta. Desde ahora voy a pensar en la IA como un equipo con roles y permisos, no como un chat que lo hace todo.

**Proceso.** Veo que la IA mejora el proceso cuando el trabajo se corta en pasos pequeños y comprobables. Eso nos salvó una vez: el agente que escribe el código se cortó por un límite de uso, y como las tareas eran pequeñas y estaban marcadas, lo retomamos desde donde quedó, después de comprobar lo que había alcanzado a hacer. Sus límites: un agente no se vigila solo. El que escribe el código y las pruebas a la vez termina acomodando una a la otra, por eso las pruebas las escribe otro, sin ver el código. También hay una limitación real que encontramos: el hook controla a los subagentes, pero no a la sesión principal, que se limita con el modo plan y con los permisos. Eso me enseñó a decir con honestidad qué no está cubierto.

---

## Reflexión de Juan David

**Antes.** [COMPLETA con tu experiencia: ¿cómo usabas la IA antes del diplomado, por ejemplo en tu práctica en Activa? ¿Qué hacías con lo que te devolvía: lo probabas, lo copiabas tal cual? Cuenta una situación concreta.]

**Ahora.** Lo que me llevo es que confiar en el código de la IA no es una cuestión de fe, es una cuestión de comprobar. En este proyecto cada funcionalidad empezó con pruebas que fallaban, escritas antes del código, y terminó con revisores que reportaban lo que encontraban y con un CI que corría todo en cada pull request. Eso se ve en el historial: en la spec 5, el commit de las pruebas está antes que el del código. De ahora en adelante no voy a aceptar un cambio de la IA sin saber cómo lo voy a comprobar. Primero pienso la prueba y después pido el código.

**Proceso.** Las pruebas pasaban y aun así los revisores encontraron errores reales. En la exportación a CSV, la IA no neutralizaba las fórmulas maliciosas cuando el texto empezaba con espacios. En el resumen anual, la pantalla mostraba el aviso de error y al mismo tiempo «No tienes gastos». Eso me enseñó que las pruebas y las revisiones encuentran cosas distintas, y que necesito las dos. Me parece que la IA sí puede mejorar el proceso, pero solo si alrededor hay controles que se puedan verificar: pruebas, revisión y CI. También reconozco lo que no medimos: no tenemos cobertura ni pruebas de punta a punta, y la seguridad por filas la comprobamos a mano con dos cuentas. Un proceso con IA es tan bueno como sus controles, y los nuestros todavía tienen huecos.

---

## Para pasar a PDF
1. Completen el **Antes** de cada uno con su experiencia real (3 o 4 frases bastan, con un ejemplo concreto).
2. Relean **Ahora** y **Proceso** y cambien lo que no sientan suyo. Si lo dicen con sus palabras, mejor.
3. Quiten esta nota inicial y el título «borrador».
4. Un solo documento, tres páginas como máximo, con el nombre de cada uno como título de su reflexión. Expórtenlo a PDF.
