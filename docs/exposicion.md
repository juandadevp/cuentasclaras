# Exposición: el arnés de Cuentas Claras (20 minutos)

15 minutos de exposición y 5 de preguntas. Herramienta: **Claude Code**. Repositorio único: `juandadevp/cuentasclaras` (frontend y backend juntos en Next.js).

## 0 – 2 min · El proyecto, la herramienta y el repositorio
- Cuentas Claras: panel privado para registrar gastos, verlos por categoría, comparar meses, presupuesto, comparador de precios y favoritos. Next.js 16, Supabase (con seguridad por filas) y TypeScript.
- Un solo repositorio; la versión original está en la rama `legacy/v1`.
- Herramienta: Claude Code, con un orquestador en modo plan y cinco subagentes.

## 2 – 6 min · El arnés
- **Memoria:** `AGENTS.md` (y `CLAUDE.md`, que lo importa): comandos, organización, convenciones y lo que el agente NO debe hacer.
- **Reglas:** `.claude/rules/`, se cargan solas según el tipo de archivo (migraciones, acciones, pantallas, pruebas, flujo y git).
- **Skills (más de 3):** `crear-migracion-supabase`, `crear-accion-servidor`, `crear-pantalla-panel`, `escribir-pruebas`, entre otras; cada una resuelve un problema concreto del proyecto (ver el README, sección 2).
- **Permisos y hooks:** `.claude/settings.json` y los hooks `proteger-secretos` y `limitar-agente`.
- Mostrar: el README del arnés y `docs/ARNES.md`.

## 6 – 9 min · El sistema de agentes y qué cambió
- Roles: orquestador (planea, no programa), `explorador`, `probador`, `implementador`, `revisor-pull-request`, `revisor-seguridad`.
- Cambio principal: el campo `tools` no limita carpetas ni comandos, así que se agregó el hook `limitar-agente.mjs`, con pruebas que corren en el CI.
- Limitación real: el orquestador no puede tener hook (los hooks de frontmatter solo aplican a subagentes).
- Más cambios: el permiso del `probador` estaba demasiado abierto (banderas de `vitest`) y se cerró; el `implementador` no escribe en `docs/` para no marcarse a sí mismo como terminado.

## 9 – 13 min · La experiencia con las cinco specs
| Spec | PR | Qué se construyó |
|---|---|---|
| 01 exportar CSV | #33 | Descarga de gastos en CSV, neutralizando inyección de fórmulas. |
| 02 avisos de presupuesto | #34 | Avisos cuando se acerca o pasa el límite. |
| 03 ingresos | #35 | Tabla `ingresos` con seguridad por filas y ahorro real. |
| 04 metas de ahorro | #36 | Tabla `metas_ahorro` y avance de la meta en «Mi ahorro». |
| 05 resumen anual | #37 | Pantalla con los 12 meses, categorías y cifras clave. |

**Qué funcionó:** el flujo spec → plan → tareas → pruebas → código → revisores → pull request; el hook; reutilizar lo que encontraba el `explorador`.

**Qué falló y qué tuvimos que corregir a la IA** (ejemplos reales):
- Inyección en el CSV cuando el texto empezaba con espacios o signos de ancho completo (la encontró el revisor).
- Mensaje «sin ingresos» engañoso cuando en realidad había fallado la carga.
- El resumen anual pedía hasta el 31 de diciembre, pero la consulta excluye la fecha final: se perdía ese día.
- El aviso de error se mostraba junto a «No tienes gastos».
- Comandos con el encabezado YAML inválido y un permiso demasiado abierto.
- El `implementador` se cortó por límite de uso y hubo que retomarlo comprobando antes el trabajo parcial.

## 13 – 15 min · Calidad y lecciones
- **Mecanismo 1: pruebas antes del código.** En cada rama el commit de las pruebas va antes que el del código (por ejemplo `c3dcbd7` y luego `2ed26bb` en la spec 05). 946 pruebas.
- **Mecanismo 2: revisión de cada pull request** por dos revisores, con cada hallazgo aceptado o descartado (`docs/specs/NN-nombre/revision.md`).
- **Mecanismo 3: CI** en GitHub Actions (lint, tipos, pruebas, hooks y build) en cada pull request.
- **Límites que reconocemos:** sin cobertura ni mutation testing; `main` sin protección; sin pruebas visuales; la seguridad por filas se comprueba a mano con dos cuentas.
- **Lecciones:** pedir a la IA que escriba las pruebas sin ver el código evita que se justifique a sí misma; las instrucciones no son controles, los hooks sí; las pruebas pasan y aun así los revisores encuentran fallos, por eso hacen falta ambos.

## 15 – 20 min · Preguntas
Posibles preguntas y respuesta corta:
- *¿Por qué no usaron Spec Kit?* Se usó una estructura propia (`docs/specs/NN-nombre/` con spec, plan y tareas), explicada en el README.
- *¿Qué harían distinto?* Proteger `main`, medir cobertura y probar las pantallas de punta a punta.
- *¿Qué no pudo hacer la IA?* Comprobar las pantallas con los ojos y la seguridad por filas con dos cuentas: lo hizo una persona.
