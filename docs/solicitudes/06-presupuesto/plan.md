# Plan: presupuesto mensual por categoría (feat/06-presupuesto)

## Contexto
Una persona con sesión fija un límite de gasto por categoría para un mes y ve cuánto lleva gastado frente a ese límite. Se reconstruye lo de `origin/legacy/v1` (`git show "origin/legacy/v1:<ruta>"`, con la ruta entre comillas) con mejoras puntuales. Cada persona solo ve sus límites (seguridad por filas).

**Estado actual.** `feat/06-presupuesto` y `feat/05-gastos` apuntan a `9f7a807` (= `main`). El módulo de gastos está terminado pero **sin commit**, solo en el árbol de trabajo (archivos nuevos y los cambios en `MarcoPanel.tsx`, `Inicio.tsx`, `gastos.ts`, `gastos.test.ts`). El presupuesto depende de él: `gastosEntre` (`src/lib/gastos-servidor.ts`), `parsearMonto`/`MONTO_MAXIMO`/`esCategoria`/`formatearMontoEscrito` (`validaciones-gasto.ts`), `Selector`, `Campo`, `AvisoPanel`, `Tarjeta`, `TituloPagina`, `rangoDelMes`/`nombreDelMes`/`totalPorCategoria`/`coloresCategoria`/`etiquetaCategoria`/`hoyIso` (`gastos.ts`).

**Decisión tomada (paso 0):** hacer primero el commit del módulo de gastos en `feat/05-gastos` (con mensaje corto en español, en imperativo, p. ej. «Agregar el módulo de gastos» más la línea de coautoría) y luego mover `feat/06-presupuesto` sobre ese commit (`git switch -C feat/06-presupuesto feat/05-gastos`, sin tocar archivos). Así el PR del presupuesto solo trae el presupuesto. Antes del commit se corren las cuatro comprobaciones de CI para no confirmar nada roto.

Antes de escribir código: leer en `node_modules/next/dist/docs/` lo relativo a Server Actions (`"use server"` solo exporta funciones asíncronas) y `PageProps`/`searchParams`, y las reglas de `vercel-react-best-practices` (`async-parallel`, `async-suspense-boundaries`, `rerender-*`, `rendering-hoist-jsx`, `bundle-barrel-imports`) y de las cinco skills pedidas.

## Archivos

### Base de datos
- `supabase/migrations/20261103010000_presupuestos.sql` (skill `crear-migracion-supabase`; fecha de hoy, posterior a `20261103000000_gastos.sql`). Repetible sin romper nada, también si el Supabase ya tiene la tabla de la versión anterior:
  - `create table if not exists public.presupuestos`: `id uuid` (`gen_random_uuid()`), `user_id uuid not null default auth.uid() references auth.users (id) on delete cascade`, `categoria text`, `mes date`, `monto numeric(14,2)`, `creado_en` y `actualizado_en timestamptz default now()`.
  - Reglas: `unique (user_id, categoria, mes)` (un solo límite por usuario, categoría y mes), `mes = date_trunc('month', mes)::date` (siempre el día 1), `mes >= date '2000-01-01'`, `monto > 0 and monto <= 999999999`, categoría en las **12** claves (las que ya existan se reemplazan con `drop constraint if exists` + `add constraint`).
  - **Disparador** `before update` que pone `actualizado_en = now()`: así la fecha no depende del reloj del servidor de la aplicación (v1 la enviaba desde el código). La función lleva `set search_path = ''`.
  - `enable row level security` y **una política por acción** (ver, crear, editar, borrar) con `drop policy if exists` y `(select auth.uid()) = user_id`; índice `presupuestos_usuario_mes_idx (user_id, mes desc)`; `comment on table`.

