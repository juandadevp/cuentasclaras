# 02-autenticacion: skills usadas

Módulo: **Autenticación con Supabase**. Las skills están en `.claude/skills/`; el prompt y el plan de este módulo están en `prompt.md` y `plan.md` de esta carpeta.

| Skill | Para qué se usó en este módulo |
|---|---|
| `autenticacion-supabase` | Reglas de contraseña, `getUser()` en el servidor, `proxy.ts` con `getClaims()`, callback con lista cerrada de destinos y errores de Supabase traducidos. |
| `crear-accion-servidor` | Acciones `registrar`, `iniciarSesion` y `cerrarSesion`: validan en el servidor, comprueban la configuración y devuelven un resultado con forma fija. |
| `crear-migracion-supabase` | Migración de la tabla `perfiles` con seguridad por filas y disparador al crear el usuario. |
| `escribir-pruebas` | Pruebas de vitest de las validaciones (`validaciones.test.ts`). |
| `vercel-react-best-practices` | Formularios de login y registro: errores calculados al renderizar, `useTransition` para el envío. |
