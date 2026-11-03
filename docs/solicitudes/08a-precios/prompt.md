# 08a-precios: lógica del comparador de precios

Reconstruir la lógica del comparador de precios igual que en `legacy/v1`, solo en `src/lib/precios` y su acción de servidor (las pantallas se hacen después): leer precios en formato colombiano, detectar el tipo de producto (15 tipos, con diccionario, plurales y errores de escritura, sin IA), saber en qué tiendas se vende, consultar Google Shopping de Colombia con SerpApi (tiempo máximo, errores tipificados, caché propia con vida limitada, enlaces solo `https://`), agrupar las ofertas por producto y, sin `SERPAPI_API_KEY`, funcionar en modo demostración. `PRECIOS_API_URL` permite probar sin gastar cuota.

Acción de servidor `buscarPrecios`: exige sesión, valida la búsqueda (2 a 80 caracteres), limita una búsqueda cada 1,5 s por persona y traduce los errores al español.

Skills usadas: `integrar-api-externa`, `crear-accion-servidor`, `escribir-pruebas`, `vercel-react-best-practices`.
