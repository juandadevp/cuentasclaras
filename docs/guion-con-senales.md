# Guion con señales: qué se dice y qué se muestra al mismo tiempo

**Cómo se usa.** Quien habla lee o dice con sus palabras el texto en cursiva. Quien maneja el teclado ve las líneas **▶** y abre el archivo **justo cuando se dice la frase en negrita** que la antecede. Así lo que se oye y lo que se ve van juntos.

- ▶ **DIAPOSITIVA N** = pasar a esa diapositiva.
- ▶ **ABRIR** = abrir ese archivo en VS Code (con `Ctrl+P` o `Cmd+P` se busca por nombre).
- ▶ **SEÑALAR** = poner el cursor o subrayar esa línea mientras se habla.
- ▶ **TERMINAL** = comando para correr.

**Antes de empezar** (5 minutos antes): VS Code en la carpeta del proyecto, rama `main` con `git pull`; terminal abierta ahí; presentación abierta en la diapositiva 1; **sin la pestaña `.env`** (ciérrala). Un solo computador comparte pantalla, y quien lo maneja sabe de memoria el orden de abajo.

**Tiempos:** Juan David 5 min · Cristian 4 min · Jorge 6 min = 15 min.

---

# PARTE 1: JUAN DAVID (5 min) · diapositivas 1 a 5

▶ **DIAPOSITIVA 1** (portada)

> *Buenos días. Somos Juan David, Jorge y Cristian, y les vamos a contar cómo usamos la inteligencia artificial para construir cinco funcionalidades de una aplicación, sin perder el control de lo que escribe.*

▶ **DIAPOSITIVA 2** (quiénes somos)

> *Yo voy a contar el arnés, Cristian los agentes y Jorge las funcionalidades que construimos y la calidad.*

▶ **DIAPOSITIVA 3** (introducción)

> ***Cuentas Claras** ya existía: es una aplicación donde cada persona lleva sus gastos del mes. Lo que nos pidieron no era hacerla más grande, sino usar la IA sin perder el control. El problema es que si le pides código a la IA sin reglas, te da código que nadie revisa.*

> *Entonces armamos algo que llamamos **el arnés**: todo lo que rodea a la IA para que trabaje como queremos.*

▶ **DIAPOSITIVA 4** (las piezas del arnés)

> ***Lo primero es la memoria.** Cada vez que la IA empieza, lee un archivo con cómo es el proyecto.*

▶ **ABRIR** `AGENTS.md`
▶ **SEÑALAR** el título «Comandos» y luego la sección «Lo que el agente NO debe hacer».

> *Aquí está cómo se corre el proyecto, cómo se organiza el código y **lo que la IA no debe hacer**. Por ejemplo: no subir claves, no tocar migraciones ya aplicadas y no hacer merge a la rama principal sin que lo pidamos.*

▶ **ABRIR** `.claude/rules/pruebas.md`
▶ **SEÑALAR** la línea «El resultado esperado se calcula a mano».

> ***Lo segundo son las reglas.** Son normas cortas que se cargan solas según el tipo de archivo. Esta es la de las pruebas, y dice algo importante: el resultado esperado se calcula a mano, nunca se copia de lo que devuelve el código. Porque una prueba que repite al código no prueba nada.*

▶ **ABRIR** `.claude/settings.json`
▶ **SEÑALAR** el bloque `deny`.

> ***Lo tercero son los permisos.** Aquí están prohibidas por configuración las cosas peligrosas: leer el archivo de claves y hacer un push forzado.*

▶ **ABRIR** `.claude/hooks/proteger-secretos.mjs`
▶ **SEÑALAR** la línea «No se leen ni se editan los archivos .env».

> *Y este programa, un hook, revisa cada acción de la IA y la cancela si intenta tocar las claves. Es la diferencia entre pedirle que no lo haga y que no pueda hacerlo.*

▶ **DIAPOSITIVA 5** (las skills)

> ***Las skills** son recetas que la IA carga solo cuando las necesita. Tenemos una para crear migraciones, otra para acciones del servidor, otra para pantallas y otra para pruebas.*

▶ **ABRIR** `.claude/skills/crear-migracion-supabase/SKILL.md`
▶ **SEÑALAR** el paso 5 («Escribe el SQL con estas reglas»).

> *Por ejemplo esta: cada vez que hay que crear una tabla, la receta dice que lleve seguridad por filas, una política por acción y un script que se pueda ejecutar dos veces. **Con esta receta nacieron las tablas de ingresos y de metas de ahorro.** Sin ella, cada tabla saldría distinta y alguna podría quedar sin protección.*

> *Hasta aquí es lo que rodea a la IA. Ahora Cristian cuenta quién trabaja dentro de ese arnés.*

---

# PARTE 2: CRISTIAN (4 min) · diapositivas 6 a 8

