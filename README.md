# Cuentas Claras

Aplicación web para llevar el control de los gastos mensuales (Next.js 16, Supabase y TypeScript). Cada persona tiene un panel privado donde registra gastos, los ve por categoría, compara sus meses, fija un presupuesto, busca precios en tiendas de Colombia, guarda favoritos y ve cuánto ahorra.

Es un solo repositorio: el frontend y el backend (las Server Actions y la conexión con Supabase) viven juntos en Next.js. La versión original (v1) se conserva en la rama [`legacy/v1`](../../tree/legacy/v1).

## Comandos
```bash
npm install
npm run dev
npm run lint
npx next typegen
npx tsc --noEmit
npm test
node --test ".claude/hooks/*.test.mjs"   # pruebas de los hooks del arnés
npm run build
```

## El arnés
En este proyecto, el arnés es todo lo que rodea a la IA (Claude Code) para que trabaje bien: lo que lee al empezar, las normas que sigue, las skills que carga, los agentes que reparten el trabajo, el flujo que se sigue y los controles que verifican lo que produce. El mapa detallado está en [`docs/ARNES.md`](docs/ARNES.md) y la arquitectura en [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md).

### 1. Qué piezas tiene y dónde está cada una

| Pieza | Qué es | Dónde está |
|---|---|---|
| Memoria | Lo que el agente lee al empezar: stack, comandos, organización, convenciones y lo que NO debe hacer | `AGENTS.md` (base) y `CLAUDE.md` (importa `AGENTS.md` y añade reglas de Claude Code) |
| Reglas | Normas que se cargan solas al tocar ciertos archivos | `.claude/rules/` (pruebas, acciones de servidor, migraciones, pantallas y flujo de git) |
| Skills | Procedimientos que el agente carga cuando la tarea coincide | `.claude/skills/` (7) |
| Agentes | Orquestador y cinco subagentes con herramientas, permisos y modelo propios | `.claude/agents/` |
| Hooks y permisos | Controles que cancelan lo que no se debe hacer | `.claude/hooks/` y `.claude/settings.json` |
| Comandos | Flujos guiados | `.claude/commands/` (`/nueva-spec` para las specs, `/nueva-solicitud` para los módulos 1 a 13) |
| Flujo SDD | Especificación → plan → tareas → código | `docs/specs/NN-nombre/` (plantilla en `docs/specs/_plantilla/`) |
| Calidad | CI, pruebas, revisores y evidencia | `.github/workflows/ci.yml`, `.github/pull_request_template.md` y los pull requests |

No usamos Spec Kit, así que no hay `constitution.md`: los principios no negociables están en `AGENTS.md` («Lo que el agente NO debe hacer» y «Convenciones») y en las reglas.

### 2. Para qué usamos cada skill

| Skill | Qué problema resuelve en este proyecto | Cuándo se invoca |
|---|---|---|
| `vercel-react-best-practices` (de Vercel, licencia MIT, revisada antes de instalarla) | Evita errores de rendimiento típicos de React y Next.js (efectos innecesarios, consultas en cascada, imports pesados). | Al escribir o revisar componentes y páginas. |
| `crear-migracion-supabase` | Cada tabla nace con seguridad por filas, restricciones y un script que se puede ejecutar dos veces; así nadie ve datos de otra persona. | Al crear o cambiar una tabla, columna o política. |
| `autenticacion-supabase` | Registro, inicio de sesión y recuperación de contraseña sin revelar si un correo existe y sin redirecciones abiertas. | Al tocar cuentas, sesión, contraseñas o rutas protegidas. |
| `crear-pantalla-panel` | Las pantallas del panel quedan iguales: enlace en el menú, datos del usuario, estado vacío y errores claros. | Al crear o cambiar una página dentro de `src/app/panel/`. |
| `crear-accion-servidor` | Las Server Actions validan en el servidor, comprueban la sesión, traducen errores y nunca confían en el navegador. | Al guardar, editar, borrar o consultar datos desde un formulario o botón. |
| `integrar-api-externa` | La clave de SerpApi se queda en el servidor, con caché, límites, modo demostración y errores claros. | Al consultar un servicio externo de pago. |
| `escribir-pruebas` | Pruebas con `vitest` de la lógica pura, con el resultado esperado calculado a mano. | Al agregar o cambiar lógica de `src/lib/` y al pedir pruebas. |

