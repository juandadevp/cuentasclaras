# Plan: autenticación con Supabase (feat/02-autenticacion)

## Contexto
La persona debe poder crear su cuenta, entrar a su espacio privado (`/panel`) y salir, y solo ella ve sus datos. Se reconstruye igual que `origin/legacy/v1` (se lee con `git show origin/legacy/v1:<ruta>`), pero solo la parte pedida: registro, inicio de sesión, cierre de sesión y protección de rutas. La recuperación de contraseña (`/recuperar`, `/restablecer`, `solicitarRecuperacion`, `restablecerClave`) queda para otro módulo; solo se deja el enlace «¿Olvidaste tu contraseña?» apuntando a `/recuperar`.

Ya existen la base (`globals.css`, `config/site.ts`) y los componentes `Campo`, `BotonOjo` e `ImagenDeFondo`. `@supabase/ssr` y `@supabase/supabase-js` ya están en `package.json`: no hay dependencias nuevas. Hoy no existen `src/proxy.ts`, `src/app/auth/`, `src/lib/supabase/`, `src/lib/validaciones.ts`, `supabase/migrations/`, ni encabezado/pie del sitio.

Estamos en la rama `feat/02-autenticacion`, pero el trabajo del módulo 01 (base visual) sigue **sin commit** en el árbol. Antes de empezar hay que confirmar que ese trabajo esté confirmado (o aceptar que entre en el mismo PR), para no mezclar los dos módulos.

Antes de escribir código: leer `node_modules/next/dist/docs/` sobre `proxy.md` (en Next 16 reemplaza a `middleware`), formularios y Server Actions, y las reglas de `vercel-react-best-practices` que aplican (`server-auth-actions`, `rendering-hoist-jsx`, `rendering-conditional-render`, `rerender-*`, `bundle-barrel-imports`).

## Archivos

