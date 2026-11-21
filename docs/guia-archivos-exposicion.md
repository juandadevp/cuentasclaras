# Guía de los archivos que vas a abrir: qué hace cada uno

Para cada archivo: **qué es**, **qué hace**, **qué señalar con el cursor** y **qué decir**. Los ejemplos son reales, tomados de este repositorio. Ábrelos en este orden.

> **No abras nunca `.env` ni `.env.local`**: tienen claves. Si el editor los tiene abiertos en una pestaña, ciérralos antes de compartir pantalla.

---

## Parte A: El arnés (lo que rodea a la IA)

### 1. `README.md` → sección «El arnés»
- **Qué es:** la entrada del proyecto. La primera página que lee quien llega.
- **Qué hace:** explica el arnés en 5 partes: qué piezas tiene y dónde está cada una, para qué sirve cada skill, cómo se usa, qué cambió del sistema de agentes y qué mecanismos de calidad aplicamos.
- **Señala:** la tabla «Qué cambió del sistema de agentes respecto del taller y por qué» y la tabla final de las cinco specs con su pull request.
- **Di:** «Este README es el mapa. Si alguien nuevo llega, aquí encuentra todo lo que construimos y dónde está la evidencia».

### 2. `AGENTS.md` (y `CLAUDE.md`)
- **Qué es:** la **memoria** del proyecto: lo primero que lee el agente al empezar cada sesión. `CLAUDE.md` solo importa `AGENTS.md` y agrega nuestras instrucciones propias.
- **Qué hace:** le dice a la IA cómo correr el proyecto (comandos), cómo se organiza el código, las convenciones (todo en español, validar siempre en el servidor) y lo que NO debe hacer.
- **Señala:** la sección «Lo que el agente NO debe hacer».
- **Ejemplo:** «No modificar migraciones ya aplicadas: crear una nueva» y «No hacer merge a `main` sin que el equipo lo pida».
- **Di:** «Esto evita repetir lo mismo en cada pedido. El agente ya llega sabiendo cómo trabajamos».

### 3. `.claude/rules/pruebas.md` (y las otras reglas)
- **Qué es:** las **reglas**: normas cortas que se cargan solas según el tipo de archivo que se toca. Esta se aplica a `src/**/*.test.ts` (lo dice el encabezado `paths`).
- **Qué hace:** fija cómo deben ser las pruebas.
- **Señala:** «El resultado esperado se **calcula a mano**. Nunca se copia de lo que devuelve el código: una prueba que repite al código no prueba nada».
- **Otras reglas:** `migraciones.md`, `acciones-servidor.md`, `pantallas-panel.md` y `flujo-y-git.md`.
- **Di:** «Si el agente escribe una prueba, esta regla se carga sola y le recuerda cómo debe ser».

### 4. `.claude/skills/crear-migracion-supabase/SKILL.md`
- **Qué es:** una **skill**: un procedimiento que el agente carga solo cuando lo necesita. El encabezado `description` es lo que le dice cuándo usarla.
- **Qué hace:** da los pasos para crear una tabla de Supabase bien hecha.
- **Señala:** los pasos 5 y 6: tabla con `user_id`, seguridad por filas activada, una política por acción y script que se puede ejecutar dos veces.
- **Ejemplo real:** con esta skill nacieron las tablas `ingresos` (3 políticas) y `metas_ahorro` (4 políticas).
- **Di:** «Sin la skill, cada tabla saldría distinta y alguna podría quedar sin seguridad por filas. Con ella, siempre sale igual de segura».
- **Las otras skills:** `crear-accion-servidor` (acciones que validan en el servidor), `crear-pantalla-panel` (pantallas con estado vacío y error) y `escribir-pruebas`.

### 5. `.claude/settings.json`
- **Qué es:** los **permisos** del proyecto.
- **Qué hace:** lista qué comandos se permiten sin preguntar (`npm test`, `npm run lint`, `git status`…) y cuáles se niegan.
- **Señala:** el bloque `deny`: no leer `.env`, y nada de `git push --force` ni `git reset --hard`.
- **Di:** «Las cosas peligrosas están prohibidas por configuración, no por buena voluntad».

### 6. `.claude/hooks/proteger-secretos.mjs`
- **Qué es:** un **hook**: un programa que se ejecuta antes de cada acción del agente.
- **Qué hace:** revisa la acción y, si intenta leer o editar un `.env`, la cancela con código de salida 2 y le explica el motivo.
- **Señala:** la línea que dice «No se leen ni se editan los archivos .env (claves secretas)».
- **Di:** «Es la diferencia entre pedirle a la IA que no lo haga y que no pueda hacerlo».

