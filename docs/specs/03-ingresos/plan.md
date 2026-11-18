# Plan 03-ingresos

## Contexto
La spec `docs/specs/03-ingresos/spec.md` pide una pantalla «Ingresos» (crear, listar por mes y borrar) y una tarjeta «Ahorro real del mes» en «Mi ahorro» (ingresos menos gastos). El `explorador` confirmó que no existe nada de ingresos y que los módulos de **gastos** (migración, validaciones, acciones) y **presupuesto** (pantalla por mes, formulario pequeño, botón de quitar) sirven de modelo. Toca backend (tabla con seguridad por filas, acciones de servidor, lógica pura) y frontend (pantalla, formulario, menú y «Mi ahorro»). Sin dependencias nuevas, sin IA.

## Decisiones técnicas
1. **Tabla `ingresos`** (`supabase/migrations/20261118000000_ingresos.sql`): `id`, `user_id` (`default auth.uid()`, `on delete cascade`), `descripcion` (2 a 80 con `btrim`), `tipo` (`salario`, `ventas`, `honorarios`, `otros`), `monto` (`numeric(14,2)`, mayor que 0 y hasta 999.999.999), `fecha date` (desde el año 2000) y `creado_en`. Seguridad por filas con **una política por acción necesaria: ver, crear y borrar** (no hay edición en esta spec) con `(select auth.uid()) = user_id`. Índice por `(user_id, fecha desc)`. El script se puede ejecutar dos veces.
2. **La validación es pura y reutiliza lo de gastos:** `parsearMonto`, `MONTO_MAXIMO`, `FECHA_MINIMA` y `normalizarDescripcion` de `src/lib/validaciones-gasto.ts`. `esFechaReal`, hoy privada, se exporta (cambio de una palabra) para no duplicarla.
3. **El ahorro real es una función pura que no inventa valores:** si el mes no tiene ingresos devuelve «sin ingresos» y no un número (CA-8).
4. **Las acciones siguen el patrón de presupuesto** (`getUser()`, `user_id` de la sesión, errores traducidos, `revalidatePath`) y las consultas el de `presupuestos-servidor.ts`.
5. **Una sola ruta `/panel/ingresos`** con navegación por mes, resumen, formulario y lista; sin subrutas, para no chocar con las migas de `registrar` (que ya significa «Registrar gasto»).
6. **Los textos que dicen «no incluye tus ingresos»** (en `Ahorro.tsx` y en la Ayuda) se reemplazan. La comparación mes a mes de «Mi ahorro» se conserva.

## Lo que ya existe y se reutiliza
- `src/lib/validaciones-gasto.ts`: `parsearMonto`, `formatearMontoEscrito`, `normalizarDescripcion`, `MONTO_MAXIMO`, `FECHA_MINIMA`.
- `src/lib/gastos.ts`: `hoyIso`, `rangoDelMes`, `nombreDelMes`, `totalGastos`. `src/lib/format.ts`: `formatearMoneda`, `formatearFecha`.
- `src/lib/presupuestos-servidor.ts` y `presupuestos-errores.ts` como modelo de consulta y de errores; `src/app/panel/presupuesto/actions.ts` como modelo de acciones.
- `src/components/panel/`: `Tarjeta`, `TituloPagina`, `AvisoPanel`, `Presupuesto.tsx` (navegación por mes), `FormularioPresupuesto.tsx` y `BotonQuitarPresupuesto.tsx` como modelos; `src/components/ui/Campo.tsx` y `Selector.tsx`.
- `src/components/panel/Ahorro.tsx` y `src/lib/ahorro.ts`; `MarcoPanel.tsx` (menú y migas).

