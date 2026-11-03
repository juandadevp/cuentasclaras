# Plan 09-contacto-ayuda

## Qué se hizo
- `supabase/migrations/20261103020000_contacto.sql`: tabla `mensajes_contacto` (`nombre`, `correo`, `asunto`, `mensaje`, `fecha`) con `check` de largos y asuntos; seguridad por filas con una sola política de `insert` para `anon` y `authenticated`, sin lectura; además `revoke all` + `grant insert`. Si la tabla ya existía con las columnas de v1 (`email`, `creado_en`), las renombra. Se puede ejecutar dos veces.
- `src/lib/validaciones-contacto.ts` (`validarContacto`, `normalizarContacto`, `asuntosContacto`, `LIMITES_CONTACTO`), `contacto-tipos.ts`, `contacto-errores.ts`, con sus pruebas.
- `src/app/(sitio)/contacto/actions.ts`: `enviarContacto` (normaliza, valida, freno de 20 s por correo con `puedeIntentar`, inserta sin `.select()`, traduce errores). Es pública: no pide sesión.
- `src/components/home/FormularioContacto.tsx`, `src/app/(sitio)/contacto/page.tsx` y `src/app/(sitio)/ayuda/page.tsx` (seis preguntas con `<details>`, sin JavaScript).

## Diferencias con v1
- Columnas `correo` y `fecha`.
- El nombre no exige apellido (la base acepta 3 a 80 caracteres).
- Las preguntas de Ayuda solo hablan de funciones que existen hoy.
- Si el guardado falla, el freno se libera para poder reintentar.
- La tarjeta de Ayuda usa el token `brand-800`.

## Verificación
`npm run lint`, `npx tsc --noEmit`, `npm test` y `npm run build` (las rutas `/contacto` y `/ayuda` salen estáticas). Revisión visual con Chrome sin ventana. Pendiente para el equipo: ejecutar la migración en Supabase y probar un envío real.

## Riesgos
- El freno de 20 s vive en la memoria de cada servidor; no es una defensa fuerte contra spam.
- Los mensajes solo se leen en el panel de Supabase; no hay correo de respuesta automática.
- Las preguntas de Ayuda describen la app de hoy; habrá que ampliarlas cuando lleguen «Recomendar compras» y «Mi ahorro».