---

## Parte B: Los agentes

### 7. `.claude/agents/probador.md`
- **Qué es:** la definición de un subagente. El encabezado dice su nombre, para qué sirve, qué herramientas tiene, qué modelo usa y qué hook lo controla.
- **Qué hace:** escribe las pruebas **antes** del código, sin ver la implementación. Solo puede tocar archivos `*.test.ts` y solo ejecutar `npm test` y `vitest`.
- **Señala:** «Si una función no existe todavía, la prueba la importa igual: debe fallar por eso» y el informe final obligatorio con la evidencia del Red.
- **Di:** «No le dejo ver el código para que no escriba las pruebas a la medida de lo que ya hizo».

### 8. `.claude/agents/implementador.md`
- **Qué es:** el agente que escribe el código.
- **Qué hace:** escribe el **mínimo** código que hace pasar las pruebas, y después lo ordena. Solo toca `src/` (sin las pruebas) y migraciones nuevas. No puede tocar `docs/` ni `.claude/`.
- **Señala:** «Si falla la verificación, después de 2 intentos sin éxito, detente y repórtalo».
- **Di:** «Tiene un tope de intentos para que no se quede dando vueltas ni improvise».
- **Los otros tres:** `explorador` (solo lee), `revisor-pull-request` y `revisor-seguridad` (solo leen y reportan).

### 9. `.claude/hooks/limitar-agente.mjs` y `limitar-agente.test.mjs`
- **Qué es:** el hook que hace cumplir los límites de los agentes. Es el cambio principal respecto del taller.
- **Qué hace:** cuando el probador o el implementador intentan escribir un archivo, mira la ruta. Si es el probador y el archivo no termina en `.test.ts`, lo bloquea con el mensaje «solo escribe archivos *.test.ts». También limita qué comandos pueden correr.
- **Señala:** la línea `if (!esPrueba) bloquear(...)` y que el hook arranca solo cuando ese agente está activo (lo declara el encabezado `hooks:` de cada agente).
- **Abre después** `limitar-agente.test.mjs`: son las pruebas del propio hook.
- **Di:** «Descubrí que el campo `tools` dice qué herramientas tiene un agente, pero no sobre qué carpetas. Por eso agregué este hook, y lo probé. Esas pruebas corren en el CI».

### 10. `.claude/commands/nueva-spec.md`
- **Qué es:** un **comando** propio: al escribir `/nueva-spec 05-resumen-anual` se ejecuta este guion.
- **Qué hace:** guía las 9 fases de una spec, y en cada una espera tu confirmación.
- **Señala:** el paso 4 («genera `plan.md` en modo plan. No lo edites a mano. Espera mi aprobación») y el paso 9 («No fusiones a `main`: eso lo hago yo cuando el CI esté en verde»).
- **Di:** «El proceso está escrito una vez, y se repite igual en las cinco specs».

---

## Parte C: Una spec completa, la 05

Abre `docs/specs/05-resumen-anual/`. Tiene seis archivos. Cada uno responde una pregunta.

### 11. `spec.md`: ¿qué se construye y cómo sé que está bien?
- **Qué hace:** describe la funcionalidad y la define con **criterios de aceptación** numerados.
- **Ejemplo:** CA-8: «Dado un gasto del 31 de diciembre y otro del 1 de enero siguiente, cuando se resumen ambos años, entonces cada uno cuenta en el año que le corresponde».
- **Señala:** la sección «Fuera de alcance» (no comparar años, no exportar, no tabla nueva).
- **Di:** «Un criterio bien escrito se puede convertir directamente en una prueba».

### 12. `plan.md`: ¿cómo se construye?
- **Qué hace:** decisiones técnicas, archivos que se tocan, lo que se reutiliza y una tabla «criterio → prueba».
- **Señala:** la tabla de criterios a pruebas.
- **Di:** «Lo generó el modo plan y no se editó a mano; una persona lo aprobó antes de escribir una línea de código».

### 13. `tasks.md`: ¿en qué pasos?
- **Qué hace:** el trabajo dividido en fases (Red, Green, verificación y cierre), con cada tarea marcada `[X]` al terminar.

### 14. `prompt.md` y `skills.md`: ¿cómo se pidió y qué se usó?
- **`prompt.md`:** lo que pedimos, con la fórmula del taller (qué quiero, para quién, contexto, formato, restricciones).
- **`skills.md`:** qué skills y agentes se usaron en esta spec y para qué.