**Crear**
- `supabase/migrations/20261017000000_perfiles.sql`: igual a la de v1 (tabla `perfiles` con `id` → `auth.users`, `nombre`, `telefono`, `email`, `creado_en`; `check` de largo del nombre y de celular `^3[0-9]{9}$`; RLS con políticas de ver y editar solo el propio perfil con `(select auth.uid()) = id`; función `crear_perfil_al_registrarse` `security definer` con `search_path = ''` y disparador `after insert on auth.users`). Se conserva el mismo nombre y contenido que v1: es idempotente y no choca si el proyecto de Supabase ya la tiene aplicada. Cumple la skill `crear-migracion-supabase`.
- `src/lib/supabase/config.ts`: lee las dos variables públicas, `supabaseConfigurado()`, `MENSAJE_SIN_CONFIGURAR`.
- `src/lib/supabase/servidor.ts`: `crearClienteServidor()` con `createServerClient` y las cookies de Next.
- `src/lib/supabase/actualizar-sesion.ts`: refresca la sesión con `getClaims()` (sin código entre crear el cliente y `getClaims()`); con sesión, `/login` y `/registro` → `/panel`; sin sesión, `/panel` y subrutas → `/login`; copia las cookies refrescadas a la redirección.
- `src/proxy.ts`: llama a `actualizarSesion`; `matcher` que excluye `_next/static`, `_next/image`, favicon e imágenes.
- `src/lib/supabase/errores.ts`: `traducirErrorAuth` (credenciales, correo sin confirmar, correo duplicado, contraseña débil, límites de envío, registro desactivado, error al guardar perfil, genérico). Nunca se muestra el texto crudo de Supabase.
- `src/lib/supabase/usuario.ts`: `obtenerUsuario()` con `React.cache`, `await connection()` y `getUser()` (no `getSession()`); devuelve `{ id, email, nombre }` con el nombre tomado de `user_metadata.nombre`.
- `src/lib/auth-tipos.ts`: `ResultadoAuth` (`errores`, `mensaje`, `requiereConfirmacion`).
- `src/lib/validaciones.ts`: `validarNombre`, `validarEmail`, `validarTelefono`, `validarClave`, `validarConfirmacion`, `validarRegistro`, `validarLogin`, `requisitosClave`, `soloDigitosTelefono`, `normalizarNombre`. Reglas pedidas: celular de 10 dígitos que empieza por 3 (acepta `+57`/`57` y separadores); contraseña de 8 a 64, mayúscula, minúscula, número, sin espacios. Es lógica pura: la usan el formulario y el servidor.
- `src/lib/validaciones.test.ts`: pruebas con vitest (skill `escribir-pruebas`): una por cada regla de rechazo y cada borde (contraseña de 7, 8, 64 y 65 caracteres; sin mayúscula/minúscula/número; con espacio; teléfono de 9 y 11 dígitos, que empiece por 2, con `+57`, con letras; nombre sin apellido, con números, de más de 80; correo sin `@`/dominio; confirmación vacía o distinta; `validarRegistro` y `validarLogin` devuelven solo los campos con error). Nombres en español, mensajes exactos, resultado esperado derivado de la regla.
- `src/app/auth/actions.ts` (`"use server"`, skill `crear-accion-servidor`): `registrar`, `iniciarSesion`, `cerrarSesion`. Cada una: leer y normalizar el `FormData` → revalidar con las mismas funciones de `validaciones.ts` → `supabaseConfigurado()` → llamar a Supabase → traducir errores. `registrar` guarda `nombre` y `telefono` (solo dígitos) en `options.data` y detecta correo ya registrado (`user_already_exists`/`email_exists` e `identities` vacío). Devuelve `requiereConfirmacion` si no hay sesión, o `redirect("/panel")` si la hay. `iniciarSesion` hace `signInWithPassword` con el correo en minúsculas y redirige a `/panel`. `cerrarSesion` hace `signOut` y redirige a `/`. Redirecciones solo a rutas internas fijas.
- `src/app/auth/callback/route.ts`: `exchangeCodeForSession(code)`; lista cerrada de destinos (`["/panel"]`); cualquier otro valor de `siguiente` cae en `/panel`; si falla, va a `/login`. `/restablecer` se añade en el módulo de recuperación.
- `src/components/auth/LoginForm.tsx` y `RegistroForm.tsx` (Client Components): validan al salir del campo y al enviar, enfocan el primer campo con error, muestran los errores del servidor, usan `useTransition` para el estado «Ingresando…/Creando cuenta…». `LoginForm` pone el enlace «¿Olvidaste tu contraseña?» en el slot `pie` de `Campo`, bajo la contraseña, y `BotonOjo` en `derecha`. `RegistroForm` trae también la pantalla «Revisa tu correo» cuando hace falta confirmar.
- `src/components/auth/RequisitosClave.tsx`: lista de requisitos que se marca al cumplirse (lee `requisitosClave`).
- `src/components/auth/MenuPerfil.tsx` (Client Component): botón con ícono, nombre y correo, y botón «Cerrar sesión» (`<form action={cerrarSesion}>`); se cierra con clic fuera y con Escape; `aria-haspopup`, `aria-expanded`. Solo la variante clara (la oscura de v1 era para el menú negro del sitio, que no existe todavía).
- `src/app/(sitio)/login/page.tsx` y `src/app/(sitio)/registro/page.tsx`: dos columnas como v1 (`md:grid-cols-[2fr_3fr]`): a la izquierda fondo `bg-menta` con `public/login.png` / `public/registro.png` mediante `ImagenDeFondo` (`ajuste="contain"`) y un texto; a la derecha el formulario en una tarjeta con borde y botón `bg-brand-800`. Con el logo (`public/logo.svg`, sin tocarlo) enlazado a `/` arriba del formulario, ya que aún no hay encabezado del sitio.
- `src/app/panel/layout.tsx`: `Suspense` con el fallback + componente `ConSesion` que llama a `obtenerUsuario()`, redirige a `/login` si no hay usuario y muestra una barra con el logo y `MenuPerfil`. Segunda barrera de seguridad además del proxy.
- `src/app/panel/page.tsx`: página mínima protegida con «Hola, {nombre}» y un texto de que el portal llega en el siguiente módulo.
- `docs/solicitudes/02-autenticacion/prompt.md` y `plan.md`.

