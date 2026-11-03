# Plan: portal privado (feat/04-portal)

## Contexto
La persona con sesión debe entrar a un espacio privado ordenado: menú lateral, barra superior con migas de pan y menú de perfil, y un inicio que muestre de un vistazo cómo van sus cuentas. Se reconstruye lo de `origin/legacy/v1` (`MarcoPanel`, `Inicio`, `BarrasMeses`, `DonaCategorias`, `TituloPagina`/`Tarjeta`) con una diferencia clave: **todavía no existe el módulo de gastos**, así que el inicio funciona vacío (sin consultas a Supabase, sin tabla `gastos`) y los cálculos son funciones puras listas para recibir datos cuando exista.

**Estado del repositorio.** La autenticación (`c8ce4bb`) está solo en `feat/02-autenticacion`: trae `src/app/panel/{layout,page}.tsx` mínimos, `MenuPerfil`, `Logo`, `obtenerUsuario`, `proxy.ts`. La portada está **sin commit** en `feat/03-portada`. El portal depende de la autenticación, no de la portada. Decisión tomada: crear `feat/04-portal` **desde `feat/02-autenticacion`**. Antes de cambiar de rama, la portada debe quedar confirmada o guardada (no lo hago sin que se pida). Ya existe una rama local `feat/03-portal` vacía (apunta a `main`); si el equipo prefiere ese nombre, se mueve sobre 02.

Antes de escribir código: leer en `node_modules/next/dist/docs/` lo relativo a `connection`, `usePathname`/Client Components y `PageProps`, y las reglas de `vercel-react-best-practices` que aplican (`rendering-hoist-jsx`, `rendering-conditional-render`, `rerender-*`, `bundle-barrel-imports`, `server-serialization`), además de la skill `crear-pantalla-panel`.

## Archivos

**Crear**
- `src/lib/gastos.ts` (lógica pura, sin interfaz ni Supabase), portada de v1 y ampliada:
  - `totalPorCategoria(gastos)` (suma por categoría, orden descendente), `totalGastos(gastos)` (suma de montos; se trae de `utils.ts` de v1 aquí para no crear otro archivo), `variacion(actual, anterior)` (porcentaje redondeado; `null` si el anterior es 0 o menor).
  - `ultimosMeses(mes, cantidad)` → lista `yyyy-mm` de los últimos N meses terminando en `mes` (cruza el cambio de año), y `totalesPorMes(gastos, meses)` → `{ mes, total }[]` con ceros en los meses sin gastos, lo que alimenta las barras.
  - `mesDeFecha`/`fechaIso(fecha: Date)` y `hoyIso()` (zona `America/Bogota`, armada con `formatToParts` para no depender del orden del idioma); `hoyIso` es lo único que lee el reloj.
  - `etiquetaCategoria`, `nombreDelMes`, `mesCorto`, y `coloresCategoria` (ver «Colores»).
  - `resumirInicio(gastos, hoy)` → `{ mes, total, cantidad, porCategoria, mayor, variacion, meses }`: reúne todo lo que pinta el inicio en una sola función pura y testeable.
- `src/lib/gastos.test.ts` (skill `escribir-pruebas`; nombres en español, mensajes y valores derivados de la regla, sin depender del idioma del sistema):
  - `variacion`: sube, baja, igual a 0, redondeo (33,3 → 33; 66,6 → 67), anterior 0 → `null`, anterior negativo → `null`.
  - `totalPorCategoria`: lista vacía, suma de varias categorías, orden descendente, empate estable, no muta la entrada.
  - `totalGastos`: vacío y suma.
  - `ultimosMeses`: 6 meses normales, cruce de año (enero → incluye julio-dic del año anterior), cantidad 1.
  - `totalesPorMes`: meses sin gastos en cero, ignora gastos fuera de la ventana, suma varios del mismo mes.
  - `fechaIso`: instante `2026-11-03T03:00:00Z` → `2026-11-02` (Colombia, UTC-5) y `2026-11-03T05:00:00Z` → `2026-11-03` (borde de medianoche).
  - `resumirInicio`: vacío (total 0, cantidad 0, `mayor` indefinido, `variacion` null, 6 meses en cero) y con datos (categoría mayor, variación contra el mes anterior).
  - `coloresCategoria`: cubre las 12 categorías, sin repetidos, y cada color base existe en los tokens de `globals.css` (guarda la regla «solo colores del proyecto»).
