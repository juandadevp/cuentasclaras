# Plan: módulo de gastos (feat/05-gastos)

## Contexto
Una persona con sesión debe poder anotar en qué gasta, ver sus gastos ordenados por categoría, buscarlos, editarlos y borrarlos, y ver el inicio del portal con datos reales. Cada persona solo ve los suyos (seguridad por filas). Se reconstruye lo de `origin/legacy/v1` (`git show origin/legacy/v1:<ruta>`), con las diferencias pedidas: **confirmación al eliminar**, **`key` para reiniciar el formulario**, y una migración única que ya trae las 12 categorías y la tienda.

**Estado actual** (rama `feat/05-gastos`, limpia, en `9f7a807` = `main` con base, portada, autenticación y portal): existen `MarcoPanel` (solo «Inicio»), `Inicio` (usa `const gastos: Gasto[] = []` y `resumirInicio` de `src/lib/gastos.ts`), `BarrasMeses`, `DonaCategorias`, `Tarjeta`, `TituloPagina`, `Campo`, `obtenerUsuario`, `crearClienteServidor`, `traducirErrorAuth`, `formatearMoneda`/`formatearFecha`, el tipo `Gasto`/`Categoria` y las 12 categorías en `config/site.ts`. No existen `src/lib/validaciones-gasto.ts`, `src/lib/gastos-servidor.ts`, `src/app/panel/actions.ts`, la tabla `gastos` ni las rutas `/panel/registrar` y `/panel/gastos`. Los tres accesos rápidos del inicio ya apuntan a `/panel/gastos`, `/panel/gastos?mes=todos` y `/panel/registrar`.

Antes de escribir código: leer en `node_modules/next/dist/docs/` lo relativo a Server Actions (`"use server"` solo permite exportar funciones asíncronas), `PageProps`/`searchParams`, `notFound` y `revalidatePath`, y las reglas de `vercel-react-best-practices` (`server-auth-actions`, `async-parallel`, `async-suspense-boundaries`, `rerender-*`, `rendering-hoist-jsx`, `bundle-barrel-imports`) y de las cinco skills pedidas.

## Archivos

### Base de datos
- `supabase/migrations/20261103000000_gastos.sql` (skill `crear-migracion-supabase`; fecha de hoy, posterior a `20261017000000_perfiles.sql`). Una sola migración con el resultado final de las tres de v1 y **repetible sin romper nada** (también si el Supabase del equipo ya tiene la tabla de v1):
  - `create table if not exists public.gastos`: `id uuid` (`gen_random_uuid()`), `user_id uuid not null default auth.uid() references auth.users (id) on delete cascade`, `descripcion`, `monto numeric(14,2)`, `categoria`, `fecha date default current_date`, `tienda text` y `creado_en timestamptz default now()`.
  - Más `add column if not exists tienda` y `drop constraint if exists` + `add constraint` para dejar las reglas al día en tablas viejas: descripción de 2 a 80 caracteres, monto `> 0 and <= 999999999`, categoría en las **12** claves, tienda nula o de 1 a 80, y fecha `>= '2000-01-01'` (límite inferior como defensa extra; el límite «no futura» queda en la validación porque `current_date` en un `check` no es inmutable).
  - `enable row level security` y **cuatro políticas** (ver, crear, editar, borrar), cada una con `drop policy if exists` y `(select auth.uid()) = user_id`; índice `gastos_usuario_fecha_idx (user_id, fecha desc)`; `comment on table`.

### Lógica pura (`src/lib/`, con pruebas)
- `src/lib/validaciones-gasto.ts`: `DatosGasto`, `ErroresGasto`, `MONTO_MAXIMO`, `parsearMonto`, `formatearMontoEscrito` (separador de miles con una expresión regular propia, **sin** `toLocaleString`, para no depender del idioma del sistema), `normalizarDescripcion`, `normalizarTienda`, `validarGasto(datos, hoy)` y `esCategoria`. Es la misma función para el formulario y para el servidor.
  - Mejora sobre v1: `parsearMonto` solo acepta dígitos y separadores de miles bien puestos (`12.500`, `12,500`, `$ 12 500`); `12,50` o `1.2` dan `null` («solo números») en lugar de convertirse en silencio en 1250/12.
  - `validarGasto` revisa fecha real (no `2026-02-30`), no futura, no anterior al 2000.
