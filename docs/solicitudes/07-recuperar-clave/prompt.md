# 07-recuperar-clave: recuperar la contraseña

Reconstruir la recuperación de contraseña igual que en `legacy/v1`, en dos pasos: `/recuperar` (la persona escribe su correo y recibe un enlace) y `/restablecer` (con el enlace fija la nueva contraseña, con las mismas reglas del registro). La respuesta no revela si el correo existe, el callback acepta solo destinos de una lista cerrada (`/panel` y `/restablecer`), un enlace vencido o abierto en otro navegador lleva a `/recuperar` con un aviso, y al cambiar la contraseña se cierran las otras sesiones y se entra al panel. Con sesión, `/recuperar` lleva al panel; `/restablecer` se abre con la sesión temporal del enlace.

Skills usadas: `autenticacion-supabase`, `crear-accion-servidor`, `escribir-pruebas`, `vercel-react-best-practices`.
