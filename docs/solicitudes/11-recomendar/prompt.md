# 11-recomendar: pantalla «Recomendar compras»

Reconstruir la pantalla «Recomendar compras» igual que en `legacy/v1`: buscar un producto, ver su precio en las tiendas donde se vende y registrar la compra con sus datos ya llenos.

- Buscador, selector de tipo («Detectar tipo solo» o uno de los 15), botón «Buscar precios», chips de ejemplo y texto que explica la detección.
- Resultado: tipo detectado y tiendas donde se vende con «Ver también otras tiendas»; precio más bajo; filtro por tienda; orden por precio; tarjetas con imagen, «Mejor precio», precio «desde», tiendas con su precio (hasta 3 y el resto desplegable), botón de enlace a la tienda y botón «+» para registrar la compra.
- Modo demostración sin clave, avisándolo; mensajes claros para cada error.
- El «+» lleva a `/panel/registrar` con descripción, valor, tienda y la categoría según el tipo de producto ya llenos, y un «Resumen de la compra» arriba del formulario. Los parámetros de la URL se validan (largo, lista permitida, solo enlaces https).
- El formulario de gasto reinicia sus campos cuando cambian los valores iniciales (usar una `key`).
- Enlace «Recomendar compras» en el menú lateral, justo debajo de «Registrar gasto».
- Datos dinámicos detrás de Suspense y `await connection()`. Pruebas con vitest de los cálculos nuevos. Sin dependencias nuevas, textos en español, sin IA.

Skills usadas: `crear-pantalla-panel`, `crear-accion-servidor`, `integrar-api-externa`, `escribir-pruebas`, `vercel-react-best-practices`.
