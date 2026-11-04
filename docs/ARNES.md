# Arnés del agente en Cuentas Claras

Este documento es el **mapa** de todo lo que rodea al agente (Claude Code) en este repositorio: qué le dice qué hacer, qué le impide hacer, cómo se comprueba su trabajo y dónde queda la evidencia de cada módulo.

## Las cuatro capas

| Capa | Para qué sirve | Dónde está |
|---|---|---|
| **Guía** | Que el agente conozca el proyecto y sus reglas | `AGENTS.md`, `CLAUDE.md`, `.claude/skills/`, `.claude/agents/`, `.claude/commands/` |
| **Control** | Que no pueda hacer lo que nunca debe hacerse | `.claude/settings.json` (permisos) y `.claude/hooks/proteger-secretos.mjs` |
| **Verificación** | Que el trabajo se compruebe solo | pruebas con vitest (`npm test`) y `.github/workflows/ci.yml` |
| **Proceso** | Que cada cambio sea revisable | prompt → plan → rama → pull request (`docs/solicitudes/`, `.github/pull_request_template.md`) |

## 1. Guía

### Memoria
- `AGENTS.md`: contenido del proyecto (stack, comandos, organización, convenciones y lo que el agente NO debe hacer). Lo leen casi todas las herramientas.
- `CLAUDE.md`: su primera línea es `@AGENTS.md`, que importa todo lo anterior, y debajo van las reglas solo de Claude Code (modo plan en tareas grandes, explicar en palabras simples).

### Skills (`.claude/skills/`)
| Skill | Origen | Se usa para |
|---|---|---|
| `vercel-react-best-practices` | Vercel (licencia MIT), revisada antes de instalarla | Rendimiento de React y Next.js |
| `crear-migracion-supabase` | Del equipo | Tablas con seguridad por filas |
| `autenticacion-supabase` | Del equipo | Registro, sesión y recuperación de contraseña |
| `crear-pantalla-panel` | Del equipo | Pantallas del portal privado |
| `crear-accion-servidor` | Del equipo | Acciones de servidor seguras |
| `integrar-api-externa` | Del equipo | Servicios de terceros (SerpApi) |
| `escribir-pruebas` | Del equipo | Pruebas con vitest |

Revisión de seguridad: todas son archivos de texto sin scripts. De las de terceros se descartó `web-design-guidelines` porque descarga sus reglas de internet en cada uso.

### Subagentes (`.claude/agents/`)
- `revisor-seguridad`: revisa seguridad por filas, validación en servidor, redirecciones y manejo de claves.
- `revisor-pull-request`: revisa que no falten archivos, pruebas ni documentación antes del pull request.

### Comando propio (`.claude/commands/`)
- `/nueva-solicitud NN-nombre`: guía el flujo completo de una funcionalidad nueva.

## 2. Control
`.claude/settings.json` define lo que se puede ejecutar sin preguntar (lint, tipos, pruebas, build y lectura de git) y lo que está prohibido (leer o editar `.env`, `git push --force`, `git reset --hard`).

El hook `proteger-secretos.mjs` se ejecuta antes de cada lectura, edición o comando y **cancela** la acción si intenta: leer archivos `.env` (excepto `.env.example`), hacer un push forzado, subir directo a `main`, usar `git reset --hard` o borrar carpetas raíz con `rm -rf`.

El hook se probó con 17 casos (permitidos y bloqueados) y se corrigió un falso positivo que él mismo provocó: un documento que *mencionaba* un comando prohibido dentro de un `cat <<EOF` se bloqueaba como si fuera el comando.

## 3. Verificación
- 25 archivos de prueba (`*.test.ts`) con vitest, junto al código que prueban. Ninguna prueba llama a una API real.
- GitHub Actions (`ci.yml`) corre en cada pull request: `npm run lint`, `npx next typegen`, `npx tsc --noEmit`, `npm test` y `npm run build`.

## 4. Proceso y evidencia por módulo
Cada funcionalidad se construyó en su propia rama, con un prompt (fórmula: *qué quiero, para quién, contexto, formato y restricciones*), un plan generado en modo plan y un pull request. La evidencia está en `docs/solicitudes/NN-nombre/` (`prompt.md`, `plan.md`, `skills.md`).

| Módulo | Carpeta de evidencia | Pull request |
|---|---|---|
| 01 Base | `docs/solicitudes/01-base` | #16 |
| 01b Portada | `docs/solicitudes/01b-portada` | #19 |
| 02 Autenticación | `docs/solicitudes/02-autenticacion` | #17 |
| 04 Portal | `docs/solicitudes/04-portal` | #18 |
| 05 Gastos | `docs/solicitudes/05-gastos` | #20 |
| 06 Presupuesto | `docs/solicitudes/06-presupuesto` | #21 |
| 07 Recuperar contraseña | `docs/solicitudes/07-recuperar-clave` | #22 (y #23, que sumó dos archivos que faltaban) |
| 08a Lógica de precios | `docs/solicitudes/08a-precios` | #23 |
| 09 Contacto y ayuda | `docs/solicitudes/09-contacto-ayuda` | #24 |
| 10 Detalles | `docs/solicitudes/10-detalles` | #25 |
| 11 Recomendar compras | `docs/solicitudes/11-recomendar` | #26 |
| 12 Favoritos | `docs/solicitudes/12-favoritos` | #27 |
| 13 Mi ahorro | `docs/solicitudes/13-ahorro` | pendiente |

Los dos primeros ejercicios del taller (presupuesto y recuperar contraseña) se hicieron antes en la versión original (rama `legacy/v1`, PR #11 y #12) y sus planes están en esa rama.

## Historia del proyecto (sin maquillaje)
- **v1 (`legacy/v1`)**: la aplicación se construyó pidiéndole cambios a Claude Code directamente, **sin skills ni modo plan**. Sus mensajes, tal como se escribieron, están en `docs/historial-de-prompts.md`.
- **Reconstrucción (rama principal)**: el proyecto se vació y se reconstruyó módulo por módulo con el arnés descrito aquí. Algunos errores del proceso quedaron registrados en el historial de Git, por ejemplo un módulo que se fusionó con archivos sin subir (corregido en el PR #23); de ahí salió el subagente `revisor-pull-request`.

## Cómo comprobar el arnés
1. `npm install` y luego `npm run lint`, `npx next typegen`, `npx tsc --noEmit`, `npm test` y `npm run build`.
2. En Claude Code, `/permissions` muestra las reglas de `.claude/settings.json`, y `/agents` y `/skills` los subagentes y las skills.
3. Probar el hook: pedirle al agente que lea `.env.local`; la acción debe quedar bloqueada con el mensaje del arnés.