### 15. `revision.md`: ¿qué encontraron los revisores y qué decidimos?
- **Qué hace:** la evidencia de calidad: historial de commits, cómo se comprobó el Red y cada hallazgo con su decisión.
- **Ejemplo (spec 05):** «Si la consulta fallaba, se mostraba el aviso de error junto a "No tienes gastos"». **Aceptado**, arreglado en `505e8a5`.
- **Ejemplo (spec 01):** la neutralización de fórmulas del CSV solo miraba el primer carácter. **Aceptado**, pruebas en `fcbfc75` y arreglo en `2e82d09`.
- **Di:** «Cada hallazgo termina en una decisión escrita: aceptado, con el commit que lo arregla, o descartado, con la razón».

---

## Parte D: Pruebas primero, y luego el código

### 16. Terminal: `git log --oneline 6c6cac9^..505e8a5`
- **Qué hace:** muestra los commits de la spec 05 en orden.
- **Lo que verás:**
  ```
  505e8a5 Arreglar el estado vacío con error y el nombre del mes en el resumen anual
  2ed26bb Agregar la pantalla de resumen anual (Green)
  c3dcbd7 Agregar pruebas del resumen anual (Red)
  2cd1ba2 Agregar plan y tareas de la spec 05-resumen-anual
  6c6cac9 Agregar la spec 05: resumen anual de gastos
  ```
- **Señala:** que el commit de las pruebas (`c3dcbd7`) está **antes** que el del código (`2ed26bb`). Esa es la evidencia de las pruebas primero.

### 17. `src/lib/resumen-anual.test.ts`
- **Qué es:** las 38 pruebas que escribió el probador.
- **Qué hace:** comprueba cada criterio con el resultado calculado a mano.
- **Ejemplo:** `anioDeResumen("1999", HOY)` debe dar `2026`, porque 1999 queda por debajo de 2000 y entonces se usa el año de hoy. `HOY` está fijo en `"2026-03-15"` para que la prueba no dependa del día en que se corra.
- **Di:** «Los casos de borde son lo importante: 2000, 1999, el año actual, un año futuro».

### 18. `src/lib/resumen-anual.ts`
- **Qué es:** el código mínimo que escribió el implementador.
- **Qué hace:** tres funciones: `anioDeResumen` (qué año mostrar), `mesesDelAnio` (los doce meses `AAAA-MM`) y `resumirAnio` (totales, categorías, mes mayor).
- **Ejemplo:** `anioDeResumen` acepta solo cuatro cifras entre `ANIO_MINIMO` (2000) y el año de hoy; si no, usa el año de hoy.
- **Di:** «Es lógica pura, sin Supabase ni pantalla, por eso se puede probar con pruebas rápidas». Para mostrarlo corre `npm test` y señala los 946 en verde.

---

## Parte E: El CI y la calidad

### 19. `.github/workflows/ci.yml`
- **Qué es:** el flujo de GitHub Actions.
- **Qué hace:** en cada pull request instala, y corre en orden lint, tipos, pruebas, pruebas de los hooks y compilación.
- **Señala:** el paso «Pruebas de los hooks del arnés»: «Comprueban que el hook limitar-agente.mjs bloquea lo que cada agente no puede hacer».
- **Di:** «Un pull request no se fusiona hasta que este flujo esté en verde. Aquí se ve en el pull request #37».

### 20. `docs/specs/01-exportar-csv/revision.md`
- **Qué es:** la mejor evidencia de revisión, porque tiene dos rondas.
- **Señala:** la tabla con la columna «Decisión»: hay hallazgos **aceptados** y **descartados con su razón** (por ejemplo, «no hay límite de frecuencia en la descarga»: descartado porque exige sesión y el riesgo es bajo).
- **Di:** «No todo lo que dice un revisor se acepta: se evalúa y se justifica».

---

## Resumen para tener en la mano
| Quiero mostrar… | Abro… |
|---|---|
| Qué es el arnés | `README.md`, `AGENTS.md` |
| Cómo se controla la IA | `.claude/rules/`, `settings.json`, los dos hooks |
| Quién hace qué | `.claude/agents/` |
| Cómo se arranca una spec | `.claude/commands/nueva-spec.md` |
| Una spec completa | `docs/specs/05-resumen-anual/` |
| Pruebas antes del código | `git log` y `resumen-anual.test.ts` → `resumen-anual.ts` |
| Que todo se verifica | `ci.yml`, `npm test` y el pull request |
| Que los revisores sirven | `docs/specs/01-exportar-csv/revision.md` |
