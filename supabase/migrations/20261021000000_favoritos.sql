-- Productos favoritos de cada usuario (la estrella de "Recomendar compras").
-- Ejecuta este script en Supabase: SQL Editor > New query > pegar > Run.

create table if not exists public.favoritos (
  id        uuid primary key default gen_random_uuid(),
  -- Se llena sola con el usuario que inició sesión: el navegador no puede falsificarla.
  user_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Identifica al producto (id del buscador o título normalizado): evita guardarlo dos veces.
  clave     text not null,
  titulo    text not null,
  imagen    text,
  rubro     text,
  -- Precios por tienda en el momento de guardarlo: [{ "tienda": "...", "precio": 1000, "enlace": "https://..." }]
  ofertas   jsonb not null default '[]'::jsonb,
  creado_en timestamptz not null default now(),

  constraint favoritos_unico          unique (user_id, clave),
  constraint favoritos_clave_largo    check (char_length(clave) between 1 and 200),
  constraint favoritos_titulo_largo   check (char_length(btrim(titulo)) between 1 and 200),
  constraint favoritos_ofertas_lista  check (jsonb_typeof(ofertas) = 'array' and jsonb_array_length(ofertas) <= 30)
);

comment on table public.favoritos is 'Productos que cada usuario marcó con la estrella en Recomendar compras.';

create index if not exists favoritos_usuario_fecha_idx on public.favoritos (user_id, creado_en desc);

-- Seguridad a nivel de fila: cada usuario solo ve y modifica SUS favoritos.
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
