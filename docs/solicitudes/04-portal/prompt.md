# 04-portal: portal privado

Construir el portal privado igual que en `legacy/v1`: `MarcoPanel` (menú lateral oscuro ocultable con solo «Inicio», barra superior con migas de pan y menú de perfil), `TituloPagina` y `Tarjeta` reutilizables, y el inicio con saludo, tres accesos rápidos, tarjetas de resumen, dona por categoría y barras de los últimos 6 meses. Como todavía no existen los gastos, el inicio funciona vacío y muestra mensajes claros.

Restricciones: datos dinámicos detrás de `Suspense` y `await connection()`, solo colores del proyecto, cuerpo blanco sin modo oscuro, sin dependencias nuevas, pruebas de los cálculos puros. Skills usadas: `crear-pantalla-panel`, `vercel-react-best-practices` (y `escribir-pruebas` para las pruebas).