## Archivos
**Crear**
1. `supabase/migrations/20261118000000_ingresos.sql`.
2. `src/types/ingreso.ts` (`TipoIngreso`, `Ingreso`) y `tiposIngreso` en `src/config/site.ts`.
3. `src/lib/ingresos.ts`: `validarIngreso(datos, hoy)`, `resumirIngresos(lista)`, `calcularAhorroReal(totalIngresos, totalGastos, cantidadIngresos)` y `etiquetaTipoIngreso(valor)`.
4. `src/lib/ingresos-errores.ts` (`mensajeDeErrorIngreso`) y `src/lib/ingresos-servidor.ts` (`ingresosEntre`).
5. `src/lib/ingresos.test.ts` y `src/lib/ingresos-errores.test.ts`: pruebas escritas **antes** del código por el `probador`.
6. `src/app/panel/ingresos/actions.ts` (`crearIngreso`, `eliminarIngreso`) y `src/app/panel/ingresos/page.tsx`.
7. `src/components/panel/Ingresos.tsx`, `FormularioIngreso.tsx` (cliente) y `BotonQuitarIngreso.tsx` (cliente).

**Modificar**
- `src/lib/validaciones-gasto.ts`: exportar `esFechaReal`.
- `src/components/panel/MarcoPanel.tsx`: enlace «Ingresos» y `ingresos: "Ingresos"` en las migas.
- `src/components/panel/Ahorro.tsx`: cargar los ingresos del mes, mostrar la tarjeta «Ahorro real del mes» y reemplazar la nota; `src/app/(sitio)/ayuda/page.tsx`: reemplazar el texto de «Mi ahorro».
- `README.md` y `docs/specs/03-ingresos/` (`plan.md`, `tasks.md`, `prompt.md`, `skills.md`, `revision.md`).

## Criterios de aceptación → pruebas
| Criterio | Prueba o comprobación |
|---|---|
| CA-1 | `ingresos.test.ts` → `validarIngreso` con datos válidos devuelve `{}` |
| CA-2 | `ingresos.test.ts` → descripción de 1 y de 81 caracteres, con espacios en los extremos |
| CA-3 | `ingresos.test.ts` → monto vacío, texto, 0, negativo y 1.000.000.000; `$ 1.500.000` se entiende |
| CA-4 | `ingresos.test.ts` → un tipo fuera de la lista |
| CA-5 | `ingresos.test.ts` → 2026-02-30, año 1999, mañana; hoy es válido |
| CA-6 | `ingresos.test.ts` → `resumirIngresos`: total, cantidad y desglose por tipo de mayor a menor |
| CA-7 | `ingresos.test.ts` → `calcularAhorroReal`: sobra, falta y justo |
| CA-8 | `ingresos.test.ts` → sin ingresos devuelve «sin ingresos» y ahorro nulo, aunque haya gastos |
| CA-9 | `ingresos-errores.test.ts` → 42P01 y PGRST205 piden la migración «ingresos», 23514 y 42501 y el genérico, sin mostrar el error crudo |
| CA-10 | La migración (política por acción) y su revisión por `revisor-seguridad`; comprobación manual con dos cuentas |
| CA-11 | Comprobación manual de «Mi ahorro» y revisión de código: no es lógica pura |

## Riesgos
- **La migración la ejecuta una persona** en el SQL Editor: sin ella, la pantalla debe mostrar un aviso claro y no un error genérico (CA-9).
- **Seguridad por filas:** es el riesgo principal; el `revisor-seguridad` revisa la migración y las acciones, y se prueba con dos cuentas.
- **Más de 1.000 ingresos en un mes:** la consulta lee hasta 1.000; es improbable para ingresos y se anota como límite.
- **`Ahorro.tsx` es un archivo grande y sin pruebas propias:** los cálculos van en `ingresos.ts` para poder probarlos; la tarjeta solo los muestra.
- **Las migas del menú:** se usa `/panel/ingresos` sin subrutas.

## Cómo se verifica
`npm run lint`, `npx next typegen`, `npx tsc --noEmit`, `npm test`, `node --test ".claude/hooks/*.test.mjs"` y `npm run build`. En pantalla, después de ejecutar la migración: registrar un ingreso, verlo en la lista y en el resumen, borrarlo, ver la tarjeta «Ahorro real del mes» con y sin ingresos, y comprobar con otra cuenta que no ve los ingresos ajenos.
