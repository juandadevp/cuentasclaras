# Guion de Juan David Plata Polanía · 6 diapositivas · 7 minutos

Es el guion para **hablar**, no para leer. Está escrito en frases cortas, con tus palabras habituales. En cada diapositiva primero dices lo que significa y después recorres lo que muestra, **elemento por elemento**, en el orden en que está en pantalla.

Corresponde a la versión de la presentación que subiste (`…con_responsables.pptx`), donde tu parte son las diapositivas **1 a 6** (las dos últimas, «Tecnologías» y «Proceso», se agregaron después). Las marcas **▶** son para quien maneja el computador.

| Diapositiva | Tiempo |
|---|---|
| 1. Portada | 40 s |
| 2. Introducción | 1 min 15 s |
| 3. El arnés | 2 min |
| 4. Las skills | 1 min 30 s |
| 5. Tecnologías | 1 min |
| 6. El proceso | 1 min |

---

## Diapositiva 1 · Portada (40 s)

**Lo que muestra:** el título «Cuentas Claras», los tres nombres del equipo y la Fundación.

> Buenos días, profe, buenos días a todos. Yo soy Juan David Plata, y con Jorge Arias y Cristian Ruiz les vamos a presentar el proyecto integrador.
>
> Nuestro proyecto se llama **Cuentas Claras**. Es una aplicación para llevar los gastos del mes. Pero lo que les vamos a contar hoy no es la aplicación en sí, sino **cómo usamos la inteligencia artificial para construirle cinco funcionalidades nuevas sin perder el control de lo que escribe**.
>
> Yo les voy a explicar el punto de partida y el arnés. Después Cristian cuenta los agentes, y Jorge las funcionalidades y la calidad.

---

## Diapositiva 2 · Introducción (1 min 15 s)

**Lo que muestra:** un párrafo y tres tarjetas numeradas: el problema, la necesidad y la propuesta.

> Empiezo por **de dónde partimos**.

▶ Señalar el párrafo.

> Cuentas Claras ya existía. Es una aplicación web hecha con **Next.js y Supabase**, donde cada persona entra a un panel privado y lleva sus gastos del mes. Sobre esa base construimos **cinco funcionalidades nuevas con ayuda de IA**.
>
> Y lo explico con tres ideas, que son estas tres tarjetas.

▶ Señalar la tarjeta 1.

> **Uno, el problema.** Si uno le pide código a la IA sin reglas, obtiene código que nadie revisa. Y cuando algo falla, es difícil explicar por qué se hizo así.

▶ Señalar la tarjeta 2.

> **Dos, la necesidad.** Que el agente sepa cómo es el proyecto, qué puede tocar y qué no, y cómo se comprueba lo que escribe. O sea, que no trabaje a ciegas.

▶ Señalar la tarjeta 3.

> **Tres, la propuesta.** Armar un **arnés**: memoria, reglas, skills, cinco agentes con permisos y un flujo que va desde la especificación hasta el pull request. Un arnés es todo lo que rodea a la IA para que trabaje como el equipo decidió. Eso es lo que sigue.

---

## Diapositiva 3 · El arnés (2 min)

**Lo que muestra:** tres columnas: **Memoria y reglas**, **Skills** y **Permisos y hooks**, con cuatro puntos cada una.

> Esta diapositiva es el mapa del arnés. Todo esto vive **en el repositorio**, no en la cabeza de nadie. Cualquier persona que llegue lo puede leer. Voy columna por columna.

### Columna 1: Memoria y reglas («lo que lee al empezar»)

▶ **ABRIR** `AGENTS.md` · **SEÑALAR** la sección «Lo que el agente NO debe hacer».

> **Primero, la memoria.** Cada vez que la IA empieza una sesión, lee estos archivos: `AGENTS.md` y `CLAUDE.md`. Ahí está cómo se corre el proyecto, las convenciones y **lo que no debe hacer**. Por ejemplo: no subir claves, no tocar migraciones que ya se aplicaron y no hacer merge a la rama principal sin que nosotros lo pidamos.

▶ **ABRIR** `.claude/rules/pruebas.md` · **SEÑALAR** «El resultado esperado se calcula a mano».