▶ **DIAPOSITIVA 6** (los agentes)

> *En vez de una sola IA que lo hace todo, separamos el trabajo en roles, como en un equipo. **El orquestador** planea y coordina, pero no programa. Después hay cinco agentes y cada uno solo puede tocar lo suyo.*

▶ **ABRIR** `.claude/agents/probador.md`
▶ **SEÑALAR** el encabezado (la línea `tools` y el bloque `hooks`) y luego «Qué puedes tocar».

> ***El probador** escribe las pruebas antes de que exista el código, y no puede ver el código. Solo puede tocar archivos de prueba. Así no escribe las pruebas a la medida de lo que ya está hecho.*

▶ **ABRIR** `.claude/agents/implementador.md`
▶ **SEÑALAR** «Qué puedes tocar» y la frase «después de 2 intentos sin éxito, detente».

> ***El implementador** escribe el código mínimo para que esas pruebas pasen. Solo toca la carpeta del código y las migraciones nuevas. Y tiene un tope: si falla dos veces, se detiene y avisa, no improvisa.*

> *Además están el explorador, que solo lee para encontrar lo que ya existe, y dos revisores: uno del pull request y otro de la seguridad.*

▶ **DIAPOSITIVA 7** (cómo se construye cada spec)

▶ **ABRIR** `.claude/commands/nueva-spec.md`
▶ **SEÑALAR** el paso 4 («No lo edites a mano. Espera mi aprobación») y el paso 9 («No fusiones a main»).

> *Todo esto arranca con un comando que escribimos nosotros, `/nueva-spec`. **Sigue nueve pasos** y en cada uno espera nuestra confirmación. Primero la spec con criterios, después el plan, que una persona aprueba antes de escribir una línea de código; luego las pruebas, luego el código y al final la revisión. Y el último paso dice que la IA no fusiona a la rama principal: eso lo hacemos nosotros cuando el CI está en verde.*

▶ **DIAPOSITIVA 8** (qué cambió respecto del taller)

> *Lo más importante que descubrimos al usarlo: en el diseño del taller creíamos que bastaba con decirle a cada agente qué herramientas tenía. **Pero eso solo dice qué herramientas, no en qué carpetas.***

▶ **ABRIR** `.claude/hooks/limitar-agente.mjs`
▶ **SEÑALAR** la línea `if (!esPrueba) bloquear(...)`.

> *Por eso agregamos este hook. Cada vez que el probador intenta escribir un archivo, el hook mira la ruta; si no termina en `.test.ts`, lo bloquea y le dice por qué.*

▶ **ABRIR** `.claude/hooks/limitar-agente.test.mjs`

> *Y lo probamos: estas son las pruebas del hook, y corren en el CI. También encontramos una limitación real: este hook controla a los agentes, pero no a la sesión principal; a esa la limitan el modo plan y los permisos. Lo decimos con honestidad.*

> *Con los agentes definidos, Jorge muestra lo que construimos con ellos.*

---

# PARTE 3: JORGE (6 min) · diapositivas 9 a 14

▶ **DIAPOSITIVA 9** (las cinco specs)

> *Construimos cinco funcionalidades. La **primera** exporta los gastos a un archivo CSV. La **segunda** avisa en el inicio cuando una categoría llega al 80 % de su límite. La **tercera** registra ingresos y calcula el ahorro real. La **cuarta** fija una meta de ahorro por mes. Y la **quinta** muestra el resumen del año completo. Cada una tiene su rama y su pull request fusionado.*

▶ **ABRIR** la carpeta `docs/specs/05-resumen-anual/` (mostrar los seis archivos).

> *Les muestro cómo se hizo una, la quinta. Cada spec tiene seis archivos y cada uno responde una pregunta.*

▶ **ABRIR** `spec.md`
▶ **SEÑALAR** CA-8.

> ***La spec** responde «qué se construye». Tiene criterios numerados. Por ejemplo el 8 dice que un gasto del 31 de diciembre y otro del 1 de enero cuentan cada uno en su año. Un criterio bien escrito se puede convertir en una prueba.*

▶ **ABRIR** `plan.md`
▶ **SEÑALAR** la tabla «Criterios de aceptación → pruebas».

> ***El plan** responde «cómo». Lo genera el modo plan y no se edita a mano. Una persona lo aprueba antes de escribir código. Aquí cada criterio apunta a una prueba.*

▶ **ABRIR** `tasks.md` (mostrar las casillas marcadas).

> ***Las tareas** son los pasos, y se marcan al terminar.*

▶ **TERMINAL** `git log --oneline 6c6cac9^..505e8a5`

> ***Y aquí está la evidencia de las pruebas primero.** Miren el orden: spec, plan, **pruebas** y después el **código**. El commit de las pruebas va antes que el del código.*

