# Plan 04-metas-ahorro

## Contexto
La spec `docs/specs/04-metas-ahorro/spec.md` pide una **meta de ahorro mensual** (una por persona y mes) y su avance en «Mi ahorro»: el ahorro real del mes frente a la meta. El `explorador` confirmó que no existe nada de metas y que el módulo de **presupuesto** es el modelo exacto de «una fila por persona y mes que se fija con upsert» (migración, acciones, validación, formulario). El ahorro real ya lo calcula `calcularAhorroReal` en `src/lib/ingresos.ts`. Toca backend (tabla con seguridad por filas, acciones, lógica pura) y frontend (una tarjeta en «Mi ahorro»). Sin dependencias nuevas, sin IA, sin ruta ni enlace de menú nuevos.

## Decisiones técnicas
1. **Tabla `metas_ahorro`** (`supabase/migrations/20261118010000_metas_ahorro.sql`): `id`, `user_id` (`default auth.uid()`, `on delete cascade`), `mes date` (siempre el primer día del mes, desde el año 2000), `monto numeric(14,2)` (mayor que 0 y hasta 999.999.999), `creado_en`, `actualizado_en`; **única por `(user_id, mes)`**. Seguridad por filas con **una política por acción: ver, crear, editar y borrar** los propios (fijar de nuevo es un upsert, que necesita crear y editar). Función y disparador para `actualizado_en`, y permisos mínimos con `revoke`/`grant` (`select, insert, update, delete` a `authenticated`). Repetible.
2. **La validación es pura y reutiliza presupuesto:** `parsearMonto` y `MONTO_MAXIMO` de `validaciones-gasto.ts`, y `MES_MINIMO` y `ultimoMesPermitido` de `presupuestos.ts` (el mes actual y el siguiente, igual que los límites).
3. **El avance es una función pura** `progresoMeta(ahorro, meta)`: primero «sin meta» (meta nula), luego «sin ingresos» (ahorro nulo: no inventa porcentaje), y si no, «por debajo», «alcanzada» o «superada» con el porcentaje y la diferencia. Se compara con números exactos, como `progresoPresupuesto`.
4. **Las acciones siguen el patrón de presupuesto** (`getUser()`, `user_id` de la sesión, upsert con `onConflict: "user_id,mes"`, errores traducidos, `revalidatePath`) en `src/app/panel/ahorro/actions.ts`.
5. **La tarjeta vive en «Mi ahorro»**, debajo de «Ahorro real del mes»: la consulta de la meta entra en el `Promise.all` existente de `Ahorro.tsx`; si falla la carga de ingresos, no se inventa un avance.
6. **Sin confirmación al quitar la meta**, como el botón de presupuesto.

## Lo que ya existe y se reutiliza
- `src/lib/presupuestos.ts`: `MES_MINIMO`, `ultimoMesPermitido`; `src/lib/validaciones-gasto.ts`: `parsearMonto`, `formatearMontoEscrito`, `MONTO_MAXIMO`; `src/lib/gastos.ts`: `hoyIso`, `rangoDelMes`, `nombreDelMes`.
- `src/lib/ingresos.ts`: `calcularAhorroReal` (estado y ahorro); `src/lib/format.ts`: `formatearMoneda`.
- Modelos a copiar: `src/app/panel/presupuesto/actions.ts`, `src/lib/presupuestos-servidor.ts`, `presupuestos-errores.ts`, `FormularioPresupuesto.tsx`, `BotonQuitarPresupuesto.tsx` y la barra accesible de `Presupuesto.tsx` (`role="progressbar"`).
- `src/components/panel/Ahorro.tsx` (punto de inserción tras «Ahorro real del mes»), `Tarjeta`, `AvisoPanel`, `Campo`.

