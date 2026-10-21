-- Nuevas categorías de gasto (Tecnología, Ropa y calzado, Educación y papelería, Mascotas)
-- y el campo opcional "tienda" para saber dónde se hizo la compra.
-- Ejecuta este script en Supabase: SQL Editor > New query > pegar > Run.

-- 1) Ampliar las categorías permitidas (los gastos que ya tienes siguen siendo válidos).
alter table public.gastos drop constraint if exists gastos_categoria_valida;
alter table public.gastos add constraint gastos_categoria_valida check (
  categoria in (
    'vivienda', 'alimentacion', 'transporte', 'servicios', 'salud',
    'tecnologia', 'ropa', 'educacion', 'mascotas', 'ocio', 'otros'
  )
);

-- 2) Tienda donde se compró (opcional).
alter table public.gastos add column if not exists tienda text;

alter table public.gastos drop constraint if exists gastos_tienda_largo;
alter table public.gastos add constraint gastos_tienda_largo check (
  tienda is null or char_length(btrim(tienda)) between 1 and 80
);
