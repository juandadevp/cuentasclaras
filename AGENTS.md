# Cuentas Claras

> **Estado:** los módulos 1 a 13 y las cinco specs del proyecto integrador (01 a 05) ya están en `main`. La versión original (v1) está en la rama `legacy/v1`. Cada funcionalidad nueva se construye en su propia rama (`feat/NN-nombre`): los módulos con `docs/solicitudes/NN-nombre/` (prompt, plan y skills) y las specs del proyecto integrador con `docs/specs/NN-nombre/` (spec, plan y tareas).

Aplicación web para llevar el control de los gastos mensuales. Cada usuario tiene un panel privado donde registra gastos, los ve por categoría, compara sus meses, busca precios de productos en tiendas de Colombia y guarda favoritos. Es un solo repositorio: el frontend y el backend viven juntos en Next.js (el «backend» son las Server Actions y la conexión con Supabase).

## Arnés
El mapa de la memoria, las reglas, las skills, los subagentes, los permisos y la evidencia está en `docs/ARNES.md` y la guía de uso en el `README.md`.

Las normas por tipo de archivo están en `.claude/rules/` (se cargan solas al tocar esos archivos). El trabajo se reparte entre el orquestador (Claude Code en modo plan, que no programa) y cinco subagentes de `.claude/agents/`:
- `explorador`: busca lo que ya existe para reutilizarlo. Solo lee.
- `probador`: escribe las pruebas primero (Red), sin ver el código. Solo toca `*.test.ts`.
- `implementador`: escribe el código mínimo (Green). Solo toca `src/**` sin las pruebas y migraciones nuevas.
- `revisor-pull-request`: antes de subir cualquier rama. Solo lee.
- `revisor-seguridad`: si toca tablas, acciones o autenticación. Solo lee.

Las carpetas y los comandos del `probador` y del `implementador` los hace cumplir el hook `.claude/hooks/limitar-agente.mjs`, no solo las instrucciones. Una spec nueva se arranca con `/nueva-spec NN-nombre`.

## Stack
- Next.js 16 (App Router, `cacheComponents` activo), React 19, TypeScript, Tailwind CSS 4.
- Supabase: PostgreSQL + Auth, con seguridad por filas (RLS): cada usuario solo ve sus datos.
- SerpApi (Google Shopping Colombia) para el comparador de precios.

## Comandos
```bash
npm install        # instalar dependencias
npm run dev        # servidor de desarrollo en http://localhost:3000
npm run build      # compilar para producción (detecta errores de tipos y de render)
npm run start      # servir lo compilado
npm run lint       # ESLint
npx tsc --noEmit   # revisar tipos
npm test           # pruebas automáticas (vitest)
node --test ".claude/hooks/*.test.mjs"  # pruebas de los hooks del arnés
```
Antes de dar algo por terminado corre `npm run lint`, `npx tsc --noEmit`, `npm test` y `npm run build`. Las pruebas viven junto al código, en archivos `*.test.ts`; si cambias validaciones o cálculos de `src/lib/`, agrega o actualiza su prueba. GitHub Actions (`.github/workflows/ci.yml`) repite esas cuatro comprobaciones en cada pull request.

## Variables de entorno
Se copian de `.env.example` a `.env.local` (este archivo NO se sube a git). `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` son públicas; `SERPAPI_API_KEY` es secreta y solo se usa en el servidor.

## Organización del código
- `src/app/(sitio)/`: páginas públicas (portada, login, registro, contacto, ayuda).
- `src/app/panel/`: portal privado (inicio, registrar, gastos, recomendar, favoritos, ahorro, presupuesto). Cada carpeta puede traer su `actions.ts` (Server Actions).
- `src/app/auth/`: acciones y callback de autenticación.
- `src/components/`: componentes de UI agrupados por zona (`home`, `layout`, `panel`, `auth`, `ui`).
- `src/lib/`: lógica sin interfaz (validaciones, formato, consultas a Supabase en `*-servidor.ts`, `precios/` para el comparador).
- `src/config/site.ts`: nombre del sitio, menú y lista de categorías de gasto.
- `src/proxy.ts`: renueva la sesión de Supabase (en Next 16 reemplaza a `middleware`).
- `supabase/migrations/`: cambios de la base de datos, en SQL, con fecha en el nombre. Se ejecutan a mano en el SQL Editor de Supabase.
- `docs/specs/NN-nombre/`: la spec, el plan y las tareas de cada funcionalidad del proyecto integrador (la plantilla está en `docs/specs/_plantilla/`). `docs/solicitudes/` guarda lo de los módulos 1 a 13.
- `.claude/`: la memoria operativa del agente: `rules/` (normas), `skills/`, `agents/`, `commands/`, `hooks/` y `settings.json` (permisos).

Regla de dependencias: los componentes pueden usar `lib/` y `config/`; `lib/` no importa componentes.

## Convenciones
- Todo el texto visible, los nombres de funciones, variables y archivos van en **español** sin tildes en los nombres de archivo (ej. `FormularioGasto.tsx`, `gastos-servidor.ts`).
- Componentes en PascalCase; utilidades en minúsculas con guiones.
- Los datos dinámicos (sesión, fechas) van detrás de `<Suspense>` y precedidos de `await connection()`; si no, Next falla al prerenderizar.
- Siempre se valida en el servidor (las validaciones del navegador se pueden saltar) y se escapan los datos del usuario.
- Cada tabla nueva lleva RLS y su migración en `supabase/migrations/`.
- Diseño: cuerpo blanco, sin modo oscuro; no cambiar los colores del logo. Los colores salen de los tokens de `src/app/globals.css`.

## Git
- `main` es la versión estable. Todo cambio se hace en una rama (`feat/...`, `fix/...`, `chore/...`) y llega a `main` por pull request.
- Mensajes de commit cortos, en español, en imperativo: «Agregar filtro por categoría».
- No se hace merge a `main` hasta comprobar que todo funciona.

## Lo que el agente NO debe hacer
- No subir ni pegar claves secretas (`SERPAPI_API_KEY`, `service_role` de Supabase, etc.) ni leer `.env.local` para mostrarlo.
- No modificar migraciones ya aplicadas: crear una nueva.
- No hacer merge a `main` ni borrar ramas sin que el equipo lo pida.
- No instalar skills ni dependencias de terceros sin revisar su código.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