## Archivos
**Crear**
1. `supabase/migrations/20261118010000_metas_ahorro.sql`.
2. `src/lib/metas-ahorro.ts`: `DatosMeta`, `ErroresMeta`, `ResultadoMeta`, `MetaAhorro`, `validarMeta(datos, hoy)` y `progresoMeta(ahorro, meta)`.
3. `src/lib/metas-ahorro-errores.ts` (`mensajeDeErrorMeta`) y `src/lib/metas-ahorro-servidor.ts` (`metaDelMes(supabase, mes)`).
4. `src/lib/metas-ahorro.test.ts` y `src/lib/metas-ahorro-errores.test.ts`: pruebas escritas **antes** del código por el `probador`.
5. `src/app/panel/ahorro/actions.ts`: `fijarMetaAhorro(formData)` y `quitarMetaAhorro(id)`.
6. `src/components/panel/TarjetaMetaAhorro.tsx` (servidor), `FormularioMetaAhorro.tsx` y `BotonQuitarMetaAhorro.tsx` (cliente).

**Modificar**
- `src/components/panel/Ahorro.tsx`: cargar la meta del mes, calcular el avance con el ahorro real y mostrar la tarjeta.
- `README.md` y `docs/specs/04-metas-ahorro/` (`plan.md`, `tasks.md`, `prompt.md`, `skills.md`, `revision.md`).

## Criterios de aceptación → pruebas
| Criterio | Prueba o comprobación |
|---|---|
| CA-1 | `metas-ahorro.test.ts` → `validarMeta` con monto y mes válidos devuelve `{}`; `$ 500.000` se entiende |
| CA-2 | `metas-ahorro.test.ts` → monto vacío, texto, 0, negativo y 1.000.000.000 |
| CA-3 | `metas-ahorro.test.ts` → mes con formato malo, 1999-12, mes actual y siguiente válidos, dos meses adelante inválido, cambio de año |
| CA-4 | `metas-ahorro.test.ts` → meta nula = «sin meta», sin porcentaje |
| CA-5 | `metas-ahorro.test.ts` → meta y ahorro nulo = «sin ingresos», sin porcentaje |
| CA-6 | `metas-ahorro.test.ts` → ahorro por debajo, cero y negativo: «por debajo», porcentaje nunca menor que 0 y lo que falta |
| CA-7 | `metas-ahorro.test.ts` → ahorro igual a la meta: «alcanzada», 100 % y nada por faltar |
| CA-8 | `metas-ahorro.test.ts` → ahorro mayor: «superada», porcentaje mayor que 100 y lo que se superó |
| CA-9 | `metas-ahorro-errores.test.ts` → 42P01 y PGRST205 piden la migración «metas_ahorro», 23514, 42501 y el genérico sin error crudo |
| CA-10 | La migración (una política por acción, única por usuario y mes) y su revisión por `revisor-seguridad`; comprobación manual con dos cuentas |
| CA-11 | Comprobación manual de la tarjeta y revisión de código: no es lógica pura |

## Riesgos
- **La migración la ejecuta una persona:** sin ella, la tarjeta debe mostrar un aviso claro y no romper «Mi ahorro» (CA-9).
- **Seguridad por filas con upsert:** necesita políticas de crear **y** editar; el `revisor-seguridad` lo comprueba y no debe quedar una política más permisiva.
- **Redondeo del avance:** `0,99…` no debe contarse como alcanzada; se decide con números exactos, no con el porcentaje redondeado.
- **`Ahorro.tsx` crece:** los cálculos van en `metas-ahorro.ts` para poder probarlos; la tarjeta solo los muestra.
- **Cambio de mes:** el mes se toma de `hoyIso()` (Bogotá) para no correrse cerca de medianoche.

## Cómo se verifica
`npm run lint`, `npx next typegen`, `npx tsc --noEmit`, `npm test`, `node --test ".claude/hooks/*.test.mjs"` y `npm run build`. En pantalla, tras ejecutar la migración: con ingresos registrados, fijar una meta, ver el avance con texto y barra, cambiarla, quitarla, y con otra cuenta comprobar que no ve la meta ajena.
