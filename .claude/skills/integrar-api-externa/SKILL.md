---
name: integrar-api-externa
description: Integra un servicio externo de pago o con límites (por ejemplo SerpApi para precios de Google Shopping) en Cuentas Claras de forma segura, con la clave solo en el servidor, caché, límites, modo demostración y errores claros. Úsala cuando se pida consultar una API de terceros.
---

# Integrar una API externa

Ejemplo del proyecto: el comparador de precios con SerpApi (Google Shopping de Colombia).

## Reglas obligatorias
1. **La clave nunca llega al navegador.** Variable sin el prefijo `NEXT_PUBLIC_` (por ejemplo `SERPAPI_API_KEY`), usada solo en código de servidor. Agrégala vacía a `.env.example` con un comentario. No la pegues en chats, commits ni capturas.
2. **Las llamadas salen desde una acción de servidor**, nunca desde un componente de cliente. La acción exige sesión y limita la frecuencia (skill `crear-accion-servidor`).
3. **Valida la entrada del usuario** antes de enviarla: largo mínimo y máximo, sin caracteres de control.
4. **Tiempo máximo y errores tipificados:** usa `AbortSignal.timeout(...)` y convierte los fallos en códigos propios (`clave`, `limite`, `red`, `respuesta`) con un mensaje en español para cada uno. No devuelvas el texto crudo del proveedor.
5. **Caché propia en memoria con vida limitada (TTL)** para no gastar cuota con búsquedas repetidas. No uses `use cache` para esto: en producción los errores que pasan por ahí pierden su clase y su mensaje.
6. **Modo demostración:** sin clave, la pantalla funciona con datos de ejemplo y lo dice claramente.
7. **Normaliza la respuesta** a tipos propios (`src/lib/<servicio>/tipos.ts`) y descarta lo que no sirva. Acepta enlaces solo si empiezan por `https://`.
8. **Un archivo por responsabilidad** en `src/lib/<servicio>/`: cliente, parseo, agrupación, datos de demostración.
9. **Permite cambiar la URL del servicio por variable de entorno** (por ejemplo `PRECIOS_API_URL`) para probar con un servidor falso sin gastar cuota.

## Lo que no debes hacer
- No metas la respuesta completa del proveedor en la base de datos ni en el HTML.
- No reintentes sin límite ante un error de cuota.
- No bloquees la pantalla: muestra «consultando…» y un mensaje de error si falla.

## Pruebas
Prueba las funciones puras (leer precios, agrupar ofertas, detectar el tipo de producto) con `escribir-pruebas`. Nunca llames a la API real desde una prueba.
