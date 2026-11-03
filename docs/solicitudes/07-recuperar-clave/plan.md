# Plan: recuperar la contraseña (feat/07-recuperar-clave)

## Contexto
El enlace «¿Olvidaste tu contraseña?» del login lleva a `/recuperar`, que no existe (404). Se reconstruye el flujo de `origin/legacy/v1` (`git show "origin/legacy/v1:<ruta>"`, la ruta entre comillas): **paso 1** `/recuperar` (la persona escribe su correo y recibe un enlace) y **paso 2** `/restablecer` (con el enlace fija la nueva contraseña). Es una extensión de la autenticación ya hecha; no toca el registro, el login ni el panel.

**Estado actual** (rama `feat/07-recuperar-clave`, limpia, en `289f5c6` = `main` con base, portada, autenticación, portal y gastos; el presupuesto vive aparte en `feat/06-presupuesto` y no interviene): existen `src/app/auth/actions.ts` (`registrar`, `iniciarSesion`, `cerrarSesion`), `src/app/auth/callback/route.ts` (destinos permitidos: solo `/panel`; si falla, `/login`), `src/lib/validaciones.ts` (`validarClave`, `validarConfirmacion`, `validarEmail`, `requisitosClave`…), `src/lib/auth-tipos.ts` (`ResultadoAuth`), `src/lib/supabase/errores.ts` (`traducirErrorAuth`), `RequisitosClave`, `BotonOjo`, `Campo`, `obtenerUsuario` y `src/lib/supabase/actualizar-sesion.ts` (invitados: `/login`, `/registro`). `(sitio)/layout.tsx` ya pone el menú y el pie, así que las páginas nuevas usan `min-h-[calc(100vh-4.5rem)]`, sin logo propio. No existen `(sitio)/recuperar` ni `(sitio)/restablecer`.

Antes de escribir código: leer en `node_modules/next/dist/docs/` lo relativo a Route Handlers, Server Actions, `redirect` y `PageProps`, y las reglas de `vercel-react-best-practices` (`server-auth-actions`, `async-suspense-boundaries`, `rendering-hoist-jsx`, `rerender-*`, `bundle-barrel-imports`) y de las cuatro skills pedidas (en especial `autenticacion-supabase`).

## Archivos

### Lógica pura (`src/lib/`, con pruebas — skill `escribir-pruebas`)
- `src/lib/validaciones.ts` (ampliar): `DatosRecuperacion`/`validarRecuperacion({ email })` (solo el correo, con `validarEmail`) y `DatosNuevaClave`/`validarNuevaClave({ clave, confirmar })`, que usa **las mismas** `validarClave` y `validarConfirmacion` del registro: así las reglas son idénticas por construcción (8 a 64, mayúscula, minúscula, número, sin espacios).
- `src/lib/auth-destinos.ts`: la lista cerrada del callback como lógica pura y probable: `DESTINOS_PERMITIDOS = ["/panel", "/restablecer"]`, `elegirDestino(pedido)` (el pedido solo vale si es **idéntico** a un elemento de la lista; cualquier otra cosa da `/panel`) y `rutaSiFallaElEnlace(destino)` (`/restablecer` → `/recuperar?error=enlace`; el resto → `/login`).
- `src/lib/limite-frecuencia.ts`: `puedeIntentar(registro: Map<string, number>, clave, ahora, ventanaMs)` (permite un intento por clave y ventana, olvida entradas viejas y limita el tamaño del mapa). Lo usa `solicitarRecuperacion` por correo (ver acciones).
- `src/lib/supabase/errores.ts` (ampliar `traducirErrorAuth`): `same_password` → «La nueva contraseña debe ser distinta de la anterior.»; `otp_expired`, `session_expired`, `session_not_found`, `refresh_token_not_found`, `bad_jwt` → «El enlace venció. Pide uno nuevo.»; `reauthentication_needed` → «Por seguridad, pide un enlace nuevo para cambiar tu contraseña.»; `over_request_rate_limit` y `over_email_send_rate_limit` ya traducidos («demasiados intentos»). Se mantiene que nunca se muestra el texto crudo de Supabase.
- `src/lib/auth-tipos.ts` (ampliar): `enlaceEnviado?: boolean` en `ResultadoAuth`.

