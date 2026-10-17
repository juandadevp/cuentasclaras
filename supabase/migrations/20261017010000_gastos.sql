-- Gastos de cada usuario. Ejecuta este script en Supabase: SQL Editor > New query > pegar > Run.

create table if not exists public.gastos (
  id          uuid primary key default gen_random_uuid(),
  -- Se llena sola con el usuario que inició sesión: el navegador no puede falsificarla.
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  descripcion text not null,
  monto       numeric(14, 2) not null,
  categoria   text not null,
  fecha       date not null default current_date,
  creado_en   timestamptz not null default now(),

  constraint gastos_descripcion_largo check (char_length(btrim(descripcion)) between 2 and 80),
  constraint gastos_monto_positivo    check (monto > 0 and monto <= 999999999),
  constraint gastos_categoria_valida  check (
    categoria in ('vivienda', 'alimentacion', 'transporte', 'servicios', 'ocio', 'salud', 'otros')
  )
);

comment on table public.gastos is 'Gastos registrados por cada usuario.';

create index if not exists gastos_usuario_fecha_idx on public.gastos (user_id, fecha desc);

-- Seguridad a nivel de fila: cada usuario solo ve y modifica SUS gastos.
alter table public.gastos enable row level security;

drop policy if exists "gastos: ver los propios" on public.gastos;
create policy "gastos: ver los propios"
  on public.gastos for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "gastos: crear los propios" on public.gastos;
create policy "gastos: crear los propios"
  on public.gastos for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "gastos: editar los propios" on public.gastos;
create policy "gastos: editar los propios"
  on public.gastos for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "gastos: borrar los propios" on public.gastos;
create policy "gastos: borrar los propios"
  on public.gastos for delete to authenticated
  using ((select auth.uid()) = user_id);
