# 02-autenticacion: registro, inicio y cierre de sesión

Construir la autenticación igual que en `legacy/v1` con Supabase: registro (nombre, correo, celular colombiano, contraseña y confirmación), login con ojo y enlace «¿Olvidaste tu contraseña?», páginas `/login` y `/registro` con sus imágenes, tabla `perfiles` con disparador y RLS, `src/proxy.ts` que refresca la sesión y protege `/panel`, callback con lista cerrada de destinos, menú de perfil con «Cerrar sesión», errores de Supabase en español y pruebas de `src/lib/validaciones.ts`.

Skills usadas: `autenticacion-supabase`, `crear-accion-servidor`, `crear-migracion-supabase`, `escribir-pruebas`, `vercel-react-best-practices`.
