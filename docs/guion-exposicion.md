# Guion para exponer: cómo se hizo todo, paso a paso

Está pensado para contarlo con tus palabras, no para leer las diapositivas. Dura 15 minutos y deja 5 para preguntas. Las diapositivas son el apoyo; lo que enseñas en pantalla es el código y el historial.

## Antes de empezar: ten abierto
1. VS Code con la carpeta del proyecto en la rama `main` (ya actualizada con `git pull`).
2. La terminal en esa carpeta, para correr `git log` y `npm test`.
3. En el navegador: la pestaña de Pull requests de GitHub (el #33 y el #37) y la aplicación en `http://localhost:3000`.
4. La presentación abierta, para saltar a una diapositiva solo cuando haga falta.

## Orden para mostrar el código (siempre de lo general a lo particular)
| Orden | Qué abres | Qué señalas en 20 segundos |
|---|---|---|
| 1 | `README.md`, sección «El arnés» | El mapa: piezas, skills, cómo se usa, qué cambió y la calidad con su evidencia. |
| 2 | `AGENTS.md` | La memoria: comandos, convenciones y «Lo que el agente NO debe hacer». |
| 3 | `.claude/rules/` (por ejemplo `pruebas.md`) | Las normas por tipo de archivo; se cargan solas. |
| 4 | `.claude/skills/crear-migracion-supabase/` | Un procedimiento que el agente carga solo cuando lo necesita. |
| 5 | `.claude/agents/probador.md` e `implementador.md` | Cada agente: qué puede tocar y con qué herramientas. |
| 6 | `.claude/hooks/limitar-agente.mjs` y `.claude/settings.json` | El control que hace cumplir los límites, y sus pruebas (`limitar-agente.test.mjs`). |
| 7 | `.claude/commands/nueva-spec.md` | El comando que arranca todo el flujo. |
| 8 | `docs/specs/05-resumen-anual/` | Una spec completa: `spec.md`, `plan.md`, `tasks.md`, `prompt.md`, `skills.md`, `revision.md`. |
| 9 | Terminal: `git log --oneline 6c6cac9^..505e8a5` (de la spec al último arreglo) | Las pruebas (Red) antes del código (Green). |
| 10 | `src/lib/resumen-anual.test.ts` y luego `src/lib/resumen-anual.ts` | Una prueba escrita antes, y el código mínimo que la hace pasar. |
| 11 | `.github/workflows/ci.yml` y la pestaña de Actions | El CI que repite lint, tipos, pruebas, hooks y build. |
| 12 | `docs/specs/01-exportar-csv/revision.md` | Los hallazgos de los revisores con su decisión. |

## El guion, por bloques

### 1. De dónde partimos (1 minuto)
«Cuentas Claras ya existía: una aplicación para llevar los gastos del mes. Lo que nos pidieron en este proyecto no era hacerla más grande, sino usar la IA para construir cinco funcionalidades nuevas **sin perder el control**. Mi idea fue: antes de pedirle código a la IA, hay que decirle cómo es el proyecto, qué puede tocar y cómo se comprueba lo que hace. A eso le llamamos el arnés.»

### 2. El arnés (3 minutos) · muestra los pasos 1 a 4
- **Memoria.** «Lo primero que lee el agente es `AGENTS.md`. Ahí está cómo se corre el proyecto, cómo se organiza el código y, lo más importante, qué NO debe hacer: no subir claves, no tocar migraciones ya aplicadas, no hacer merge a `main`.» `CLAUDE.md` importa ese archivo y agrega nuestras instrucciones propias.
- **Reglas.** «Son normas cortas por tipo de archivo. Si el agente toca una migración, se carga la regla de migraciones; si escribe una pantalla, la de pantallas. Así no hay que repetirlo en cada pedido.»
- **Skills.** «Son recetas que el agente solo carga cuando las necesita. Hicimos una para crear migraciones, otra para acciones del servidor, otra para pantallas del panel y otra para pruebas. Resuelven el mismo problema cada vez: que cada tabla tenga seguridad por filas, que cada acción valide en el servidor, que cada pantalla tenga estado vacío y error.»
- **Permisos.** «`.claude/settings.json` dice qué comandos se permiten y cuáles no, y un hook bloquea leer archivos `.env`.»

### 3. Los agentes (3 minutos) · muestra los pasos 5 a 7
«En vez de un solo agente que hace todo, separé el trabajo en roles, como en un equipo.»
- «El **orquestador** es Claude Code en modo plan. Planea y coordina, pero no programa.»
- «El **explorador** solo lee: antes de cada spec busca qué ya existe para reutilizarlo y no duplicar código.»
- «El **probador** escribe las pruebas primero y no ve el código. Solo puede tocar archivos `*.test.ts`.»
- «El **implementador** escribe el código mínimo para que esas pruebas pasen. Solo toca `src/` y las migraciones nuevas.»
- «Los **dos revisores** solo leen: uno revisa cada pull request y el otro la seguridad.»

**Qué cambió respecto del taller (esto es lo importante):** «En el diseño del taller yo creía que bastaba con decirle a cada agente qué herramientas tenía. Al usarlo descubrí que no: una herramienta dice *qué* puede usar, no *dónde*. Un agente con permiso de editar archivos podía editar cualquiera. Por eso agregué un hook, `limitar-agente.mjs`, que revisa cada acción del probador y del implementador y la bloquea si sale de su carpeta. Y lo probé: hay pruebas del hook que corren en el CI. Una limitación que reconozco: el orquestador es la sesión principal y esos hooks no le aplican; lo limitan el modo plan y los permisos.» También: «el permiso del probador dejaba pasar banderas de `vitest` como `--config`; lo cerré a archivos `*.test.ts`, y el implementador no escribe en `docs/` para que no pueda marcarse a sí mismo como terminado.»

### 4. Cómo se hizo cada spec, paso a paso (4 minutos) · muestra los pasos 8 a 10
Usa la spec 05 como ejemplo y di que las otras cuatro siguieron lo mismo.
1. **Se arranca con `/nueva-spec 05-resumen-anual`.** Crea la rama `feat/05-resumen-anual` y la carpeta `docs/specs/05-resumen-anual/`.
2. **Spec.** «Escribí qué se construye y por qué, con criterios de aceptación numerados: CA-1 hasta CA-9. Por ejemplo, el CA-8 dice que un gasto del 31 de diciembre y otro del 1 de enero cuentan cada uno en su año.» Una persona la aprueba.
3. **Exploración.** El explorador devolvió qué se podía reutilizar: la consulta de gastos, la dona de categorías y el patrón de las flechas del presupuesto.
4. **Plan en modo plan.** «El plan lo genera el modo plan y no se edita a mano; una persona lo aprueba antes de escribir una línea de código.» Muestra `plan.md` y la tabla «criterio → prueba».
5. **Tareas.** `tasks.md` con las fases Red, Green, verificación y cierre, marcadas al terminar.
6. **Red: las pruebas primero.** «El probador escribió 38 pruebas sin ver el código y confirmó que fallaban, porque el módulo todavía no existía. Las subimos en su propio commit.» Muestra `c3dcbd7` en `git log`.
7. **Green: el código.** «El implementador escribió lo mínimo para que pasaran: `resumen-anual.ts`, la pantalla y el enlace del menú.» Muestra `2ed26bb`.
8. **Revisión.** «El revisor encontró un error que las pruebas no cubrían: si la consulta fallaba, la pantalla mostraba el aviso de error y a la vez "No tienes gastos". Se corrigió en `505e8a5`.» Muestra `revision.md`: cada hallazgo, aceptado o descartado, con su razón.
9. **Pull request y CI.** «El pull request usa la plantilla, el CI corre lint, tipos, pruebas y build, y solo se fusiona en verde.»

Las cinco en una frase cada una:
- **01 Exportar a CSV (#33):** descarga de los gastos del mes. La IA no neutralizaba fórmulas cuando el texto empezaba con espacios; el revisor lo encontró.
- **02 Avisos de presupuesto (#34):** el inicio avisa cuando una categoría llega al 80 % de su límite.
- **03 Ingresos (#35):** tabla `ingresos` con seguridad por filas y el ahorro real del mes.
- **04 Metas de ahorro (#36):** una meta por mes y su avance en «Mi ahorro».
- **05 Resumen anual (#37):** los 12 meses, las categorías y las cifras clave.

### 5. Lo que falló y cómo lo corregimos (2 minutos)
Cuéntalo como historias, no como lista:
- «**El día perdido.** El plan decía pedir los gastos hasta el 31 de diciembre. El implementador descubrió que la consulta no incluye la fecha final: así se perdía ese día. Usó el 1 de enero siguiente. Dejé el plan como se aprobó y anoté la corrección.»
- «**El mensaje que mentía.** Cuando fallaba la carga de ingresos, la pantalla decía "sin ingresos". No era cierto: no se sabía. Ahora dice que no pudo cargarlos.»
- «**El agente que se cortó.** El implementador se detuvo una vez por un límite de uso. Como el trabajo estaba en tareas pequeñas, lo retomé desde donde quedó, verificando antes lo que había hecho.»
- «**El CI.** Una vez el CI quedó "en progreso" mucho tiempo y fusioné un pull request tras repetir las cuatro comprobaciones en local. Lo reconozco como excepción.»

### 6. Calidad y lecciones (2 minutos) · muestra el paso 11 y 12
- «Apliqué tres mecanismos: **pruebas antes del código** (se ve en el historial), **revisión de cada pull request con decisión por hallazgo**, y el **CI** en cada pull request. Hoy son 946 pruebas y todas pasan.»
- «Lo que aprendí: las instrucciones no son controles, los hooks sí. Y las pruebas y los revisores encuentran cosas distintas: las pruebas pasaban y aun así el revisor halló errores reales.»
- «Lo que no hice y lo digo: no medí la cobertura, `main` no está protegida y no hay pruebas visuales; la seguridad por filas la comprobamos a mano con dos cuentas.»

## Si te preguntan (respuestas cortas)
- **¿Por qué no usaron Spec Kit?** Usamos una estructura propia, `docs/specs/NN-nombre/`, con spec, plan y tareas por funcionalidad; está explicada en el README.
- **¿Quién escribió el código?** La IA, dentro de límites: yo definí los criterios, aprobé los planes y revisé los hallazgos. Las decisiones de qué construir y qué aceptar fueron nuestras.
- **¿Qué harían distinto?** Proteger `main` desde el principio, medir la cobertura y probar las pantallas de punta a punta.
- **¿Qué no pudo hacer la IA?** Mirar las pantallas con los ojos y comprobar la seguridad por filas con dos cuentas reales; eso lo hace una persona.
- **¿Por qué las pruebas primero?** Porque si la IA escribe el código y las pruebas juntas, las pruebas se acomodan al código. Escritas antes y sin verlo, solo comprueban lo que pedía la spec.

## Antes de exponer, comprueba una vez
- `git pull` en `main` y `npm test` (deben pasar las 946).
- Abre cada archivo de la tabla de arriba para saber dónde está.
- Practica los pasos 9 y 10: es lo que más impresiona y lo que más se puede trabar.
