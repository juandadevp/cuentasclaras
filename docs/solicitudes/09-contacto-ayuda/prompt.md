# 09-contacto-ayuda: páginas de Contacto y Ayuda

Reconstruir las páginas de Contacto y Ayuda igual que en `legacy/v1`: un formulario de contacto que guarda los mensajes y una página de preguntas frecuentes. Hoy los enlaces «Contacto» y «Ayuda» del menú dan error 404.

Tabla `mensajes_contacto`: nombre (3 a 80), correo (5 a 120), asunto (consulta, problema, sugerencia u otro), mensaje (10 a 1000) y fecha. Seguridad por filas: cualquiera puede enviar un mensaje, pero nadie puede leerlos desde la app.

Formulario con nombre, correo, asunto y mensaje, validado en el navegador y en el servidor con la misma función; al enviar bien muestra «¡Mensaje enviado!». Límite de un mensaje cada 20 segundos por correo.

Contacto: encabezado verde menta con círculos decorativos, el formulario en una tarjeta debajo del encabezado y, al lado, una tarjeta «¿En qué podemos ayudarte?» (Consultas, Problemas, Sugerencias) y otra con enlace a Ayuda.

Ayuda: seis preguntas frecuentes desplegables y un enlace para crear la cuenta; solo preguntas sobre funciones que existen.

Pruebas con vitest de las validaciones. Sin dependencias nuevas, textos en español, sin IA.

Skills usadas: `crear-migracion-supabase`, `crear-accion-servidor`, `escribir-pruebas`, `vercel-react-best-practices`.
