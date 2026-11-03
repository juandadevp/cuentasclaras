---
name: autenticacion-supabase
description: Construye o modifica el registro, el inicio de sesión, la recuperación de contraseña y el cierre de sesión de Cuentas Claras con Supabase Auth y Next.js. Úsala cuando se pida cualquier cosa de cuentas de usuario, sesión, contraseñas o rutas protegidas.
---

# Autenticación con Supabase Auth

Cada persona tiene su propia cuenta y solo ve sus datos. La autenticación se hace en el **servidor**; el navegador nunca decide quién es quién.

## Piezas que deben existir
1. **Cliente de servidor** (`src/lib/supabase/servidor.ts`) con `createServerClient` de `@supabase/ssr` y las cookies de Next. Variables: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (públicas). Nunca uses la clave `service_role`.
2. **`src/proxy.ts`** (en Next 16 reemplaza a `middleware`) que refresca la sesión con `getClaims()` y redirige: con sesión, `/login`, `/registro` y `/recuperar` llevan al panel; sin sesión, `/panel` lleva a `/login`. No pongas código entre crear el cliente y `getClaims()`.
3. **Acciones de servidor** en `src/app/auth/actions.ts`: `registrar`, `iniciarSesion`, `solicitarRecuperacion`, `restablecerClave`, `cerrarSesion`. Siguen la skill `crear-accion-servidor`.
4. **Callback** `src/app/auth/callback/route.ts`: cambia el `code` del correo por una sesión con `exchangeCodeForSession`.
5. **Validaciones** en `src/lib/validaciones.ts`, compartidas entre el formulario y el servidor.

## Reglas obligatorias
- **Siempre se revalida en el servidor** (nombre, correo, teléfono, contraseña y confirmación), aunque el formulario ya lo haga.
- **Contraseña:** mínimo 8 caracteres, una mayúscula, una minúscula, un número, sin espacios, máximo 64. La recuperación usa exactamente las mismas reglas.
- **Correo:** se normaliza con `trim().toLowerCase()`.
- **Para saber quién es el usuario en el servidor usa `getUser()`**, no `getSession()`.
- **Recuperar contraseña no debe revelar si el correo existe:** responde siempre el mismo mensaje. Solo se muestran aparte el formato inválido, Supabase sin configurar y el límite de intentos.
- **Callback con lista cerrada de destinos** (`/panel`, `/restablecer`). Nunca redirijas a una dirección que venga en la URL (redirección abierta).
- Si el enlace venció o se abrió en otro navegador (PKCE), lleva a `/recuperar?error=enlace`.
- Tras cambiar la contraseña llama a `signOut({ scope: "others" })` y redirige al panel.
- Traduce los errores de Supabase a español en un solo lugar (`traducirErrorAuth`).
- Los datos extra del registro (nombre, teléfono) van en `options.data` y se copian a la tabla `perfiles` con un disparador. Esa tabla lleva seguridad por filas (ver `crear-migracion-supabase`).

## Configuración manual en Supabase
- *Authentication → URL Configuration → Redirect URLs:* agregar `http://localhost:3000/auth/callback` y la URL de producción.
- Con el plan gratuito las plantillas de correo no se pueden editar sin SMTP propio, y hay pocos envíos por hora.

## Lo que no debes hacer
- No guardes contraseñas ni tokens en tu propio código ni en `localStorage`.
- No muestres en pantalla el mensaje crudo de Supabase.
- No desactives la confirmación de seguridad por filas para «probar más rápido».

## Referencia
La versión anterior del proyecto está en la rama `legacy/v1` (`git show legacy/v1:src/app/auth/actions.ts`).