- `src/lib/gastos.ts` (añadir): `rangoDelMes(mesParam, hoy)` (mes válido o el actual; inicio, fin, anterior, siguiente), `agruparPorCategoria(gastos)` (secciones `{ categoria, lista, subtotal }`, solo categorías con compras, de mayor a menor subtotal), `leerFiltros(searchParams)` (limpia `mes`, `q` ≤ 80 y `categoria` de la lista; `mes=todos`) y `escaparComodines(q)` (para `ilike`).
- `src/lib/gastos-errores.ts`: `mensajeDeErrorGasto(error)` traduce `42P01`/`PGRST205` («Falta crear la tabla de gastos. Ejecuta la migración «gastos» en el SQL Editor de Supabase.»), `PGRST204` («Falta actualizar la base de datos. Ejecuta la migración «gastos»…»), `23514` (datos fuera de las reglas), `42501` (sin permiso) y un mensaje general. No se muestra nunca el texto crudo. Va en `lib/` y no en `actions.ts` para poder probarla.
- `src/lib/gastos-servidor.ts`: consultas con el cliente de servidor: `gastosEntre`, `gastosFiltrados`, `ultimosGastos`, `gastoPorId`, con `aGasto` (convierte `monto` a número y `tienda` nula a `undefined`). Las listas se leen **por páginas de 1000** hasta un tope (p. ej. 5000) porque PostgREST corta en 1000 filas; si se llega al tope se devuelve un indicador para avisar. La seguridad por filas filtra por usuario; no se envía `user_id`.

### Pruebas (skill `escribir-pruebas`)
- `src/lib/validaciones-gasto.test.ts`: `parsearMonto` (con puntos, comas, `$`, espacios, vacío, letras, decimales, ceros a la izquierda), `formatearMontoEscrito` (agrupa de a tres, quita letras, límite de 9 dígitos, quita ceros iniciales, vacío), `normalizarDescripcion`/`normalizarTienda`, y `validarGasto` regla por regla y en sus bordes: descripción 1/2/80/81, monto 0/1/999.999.999/1.000.000.000, categoría inválida, tienda 80/81, fecha hoy/mañana/`2000-01-01`/`1999-12-31`/`2026-02-30`/formato roto, y un caso sin errores.
- `src/lib/gastos.test.ts` (ampliar): `rangoDelMes` (mes válido, inválido, diciembre→enero y enero→diciembre), `agruparPorCategoria` (solo categorías con compras, orden por subtotal, subtotales), `leerFiltros`, `escaparComodines`.
- `src/lib/gastos-errores.test.ts`: cada código mapeado y el mensaje general.

### Acciones de servidor (skill `crear-accion-servidor`)
- `src/app/panel/actions.ts` (`"use server"`, compartido por Registrar y Mis gastos como en v1): `crearGasto`, `actualizarGasto(id, formData)` y `eliminarGasto(id)`, todas con el mismo orden: normalizar → **validar** con `validarGasto(datos, hoyIso())` → `supabaseConfigurado()` → **`getUser()`** («Tu sesión expiró. Inicia sesión de nuevo.»; v1 no lo hacía al editar y eliminar) → escribir sin enviar `user_id` → traducir errores con `mensajeDeErrorGasto` → `revalidatePath("/panel", "layout")`. `id` validado como UUID; si la actualización o el borrado no afectan ninguna fila: «No encontramos ese gasto.». `eliminarGasto` ahora **devuelve resultado** (v1 no avisaba de fallos). Resultado con forma fija `{ ok?, errores?, mensaje? }`.
  - Sin límite de frecuencia propio (la regla 6 de la skill es para acciones costosas o públicas; estas requieren sesión y el botón se desactiva mientras guarda). Se anota como decisión.

