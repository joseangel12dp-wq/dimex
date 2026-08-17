-- =====================================================================
-- DIMEX · 0005 — Promociones como colecciones de productos (con página propia)
-- =====================================================================
-- Cada promoción tiene un slug (para su URL /promocion/[slug]) y una lista de
-- productos asociados manualmente (tabla promocion_productos).
-- El descuento sigue en cada producto; la promoción solo agrupa.
--
-- Cómo usar: SQL Editor → New query → pega todo → Run. Es idempotente.
-- =====================================================================

-- 1) slug en promociones (para la URL)
alter table public.promociones add column if not exists slug text;

-- Rellenar slugs de las promos existentes a partir del título
update public.promociones
set slug = trim(both '-' from regexp_replace(
  lower(translate(titulo,
    'áàäâãéèëêíìïîóòöôõúùüûñÁÀÄÂÃÉÈËÊÍÌÏÎÓÒÖÔÕÚÙÜÛÑ',
    'aaaaaeeeeiiiiooooouuuunAAAAAEEEEIIIIOOOOOUUUUN')),
  '[^a-z0-9]+', '-', 'g'))
where slug is null or slug = '';

-- Evitar slugs duplicados (por si dos títulos generan el mismo)
update public.promociones p
set slug = p.slug || '-' || substr(p.id::text, 1, 4)
where exists (
  select 1 from public.promociones q where q.slug = p.slug and q.id <> p.id
);

-- Cualquier caso raro sin slug → uno derivado del id
update public.promociones
set slug = 'promocion-' || substr(id::text, 1, 8)
where slug is null or slug = '';

create unique index if not exists promociones_slug_key on public.promociones (slug);

-- 2) Tabla de enlace: qué productos pertenecen a cada promoción
create table if not exists public.promocion_productos (
  id            uuid primary key default gen_random_uuid(),
  promocion_id  uuid not null references public.promociones(id) on delete cascade,
  producto_id   uuid not null references public.productos(id) on delete cascade,
  orden         int not null default 0,
  created_at    timestamptz not null default now(),
  unique (promocion_id, producto_id)
);
create index if not exists idx_promo_prod_promo on public.promocion_productos(promocion_id);
create index if not exists idx_promo_prod_prod on public.promocion_productos(producto_id);

-- 3) RLS: lectura pública de las asociaciones; escritura solo staff activo.
--    (La visibilidad real de cada producto la controla la RLS de `productos`.)
alter table public.promocion_productos enable row level security;

drop policy if exists pp_select on public.promocion_productos;
create policy pp_select on public.promocion_productos for select using (true);

drop policy if exists pp_insert on public.promocion_productos;
create policy pp_insert on public.promocion_productos for insert to authenticated
  with check (public.es_staff_activo());

drop policy if exists pp_update on public.promocion_productos;
create policy pp_update on public.promocion_productos for update to authenticated
  using (public.es_staff_activo()) with check (public.es_staff_activo());

drop policy if exists pp_delete on public.promocion_productos;
create policy pp_delete on public.promocion_productos for delete to authenticated
  using (public.es_staff_activo());

-- Comprobar:
-- select slug from public.promociones;                 -- cada promo con su slug
-- select count(*) from public.promocion_productos;     -- 0 al inicio