- `src/components/panel/TituloPagina.tsx`: `TituloPagina` (`titulo`, `subtitulo`, `children` a la derecha). Un solo `h1` por pantalla.
- `src/components/panel/Tarjeta.tsx`: `Tarjeta` (`titulo`, `acciones`, `className`), en archivo propio como pidió el equipo (en v1 estaba junto a `TituloPagina`).
- `src/components/panel/MarcoPanel.tsx` (**Client Component**: usa `usePathname` y estado del menú): recibe `nombre`, `email` y `children`.
  - Menú lateral oscuro (`bg-neutral-800`) con el logo y el nombre en blanco (inline, como v1; `Logo` de 02 tiene texto oscuro) y botón para ocultarlo/mostrarlo en la barra superior (`aria-expanded`, `aria-controls`).
  - Solo el enlace «Inicio». Los enlaces están en un arreglo de secciones a nivel de módulo (`{ titulo, enlaces: { href, etiqueta, icono } }`) más `nombresRuta` para las migas: sumar «Gastos» u otras secciones después es agregar una entrada, sin tocar el marco.
  - Barra superior fija con botón del menú, migas de pan (`<nav aria-label="Ruta">`) y el `MenuPerfil` existente (`src/components/auth/MenuPerfil.tsx`).
  - Escritorio: visible por defecto y se oculta; celular: oculto y se abre sobre una capa. El menú cerrado usa `invisible` además del desplazamiento, para que sus enlaces no reciban el foco con el teclado. Se cierra al elegir un enlace en celular.
  - Cuerpo **blanco** (`bg-white`; v1 usaba gris `neutral-100`, se cambia por la regla del proyecto), tarjetas con borde; `min-w-0` en el contenido para evitar desbordamiento.
- `src/components/panel/BarrasMeses.tsx`: recibe `meses: { mes; total }[]` y `actual` por props; estado vacío cuando todos los totales son 0 («Cuando registres gastos verás aquí tus últimos 6 meses.»); alto proporcional con mínimo visible; valor accesible sin depender del hover (`role="img"` con resumen y lista de valores solo para lectores de pantalla).
- `src/components/panel/DonaCategorias.tsx`: recibe `datos` y `total` por props; estado vacío («Cuando registres gastos verás aquí en qué se va tu dinero.»); dona SVG con leyenda (categoría, monto, porcentaje) y `title` por segmento. Evita dividir por cero cuando el total es 0.
- `src/components/panel/Inicio.tsx` (Server Component): `await connection()`, `obtenerUsuario()`, `hoyIso()` y `resumirInicio([], hoy)`. Pinta `TituloPagina` («Hola, {primer nombre}» y «Así van tus cuentas en {mes}.»), los tres accesos rápidos, las tres tarjetas de datos, la dona y las barras. Los textos vacíos son claros: «Sin datos del mes anterior», «Aún no hay datos», 0 gastos registrados, «Total del mes $ 0». Cuando exista el módulo de gastos, solo cambia de dónde sale la lista que se pasa a `resumirInicio`.
  - Accesos rápidos: «Buscar gastos» → `/panel/gastos`, «Mostrar todo» → `/panel/gastos?mes=todos`, «Nuevo gasto» → `/panel/registrar` (esas rutas se crean en el módulo de gastos).
  - Tarjetas: «Total del mes» (con variación ▲/▼ cuando hay base), «Gastos registrados», «Donde más gastas».
- `docs/solicitudes/04-portal/prompt.md` y `plan.md`.

**Modificar**
- `src/app/panel/layout.tsx`: `Suspense` con fallback reservado (`aria-busy`) y `ConSesion` que redirige a `/login` si no hay usuario y envuelve con `MarcoPanel` (reemplaza la barra mínima de 02).
- `src/app/panel/page.tsx`: título/metadata «Inicio» y `<Suspense fallback={<div aria-busy className="h-96" />}><Inicio /></Suspense>`; elimina el saludo mínimo de 02.
- Sin cambios en `globals.css` ni `config/site.ts`, salvo que haga falta (los tokens ya existen).

## Colores (decisión tomada)
Solo tokens del proyecto y tonos derivados de ellos (mezclados con blanco o negro) para las 12 categorías: base `brand-800/700/500/300`, `accent`, `manzana`, `muted` y variaciones de esos mismos colores. Los valores van como hex en `coloresCategoria` porque `@theme inline` no garantiza variables CSS en tiempo de ejecución; la prueba comprueba que cada base sale de `globals.css`. No dependemos del color: leyenda con nombre, monto y porcentaje. Variación del mes: ▲/▼ con texto («▲ 12% vs. mes anterior»); el color de alerta es el `rose` que ya usa `Campo` para errores (es la única excepción y se avisa en la entrega); avisos de error de base de datos no aplican todavía.