### Lógica pura (`src/lib/`, con pruebas — skill `escribir-pruebas`)
- `src/lib/presupuestos.ts`:
  - `ultimoMesPermitido(hoy)`: mes siguiente al actual (diciembre → enero del año siguiente).
  - `validarPresupuesto({ categoria, monto, mes }, hoy)`: categoría de la lista, monto > 0 y ≤ 999.999.999 (reusa `parsearMonto`, `MONTO_MAXIMO`, `esCategoria`), mes con formato `yyyy-mm`, no anterior a `2000-01` y no posterior a `ultimoMesPermitido`.
  - `mesDePresupuesto(param, hoy)`: mes pedido por la URL si es válido y está entre `2000-01` y el último permitido; si no, el mes de hoy (en v1 solo se comprobaba el máximo).
  - `progresoPresupuesto(gastado, limite)` → `{ porcentaje, restante, estado }`. **Corrige un fallo de v1**: allí el estado usaba el porcentaje ya redondeado (79,6 % se mostraba como «cerca»). Aquí el estado se decide con enteros exactos: `gastado > limite` → `excedido`; `gastado * 100 >= limite * 80` → `cerca`; si no, `bien` (gastar exactamente el límite es «cerca», no excedido). El porcentaje mostrado es redondeado y, si está excedido, nunca se muestra menos de 101 %.
  - `ordenarPorUso(presupuestos, gastadoPorCategoria)` (de los más cerca de pasarse a los menos; no modifica la lista) y `resumirPresupuestos(presupuestos, gastadoPorCategoria)` → `{ presupuestado, gastado (solo en categorías con límite), restante }`. En v1 esto estaba dentro del componente; así queda probable.
  - Tipos `Presupuesto`, `DatosPresupuesto`, `ErroresPresupuesto`, `ResultadoPresupuesto`.
- `src/lib/presupuestos-errores.ts`: `mensajeDeErrorPresupuesto(error)`: `42P01`/`PGRST205` → «Falta crear la tabla de presupuestos. Ejecuta la migración «presupuestos» en el SQL Editor de Supabase.», `23514` (datos fuera de las reglas), `42501` (sin permiso) y mensaje general; nunca el texto crudo. (`mensajeDeErrorGasto` habla de la tabla de gastos, por eso no se reusa.)
- `src/lib/presupuestos-servidor.ts`: `presupuestosDelMes(supabase, mes)` (`select id, categoria, monto` con `.eq("mes", "<mes>-01")`; la seguridad por filas filtra por usuario; `monto` pasa a número).
- `src/lib/presupuestos.test.ts`: `progresoPresupuesto` (0 %, 79 %, justo 80 %, 99 %, exactamente 100 %, 100,1 % que debe ser «excedido» y mostrar 101 %, el caso 79,6 % que debe ser «bien», restante positivo/cero/negativo); `ultimoMesPermitido` (mitad de año, diciembre, enero); `validarPresupuesto` regla por regla y bordes (monto 0/1/999.999.999/1.000.000.000, vacío, texto, decimales; mes `2026-12` permitido, `2027-01` rechazado, `1999-12`, `2000-01`, `2026-13`, formato roto; categoría inválida; caso feliz); `mesDePresupuesto`; `ordenarPorUso`; `resumirPresupuestos` (solo suma lo gastado en categorías con límite; restante negativo). `src/lib/presupuestos-errores.test.ts`: cada código y el mensaje general sin texto crudo.

### Acciones de servidor (skill `crear-accion-servidor`)
- `src/app/panel/presupuesto/actions.ts` (`"use server"`):
  - `fijarPresupuesto(formData)`: leer → **validar** con `validarPresupuesto(datos, hoyIso())` → `supabaseConfigurado()` → **`getUser()`** («Tu sesión expiró. Inicia sesión de nuevo.») → `upsert` con `onConflict: "user_id,categoria,mes"` (si ya había límite lo actualiza en vez de duplicarlo; `user_id` sale de la sesión comprobada en el servidor, nunca del formulario; `mes` se guarda como `yyyy-mm-01`; `actualizado_en` lo pone el disparador) → traducir errores con `mensajeDeErrorPresupuesto` → `revalidatePath("/panel", "layout")`.
  - `quitarPresupuesto(id)`: UUID válido, sesión comprobada, `delete().eq("id", id).select("id")`; si no borró nada: «No encontramos ese límite.»; **devuelve resultado** (en v1 no avisaba de fallos).
  - Sin límite de frecuencia propio (requieren sesión y el botón se desactiva mientras guarda); se anota como decisión.

