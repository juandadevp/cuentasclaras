# Plan 10-detalles

## Qué se hizo
- `src/app/not-found.tsx`: 404 dentro de `MarcoSitio` con enlace «Volver al inicio».
- `src/app/icon.svg`: copia exacta de `public/logo.svg` (mismos colores); Next agrega el ícono de la pestaña solo.
- `NavegacionCentral` (nuevo) y `AccionesSesion` (ahora `async`) leen la sesión con `obtenerUsuario` (`getUser()`, una sola consulta por petición). `Header` los envuelve en `Suspense` con marcadores del mismo tamaño.
- `MenuPerfil`: variante `oscuro` para el menú oscuro del sitio y opción «Mi portal» (en celular el enlace central está oculto).
- `src/components/home/VistaPrevia.tsx`: dona y barras del portal con datos de ejemplo, con etiqueta «Datos de ejemplo»; va entre `Diferenciales` y `LlamadoFinal`.

## Verificación
`lint`, `tsc`, `npm test` (542) y `npm run build` pasan; la portada y el sitio salen como Partial Prerender. `/no-existe` responde 404; `/icon.svg` es idéntico al logo; sin desbordamiento horizontal a 360, 375 y 1280 px. El menú con sesión se revisó con una ruta temporal (ya borrada) y un nombre falso. Pendiente para el equipo: probarlo con una cuenta real.

## Riesgos
- El centro del menú puede moverse un poco al llegar la sesión (los botones de invitado y el perfil miden distinto).
- Los enlaces del centro llegan con el flujo, no en el HTML estático (el pie sí los trae).
- Los meses de ejemplo van fijos (may–oct).
