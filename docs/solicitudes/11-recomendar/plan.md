# Plan 11-recomendar

## Qué se hizo
- `src/lib/precios/vista.ts`: filtrar por tipo y tienda, precio más bajo, orden, tiendas visibles y «hace cuánto», con pruebas.
- `src/lib/precios/compra.ts`: arma el enlace del «+» (`enlaceRegistrar`) y lee y valida los parámetros de «Registrar gasto» (`leerParametrosRegistro`, `soloHttps`), con pruebas de ida y vuelta.
- `src/components/panel/RecomendarCompras.tsx` y `TarjetaProducto.tsx`; `src/app/panel/recomendar/page.tsx` pasa `buscarPrecios` como propiedad.
- `registrar/page.tsx`, `Registrar.tsx` y `ResumenCompra.tsx`: «Resumen de la compra» y formulario con `key` que lo reinicia al cambiar los valores iniciales.
- Menú lateral: «Recomendar compras» debajo de «Registrar gasto» y su miga de pan.

## Diferencias con v1
Sin favoritos (aún no existen); colores solo con tokens (sin `amber`); cálculos fuera del componente y probados; mensaje claro si falla la conexión; el resumen muestra el dominio del enlace.

## Verificación
`lint`, `tsc`, `npm test` y `npm run build` pasan. Con rutas temporales (ya borradas) y un servidor falso de SerpApi se comprobó: modo demostración y modo real, caché (una sola petición por búsqueda repetida), errores 401/429/500 y sin resultados, filtros, orden, desplegable, sin desbordamiento a 375 px, y que los parámetros alterados de `/panel/registrar` se ignoran.

## Pendiente para el equipo
Probar con una cuenta real: sesión vencida, «Vas muy rápido…», y que el «+» guarde el gasto. Con clave real de SerpApi, comprobar precios y enlaces.

## Riesgos
El resumen sigue visible tras guardar (la URL conserva los parámetros); la caché y el freno viven en la memoria de cada servidor; un enlace armado a mano puede traer un `enlace` o `imagen` https ajenos (se muestra el dominio y la imagen no envía `Referer`).
