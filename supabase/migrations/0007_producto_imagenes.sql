-- MIGRACIÓN — DIMEX 0007: varias fotos por producto
-- Crea la tabla producto_imagenes (fotos + orden) y copia la foto actual de
-- cada producto como su primera foto (portada). La columna productos.imagen_url
-- se mantiene como la PORTADA, así el resto de la tienda no cambia.
-- Idempotente: se puede re-ejecutar sin duplicar.

-- 1) Tabla de fotos del producto
create table if not exists public.producto_imagenes (
  id           uuid primary key default gen_random_uuid(),
  producto_id  uuid not null references public.productos(id) on delete cascade,
  url          text not null,
  orden        int  not null default 0,
  created_at   timestamptz not null default now(),
  unique (producto_id, url)
);
create index if not exists idx_prod_img_producto on public.producto_imagenes(producto_id);

-- 2) RLS: lectura pública; escritura solo staff activo (mismo patrón del catálogo)
alter table public.producto_imagenes enable row level security;

drop policy if exists pi_select on public.producto_imagenes;
create policy pi_select on public.producto_imagenes for select using (true);

drop policy if exists pi_insert on public.producto_imagenes;
create policy pi_insert on public.producto_imagenes for insert to authenticated
  with check (public.es_staff_activo());

drop policy if exists pi_update on public.producto_imagenes;
create policy pi_update on public.producto_imagenes for update to authenticated
  using (public.es_staff_activo()) with check (public.es_staff_activo());

drop policy if exists pi_delete on public.producto_imagenes;
create policy pi_delete on public.producto_imagenes for delete to authenticated
  using (public.es_staff_activo());

-- 3) Copiar la foto actual de cada producto como su primera foto (portada)
insert into public.producto_imagenes (producto_id, url, orden)
select id, imagen_url, 0
from public.productos
where imagen_url is not null and imagen_url <> ''
on conflict (producto_id, url) do nothing;

-- Comprobar:
-- select count(*) from public.producto_imagenes;
