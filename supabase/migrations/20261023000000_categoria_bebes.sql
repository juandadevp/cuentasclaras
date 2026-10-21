-- Nueva categoría de gasto: "Bebés y maternidad" (pañales, fórmula, biberones…).
-- Ejecuta este script en Supabase: SQL Editor > New query > pegar > Run.

alter table public.gastos drop constraint if exists gastos_categoria_valida;
alter table public.gastos add constraint gastos_categoria_valida check (
  categoria in (
    'vivienda', 'alimentacion', 'transporte', 'servicios', 'salud',
    'tecnologia', 'ropa', 'educacion', 'mascotas', 'bebes', 'ocio', 'otros'
  )
);
