# 08a-precios: skills usadas

Módulo: **Lógica del comparador de precios**. Las skills están en `.claude/skills/`; el prompt y el plan de este módulo están en `prompt.md` y `plan.md` de esta carpeta.

| Skill | Para qué se usó en este módulo |
|---|---|
| `integrar-api-externa` | Cliente de SerpApi con la clave solo en el servidor, errores tipificados, caché con vida limitada, modo demostración y enlaces solo https. |
| `crear-accion-servidor` | Acción `buscarPrecios`: exige sesión, valida la búsqueda y limita la frecuencia. |
| `escribir-pruebas` | Pruebas de lectura de precios, detección del tipo de producto, agrupado y cliente (sin llamar nunca a la API real). |
| `vercel-react-best-practices` | Funciones puras y sin estado compartido entre peticiones. |