> **Después, las reglas.** Son normas cortas que **se cargan solas según el tipo de archivo**. Tenemos reglas para migraciones, acciones del servidor, pantallas, pruebas y para el flujo con git. Esta es la de las pruebas, y dice algo clave: el resultado esperado se calcula a mano y no se copia de lo que devuelve el código, porque una prueba que repite al código no prueba nada.
>
> Y lo último de esta columna: todo el proyecto va **en español**, también los nombres y los mensajes de los commits.

### Columna 2: Skills («procedimientos bajo demanda»)

> **Segunda columna, las skills.** Son recetas que la IA **carga solo cuando la tarea las necesita**. Tenemos siete en la carpeta `.claude/skills/`, y el documento pide como mínimo tres. Además hay un comando propio, `/nueva-spec`, que arranca todo el flujo de una funcionalidad. Y el README explica para qué sirve cada skill. Las veo una por una en la siguiente diapositiva.

### Columna 3: Permisos y hooks («lo que lo verifica»)

▶ **ABRIR** `.claude/settings.json` · **SEÑALAR** el bloque `deny`.

> **Tercera columna, los permisos y los hooks.** `settings.json` dice qué comandos se pueden usar sin preguntar y cuáles están prohibidos: por ejemplo, leer el archivo de claves o hacer un push forzado.

▶ **ABRIR** `.claude/hooks/proteger-secretos.mjs` · **SEÑALAR** la línea «No se leen ni se editan los archivos .env».

> Un **hook** es un programa que se ejecuta antes de cada acción de la IA. Este, `proteger-secretos`, la cancela si intenta leer o mostrar un archivo `.env`, que es donde están las claves. Es la diferencia entre **pedirle** a la IA que no lo haga y **que no pueda hacerlo**.
>
> Hay otro hook, `limitar-agente`, que restringe qué carpetas puede tocar cada agente: el probador solo toca archivos de prueba y el implementador solo el código. Ese lo explica Cristian. Lo que sí quiero que se queden es que **los hooks tienen pruebas, y esas pruebas corren en el CI**.

---

## Diapositiva 4 · Las siete skills (1 min 30 s)

**Lo que muestra:** siete tarjetas con el nombre de cada skill y para qué sirve, en dos columnas, y una tarjeta final («i») que dice de dónde vienen.

> Tenemos **siete skills**, y les cuento qué problema resuelve cada una. Las cuatro primeras, en la columna de la izquierda, son las que más usamos.

▶ **ABRIR** `.claude/skills/crear-migracion-supabase/SKILL.md` · **SEÑALAR** el paso 5.

> **Uno, `crear-migracion-supabase`.** Cada vez que hay que crear una tabla, obliga a que lleve seguridad por filas y un script que se pueda ejecutar dos veces. El resultado es que **nadie ve datos de otra persona**. Con ella nacieron las tablas de ingresos y de metas de ahorro.
>
> **Dos, `crear-accion-servidor`.** Valida siempre en el servidor y **toma el usuario de la sesión, nunca del formulario**.
>
> **Tres, `crear-pantalla-panel`.** Cada pantalla trae su enlace en el menú, un estado vacío y un aviso de error.
>
> **Cuatro, `escribir-pruebas`.** Pruebas con vitest, con el resultado esperado calculado a mano.
>
> En la columna de la derecha están las otras tres. **`autenticacion-supabase`** cubre el registro, el inicio de sesión, recuperar la contraseña y cerrar sesión. **`integrar-api-externa`** es para usar servicios de terceros, como el de precios, dejando la clave solo en el servidor. Y **`vercel-react-best-practices`** son buenas prácticas de rendimiento de React y Next.js.
>
> Y fíjense en la última tarjeta: **seis skills las hicimos nosotros y una es de terceros**, y esa la revisamos antes de instalarla. Es solo texto, sin scripts.
>
> Sin estas recetas, cada tabla o cada pantalla saldría distinta y alguna podría quedar sin protección. Con ellas, siempre sale igual de segura.

---

## Diapositiva 5 · Tecnologías que utilizamos (1 min)

**Lo que muestra:** cuatro filas numeradas, cada una con una tecnología y para qué se usa.

