-- MIGRACIÓN — DIMEX 0008: inventario (código, existencia y unidad por producto)
-- Permite importar el inventario del sistema de la tienda y llevar la existencia
-- desde el panel. Idempotente: se puede re-ejecutar sin problema.

alter table public.productos add column if not exists codigo text;      -- código de barras / interno
alter table public.productos add column if not exists existencia numeric(10,2) not null default 0;
alter table public.productos add column if not exists unidad text;      -- PZA, PAQ, METRO, LAMINA…

-- Un código no se puede repetir (los productos sin código quedan en NULL y no chocan)
create unique index if not exists productos_codigo_key on public.productos(codigo);

-- Comprobar:
-- select count(*), sum(existencia) from public.productos;
