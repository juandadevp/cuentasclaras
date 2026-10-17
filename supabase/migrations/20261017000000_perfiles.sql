-- Perfiles de usuario de Cuentas Claras.
-- Ejecuta este script en Supabase: SQL Editor > New query > pegar > Run.

create table if not exists public.perfiles (
  id        uuid primary key references auth.users (id) on delete cascade,
  nombre    text not null,
  telefono  text,
  email     text not null,
  creado_en timestamptz not null default now(),

  constraint perfiles_nombre_largo   check (char_length(btrim(nombre)) between 3 and 80),
  constraint perfiles_telefono_movil check (telefono is null or telefono ~ '^3[0-9]{9}$')
);

comment on table public.perfiles is 'Datos de perfil de cada usuario registrado (1 a 1 con auth.users).';

-- Seguridad a nivel de fila: cada usuario solo ve y edita su propio perfil.
alter table public.perfiles enable row level security;

drop policy if exists "perfil: ver el propio" on public.perfiles;
create policy "perfil: ver el propio"
  on public.perfiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "perfil: editar el propio" on public.perfiles;
create policy "perfil: editar el propio"
  on public.perfiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Al registrarse un usuario (auth.users) se crea su perfil automáticamente
-- con los datos que envía el formulario de registro.
create or replace function public.crear_perfil_al_registrarse()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre, telefono, email)
  values (
    new.id,
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'nombre'), ''), split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'telefono', ''),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists al_registrarse_crear_perfil on auth.users;
create trigger al_registrarse_crear_perfil
  after insert on auth.users
  for each row execute function public.crear_perfil_al_registrarse();