### Interfaz (skill `crear-pantalla-panel`)
- `src/components/panel/FormularioPresupuesto.tsx` (cliente): `Selector` de categoría y `Campo` «Límite del mes (COP)» con separador de miles (`formatearMontoEscrito`); validación en cliente con `validarPresupuesto`; `useTransition`; al guardar limpia y vuelve a `?mes=` (sale del modo edición). El modo edición precarga categoría y monto; se monta con `key` que cambia con mes, categoría y monto (igual que el formulario de gastos), para que se reinicie al cambiar de mes o al pulsar «Editar».
- `src/components/panel/BotonQuitarPresupuesto.tsx` (cliente): botón «Quitar» con `aria-label` («Quitar el límite de {categoría}»), estado «Quitando…» y mensaje de error visible si falla.
- `src/components/panel/Presupuesto.tsx` (servidor): `await connection()`, `hoyIso()`, `mesDePresupuesto` + `rangoDelMes`; lee **en paralelo** (`Promise.all`) `presupuestosDelMes` y `gastosEntre` del mes; agrupa lo gastado con `totalPorCategoria`; muestra:
  - Título «Presupuesto» y navegación de mes (← siempre disponible hasta `2000-01`; → desactivada en el último mes permitido).
  - Formulario «Fijar un límite» / «Editar el límite de {categoría}» con «Cancelar edición» y nota de que fijar de nuevo reemplaza el valor.
  - Resumen: **Presupuestado**, **Gastado en esas categorías**, **Te queda** (o «Te pasaste por», en rosa de error).
  - Una tarjeta por categoría con límite: punto de color, estado con las etiquetas pedidas («Vas bien», «Cerca», «Excedido»), «$ gastado de $ límite · N %», **barra de avance** (`role="progressbar"` con `aria-valuenow`/`aria-valuetext`, tope visual 100 %), «Te quedan $…» / «Te pasaste por $…», y botones **Editar** (enlace `?mes=&categoria=`) y **Quitar**.
  - «Categorías sin límite» con gasto en el mes y botón «Fijar límite».
  - Estado vacío («Aún no tienes límites en {mes}») y `AvisoPanel` con el mensaje traducido si falla alguna consulta (pide ejecutar la migración).
  - Colores solo del proyecto: barra `bg-brand-500` (bien), `bg-accent` (cerca), `bg-rose-500` (excedido, el mismo rosa de error que ya usan `Campo` y los gastos); etiquetas con `brand-100/brand-700`, `accent/20` + `brand-800` y `rose-50/rose-700`. Nada de `amber-*`.
- `src/app/panel/presupuesto/page.tsx`: metadata «Presupuesto», `<Suspense fallback={<div aria-busy className="h-96" />}>`, `PageProps<"/panel/presupuesto">` y `await searchParams` dentro del `Suspense` (`mes`, `categoria` limpiados: `mesDePresupuesto`, `esCategoria`).

### Modificar
- `src/components/panel/MarcoPanel.tsx`: enlace «Presupuesto» (`/panel/presupuesto`, con ícono) dentro de la sección «Gastos», y `presupuesto: "Presupuesto"` en `nombresRuta` para las migas.
- `docs/solicitudes/06-presupuesto/prompt.md` y `plan.md`.

## Pasos en orden
0. Correr lint, tipos, pruebas y build sobre el módulo de gastos; commit en `feat/05-gastos`; mover `feat/06-presupuesto` sobre él. Leer docs y reglas.
1. Migración `20261103010000_presupuestos.sql`.
2. `presupuestos.ts`, `presupuestos-errores.ts` y sus pruebas; `npm test` en verde antes de seguir.
3. `presupuestos-servidor.ts` y `actions.ts`.
4. `FormularioPresupuesto`, `BotonQuitarPresupuesto`, `Presupuesto` y la página.
5. Enlace en `MarcoPanel`.
6. Lint, tipos, pruebas, build; revisión en el navegador; documentación.

