-- Presupuestos mensuales por categoría: el límite de gasto que cada usuario se fija para un mes.
-- Ejecuta este script en Supabase: SQL Editor > New query > pegar > Run.

create table if not exists public.presupuestos (
  id             uuid primary key default gen_random_uuid(),
  -- Se llena sola con el usuario que inició sesión: el navegador no puede falsificarla.
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  categoria      text not null,
  -- Siempre el primer día del mes (2026-11-01 = noviembre de 2026).
  mes            date not null,
  monto          numeric(14, 2) not null,
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),

  -- Un solo límite por usuario, categoría y mes: fijarlo de nuevo lo actualiza.
  constraint presupuestos_unico            unique (user_id, categoria, mes),
  constraint presupuestos_mes_primer_dia   check (mes = date_trunc('month', mes)::date),
  constraint presupuestos_monto_positivo   check (monto > 0 and monto <= 999999999),
  constraint presupuestos_categoria_valida check (
    categoria in (
      'vivienda', 'alimentacion', 'transporte', 'servicios', 'salud',
      'tecnologia', 'ropa', 'educacion', 'mascotas', 'bebes', 'ocio', 'otros'
    )
  )
);

comment on table public.presupuestos is 'Límite de gasto mensual que cada usuario fija por categoría.';

create index if not exists presupuestos_usuario_mes_idx on public.presupuestos (user_id, mes desc);

-- Seguridad a nivel de fila: cada usuario solo ve y modifica SUS presupuestos.
alter table public.presupuestos enable row level security;

drop policy if exists "presupuestos: ver los propios" on public.presupuestos;
create policy "presupuestos: ver los propios"
  on public.presupuestos for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "presupuestos: crear los propios" on public.presupuestos;
create policy "presupuestos: crear los propios"
  on public.presupuestos for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "presupuestos: editar los propios" on public.presupuestos;
create policy "presupuestos: editar los propios"
  on public.presupuestos for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "presupuestos: borrar los propios" on public.presupuestos;
create policy "presupuestos: borrar los propios"
  on public.presupuestos for delete to authenticated
  using ((select auth.uid()) = user_id);
