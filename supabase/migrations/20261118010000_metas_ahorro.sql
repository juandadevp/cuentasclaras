-- Ejecuta este script en Supabase: SQL Editor > New query > pegar > Run.
-- Metas de ahorro mensuales: cuánto quiere ahorrar cada usuario en un mes (una meta por usuario y mes).
-- Se puede ejecutar más de una vez: deja al día los check, los permisos y las cuatro políticas con nombre propio.
-- Si ya existiera una tabla «metas_ahorro» anterior, revisa sus políticas con:
--   select policyname, cmd from pg_policies where tablename = 'metas_ahorro';
-- Deben salir exactamente 4: ver, crear, editar y borrar.

create table if not exists public.metas_ahorro (
  id             uuid primary key default gen_random_uuid(),
  -- Se llena sola con el usuario que inició sesión: el navegador no puede falsificarla.
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Siempre el primer día del mes (2026-11-01 = noviembre de 2026).
  mes            date not null,
  monto          numeric(14, 2) not null,
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),

  -- Una sola meta por usuario y mes: fijarla de nuevo la actualiza.
  constraint metas_ahorro_unico unique (user_id, mes)
);

comment on table public.metas_ahorro is 'Meta de ahorro mensual que cada usuario fija (una por mes).';

-- Reglas de los datos (se reemplazan para que queden iguales en una tabla nueva o vieja).
alter table public.metas_ahorro drop constraint if exists metas_ahorro_mes_primer_dia;
alter table public.metas_ahorro add constraint metas_ahorro_mes_primer_dia check (mes = date_trunc('month', mes)::date);

alter table public.metas_ahorro drop constraint if exists metas_ahorro_mes_desde_2000;
alter table public.metas_ahorro add constraint metas_ahorro_mes_desde_2000 check (mes >= date '2000-01-01');

alter table public.metas_ahorro drop constraint if exists metas_ahorro_monto_positivo;
alter table public.metas_ahorro add constraint metas_ahorro_monto_positivo check (monto > 0 and monto <= 999999999);

-- Al cambiar una meta, la fecha de actualización la pone la base de datos (no el navegador ni el servidor web).
create or replace function public.actualizar_fecha_meta_ahorro()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

drop trigger if exists al_editar_actualizar_fecha on public.metas_ahorro;
create trigger al_editar_actualizar_fecha
  before update on public.metas_ahorro
  for each row execute function public.actualizar_fecha_meta_ahorro();

-- Seguridad a nivel de fila: cada usuario solo ve, crea, edita y borra SUS metas.
-- Fijar de nuevo la meta es un upsert, por eso hacen falta las políticas de crear y de editar.
alter table public.metas_ahorro enable row level security;

drop policy if exists "metas_ahorro: ver las propias" on public.metas_ahorro;
create policy "metas_ahorro: ver las propias"
  on public.metas_ahorro for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "metas_ahorro: crear las propias" on public.metas_ahorro;
create policy "metas_ahorro: crear las propias"
  on public.metas_ahorro for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "metas_ahorro: editar las propias" on public.metas_ahorro;
create policy "metas_ahorro: editar las propias"
  on public.metas_ahorro for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "metas_ahorro: borrar las propias" on public.metas_ahorro;
create policy "metas_ahorro: borrar las propias"
  on public.metas_ahorro for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Permisos de la tabla: ver, crear, editar y borrar, y solo con sesión iniciada.
revoke all on public.metas_ahorro from anon, authenticated;
grant select, insert, update, delete on public.metas_ahorro to authenticated;