### Pruebas
- `src/lib/validaciones.test.ts` (ampliar): `validarRecuperacion` (correo válido; vacío; sin `@`; sin dominio) y `validarNuevaClave` (acepta una válida; cada regla de rechazo —vacía, 7 caracteres, sin mayúscula, sin minúscula, sin número, con espacio, 65 caracteres— con su mensaje exacto; confirmación vacía y distinta; devuelve solo los campos con error). **Prueba de paridad**: una tabla de contraseñas (buenas y malas) para la que `validarNuevaClave` da el mismo mensaje de contraseña que `validarRegistro`, para que las reglas no puedan separarse sin que falle algo.
- `src/lib/auth-destinos.test.ts`: `elegirDestino` acepta `/panel` y `/restablecer`; rechaza `https://malo.com`, `//malo.com`, `/\malo.com`, `/panel/../x`, `/panel?x=1`, `/PANEL`, `/restablecer/`, `javascript:alert(1)`, vacío y algo codificado (`%2F%2Fmalo.com`) → siempre `/panel`; `rutaSiFallaElEnlace` para cada destino.
- `src/lib/limite-frecuencia.test.ts`: primer intento permitido, segundo dentro de la ventana bloqueado, permitido de nuevo pasada la ventana, claves distintas independientes, el mapa no crece sin límite.
- `src/lib/supabase/errores.test.ts` (nuevo): cada código del flujo mapeado a su mensaje en español y que un error desconocido no deja pasar el texto crudo.

### Acciones de servidor (skill `crear-accion-servidor`) — `src/app/auth/actions.ts`
- `solicitarRecuperacion(formData)`: leer → **validar** con `validarRecuperacion` (si falla, errores por campo) → `supabaseConfigurado()` → límite de un intento por correo cada 60 s (si lo excede, **responde igual que si hubiera enviado**) → `resetPasswordForEmail(correo en minúsculas, { redirectTo: <sitio>/auth/callback?siguiente=/restablecer })`. **No revela si el correo existe:** devuelve siempre `{ enlaceEnviado: true }`, exista o no la cuenta y aunque Supabase falle. Las únicas excepciones visibles son las pedidas: formato inválido, Supabase sin configurar y `over_request_rate_limit` (límite por conexión, no por correo). `over_email_send_rate_limit` es por cuenta (distingue cuentas que existen) y por eso no se muestra; cualquier otro fallo se registra en el servidor **sin el correo** (`console.error` con el código) y se responde igual.
- `restablecerClave(formData)`: leer → **validar** con `validarNuevaClave` → `supabaseConfigurado()` → **`getUser()`** (sin sesión del enlace: «El enlace venció. Pide uno nuevo.») → `updateUser({ password })` → errores con `traducirErrorAuth` → `signOut({ scope: "others" })` (cierra las demás sesiones abiertas con la contraseña anterior) → `redirect("/panel")`.

### Callback y proxy
- `src/app/auth/callback/route.ts`: usa `elegirDestino(searchParams.get("siguiente"))`; con `code` válido, `exchangeCodeForSession` y redirige al destino; si no hay `code`, falla el intercambio (enlace vencido, ya usado o **abierto en otro navegador**, porque la verificación PKCE vive en el navegador que lo pidió) o Supabase no está configurado, redirige a `rutaSiFallaElEnlace(destino)`: `/recuperar?error=enlace` para el flujo de recuperación y `/login` para el resto. Nunca redirige a una dirección que venga en la URL.
- `src/lib/supabase/actualizar-sesion.ts`: añade `/recuperar` a `RUTAS_SOLO_INVITADOS` (con sesión lleva a `/panel`). **`/restablecer` no se añade**: tiene que poder abrirse con la sesión temporal del enlace. Se actualiza el comentario de la función.

