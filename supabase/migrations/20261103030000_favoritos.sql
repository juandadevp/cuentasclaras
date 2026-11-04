-- Productos favoritos de cada usuario (la estrella de «Recomendar compras»).
-- Ejecuta este script en Supabase: SQL Editor > New query > pegar > Run.
-- Se puede ejecutar más de una vez sin romper nada.

create table if not exists public.favoritos (
  id      uuid primary key default gen_random_uuid(),
  -- Se llena sola con el usuario que inició sesión: el navegador no puede falsificarla.
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Identifica al producto (id del buscador o título normalizado): evita guardarlo dos veces.
  clave   text not null,
  titulo  text not null,
  imagen  text,
  tipo    text,
  -- Precios por tienda al guardarlo: [{ "tienda": "...", "precio": 1000, "enlace": "https://..." }]
  ofertas jsonb not null default '[]'::jsonb,
  fecha   timestamptz not null default now()
);

-- Si la tabla ya existía con las columnas de la versión anterior (rubro, creado_en), se renombran.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'favoritos' and column_name = 'rubro'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'favoritos' and column_name = 'tipo'
  ) then
    alter table public.favoritos rename column rubro to tipo;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'favoritos' and column_name = 'creado_en'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'favoritos' and column_name = 'fecha'
  ) then
    alter table public.favoritos rename column creado_en to fecha;
  end if;
end
$$;

comment on table public.favoritos is 'Productos que cada usuario marcó con la estrella en Recomendar compras.';

-- Reglas de la base de datos (se recrean para que queden iguales en una tabla nueva o vieja).
alter table public.favoritos drop constraint if exists favoritos_unico;
alter table public.favoritos drop constraint if exists favoritos_clave_largo;
alter table public.favoritos drop constraint if exists favoritos_titulo_largo;
alter table public.favoritos drop constraint if exists favoritos_tipo_largo;
alter table public.favoritos drop constraint if exists favoritos_ofertas_lista;
alter table public.favoritos drop constraint if exists favoritos_imagen_https;

alter table public.favoritos
  add constraint favoritos_unico        unique (user_id, clave),
  add constraint favoritos_clave_largo  check (char_length(clave) between 1 and 200),
  add constraint favoritos_titulo_largo check (char_length(btrim(titulo)) between 1 and 200),
  add constraint favoritos_tipo_largo   check (tipo is null or char_length(tipo) <= 40),
  add constraint favoritos_ofertas_lista check (jsonb_typeof(ofertas) = 'array' and jsonb_array_length(ofertas) <= 30);

-- «not valid»: solo se exige a lo que se guarde de ahora en adelante (no falla por filas viejas).
alter table public.favoritos
  add constraint favoritos_imagen_https check (imagen is null or (imagen like 'https://%' and char_length(imagen) <= 600)) not valid;

create index if not exists favoritos_usuario_fecha_idx on public.favoritos (user_id, fecha desc);

-- Seguridad a nivel de fila: cada usuario solo ve, crea y borra SUS favoritos (no hay política para editar).
alter table public.favoritos enable row level security;

drop policy if exists "favoritos: ver los propios" on public.favoritos;
create policy "favoritos: ver los propios"
  on public.favoritos for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "favoritos: crear los propios" on public.favoritos;
create policy "favoritos: crear los propios"
  on public.favoritos for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "favoritos: borrar los propios" on public.favoritos;
create policy "favoritos: borrar los propios"
  on public.favoritos for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Refuerzo: sin sesión no se puede nada, y con sesión solo ver, crear y borrar.
revoke all on public.favoritos from anon, authenticated;
grant select, insert, delete on public.favoritos to authenticated;
