# Cuentas Claras

Aplicación para administrar gastos mensuales, construida con Next.js (App Router), TypeScript y Tailwind CSS.

## Comandos

```bash
npm install
npm run dev     # desarrollo en http://localhost:3000
npm run build   # build de producción
npm run lint
```

## Base de datos y cuentas (Supabase)

El registro y el inicio de sesión usan **Supabase Auth** (PostgreSQL). Pasos para activarlos:

1. Crea un proyecto en https://supabase.com.
2. En **SQL Editor** ejecuta, en este orden, los dos scripts de `supabase/migrations/`:
   - `20261017000000_perfiles.sql`: tabla `perfiles` y un trigger que guarda el perfil al registrarse.
   - `20261017010000_gastos.sql`: tabla `gastos`. Ambas tienen seguridad por filas (RLS): cada usuario
     solo puede ver y modificar sus propios datos.
3. Copia `.env.example` como `.env.local` y completa `NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (**Project Settings → API**). Nunca uses la clave `service_role`.
4. En **Authentication → URL Configuration** agrega `http://localhost:3000/auth/callback`
   (y la URL de producción) en *Redirect URLs*.
5. En **Authentication → Providers → Email**:
   - *Confirm email* **activado** (recomendado): el usuario recibe un correo y debe confirmarlo antes de entrar.
   - *Confirm email* **desactivado** (solo desarrollo): el usuario entra apenas se registra.
6. Reinicia `npm run dev`.

Al iniciar sesión (o registrarse sin confirmación de correo) cada usuario entra a **su propio portal** en
`/panel`, con accesos a:
- `/panel/registrar`: formulario para anotar un gasto y sus últimos movimientos.
- `/panel/resumen`: total del mes, gastos por categoría e historial, con selector de mes.

Sin sesión, cualquier ruta de `/panel` lleva a `/login`.

Sin las variables de entorno el sitio funciona, pero el login y el registro muestran un aviso de que falta configurar Supabase.

## Estructura

```
src/
├── app/            # Rutas (App Router): páginas, layout y API routes
│   ├── auth/       # Acciones de login/registro/cierre de sesión y callback de confirmación
│   └── panel/      # Portal personal de cada usuario: registrar/ y resumen/
├── components/     # ui/ (genéricos), layout/ (estructura), auth/ (login/registro), home/, gastos/
├── proxy.ts        # Refresca la sesión de Supabase en cada petición
├── config/         # Configuración del sitio y categorías
├── lib/            # Utilidades, validaciones y clientes de Supabase (lib/supabase)
└── types/          # Tipos de TypeScript
```
