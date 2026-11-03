# 10-detalles: detalles de la base y la portada

Completar lo que falta de la base y la portada respecto a `legacy/v1`: página 404, ícono de la pestaña, menú superior según la sesión y la sección «Todo claro de un vistazo» de la portada.

- 404 con el diseño del sitio y un enlace para volver al inicio; ícono de la pestaña con el logo, sin cambiar sus colores.
- Menú superior: sin sesión «Iniciar sesión» y «Crear cuenta gratis»; con sesión el menú de perfil, y el enlace central dice «Mi portal». La sesión se lee en el servidor dentro de `Suspense` y con `await connection()`, con un marcador para que no salte.
- «Todo claro de un vistazo» entre los diferenciales y el llamado final, con la dona y las barras con datos de ejemplo claramente marcados como tales.
- Sin dependencias nuevas, textos en español, sin IA. Debe verse bien en celular.

Skills usadas: `autenticacion-supabase`, `crear-pantalla-panel`, `vercel-react-best-practices`.
