-- Ingresos de cada usuario (salario, ventas, honorarios u otros) para calcular el ahorro real.
-- Ejecuta este script en Supabase: SQL Editor > New query > pegar > Run.
-- Se puede ejecutar más de una vez; también deja al día una tabla «ingresos» creada antes.

create table if not exists public.ingresos (
  id          uuid primary key default gen_random_uuid(),
  -- Se llena sola con el usuario que inició sesión: el navegador no puede falsificarla.
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  descripcion text not null,
  tipo        text not null,
  monto       numeric(14, 2) not null,
  fecha       date not null default current_date,
  creado_en   timestamptz not null default now()
);

comment on table public.ingresos is 'Ingresos registrados por cada usuario.';

-- Reglas de los datos (se reemplazan para que queden iguales en una tabla nueva o vieja).
alter table public.ingresos drop constraint if exists ingresos_descripcion_largo;
alter table public.ingresos add constraint ingresos_descripcion_largo check (char_length(btrim(descripcion)) between 2 and 80);

alter table public.ingresos drop constraint if exists ingresos_tipo_valido;
alter table public.ingresos add constraint ingresos_tipo_valido check (tipo in ('salario', 'ventas', 'honorarios', 'otros'));

alter table public.ingresos drop constraint if exists ingresos_monto_positivo;
alter table public.ingresos add constraint ingresos_monto_positivo check (monto > 0 and monto <= 999999999);

-- La fecha no puede ser futura: eso lo valida la aplicación (current_date no sirve en un check).
alter table public.ingresos drop constraint if exists ingresos_fecha_desde_2000;
alter table public.ingresos add constraint ingresos_fecha_desde_2000 check (fecha >= date '2000-01-01');

create index if not exists ingresos_usuario_fecha_idx on public.ingresos (user_id, fecha desc);

-- Seguridad a nivel de fila: cada usuario solo ve, crea y borra SUS ingresos.
-- No hay política de edición: un ingreso se borra y se vuelve a registrar.
alter table public.ingresos enable row level security;

drop policy if exists "ingresos: ver los propios" on public.ingresos;
create policy "ingresos: ver los propios"
  on public.ingresos for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "ingresos: crear los propios" on public.ingresos;
create policy "ingresos: crear los propios"
  on public.ingresos for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "ingresos: borrar los propios" on public.ingresos;
create policy "ingresos: borrar los propios"
  on public.ingresos for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Permisos de la tabla: solo ver, crear y borrar, y solo con sesión iniciada.
revoke all on public.ingresos from anon, authenticated;
grant select, insert, delete on public.ingresos to authenticated;
