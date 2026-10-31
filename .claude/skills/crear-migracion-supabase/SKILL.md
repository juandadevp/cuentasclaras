---
name: crear-migracion-supabase
description: Crea una migración SQL de Supabase para Cuentas Claras siguiendo las reglas del proyecto (nombre con fecha, tabla por usuario con seguridad por filas, restricciones y comentarios en español). Úsala cuando se pida crear o cambiar una tabla, columna, restricción o política de la base de datos.
---

# Crear una migración de Supabase

Las migraciones de este proyecto son archivos SQL en `supabase/migrations/`. No hay herramienta automática: la persona las ejecuta a mano en Supabase (SQL Editor > New query > pegar > Run). Por eso cada archivo debe poder ejecutarse **dos veces sin romper nada**.

## Pasos

1. **Mira las migraciones existentes** en `supabase/migrations/` y usa de modelo la más parecida (por ejemplo `20261021000000_favoritos.sql` para una tabla por usuario).
2. **Nunca edites una migración que ya existe.** Un cambio nuevo va en un archivo nuevo.
3. **Nombra el archivo** `AAAAMMDDHHMMSS_nombre_corto.sql`, con la fecha y hora de hoy y el nombre en minúsculas con guiones bajos (ej. `20261105000000_presupuestos.sql`). Debe ser posterior a todas las migraciones existentes.
4. **Empieza con un comentario** en español que diga qué hace y cómo ejecutarlo: «Ejecuta este script en Supabase: SQL Editor > New query > pegar > Run.»
5. **Escribe el SQL** con estas reglas:
   - Usa `create table if not exists`, `add column if not exists`, `drop ... if exists` para poder repetirla.
   - Si la tabla guarda datos de cada persona, incluye `user_id uuid not null default auth.uid() references auth.users (id) on delete cascade`. La columna se llena sola: el navegador no puede falsificarla.
   - Activa la seguridad por filas con `alter table ... enable row level security;`.
   - Crea una política por acción (ver, crear, editar, borrar), cada una con `drop policy if exists` antes y la condición `(select auth.uid()) = user_id`.
   - Agrega `check` para validar largos, valores permitidos y rangos (como en `gastos`).
   - Agrega `comment on table` en español y un índice si se va a filtrar por usuario y fecha.
6. **Para tablas públicas** (como `mensajes_contacto`): permite solo `insert` y no crees política de lectura, para que nadie pueda leer los datos desde la app.
7. **Actualiza el código que use la tabla**: si falta la tabla, la acción debe mostrar un aviso claro («Falta crear la tabla de X. Ejecuta la migración «x» en Supabase»), como hace `mensajeDeError` en `src/app/panel/actions.ts`.
8. **Al terminar**, dile a la persona el nombre exacto del archivo y los tres pasos para ejecutarlo en el SQL Editor.

## Lo que no debes hacer
- No pegues claves ni datos reales en el SQL.
- No uses `drop table` ni borres datos sin que la persona lo pida de forma explícita.
- No desactives la seguridad por filas en una tabla con datos de usuarios.
