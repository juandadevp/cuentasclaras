# 12-favoritos: favoritos de «Recomendar compras»

Reconstruir los favoritos igual que en `legacy/v1`: una estrella en cada producto de «Recomendar compras» para guardarlo, y una pantalla «Favoritos» para verlos y quitarlos.

- Tabla `favoritos`: `user_id` con default `auth.uid()`, clave del producto (única por usuario), título, imagen, tipo, ofertas por tienda (lista de hasta 30) y fecha; seguridad por filas para ver, crear y borrar solo los propios.
- La estrella se marca al instante y se deshace si falla el guardado; al volver a «Recomendar compras» el estado de las estrellas está al día.
- Pantalla «Favoritos» con la lista de productos guardados, sus precios guardados, botón para quitar y un botón «Buscar precios actuales» que lleva a «Recomendar compras» con el producto ya escrito.
- Enlace «Favoritos» en el menú lateral, justo debajo de «Recomendar compras».
- Si falta la tabla, aviso claro que pida ejecutar la migración. Pruebas con vitest de la lógica pura. Sin dependencias nuevas, textos en español, sin IA.

Skills usadas: `crear-migracion-supabase`, `crear-accion-servidor`, `crear-pantalla-panel`, `escribir-pruebas`, `vercel-react-best-practices`.
