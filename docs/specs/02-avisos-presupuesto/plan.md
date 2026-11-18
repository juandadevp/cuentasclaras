# Plan 02-avisos-presupuesto

## Contexto
La spec `docs/specs/02-avisos-presupuesto/spec.md` pide una sección de avisos en el **inicio del panel**: las categorías del mes que llegaron al 80 % de su límite («cerca») o lo superaron («excedido»), con un enlace a «Presupuesto». El `explorador` confirmó que `progresoPresupuesto` ya aplica las reglas (80 % = cerca, 100 % sigue siendo cerca, más de 100 % = excedido) y que no existe ninguna función ni componente de avisos. Toca backend (lógica pura y una consulta) y frontend (una tarjeta). Sin tablas nuevas, sin dependencias nuevas, sin IA.

## Decisiones técnicas
1. **La lógica va en una función pura nueva** (`src/lib/avisos-presupuesto.ts`) que reutiliza `progresoPresupuesto`: así los avisos y «Presupuesto» nunca discrepan. No se copia el umbral: sale de `progresoPresupuesto`.
2. **El orden (CA-5)** es por estado (excedido antes que cercano), luego por porcentaje de uso de mayor a menor y, si empatan, por nombre de categoría, para que el resultado sea siempre el mismo. `ordenarPorUso` no sirve: no separa por estado.
3. **Los textos de los avisos también son lógica pura** (`descripcionDeAviso`, `enlaceAPresupuesto`) para poder probar CA-8 sin renderizar: el estado se dice con palabras («Cerca del límite», «Excedido») y el enlace lleva a `/panel/presupuesto?mes=yyyy-mm&categoria=...`.
4. **El inicio carga los límites en paralelo** con lo que ya carga (`Promise.all`), con su propio aviso de error (CA-9): si falla la consulta de presupuestos, el resto del inicio sigue igual y se muestra el mensaje de `mensajeDeErrorPresupuesto`. Lo gastado por categoría sale de `resumen.porCategoria`, que el inicio ya calcula: no hay una consulta de gastos nueva.
5. **Colores:** se usan los mismos que ya usa «Presupuesto» para «cerca» (`bg-accent/20 text-brand-800`) y «excedido» (`bg-rose-50 text-rose-700`), para que las dos pantallas se vean igual. `rose-*` no es un token del proyecto; ya lo usaba «Presupuesto». Queda anotado como deuda existente, no se amplía `globals.css`.
6. **La sección es una `Tarjeta` «Avisos de presupuesto»** que solo se muestra si hay avisos (CA-7); si no, no se dibuja nada.

## Lo que ya existe y se reutiliza
- `src/lib/presupuestos.ts`: `progresoPresupuesto`, tipos `Presupuesto` y `EstadoPresupuesto`.
- `src/lib/presupuestos-servidor.ts`: `presupuestosDelMes(supabase, mes)` → `{ presupuestos, error }`; `src/lib/presupuestos-errores.ts`: `mensajeDeErrorPresupuesto`.
- `src/lib/gastos.ts`: `etiquetaCategoria`, `coloresCategoria`, `rangoDelMes`; `resumirInicio(...).porCategoria` en el inicio. `src/lib/format.ts`: `formatearMoneda`.
- `src/components/panel/`: `Tarjeta`, `AvisoPanel`; el patrón de enlaces `/panel/presupuesto?mes=...&categoria=...` de `Presupuesto.tsx`.

## Archivos
**Crear**
1. `src/lib/avisos-presupuesto.ts`: `avisosDePresupuesto(presupuestos, gastadoPorCategoria)` → lista ordenada de `{ categoria, gastado, limite, porcentaje, restante, estado: "cerca" | "excedido" }`; `descripcionDeAviso(aviso)` (texto con el estado en palabras y, si se pasó, cuánto); `enlaceAPresupuesto(mes, categoria)`.
2. `src/lib/avisos-presupuesto.test.ts`: pruebas escritas **antes** del código por el `probador`.
3. `src/components/panel/AvisosPresupuesto.tsx`: tarjeta presentacional con los avisos (recibe la lista y el mes).

**Modificar**
- `src/components/panel/Inicio.tsx`: carga los límites en el `Promise.all`, calcula los avisos y dibuja `AvisosPresupuesto` entre las tarjetas de resumen y los gráficos; el error de los límites va en su propio `AvisoPanel`.
- `README.md` y `docs/specs/02-avisos-presupuesto/`: `plan.md`, `tasks.md`, `prompt.md`, `skills.md`, `revision.md` y la fila de la spec.

## Criterios de aceptación → pruebas
| Criterio | Prueba o comprobación |
|---|---|
| CA-1 | `avisos-presupuesto.test.ts` → por debajo del 80 % no hay aviso (79 %) |
| CA-2 | `avisos-presupuesto.test.ts` → exactamente 80 % = «cerca» |
| CA-3 | `avisos-presupuesto.test.ts` → exactamente 100 % sigue siendo «cerca», no «excedido» |
| CA-4 | `avisos-presupuesto.test.ts` → más del 100 % = «excedido» con `restante` negativo y texto que dice cuánto se pasó |
| CA-5 | `avisos-presupuesto.test.ts` → excedidos antes que cercanos, mayor porcentaje primero y desempate por nombre |
| CA-6 | `avisos-presupuesto.test.ts` → categoría sin límite no genera aviso aunque gaste mucho |
| CA-7 | `avisos-presupuesto.test.ts` → sin límites, o con límites y sin gastos, la lista es vacía |
| CA-8 | `avisos-presupuesto.test.ts` → `descripcionDeAviso` trae categoría, gastado, límite y el estado en palabras; `enlaceAPresupuesto` trae el mes y la categoría |
| CA-9 | Comprobación manual y revisión de código: el error de los límites va en su propio aviso sin romper el inicio (no es lógica pura) |

## Riesgos
- **CA-9 no tiene prueba automática** (vive en el componente del inicio): lo revisan los revisores y se prueba a mano apagando la tabla de presupuestos.
- **`rose-*` no es un token del proyecto.** Se mantiene por coherencia con «Presupuesto»; el revisor lo marcará como deuda existente.
- **Redondeo:** 79,6 % debe seguir siendo «bien» (sin aviso); se usa `progresoPresupuesto`, que decide con números exactos, no con el porcentaje redondeado.
- **Mes sin gastos o categoría sin límite:** se cubren con CA-6 y CA-7.
- **El inicio ya hace varias consultas:** se añade una más en paralelo, sin alargar la carga.

## Cómo se verifica
`npm run lint`, `npx next typegen`, `npx tsc --noEmit`, `npm test`, `node --test ".claude/hooks/*.test.mjs"` y `npm run build`. En pantalla: con un límite casi gastado debe salir el aviso en el inicio, con otro excedido debe salir primero y con texto, y sin límites no debe salir nada.