### Interfaz (skill `crear-pantalla-panel`)
- `src/components/ui/Selector.tsx`: lista desplegable con etiqueta, `aria-invalid` y error con `role="alert"` (en v1 se repetía a mano); la usan el formulario y el filtro.
- `src/components/panel/FormularioGasto.tsx` (cliente): descripción, valor con separador de miles al escribir, fecha (`max=hoy`), categoría y tienda opcional; validación en cliente con `validarGasto` y errores del servidor; envío con `useTransition`; crea o edita según reciba `gasto`; al crear con éxito limpia y muestra «¡Gasto guardado!»; al editar vuelve a `/panel/gastos`. Recibe `hoy` desde el servidor.
- `src/components/panel/ConfirmarEliminar.tsx` (cliente): botón de papelera que abre un `<dialog>` modal con «¿Eliminar “{concepto}”? Esta acción no se puede deshacer.» y botones «Cancelar» / «Sí, eliminar» (foco y Escape los maneja el navegador); muestra el error si falla.
- `src/components/panel/TablaGastos.tsx`: tabla dentro de `overflow-x-auto`, con editar (enlace) y `ConfirmarEliminar`; estado vacío con mensaje claro.
- `src/components/panel/GastosPorCategoria.tsx`: usa `agruparPorCategoria`; resumen «N gastos en M categorías · Total», una `Tarjeta` por categoría con punto de color, cantidad y subtotal.
- `src/components/panel/Registrar.tsx` (servidor): `await connection()`, `hoyIso()`, últimos 5 gastos; formulario con `key` calculada con sus valores iniciales y últimos gastos (ver abajo); aviso de migración si falla la consulta.
- `src/components/panel/Gastos.tsx` (servidor): total, buscador por concepto, filtro por categoría, navegación por mes (← →, el mes siguiente se desactiva en el actual), «Mostrar todo», «+ Nuevo gasto», «Quitar filtros», aviso si se alcanzó el tope de filas y aviso de migración.
- Páginas: `src/app/panel/registrar/page.tsx`, `src/app/panel/gastos/page.tsx` y `src/app/panel/gastos/[id]/editar/page.tsx`, cada una con metadata, `<Suspense fallback={<div aria-busy className="h-96" />}>`, `PageProps<...>` y `await searchParams`/`params` dentro del `Suspense`; editar usa `notFound()` si el id no es válido o no existe (la seguridad por filas hace que los ajenos «no existan»).
- **Valores iniciales y `key`**: `/panel/registrar` acepta `descripcion`, `monto`, `categoria` y `tienda` por la URL (limpiados: largo, lista de categorías, monto formateado) para precargar el formulario cuando se llegue desde otra pantalla; el formulario se monta con `key={JSON.stringify(valoresIniciales)}` para que se reinicie cuando cambian. En edición, `key={gasto.id}`.

### Modificar
- `src/components/panel/MarcoPanel.tsx`: nueva sección «Gastos» con «Registrar gasto» (`/panel/registrar`) y «Mis gastos» (`/panel/gastos`) con sus íconos, y `nombresRuta` con `registrar`, `gastos` y `editar` (el id de la ruta de edición no está en el diccionario, así que las migas quedan «Panel / Mis gastos / Editar»).
- `src/components/panel/Inicio.tsx`: sustituye la lista vacía por los gastos reales de los últimos 6 meses (una sola consulta entre el primer día del mes más antiguo y el fin del mes actual) y se las pasa a `resumirInicio`; `obtenerUsuario()` y la consulta se lanzan con `Promise.all`; aviso si falta la tabla; tarjetas, dona y barras ya existentes pasan a mostrar datos reales. Sin cambios en `BarrasMeses`/`DonaCategorias`.
- `docs/solicitudes/05-gastos/prompt.md` y `plan.md`.

## Pasos en orden
1. Leer docs y reglas; confirmar la rama `feat/05-gastos`.
2. Migración `20261103000000_gastos.sql` (define los datos).
3. `validaciones-gasto.ts`, ampliar `gastos.ts`, `gastos-errores.ts` y sus tres archivos de prueba; `npm test` en verde.
4. `gastos-servidor.ts`.
5. `actions.ts`.
6. `Selector`, `FormularioGasto`, `ConfirmarEliminar`, `TablaGastos`, `GastosPorCategoria`.
7. `Registrar`, `Gastos` y las tres páginas.
8. `MarcoPanel` (menú) e `Inicio` (datos reales).
9. Lint, tipos, pruebas, build; revisión en el navegador; documentación.

