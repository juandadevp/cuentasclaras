-- Mensajes del formulario de Contacto.
-- Ejecuta este script en Supabase: SQL Editor > New query > pegar > Run.
-- Se puede ejecutar más de una vez sin romper nada.

create table if not exists public.mensajes_contacto (
  id      uuid primary key default gen_random_uuid(),
  nombre  text not null,
  correo  text not null,
  asunto  text not null,
  mensaje text not null,
  fecha   timestamptz not null default now()
);

-- Si la tabla ya existía con las columnas de la versión anterior (email, creado_en), se renombran.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'mensajes_contacto' and column_name = 'email'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'mensajes_contacto' and column_name = 'correo'
  ) then
    alter table public.mensajes_contacto rename column email to correo;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'mensajes_contacto' and column_name = 'creado_en'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'mensajes_contacto' and column_name = 'fecha'
  ) then
    alter table public.mensajes_contacto rename column creado_en to fecha;
  end if;
end
$$;

-- Reglas de la base de datos (se recrean para que queden con los nombres nuevos).
alter table public.mensajes_contacto drop constraint if exists contacto_email_largo;
alter table public.mensajes_contacto drop constraint if exists contacto_nombre_largo;
alter table public.mensajes_contacto drop constraint if exists contacto_correo_largo;
alter table public.mensajes_contacto drop constraint if exists contacto_asunto_valido;
alter table public.mensajes_contacto drop constraint if exists contacto_mensaje_largo;

alter table public.mensajes_contacto
  add constraint contacto_nombre_largo  check (char_length(btrim(nombre)) between 3 and 80),
  add constraint contacto_correo_largo  check (char_length(btrim(correo)) between 5 and 120),
  add constraint contacto_asunto_valido check (asunto in ('consulta', 'problema', 'sugerencia', 'otro')),
  add constraint contacto_mensaje_largo check (char_length(btrim(mensaje)) between 10 and 1000);

comment on table public.mensajes_contacto is 'Mensajes enviados desde la página de Contacto (anónimos).';

-- Cualquiera puede ENVIAR un mensaje, pero nadie puede leerlos desde la app (solo se ven en el panel de Supabase).
alter table public.mensajes_contacto enable row level security;

drop policy if exists "contacto: enviar mensaje" on public.mensajes_contacto;
create policy "contacto: enviar mensaje"
  on public.mensajes_contacto for insert
  to anon, authenticated
  with check (true);

-- Refuerzo: aunque alguien agregue una política de lectura por error, estos roles solo pueden insertar.
revoke all on public.mensajes_contacto from anon, authenticated;
grant insert on public.mensajes_contacto to anon, authenticated;
