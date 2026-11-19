# Plan 05-resumen-anual

## Contexto
La spec `docs/specs/05-resumen-anual/spec.md` pide una pantalla **«Resumen anual»** (`/panel/resumen-anual`): para un año elegido, el total de cada mes, el desglose por categoría y tres cifras clave (total, promedio mensual, mes de mayor gasto), con flechas para cambiar de año. Hoy «Inicio» muestra solo 6 meses y «Mis gastos» es mes a mes. El `explorador` confirmó que casi todo se puede reutilizar: no hay tabla nueva, ni migración, ni Server Action, ni dependencias. Es **lógica pura nueva + una pantalla de lectura**.

## Decisiones técnicas
1. **Parámetro de la URL: `anio`** (`/panel/resumen-anual?anio=2025`). Se decide con `anioDeResumen(valor, hoy)`: cuatro cifras entre 2000 y el año de hoy; si no, el año de hoy.
2. **Toda la lógica va en `src/lib/resumen-anual.ts`** (pura, sin Supabase ni React) para poder probarla: `anioDeResumen`, `mesesDelAnio(anio)` y `resumirAnio(gastos, anio)`, que devuelve `{ anio, total, cantidad, promedioMensual, meses[12], categorias[], mesMayor }`. Filtra por año aquí, así que CA-3 y CA-8 no dependen de la consulta.
3. **Promedio siempre entre 12** (`Math.round(total / 12)`), como dice la spec, aunque el año actual no haya terminado.
4. **Categorías**: solo las que tienen gastos, ordenadas por total descendente y, si empatan, por nombre; porcentaje entero del total del año. Como en spec 02, el orden se decide con números exactos, no con el porcentaje redondeado.
5. **Mes de mayor gasto**: el de total más alto; si empatan, el primero del año; `null` si no hay gastos.
6. **Los meses se muestran como lista con barra y el total escrito en texto** (no solo barra ni color). `BarrasMeses` de «Inicio» solo muestra el valor al pasar el ratón, así que no basta; se hace un componente nuevo y simple.
7. **Dona de categorías: se reutiliza tal cual** (`DonaCategorias`, datos `{categoria, total}[]` y `total`), junto a una lista con porcentaje escrito.
8. **Consulta**: `gastosEntre(supabase, "AAAA-01-01", "AAAA-12-31")` de `gastos-servidor.ts`; devuelve `{ gastos, error, recortado }` con tope de 5.000. `error` → `AvisoPanel` con `mensajeDeErrorGasto`; `recortado` → aviso de resumen incompleto.
9. **Navegación entre años** con el mismo patrón de `Presupuesto.tsx`/`Ingresos.tsx`: flecha activa como enlace y flecha inactiva como `<span aria-hidden>` en los límites (2000 y año actual).
10. **Pantalla**: patrón de `app/panel/presupuesto/page.tsx` (`await connection()` dentro de un componente detrás de `<Suspense>` con `fallback <div aria-busy className="h-96" />`, `PageProps<"/panel/resumen-anual">`, `TituloPagina`, `Tarjeta`). Estado vacío claro cuando no hay gastos.
11. **Menú**: enlace «Resumen anual» en la sección «Gastos» de `MarcoPanel.tsx` y `"resumen-anual": "Resumen anual"` en `nombresRuta`.

## Lo que ya existe y se reutiliza
- `src/lib/gastos.ts`: `hoyIso`, `nombreDelMes`, `mesCorto`, `etiquetaCategoria`, `coloresCategoria`.
- `src/lib/gastos-servidor.ts`: `gastosEntre`; `src/lib/gastos-errores.ts`: `mensajeDeErrorGasto`; `src/lib/format.ts`: `formatearMoneda`.
- `src/components/panel/DonaCategorias.tsx`, `Tarjeta`, `TituloPagina`, `AvisoPanel`.
- Modelos a copiar: `src/app/panel/presupuesto/page.tsx` y la navegación por flechas de `Presupuesto.tsx`.

## Archivos
**Crear**
1. `src/lib/resumen-anual.ts`: lógica pura (arriba).
2. `src/lib/resumen-anual.test.ts`: pruebas escritas **antes** del código por el `probador`.
3. `src/app/panel/resumen-anual/page.tsx`: pantalla con `Suspense`.
4. `src/components/panel/ResumenAnual.tsx`: servidor; cifras clave, meses, categorías y avisos.

**Modificar**
- `src/components/panel/MarcoPanel.tsx`: enlace y nombre de ruta.
- `README.md` (fila 05) y `docs/specs/05-resumen-anual/` (`plan.md`, `tasks.md`, `prompt.md`, `skills.md`, `revision.md`).

No se tocan migraciones ni `revisor-seguridad` (no hay tablas, acciones ni autenticación nuevas; la consulta ya está protegida por la seguridad por filas de `gastos`).

## Criterios de aceptación → pruebas
| Criterio | Prueba o comprobación |
|---|---|
| CA-1 | `resumen-anual.test.ts` → `anioDeResumen`: válido, vacío, texto, `1999`, futuro, ausente, `2000` y año actual en los bordes, `202`/`20255` |
| CA-2 | `resumen-anual.test.ts` → `mesesDelAnio(2025)`: 12 meses `2025-01`…`2025-12` |
| CA-3 | `resumen-anual.test.ts` → siempre 12 meses, ceros en los vacíos, gastos de otros años ignorados |
| CA-4 | `resumen-anual.test.ts` → total, cantidad y promedio (redondeo al peso) |
| CA-5 | `resumen-anual.test.ts` → solo categorías con gastos, orden, desempate por nombre, porcentaje entero |
| CA-6 | `resumen-anual.test.ts` → mes mayor, empate = el primero, `null` sin gastos |
| CA-7 | `resumen-anual.test.ts` → año sin gastos: todo en 0, sin categorías, `mesMayor` nulo |
| CA-8 | `resumen-anual.test.ts` → 31 dic y 1 ene cuentan en su año |
| CA-9 | Comprobación manual de la pantalla (flechas, texto por mes, vacío, avisos, enlace) y revisión de código: no es lógica pura |

## Riesgos
- **Fechas en el borde del año:** se compara por el texto `AAAA-MM-DD` (sin crear `Date` con zona horaria) para que el 31 dic / 1 ene no se corra.
- **Más de 5.000 gastos:** el resumen quedaría incompleto; se avisa, no se oculta.
- **Año actual:** el promedio entre 12 puede parecer bajo; es lo que pide la spec y se dice en el texto de la tarjeta.
- **`cacheComponents`:** el año de hoy y la sesión son datos dinámicos; van detrás de `<Suspense>` con `await connection()`.

## Cómo se verifica
`npm run lint`, `npx next typegen`, `npx tsc --noEmit`, `npm test`, `node --test ".claude/hooks/*.test.mjs"` y `npm run build`. En pantalla: abrir `/panel/resumen-anual`, cambiar de año con las flechas (sin pasar del actual ni bajar de 2000), probar `?anio=abc` y `?anio=3000` (vuelve al año de hoy), un año sin gastos (estado vacío) y confirmar que cada mes dice su total en texto y que el menú muestra el enlace.
