---
paths:
  - "supabase/migrations/**"
---

# Reglas de las migraciones de Supabase

- El archivo se llama `AAAAMMDDHHMMSS_nombre.sql`, con una fecha posterior a la última migración.
- **No se modifica una migración ya aplicada**: se crea una nueva.
- El script se puede ejecutar más de una vez: `create table if not exists`, `drop constraint if exists` antes de volver a crear, `create or replace function`.
- Toda tabla por usuario lleva `user_id uuid not null default auth.uid() references auth.users (id) on delete cascade`.
- Toda tabla nueva activa la seguridad por filas (`enable row level security`) y tiene una política por acción necesaria (ver, crear, editar, borrar) con `(select auth.uid()) = user_id`. Una acción sin política queda prohibida.
- Los datos se protegen con `check` (montos positivos, categorías válidas, formatos) y con restricciones únicas cuando corresponda.
- Los comentarios van en español y la primera línea explica cómo ejecutarla: SQL Editor > New query > pegar > Run.
- No se usa la clave `service_role` en ninguna migración ni en el código de la aplicación.