**Modificar**
- `.env.example`: dejar `NEXT_PUBLIC_SUPABASE_URL=` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=` vacías (hoy traen valores de ejemplo) y conservar los comentarios; no tocar ni leer `.env.local`.
- `src/components/ui/Campo.tsx` (solo si hace falta): ya soporta `ayuda`, `pie`, `derecha` y `error`; se espera no tocarlo.

## Pasos en orden
1. Resolver el asunto de la rama (commit del módulo 01 o aceptarlo en este PR) y leer la doc de Next 16 y las reglas de la skill.
2. Migración `perfiles` (es lo que define los datos).
3. `validaciones.ts` y su prueba; correr `npm test` hasta que pase (base de todo lo demás).
4. `lib/supabase/*` y `auth-tipos.ts`.
5. `src/proxy.ts`.
6. `auth/actions.ts` y `auth/callback/route.ts`.
7. Componentes `auth/` y páginas `/login` y `/registro`.
8. `panel/layout.tsx`, `panel/page.tsx` y `MenuPerfil`.
9. `.env.example` y documentación en `docs/solicitudes/02-autenticacion/`.

## Configuración manual de la persona (la hace el equipo, no el código)
- Supabase: SQL Editor → ejecutar `20261017000000_perfiles.sql`.
- Supabase → Authentication → URL Configuration → Redirect URLs: `http://localhost:3000/auth/callback` y la URL de producción.
- Poner las dos variables en `.env.local` y en Vercel (en `.env.local` ya existen; el agente no las lee).
- Decidir si se exige confirmar el correo (por defecto sí): afecta al flujo de registro (con confirmación aparece «Revisa tu correo»; sin ella entra directo a `/panel`).

## Verificación
1. `npm run lint`, `npx next typegen && npx tsc --noEmit`, `npm test`, `npm run build` (las cuatro comprobaciones de CI).
2. `npm test`: validaciones (reglas de contraseña y celular, bordes).
3. Con Supabase configurado, en `npm run dev` (flujo en el navegador):
   - `/registro` con errores: se muestran mensajes bajo cada campo y el foco va al primero.
   - Registro válido: crea usuario y fila en `perfiles` (revisar en Supabase → Table Editor); con confirmación activa muestra «Revisa tu correo»; el enlace del correo pasa por `/auth/callback` y entra a `/panel`.
   - Registro con un correo repetido: «Este correo ya está registrado».
   - `/login` con clave incorrecta: «Correo o contraseña incorrectos.»; con credenciales correctas entra a `/panel` mostrando el nombre.
   - Ojo de contraseña alterna el campo; el enlace «¿Olvidaste tu contraseña?» va a `/recuperar` (404 hasta el siguiente módulo).
   - Con sesión: `/login` y `/registro` redirigen a `/panel`. Sin sesión: `/panel` redirige a `/login`.
   - Menú de perfil: abre, muestra nombre y correo, Escape lo cierra, «Cerrar sesión» vuelve a `/` y `/panel` vuelve a pedir login.
   - `/auth/callback?code=x&siguiente=https://malo.com` no sale del sitio.
   - Sin variables de Supabase: los formularios muestran el aviso de configuración en vez de fallar.
   - Probar con otra cuenta que no se ven datos ajenos (RLS): `select` a `perfiles` solo devuelve la propia fila.
4. Revisión visual en escritorio y celular: colores de los tokens, logo intacto, imagen visible solo desde `md`.
5. Revisar accesibilidad: etiqueta enlazada, `aria-invalid`, error con `role="alert"`, foco visible, uso por teclado.

## Riesgos
- **Rama sucia**: el módulo 01 sin commit se mezcla con este; ya señalado en el paso 1.
- **Next 16 distinto al conocido**: `proxy` (no `middleware`), `LayoutProps`, `cacheComponents`. Con `cacheComponents` el acceso a sesión/cookies debe ir detrás de `<Suspense>` y precedido de `await connection()` (por eso `obtenerUsuario` y el layout del panel); si no, `next build` falla al prerenderizar.
- **Seguridad de sesión**: usar `getUser()` en servidor y `getClaims()` solo en el proxy; no poner código entre crear el cliente y `getClaims()`; el proxy no es la única barrera (el layout del panel y RLS también comprueban).
- **Redirección abierta** en el callback: solo destinos de la lista cerrada.
- **Enumeración de correos**: al registrarse hay que avisar si el correo ya existe (el diseño de v1 lo hace y la persona lo pidió); la recuperación sí deberá responder igual en su módulo.
- **Teléfono**: el celular se guarda solo con dígitos; la restricción de la base de datos (`^3[0-9]{9}$`) debe coincidir con la regla del servidor o el registro falla con «Database error saving new user» (traducido en `errores.ts`).
- **Migración ya aplicada**: si el Supabase del equipo ya tiene `perfiles` de v1, la migración es idempotente y no cambia nada; no se edita una migración existente.
- **Sin límite de frecuencia propio**: la skill sugiere limitar acciones públicas; en serverless un mapa en memoria no es fiable, así que se confía en los límites de Supabase Auth (ya traducidos). Si el equipo quiere un límite propio, se hace en una tarea aparte.
- **Plan gratuito de Supabase**: pocos correos de confirmación por hora, y plantillas no editables sin SMTP propio: puede parecer un error del código al probar varios registros seguidos.
- **Nombre en el menú**: sale de los metadatos del usuario (rápido, igual que v1); si alguien cambia su nombre en `perfiles` no se reflejará hasta que haya un módulo de perfil.
- **Pruebas de formularios y acciones**: no se prueban con vitest (requieren Supabase y navegador); se cubren con la verificación manual de arriba. La skill `escribir-pruebas` solo pide pruebas de lógica pura.