### Interfaz (skill `vercel-react-best-practices`)
- `src/components/auth/RecuperarForm.tsx` (cliente): correo con validación al salir del campo y al enviar, `useTransition` («Enviando…»), y al terminar la pantalla «Revisa tu correo» con el texto «Si el correo está registrado, te enviamos un enlace…» (mismo texto exista o no la cuenta) y botón «Volver a iniciar sesión». El ícono del correo, constante fuera del componente.
- `src/components/auth/RestablecerForm.tsx` (cliente): «Nueva contraseña» y «Confirmar contraseña» con `BotonOjo` en cada una y `RequisitosClave` bajo la primera; foco en el primer campo con error; «Guardando…»; el error general en `role="alert"`.
- `src/app/(sitio)/recuperar/page.tsx`: título «¿Olvidaste tu contraseña?», formulario y enlace «Inicia sesión»; con `?error=enlace` muestra, dentro de `Suspense` y esperando `searchParams`, el aviso «El enlace venció, ya se usó o se abrió en otro navegador. Pide uno nuevo y ábrelo en este mismo navegador.». El aviso usa colores del proyecto (`border-accent bg-accent/20 text-brand-800`), no `amber-*`.
- `src/app/(sitio)/restablecer/page.tsx`: dentro de `Suspense` con `aria-busy`, `obtenerUsuario()`; sin sesión → `redirect("/recuperar?error=enlace")`; con sesión del enlace → `RestablecerForm`. Título «Crea tu nueva contraseña».
- Sin cambios en `LoginForm` (el enlace ya apunta a `/recuperar`) ni en el registro.

### Documentación
- `docs/solicitudes/07-recuperar-clave/prompt.md` y `plan.md` (la carpeta `docs/` es la que existe hoy en esta rama).

## Pasos en orden
1. Leer docs y reglas; confirmar la rama.
2. Validaciones nuevas, `auth-destinos`, `limite-frecuencia`, traducciones, y todas sus pruebas; `npm test` en verde antes de seguir.
3. Proxy y callback.
4. Acciones (`solicitarRecuperacion`, `restablecerClave`).
5. Formularios y las dos páginas.
6. Lint, tipos, pruebas, build; revisión en el navegador; documentación.

## Configuración manual en Supabase (la hace el equipo)
- Authentication → URL Configuration → Redirect URLs: `http://localhost:3000/auth/callback` y la URL de producción. Como el enlace lleva `?siguiente=/restablecer`, si Supabase no lo acepta con la dirección exacta, agregar también la versión con comodín (`http://localhost:3000/auth/callback**` / `…/**`); hay que comprobarlo con un correo real.
- La plantilla «Reset Password» por defecto ya sirve (usa el enlace con `code`). Con el plan gratuito y el correo de Supabase hay muy pocos envíos por hora: probar con calma.

