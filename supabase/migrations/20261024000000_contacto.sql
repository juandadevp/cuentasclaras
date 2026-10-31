-- Mensajes del formulario de Contacto.
-- Ejecuta este script en Supabase: SQL Editor > New query > pegar > Run.

create table if not exists public.mensajes_contacto (
  id        uuid primary key default gen_random_uuid(),
  nombre    text not null,
  email     text not null,
  asunto    text not null,
  mensaje   text not null,
  creado_en timestamptz not null default now(),

  constraint contacto_nombre_largo  check (char_length(btrim(nombre)) between 3 and 80),
  constraint contacto_email_largo   check (char_length(btrim(email)) between 5 and 120),
  constraint contacto_asunto_valido check (asunto in ('consulta', 'problema', 'sugerencia', 'otro')),
  constraint contacto_mensaje_largo check (char_length(btrim(mensaje)) between 10 and 1000)
);

comment on table public.mensajes_contacto is 'Mensajes enviados desde la página de Contacto.';

-- Cualquiera puede ENVIAR un mensaje, pero nadie puede leerlos desde la app (solo tú, en el panel de Supabase).
alter table public.mensajes_contacto enable row level security;

drop policy if exists "contacto: enviar mensaje" on public.mensajes_contacto;
create policy "contacto: enviar mensaje"
  on public.mensajes_contacto for insert to anon, authenticated
  with check (true);