## Verificación
1. `npm run lint`, `npx next typegen && npx tsc --noEmit` (borrar `.next` si hay tipos viejos), `npm test`, `npm run build`. Las tres rutas nuevas y `/panel` deben ser dinámicas/parciales y no fallar al prerenderizar.
2. **El equipo ejecuta la migración** (SQL Editor → New query → pegar `20261103000000_gastos.sql` → Run). Sin ella, `/panel/registrar` y `/panel/gastos` deben mostrar el aviso que pide ejecutarla (no una pantalla rota) y `crearGasto` devolver ese mismo mensaje. Ejecutarla dos veces no debe dar error.
3. Con una cuenta de prueba en `npm run dev`:
   - **Registrar**: errores por campo y foco en el primero; el valor muestra `25.000` mientras se escribe; fecha futura y anterior a 2000 rechazadas; guarda, aparece «¡Gasto guardado!», los campos se limpian y el gasto sale en «Tus últimos gastos».
   - **Mis gastos**: total correcto, secciones solo de categorías con compras con su subtotal, buscador (incluido `%` y `_` como texto literal), filtro por categoría, flechas de mes, «Mostrar todo», «Quitar filtros»; mensajes de vacío distintos con y sin filtros.
   - **Editar**: `/panel/gastos/<id>/editar` carga los datos, guarda y vuelve a la lista; un id inventado o ajeno da 404.
   - **Eliminar**: el diálogo pide confirmar, «Cancelar» no borra, «Sí, eliminar» borra y la lista y el inicio se actualizan; funciona con teclado (Escape cierra).
   - **`key`**: ir de `/panel/registrar?descripcion=Pan&monto=4500` a `/panel/registrar?descripcion=Leche` reinicia el formulario con los nuevos valores; escribir a mano y volver a cargar sin parámetros lo deja vacío.
   - **Inicio**: total del mes, cantidad, categoría mayor, variación contra el mes anterior, dona y 6 barras coinciden con los gastos creados (probar un gasto del mes anterior y otro de hace 5 meses); con cero gastos sigue mostrando los estados vacíos.
   - **Aislamiento (RLS)**: con una segunda cuenta no se ven, ni se editan, ni se borran los gastos de la primera (ni por URL directa).
4. Celular a 360, 390 y 768 px: sin desbordamiento horizontal (la tabla se desplaza dentro de su contenedor); barra de filtros apilada; diálogo usable.
5. Accesibilidad y diseño: etiquetas enlazadas, errores con `role="alert"`, botones de editar/eliminar con nombre accesible, un solo `h1` por página, foco visible, solo colores del proyecto (los avisos y el botón de eliminar usan los tokens y el rosa de error que ya usa `Campo`; no `amber-*`).

## Riesgos
- **La migración la ejecuta una persona, a mano.** Si no se ejecuta, nada guarda. Por eso todas las pantallas y acciones traducen `42P01`/`PGRST205` a un aviso claro. Si el Supabase ya tiene la tabla de v1, la migración la deja al día sin borrar datos (solo cambia reglas); si hubiera gastos antiguos que no cumplan alguna regla, el `add constraint` fallaría y habría que corregirlos antes (no se borra nada automáticamente).
- **Seguridad por filas y `user_id`**: nunca se envía desde el formulario ni desde la acción; la columna se llena sola. Cuatro políticas separadas; editar y borrar comprueban además la sesión con `getUser()`.
- **Tope de 1000 filas de PostgREST**: sin paginar, el total del mes o las barras saldrían mal en silencio con muchos gastos. Mitigación: lectura por páginas con tope y aviso si se alcanza (en «Mostrar todo»).
- **`"use server"`**: solo puede exportar funciones asíncronas; los tipos y ayudantes (`mensajeDeErrorGasto`, validaciones) viven en `lib/`, no en `actions.ts`.
- **`cacheComponents`**: sesión y fecha de hoy detrás de `Suspense` y `await connection()` en `Registrar`, `Gastos` y la página de edición; `searchParams` se espera dentro del `Suspense`, o el build falla al prerenderizar.
- **Fecha de hoy en Colombia**: `hoyIso()` (UTC-5) y no la del servidor; si no, entre las 7 p. m. y medianoche se rechazaría o se aceptaría mal «hoy». Cubierto con las pruebas existentes de `fechaIso` y las de `validarGasto`.
- **Diálogo de confirmación**: `<dialog>` + `showModal()` requiere un componente de cliente; se prefirió a `window.confirm` por accesibilidad y consistencia visual. Si el equipo prefiere algo más simple, es un cambio de un archivo.
- **Entrada por URL en `/panel/registrar`**: los valores iniciales vienen de la barra de direcciones; se limpian y se acotan (largo, categoría de la lista, solo dígitos en el monto). Nada se interpreta como HTML.
- **Monto**: cambia el comportamiento de v1 con decimales (se rechazan en lugar de convertirse en un número 10 veces mayor); es deliberado y está probado.
- **Búsqueda con comodines**: `%` y `_` se escapan para buscar texto literal.
- **Doble envío / carreras**: el botón se desactiva con `useTransition`; no hay límite de frecuencia propio (decisión anotada arriba).
- **Datos de prueba**: no se guardan credenciales ni datos reales en el código ni en la migración; las pruebas con vitest solo usan funciones puras (nada llama a Supabase).
- **Sin cambios en dependencias, `globals.css`, `proxy.ts`, autenticación ni portada.**