## Pasos en orden
1. Confirmar/guardar la portada, crear `feat/04-portal` desde `feat/02-autenticacion`, leer docs de Next y reglas de la skill.
2. `lib/gastos.ts` + `lib/gastos.test.ts`; correr `npm test` hasta que pase (cálculos antes que la interfaz).
3. `TituloPagina` y `Tarjeta`.
4. `BarrasMeses` y `DonaCategorias`.
5. `MarcoPanel`.
6. `Inicio`, `panel/layout.tsx` y `panel/page.tsx`.
7. Revisión visual (escritorio y celular) y ajustes.
8. Documentación en `docs/solicitudes/04-portal/`.

Aplicación de `vercel-react-best-practices`: solo `MarcoPanel` y `MenuPerfil` son de cliente; el resto son Server Components (los gráficos son SVG/HTML sin JavaScript de cliente); datos e íconos como constantes de módulo; ternarios en vez de `&&`; sin archivos `index.ts`; props mínimas y serializables hacia el cliente (`nombre`, `email`); `Promise.all` queda para cuando haya consultas reales.

## Verificación
1. `npm run lint`, `npx next typegen && npx tsc --noEmit` (borrar `.next` si hay tipos viejos de otra rama), `npm test`, `npm run build`. En el build `/panel` debe salir como `◐` (prerender parcial) y no fallar por fecha o sesión.
2. `npm test`: cálculos puros (lista de arriba) en verde, incluido el borde de zona horaria y el cruce de año.
3. Con Supabase configurado y una cuenta de prueba, en `npm run dev`:
   - Sin sesión, `/panel` lleva a `/login`; con sesión se ve el marco con «Inicio» activo (`aria-current="page"`), migas «Panel» y el menú de perfil con «Cerrar sesión».
   - El saludo trae el primer nombre; las tres tarjetas muestran 0 / «—» y mensajes vacíos; dona y barras muestran su estado vacío (sin errores en consola, sin `NaN`).
   - El botón de menú oculta y muestra la barra lateral en escritorio, y en celular la abre sobre una capa y se cierra al elegir un enlace; con el menú cerrado no se puede tabular a sus enlaces.
   - Los tres accesos rápidos apuntan a las rutas indicadas (404 hasta el módulo de gastos).
4. Gráficos con datos de prueba (temporal, sin commitear): pasar a `resumirInicio` unos gastos de ejemplo en dos meses y revisar total, variación, categoría mayor, dona con porcentajes que suman 100 % y barras con el mes actual resaltado.
5. Celular a 360, 390 y 768 px: `document.documentElement.scrollWidth <= innerWidth` (sin desbordamiento horizontal; vigilar migas largas, la leyenda de la dona y el menú de perfil).
6. Accesibilidad y diseño: un solo `h1`, foco visible, nombres accesibles de botones, cuerpo blanco sin modo oscuro, solo colores del proyecto, logo sin cambios.

## Riesgos
- **Ramas divergidas**: `Logo` (02) y `Marca` (03) hacen lo mismo en colores distintos; al integrar habrá que unificarlos. Para no depender de ninguna, el logo del menú lateral va inline (como en v1). Además `(sitio)/layout.tsx` de la portada dará a `/login` y `/registro` el encabezado y el pie del sitio (sus páginas usan `min-h-screen` y llevan su propio `Logo`): conviene revisarlo al juntar 02 y 03.
- **`cacheComponents`**: la sesión y `hoyIso()` deben quedar detrás de `Suspense` y de `connection()` (si no, el build falla al prerenderizar). El estado cerrado/abierto del menú no se guarda (se pierde al navegar entre páginas); guardarlo sería una mejora aparte.
- **Datos aún inexistentes**: `resumirInicio([], hoy)` simula «sin gastos». El módulo de gastos deberá reemplazar esa lista y añadir los estados de error de base de datos (`42P01`, `PGRST205`) que pide la skill; hoy no aplica porque no hay consultas.
- **Rutas de accesos rápidos inexistentes**: dan 404 hasta el módulo de gastos (pedido así). El tipo `Gasto` de `src/types/gasto.ts` ya define la forma de los datos.
- **Zona horaria**: el «mes actual» se calcula en hora de Colombia, no del servidor (Vercel corre en UTC); de lo contrario, entre las 7 p. m. y medianoche el último día del mes saldría como el mes siguiente. Por eso `fechaIso` se prueba en el borde.
- **Colores de la dona**: con solo tokens y tonos hay categorías parecidas entre sí; se verifica visualmente que los segmentos contiguos se distingan y la leyenda siempre acompaña.
- **Accesibilidad de las barras**: v1 mostraba el valor solo al pasar el ratón; se añade texto para lectores de pantalla y para teclado.
- **Cuerpo blanco**: cambia respecto al gris de v1 por la regla del proyecto; si el equipo prefiere el gris del panel, es un cambio de una clase.
- **Menú de perfil existente**: se usa tal cual (`MenuPerfil` de 02); no se toca su lógica.