## Verificación
1. `npm run lint`, `npx next typegen && npx tsc --noEmit` (borrar `.next` si hay tipos viejos), `npm test`, `npm run build` (`/panel/presupuesto` debe salir como `◐`).
2. **El equipo ejecuta la migración** (SQL Editor → New query → pegar `20261103010000_presupuestos.sql` → Run); ejecutarla dos veces no debe fallar. Sin ella, la pantalla debe mostrar el aviso que pide ejecutarla (no una pantalla rota) y `fijarPresupuesto` devolver ese mismo mensaje.
3. Con una cuenta de prueba en `npm run dev`:
   - Fijar un límite por categoría; fijar otra vez la misma categoría y mes **actualiza** (no duplica) y cambia `actualizado_en`.
   - Registrar gastos y comprobar los tres estados: <80 % «Vas bien», 80–100 % «Cerca», gastar **exactamente** el límite → «Cerca» y no «Excedido», >100 % «Excedido» con «Te pasaste por…». Resumen: presupuestado, gastado (solo en categorías con límite) y te queda.
   - Editar (carga categoría y monto, guarda y sale del modo edición), Quitar, y el estado vacío.
   - Navegación de mes: ← a meses anteriores; → llega hasta el mes siguiente y ahí queda desactivada; `?mes=2027-05` o `?mes=basura` caen en el mes actual.
   - Fijar un límite para dos meses adelante (forzando el envío) es rechazado por la validación del servidor.
   - **Aislamiento (RLS)**: con una segunda cuenta no se ven ni se pueden editar ni quitar los límites de la primera, ni siquiera con el `id` en la mano.
4. Celular a 360, 390 y 768 px: sin desbordamiento horizontal (formulario apilado, tarjetas en una columna).
5. Accesibilidad y diseño: etiquetas enlazadas, errores con `role="alert"`, barra con `role="progressbar"`, botones con nombre accesible, un solo `h1`, foco visible, solo colores del proyecto, estado también en texto (no solo en color).

## Riesgos
- **Base de gastos sin commit**: es el riesgo de partida; se resuelve en el paso 0 y solo se hace commit en `feat/05-gastos` (nada de forzar ni reescribir otras ramas).
- **La migración la ejecuta una persona, a mano.** Todas las pantallas y acciones traducen `42P01`/`PGRST205` a un aviso claro. Si el Supabase ya tiene la tabla de la versión anterior, la migración la deja al día sin borrar datos; si hubiera filas que no cumplan alguna regla (p. ej. un monto fuera de rango), el `add constraint` fallaría y habría que corregirlas antes.
- **`upsert` y seguridad por filas**: `upsert` necesita permiso de crear y de editar a la vez (las cuatro políticas existen); conviene probarlo con una cuenta real y con una segunda para confirmar que no pisa límites ajenos. El `user_id` viene de `getUser()` en el servidor, no del formulario.
- **Umbral del 80 %**: v1 decidía el estado con el porcentaje redondeado (79,6 % → «cerca»). Aquí se decide con enteros exactos; lo cubren las pruebas de borde.
- **Fecha de hoy en Colombia**: `hoyIso()` (UTC-5); el último mes permitido se calcula con ella, no con la del servidor. Cubierto por las pruebas de `ultimoMesPermitido` y `fechaIso`.
- **`cacheComponents`**: sesión y fecha detrás de `Suspense` y `await connection()`; `searchParams` se espera dentro del `Suspense`, o el build falla al prerenderizar.
- **Tope de filas de gastos**: `gastosEntre` lee por páginas hasta 5.000 gastos; un solo mes no debería acercarse, pero si el tope se alcanzara los totales saldrían incompletos (el resultado ya trae `recortado`; se muestra el aviso si ocurre).
- **Pasado**: se permite fijar límites en meses anteriores (como en v1) y el pedido solo limita hacia adelante; si el equipo prefiere bloquear meses pasados es un cambio pequeño en `validarPresupuesto` y sus pruebas.
- **Quitar sin confirmación**: no se pidió y un límite se vuelve a fijar en segundos; si se quiere, puede reutilizarse el diálogo de `ConfirmarEliminar`.
- **Sin cambios en dependencias, `globals.css`, `proxy.ts`, autenticación, portada ni gastos** (salvo el enlace del menú).
