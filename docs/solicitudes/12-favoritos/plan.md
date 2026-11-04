# Plan 12-favoritos

## Qué se hizo
- `supabase/migrations/20261103030000_favoritos.sql`: tabla `favoritos` (`tipo`, `fecha`), única por usuario y clave, máximo 30 ofertas, solo ver, crear y borrar los propios (sin política de edición), con `revoke`/`grant`. Si la tabla de v1 ya existía, renombra `rubro`→`tipo` y `creado_en`→`fecha`. Se puede ejecutar dos veces.
- `src/lib/favoritos.ts` (limpiar lo que llega del navegador, armar lo que se guarda, estrella optimista, resumen de precios, enlace de «Buscar precios actuales», errores en español) y `favoritos-servidor.ts`, con 55 pruebas.
- `src/app/panel/favoritos/actions.ts`: `guardarFavorito` y `quitarFavorito` (validan, piden sesión, no envían `user_id`, traducen errores, `revalidatePath`).
- Pantalla `/panel/favoritos` (`Favoritos`, `TarjetaFavorito`, `BotonQuitarFavorito`) y enlace «Favoritos» debajo de «Recomendar compras».
- ★ en `TarjetaProducto`; `RecomendarCompras` usa `useOptimistic` con su propia transición; `recomendar/page.tsx` lee las estrellas del servidor detrás de `Suspense` y `connection()`, y acepta `q` y `tipo` validados.

## Diferencias con v1
Columnas `tipo` y `fecha`; la estrella no esconde los resultados mientras guarda; la clave se recorta en un solo lugar; sin colores `amber`; «Quitar» muestra su error; se muestra el `detalle` de cada oferta guardada; «Buscar precios actuales» también lleva el tipo.

## Verificación
`lint`, `tsc`, `npm test` y `npm run build` pasan. Con rutas temporales (ya borradas) y un almacén en memoria: la estrella cambia al instante, el clic repetido se ignora, un fallo la deshace con su mensaje, el estado se conserva al recargar, los parámetros alterados se ignoran y no hay desborde a 375 px.

## Pendiente para el equipo
Ejecutar la migración en Supabase y probar con cuentas reales: guardar, quitar, volver a «Recomendar compras», que dos cuentas no vean los favoritos de la otra y que guardar dos veces no duplique.

## Riesgos
La clave del producto no siempre es estable entre búsquedas (id o título del buscador); los precios guardados envejecen; en modo demostración se pueden guardar precios de ejemplo (se ve su detalle); no hay tope de favoritos por persona.