## Verificación
1. `npm run lint`, `npx next typegen && npx tsc --noEmit` (borrar `.next` si hay tipos viejos), `npm test`, `npm run build` (`/recuperar` estática `○`; `/restablecer` parcial `◐`).
2. Con una cuenta de prueba y Supabase configurado, en `npm run dev`:
   - **Paso 1:** en `/recuperar`, un correo registrado y uno inexistente dan **la misma pantalla y el mismo texto**; formato inválido muestra el error bajo el campo; llegan correos solo para la cuenta real; pedir otro enlace de inmediato no muestra nada distinto.
   - **Paso 2:** abrir el enlace **en el mismo navegador** lleva a `/restablecer` con la sesión temporal; la contraseña nueva sigue las reglas del registro (probar cada una: corta, sin mayúscula/minúscula/número, con espacio, 65 caracteres, confirmación distinta); usar la **misma contraseña** anterior muestra «La nueva contraseña debe ser distinta de la anterior.»; una válida guarda y entra a `/panel`.
   - **Otras sesiones:** con la cuenta abierta en un segundo navegador, después del cambio esa sesión deja de ser válida (al recargar o refrescar el token vuelve a `/login`).
   - **Enlace malo:** abrirlo en **otro navegador**, abrirlo dos veces o esperar a que venza lleva a `/recuperar?error=enlace` con el aviso; `/restablecer` sin sesión también.
   - **Callback:** `/auth/callback?siguiente=https://malo.com`, `//malo.com` y `/panel/../x` terminan en `/panel` (o `/login` sin código), nunca fuera del sitio; `?siguiente=/restablecer` con código inválido → `/recuperar?error=enlace`.
   - **Con sesión iniciada:** `/recuperar` redirige a `/panel`; `/restablecer` se abre.
   - **Demasiados intentos:** muchas peticiones seguidas muestran «Hiciste demasiados intentos…» solo si Supabase devuelve `over_request_rate_limit`.
   - Sin variables de Supabase: ambos formularios muestran el aviso de configuración en vez de fallar.
3. Celular a 360, 390 y 768 px: sin desbordamiento horizontal en `/recuperar` y `/restablecer` (medir `scrollWidth <= innerWidth`).
4. Accesibilidad y diseño: etiquetas enlazadas, errores con `role="alert"`, `BotonOjo` con nombre accesible, un solo `h1`, foco visible, solo colores del proyecto, sin modo oscuro.

## Riesgos
- **Enumeración de correos** (el más importante): el mensaje, el estado y la redirección deben ser iguales para correos que existen y que no. Quedan dos filtraciones que no se pueden cerrar del todo desde el código: la **diferencia de tiempo** (enviar un correo tarda más que no hacerlo) y el límite por cuenta de Supabase (por eso `over_email_send_rate_limit` no se muestra). Se anota como riesgo residual.
- **La sesión del enlace es una sesión completa.** Quien abre el enlace queda con sesión iniciada aunque no cambie la contraseña (así funciona la recuperación de Supabase) y podría ir a `/panel`. Por eso `restablecerClave` cierra todas las demás sesiones al cambiar la contraseña. Si se quisiera obligar a cambiarla antes de entrar al panel, sería una regla aparte.
- **Enlace abierto en otro navegador:** la verificación PKCE no coincide y el intercambio falla; el flujo lo contempla (aviso en `/recuperar`), pero es la queja más probable de las personas usuarias; el aviso lo explica.
- **Redirección abierta en el callback:** `elegirDestino` solo acepta valores idénticos a la lista (probado con varios intentos de evasión); la dirección final se arma siempre con `request.nextUrl.origin`.
- **Límite de frecuencia en memoria:** en un servidor sin estado compartido (Vercel con varias instancias) solo frena a medias; es una capa extra sobre los límites de Supabase, que son los que de verdad protegen. Responde igual que un envío exitoso para no revelar nada. Es estado de módulo compartido entre peticiones (la regla `server-no-shared-module-state` lo desaconseja para datos de petición): aquí solo guarda marcas de tiempo por correo, sin datos de personas más allá del correo en minúsculas, y se descarta al reiniciar.
- **Redirect URLs de Supabase:** si la dirección con `?siguiente=` no coincide con la lista permitida, Supabase manda a la página principal del sitio y el flujo se rompe; se comprueba con un correo real y se documenta el comodín si hace falta.
- **Texto de contraseña en los registros:** las acciones nunca escriben contraseñas ni correos en `console.*`; solo el código de error de Supabase.
- **`cacheComponents`:** la sesión (`obtenerUsuario`) y `searchParams` se leen detrás de `Suspense`; `/recuperar` debe quedar estática salvo el aviso.
- **Sin cambios en dependencias, `globals.css`, gastos, portal, portada ni registro/login.**