▶ **ABRIR** `src/lib/resumen-anual.test.ts`
▶ **SEÑALAR** la prueba de «1999 queda por debajo del límite».

> *Estas son las pruebas que escribió el probador sin ver el código. Esta dice que si piden el año 1999, se muestra el año de hoy, porque el mínimo es 2000. Los casos de borde son lo importante.*

▶ **ABRIR** `src/lib/resumen-anual.ts`
▶ **SEÑALAR** la función `anioDeResumen`.

> *Y este es el código mínimo que escribió el implementador para que pasaran.*

▶ **TERMINAL** `npm test`

> *Y corremos todo: **946 pruebas, todas en verde.***

▶ **DIAPOSITIVA 10** (lo que falló)

> *Ahora lo que falló, que es lo más interesante. Las pruebas pasaban y aun así los revisores encontraron errores reales.*

> ***Primero:** en el CSV, la IA no neutralizaba las fórmulas maliciosas cuando el texto empezaba con espacios.* ***Segundo:** en el resumen anual, el plan decía pedir los gastos hasta el 31 de diciembre, pero la consulta no incluye la fecha final: se perdía ese día. Lo descubrió quien ejecutó el código. Dejamos el plan como se aprobó y anotamos la corrección.* ***Tercero:** la pantalla mostraba el aviso de error y a la vez «No tienes gastos».*

▶ **ABRIR** `docs/specs/01-exportar-csv/revision.md`
▶ **SEÑALAR** la tabla de hallazgos y la columna «Decisión».

> *Cada hallazgo termina en una decisión escrita. Hay aceptados, con el commit que los arregla, y descartados con su razón; por ejemplo, «sin límite de frecuencia en la descarga» lo descartamos porque exige sesión y el riesgo es bajo. No todo lo que dice un revisor se acepta: se evalúa.*

> *También hubo un problema de proceso: el agente que escribe el código se cortó una vez por un límite de uso. Como las tareas eran pequeñas, lo retomamos desde donde quedó, después de comprobar lo que había hecho.*

▶ **DIAPOSITIVA 11** (calidad)

▶ **ABRIR** `.github/workflows/ci.yml`
▶ **SEÑALAR** el paso «Pruebas de los hooks del arnés».

> *Aplicamos tres mecanismos de calidad. **Las pruebas antes del código**, que ya vimos. **La revisión de cada pull request** con una decisión por hallazgo. Y **el CI**: en cada pull request se corren lint, tipos, pruebas, las pruebas de los hooks y la compilación. No se fusiona hasta que esté en verde.*

▶ **ABRIR** el navegador, el pull request #37, pestaña «Checks» (CI en verde).

> *Aquí se ve en el pull request de la quinta funcionalidad.*

▶ **DIAPOSITIVA 12** (conclusiones)

> *Lo que lograron: un arnés que funciona y se puede explicar, cinco funcionalidades fusionadas con su evidencia, y un hook probado que limita a los agentes.*
>
> *Y lo que reconocemos que falta: no medimos la cobertura, la rama principal no está protegida, no hay pruebas de punta a punta y la seguridad por filas la comprobamos a mano.*
>
> *Lo que aprendimos: **las instrucciones no son controles, los hooks sí**; y las pruebas y los revisores encuentran cosas distintas, por eso necesitamos los dos.*

▶ **DIAPOSITIVA 13** (preguntas)

> *Gracias. ¿Alguna pregunta?*

---

# Si hacen preguntas (quien maneja el teclado abre lo indicado)

| Pregunta | Responde | Abrir |
|---|---|---|
| ¿Cómo evitan que la IA toque lo que no debe? | Cristian | `.claude/hooks/limitar-agente.mjs` |
| ¿Dónde está lo que la IA sabe del proyecto? | Juan David | `AGENTS.md` |
| ¿Cómo comprueban que las pruebas se escribieron primero? | Jorge | Terminal: `git log --oneline 6c6cac9^..505e8a5` |
| ¿Qué pasó cuando algo falló? | Jorge | `docs/specs/05-resumen-anual/revision.md` |
| ¿Por qué no usaron Spec Kit? | Cristian | `docs/specs/_plantilla/` y el README: usamos una estructura propia |
| ¿Cómo se ve la tabla segura de un usuario? | Juan David | `supabase/migrations/` (ingresos y metas de ahorro) |
| ¿Quién escribió el código? | Cualquiera | Nosotros definimos los criterios, aprobamos los planes y decidimos qué hallazgos se aceptan. La IA escribió dentro de límites. |

# Tres cosas que no deben pasar
1. **No abrir `.env` ni `.env.local`.** Si alguien pide ver «cómo se configura», se abre `.env.example`.
2. **No improvisar archivos.** Si no se sabe dónde está algo, se dice «lo busco al terminar» y se sigue.
3. **No leer la diapositiva.** El texto en cursiva está pensado para decirlo con sus palabras.