### 3. Cómo se usa el arnés
1. **Se abre Claude Code en la carpeta del proyecto.** Lee `AGENTS.md` y las reglas por su cuenta.
2. **Se escribe `/nueva-spec NN-nombre`** (por ejemplo `/nueva-spec 01-ingresos`). El orquestador sigue estos pasos y pide confirmación en cada uno:
   1. Crea la rama `feat/NN-nombre` y la carpeta `docs/specs/NN-nombre/` con las plantillas.
   2. Redacta `spec.md` con criterios de aceptación (CA-1, CA-2…). **Una persona la aprueba.**
   3. El `explorador` busca lo que ya existe para reutilizar.
   4. El orquestador genera `plan.md` en modo plan, sin editarlo a mano. **Una persona lo aprueba**; sin eso no se escribe código.
   5. Crea `tasks.md` (Red, Green, verificación y cierre).
   6. El `probador` escribe las pruebas primero (Red) y confirma que fallan por el motivo esperado. Se suben en su propio commit.
   7. El `implementador` escribe el código mínimo (Green) y lo ordena. Si falla la verificación, máximo 2 vueltas; después se detiene y pregunta.
   8. `revisor-pull-request` (siempre) y `revisor-seguridad` (si toca tablas, acciones o autenticación) revisan. Cada hallazgo se anota como aceptado (con su commit) o descartado (con su razón).
   9. Pull request con la plantilla; CI en verde; **una persona fusiona a `main`**.

### 4. Qué cambió del sistema de agentes respecto del taller y por qué
El taller diseñó seis roles. Estos son los cambios al implementarlos, con lo que observamos:

| Cambio | Por qué |
|---|---|
| Se agregó el hook `.claude/hooks/limitar-agente.mjs` para el `probador` y el `implementador`. | Al implementar vimos que el campo `tools` de un agente solo dice **qué herramientas** tiene, no sobre qué carpetas ni con qué comandos. Sin el hook, «el probador solo toca `*.test.ts`» era solo una instrucción. El hook lo hace cumplir y se probó con 5 pruebas y 40 acciones permitidas y bloqueadas que corren en el CI. |
| El orquestador **no** tiene un hook como los demás. | Es la sesión principal de Claude Code, no un subagente, y los `hooks` del frontmatter solo aplican a subagentes. Se limita con el modo plan (no edita hasta que una persona aprueba el plan), con las reglas y con los permisos de `.claude/settings.json`. Es una limitación real. |
| Los dos revisores existentes recibieron `model` (`revisor-seguridad`: `opus`; `revisor-pull-request`: `haiku`). | En el diseño cada agente tenía modelo y razón; antes de esto heredaban el de la conversación. |
| El `implementador` no escribe en `docs/`. | Las tareas se marcan y los documentos se actualizan desde el orquestador, para que el agente que escribe código no pueda marcarse a sí mismo como terminado. |
| El flujo ahora arranca con `/nueva-spec` y usa `docs/specs/` en vez de `docs/solicitudes/`. | El proyecto integrador pide spec, plan y tareas por funcionalidad. |

Lo que descubramos al ejecutar las cinco specs se agrega a esta tabla.

### 5. Qué mecanismos de calidad aplicamos y dónde está su evidencia

| Mecanismo | Dónde está la evidencia |
|---|---|
| **CI en cada pull request** (lint, tipos, pruebas de la aplicación, pruebas de los hooks y build) | `.github/workflows/ci.yml` y la pestaña *Actions* de cada pull request. |
| **Pruebas antes del código (TDD)**, en un commit propio | El historial de cada rama `feat/NN-nombre`: el commit de las pruebas va antes que el del código. Cada pull request enlaza ambos. |
| **Revisión de cada pull request por los dos revisores**, con cada hallazgo aceptado o descartado | Los comentarios de cada pull request y la sección «Evidencia de calidad» de su descripción. |
| **Hook de protección** (`proteger-secretos.mjs` y `limitar-agente.mjs`) probado | `.claude/hooks/*.test.mjs` y el paso «Pruebas de los hooks del arnés» del CI. |

Los pull requests de las cinco specs se irán enlazando aquí cuando se fusionen.

| Spec | Pull request | Commit de las pruebas | Revisión |
|---|---|---|---|
| 01-exportar-csv | [#33](https://github.com/juandadevp/cuentasclaras/pull/33) | `d112390` y `fcbfc75` | `docs/specs/01-exportar-csv/revision.md` |
| 02-avisos-presupuesto | [#34](https://github.com/juandadevp/cuentasclaras/pull/34) | `0989b04` y `00f97c8` | `docs/specs/02-avisos-presupuesto/revision.md` |
| 03-ingresos | [#35](https://github.com/juandadevp/cuentasclaras/pull/35) | `aed284e` | `docs/specs/03-ingresos/revision.md` |
| 04-metas-ahorro | [#36](https://github.com/juandadevp/cuentasclaras/pull/36) | `45afc4c` | `docs/specs/04-metas-ahorro/revision.md` |
| 05-resumen-anual | [#37](https://github.com/juandadevp/cuentasclaras/pull/37) | `c3dcbd7` | `docs/specs/05-resumen-anual/revision.md` |

### Límites que reconocemos
- No medimos la cobertura ni usamos *mutation testing* todavía.
- La rama `main` no está protegida en GitHub: fusionar con el CI en rojo depende de la persona.
- No hay pruebas visuales ni de punta a punta del frontend.
- La seguridad por filas de Supabase se comprueba a mano con dos cuentas.