> Antes de pasar a cómo lo hicimos, les muestro **con qué herramientas lo hicimos**. Son cuatro grupos.
>
> **Uno, la aplicación:** Next.js 16, React 19, TypeScript y Tailwind CSS 4. Next.js nos da las páginas y las acciones del servidor; React los componentes; TypeScript nos avisa de errores antes de ejecutar; y Tailwind los estilos.
>
> **Dos, los datos y las cuentas:** Supabase. Es una base de datos PostgreSQL con **seguridad por filas**, que hace que cada persona vea solo lo suyo, y con inicio de sesión. Los cambios de la base de datos van en migraciones en SQL.
>
> **Tres, la calidad:** Vitest para las pruebas, ESLint para el estilo y el compilador de TypeScript para revisar los tipos. Todo eso se corre en cada cambio, y el CI lo repite en cada pull request.
>
> **Y cuatro, la IA y la entrega:** Claude Code, que es la herramienta de IA, trabajando con el arnés que ya vimos. Git guarda el historial y GitHub guarda las ramas y corre el CI con GitHub Actions.

---

## Diapositiva 6 · Cómo se hizo, de principio a fin (1 min)

**Lo que muestra:** cuatro tarjetas con los pasos del proceso.

> Y ahora **cómo fue el proceso**, de principio a fin. Fueron cuatro pasos.
>
> **Primero, armamos el arnés.** Antes de escribir ninguna funcionalidad dejamos listas la memoria, las reglas, las skills, los agentes y los hooks. Eso se fusionó en el pull request 32.
>
> **Segundo, una spec por funcionalidad.** Cada una tiene su propia rama, con criterios de aceptación numerados y un plan que una persona aprueba antes de escribir una sola línea de código.
>
> **Tercero, pruebas, código y revisión.** Primero se escriben las pruebas, después el código mínimo que las hace pasar, y al final dos revisores leen el resultado. Cada hallazgo se anota con su decisión: aceptado o descartado.
>
> **Y cuarto, el pull request y el CI.** Cada funcionalidad entra a la rama principal solo con el CI en verde. Fueron cinco pull requests, del 33 al 37.
>
> Ese recorrido lo repetimos cinco veces, y Cristian les cuenta ahora quién hace cada cosa dentro de él.

**Para pasarle la palabra a Cristian:**

> Hasta aquí es lo que rodea a la IA. Ahora **Cristian** les cuenta quién trabaja dentro de ese arnés.

---

## Si te preguntan (respuestas cortas)

| Pregunta | Respuesta |
|---|---|
| ¿Qué es un hook? | Un programa que se ejecuta antes de cada acción de la IA y puede cancelarla. El de secretos cancela cualquier intento de leer o mostrar un `.env`. |
| ¿Cuál es la diferencia entre una regla y una skill? | La regla se carga sola según el tipo de archivo y dice **cómo debe ser** algo. La skill se carga cuando la tarea la necesita y dice **cómo hacerlo**, paso a paso. |
| ¿Por qué `AGENTS.md` y `CLAUDE.md`? | `AGENTS.md` lo leen casi todas las herramientas de IA. `CLAUDE.md` lo importa y agrega instrucciones solo de Claude Code. |
| ¿Las skills las escribieron ustedes? | Seis son del equipo. Una, `vercel-react-best-practices`, es de terceros y la revisamos antes de instalarla (es solo texto, sin scripts). |
| ¿Cómo evitan que la IA vea las claves? | Con tres capas: el permiso `deny` en `settings.json`, el hook `proteger-secretos` y la regla de no leer `.env`. Además `.env.local` nunca se sube a git. |

## Antes de empezar
- Cierra la pestaña `.env` del editor. **Nunca la abras ante el público**; si piden ver la configuración, muestra `.env.example`.
- Ten abiertos de antemano: `AGENTS.md`, `.claude/rules/pruebas.md`, `.claude/settings.json`, `proteger-secretos.mjs` y la skill de migraciones, en ese orden.
- Practica una vez con cronómetro: ahora son unos 7 minutos y la diapositiva 3 es la más larga. Con tus dos diapositivas nuevas la exposición completa pasa de 15 minutos; si hace falta recortar, abrevia la 5 y la 6 a 40 segundos cada una.
