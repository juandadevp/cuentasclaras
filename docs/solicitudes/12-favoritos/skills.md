# 12-favoritos: skills usadas

Módulo: **Favoritos**. Las skills están en `.claude/skills/`; el prompt y el plan de este módulo están en `prompt.md` y `plan.md` de esta carpeta.

| Skill | Para qué se usó en este módulo |
|---|---|
| `crear-migracion-supabase` | Migración de la tabla `favoritos`: único por usuario y producto, ofertas guardadas como lista de hasta 30 y seguridad por filas para ver, crear y borrar solo los propios. |
| `crear-accion-servidor` | Acciones para guardar y quitar un favorito con sesión, validación en servidor y errores traducidos. |
| `crear-pantalla-panel` | Pantalla «Favoritos» con estado vacío y de error, y su enlace en el menú lateral debajo de «Recomendar compras». |
| `escribir-pruebas` | Pruebas de la lógica pura de favoritos (`favoritos.test.ts`). |
| `vercel-react-best-practices` | Estrella que se marca al instante y se deshace si falla el guardado, y tarjetas calculadas al renderizar sin efectos. |
