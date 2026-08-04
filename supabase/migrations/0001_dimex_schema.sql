-- =====================================================================
-- DIMEX · Etapa 1 — Esquema de base de datos, seguridad (RLS) y datos
-- =====================================================================
-- Cómo usar: Supabase → SQL Editor → New query → pega TODO este archivo → Run.
-- Es idempotente: puedes volver a ejecutarlo sin duplicar datos.
--
-- Cubre: 8 tablas (§4 del anexo), RLS en todas (§5/§6), bucket de Storage (§6/§7)
-- y datos de ejemplo tomados del prototipo.
--
-- Después de esto: ejecuta 0002_owner_seed.sql (con tu correo) para marcarte
-- como dueño, y crea tu usuario en Authentication → Users.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1) TABLAS
-- ---------------------------------------------------------------------

-- Categorías (para /categoria/[slug] y filtros del catálogo)
create table if not exists public.categorias (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,       -- para la URL, ej. 'escritura'
  nombre      text not null,              -- visible, ej. 'Escritura'
  orden       int  not null default 0,    -- orden de aparición
  activa      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Productos del catálogo
create table if not exists public.productos (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  nombre          text not null,
  descripcion     text,                                 -- corta, ~2 líneas
  categoria_id    uuid references public.categorias(id) on delete set null,
  precio          numeric(10,2) not null default 0,     -- en USD
  precio_anterior numeric(10,2),                         -- si existe → rebaja (rojo)
  es_nuevo        boolean not null default false,        -- badge "NUEVO"
  destacado       boolean not null default false,        -- aparece en "Más vendidos"
  imagen_url      text,                                  -- ruta en Storage
  activo          boolean not null default true,         -- si false, no se muestra
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_productos_categoria on public.productos(categoria_id);

-- Colegios (agrupan a los kits)
create table if not exists public.colegios (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,       -- ej. 'bellas-artes'
  nombre      text not null,              -- ej. 'U.E. Bellas Artes'
  orden       int  not null default 0,
  activo      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Kits escolares (para /kits/[colegio]/[grado])
create table if not exists public.kits (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null,           -- ej. 'preescolar'; único por colegio
  colegio_id     uuid not null references public.colegios(id) on delete cascade,
  grado          text not null,           -- ej. 'Preescolar', '3er grado'
  precio         numeric(10,2) not null default 0,   -- precio del kit armado
  precio_suelto  numeric(10,2) not null default 0,   -- suma por separado (para el ahorro)
  imagen_url     text,                    -- 3:2
  activo         boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (colegio_id, slug)
);
create index if not exists idx_kits_colegio on public.kits(colegio_id);
-- Nota: el ahorro = precio_suelto - precio. No se almacena, se calcula.

-- Ítems que incluye cada kit (texto libre; vínculo a producto opcional)
create table if not exists public.kit_items (
  id           uuid primary key default gen_random_uuid(),
  kit_id       uuid not null references public.kits(id) on delete cascade,
  texto        text not null,             -- ej. '2 cuadernos doble línea'
  producto_id  uuid references public.productos(id) on delete set null,
  orden        int  not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (kit_id, orden)
);
create index if not exists idx_kit_items_kit on public.kit_items(kit_id);

-- Promociones (banner del hero y ofertas, con vigencia por fechas)
create table if not exists public.promociones (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  subtitulo   text,
  imagen_url  text,
  enlace      text,                        -- a dónde lleva el banner
  inicia_en   timestamptz not null default now(),
  termina_en  timestamptz,
  activa      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
-- Promo vigente: activa = true y ahora entre inicia_en y termina_en (o sin fin).

-- Perfiles del panel (vinculados a Supabase Auth)
create table if not exists public.perfiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nombre      text,
  rol         text not null default 'empleado' check (rol in ('dueno','empleado')),
  activo      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Configuración del negocio (fila única, id = 1)
create table if not exists public.configuracion (
  id            int primary key default 1 check (id = 1),
  whatsapp      text not null default '584246049228',
  direccion     text,
  horario       text,
  metodos_pago  text[] not null default array['Pago móvil','Efectivo $','Zelle','USDT','Transferencia'],
  instagram_url text,
  tiktok_url    text,
  mapa_embed    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2) updated_at automático
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'categorias','productos','colegios','kits','kit_items',
    'promociones','perfiles','configuracion'
  ] loop
    execute format('drop trigger if exists trg_updated_at on public.%I;', t);
    execute format(
      'create trigger trg_updated_at before update on public.%I
       for each row execute function public.set_updated_at();', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- 3) FUNCIONES DE ROL (SECURITY DEFINER para evitar recursión de RLS)
-- ---------------------------------------------------------------------
-- ¿El usuario actual es dueño activo?
create or replace function public.es_dueno()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol = 'dueno' and activo = true
  );
$$;

-- ¿El usuario actual es staff activo (dueño o empleado)?
create or replace function public.es_staff_activo()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid() and activo = true
  );
$$;

-- ¿Un kit está activo? (para las políticas públicas de kit_items)
create or replace function public.kit_esta_activo(kid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.kits where id = kid and activo = true);
$$;

-- ---------------------------------------------------------------------
-- 4) RLS — activada en TODAS las tablas (§6)
-- ---------------------------------------------------------------------
alter table public.categorias    enable row level security;
alter table public.productos     enable row level security;
alter table public.colegios      enable row level security;
alter table public.kits          enable row level security;
alter table public.kit_items     enable row level security;
alter table public.promociones   enable row level security;
alter table public.perfiles      enable row level security;
alter table public.configuracion enable row level security;

-- --- Catálogo: SELECT público solo lo activo; el staff activo ve todo.
--     INSERT/UPDATE: staff activo. DELETE: solo dueño.

-- categorias (columna de actividad: activa)
drop policy if exists cat_select on public.categorias;
create policy cat_select on public.categorias for select
  using (activa = true or public.es_staff_activo());
drop policy if exists cat_write on public.categorias;
create policy cat_write on public.categorias for insert to authenticated
  with check (public.es_staff_activo());
drop policy if exists cat_update on public.categorias;
create policy cat_update on public.categorias for update to authenticated
  using (public.es_staff_activo()) with check (public.es_staff_activo());
drop policy if exists cat_delete on public.categorias;
create policy cat_delete on public.categorias for delete to authenticated
  using (public.es_dueno());

-- productos (activo)
drop policy if exists prod_select on public.productos;
create policy prod_select on public.productos for select
  using (activo = true or public.es_staff_activo());
drop policy if exists prod_write on public.productos;
create policy prod_write on public.productos for insert to authenticated
  with check (public.es_staff_activo());
drop policy if exists prod_update on public.productos;
create policy prod_update on public.productos for update to authenticated
  using (public.es_staff_activo()) with check (public.es_staff_activo());
drop policy if exists prod_delete on public.productos;
create policy prod_delete on public.productos for delete to authenticated
  using (public.es_dueno());

-- colegios (activo)
drop policy if exists col_select on public.colegios;
create policy col_select on public.colegios for select
  using (activo = true or public.es_staff_activo());
drop policy if exists col_write on public.colegios;
create policy col_write on public.colegios for insert to authenticated
  with check (public.es_staff_activo());
drop policy if exists col_update on public.colegios;
create policy col_update on public.colegios for update to authenticated
  using (public.es_staff_activo()) with check (public.es_staff_activo());
drop policy if exists col_delete on public.colegios;
create policy col_delete on public.colegios for delete to authenticated
  using (public.es_dueno());

-- kits (activo)
drop policy if exists kit_select on public.kits;
create policy kit_select on public.kits for select
  using (activo = true or public.es_staff_activo());
drop policy if exists kit_write on public.kits;
create policy kit_write on public.kits for insert to authenticated
  with check (public.es_staff_activo());
drop policy if exists kit_update on public.kits;
create policy kit_update on public.kits for update to authenticated
  using (public.es_staff_activo()) with check (public.es_staff_activo());
drop policy if exists kit_delete on public.kits;
create policy kit_delete on public.kits for delete to authenticated
  using (public.es_dueno());

-- kit_items (visibilidad pública según el kit padre)
drop policy if exists ki_select on public.kit_items;
create policy ki_select on public.kit_items for select
  using (public.es_staff_activo() or public.kit_esta_activo(kit_id));
drop policy if exists ki_write on public.kit_items;
create policy ki_write on public.kit_items for insert to authenticated
  with check (public.es_staff_activo());
drop policy if exists ki_update on public.kit_items;
create policy ki_update on public.kit_items for update to authenticated
  using (public.es_staff_activo()) with check (public.es_staff_activo());
drop policy if exists ki_delete on public.kit_items;
create policy ki_delete on public.kit_items for delete to authenticated
  using (public.es_dueno());

-- promociones (activa)
drop policy if exists promo_select on public.promociones;
create policy promo_select on public.promociones for select
  using (activa = true or public.es_staff_activo());
drop policy if exists promo_write on public.promociones;
create policy promo_write on public.promociones for insert to authenticated
  with check (public.es_staff_activo());
drop policy if exists promo_update on public.promociones;
create policy promo_update on public.promociones for update to authenticated
  using (public.es_staff_activo()) with check (public.es_staff_activo());
drop policy if exists promo_delete on public.promociones;
create policy promo_delete on public.promociones for delete to authenticated
  using (public.es_dueno());

-- perfiles: cada quien ve el suyo; el dueño ve/gestiona todos.
drop policy if exists perf_select on public.perfiles;
create policy perf_select on public.perfiles for select to authenticated
  using (id = auth.uid() or public.es_dueno());
drop policy if exists perf_insert on public.perfiles;
create policy perf_insert on public.perfiles for insert to authenticated
  with check (public.es_dueno());
drop policy if exists perf_update on public.perfiles;
create policy perf_update on public.perfiles for update to authenticated
  using (public.es_dueno()) with check (public.es_dueno());
drop policy if exists perf_delete on public.perfiles;
create policy perf_delete on public.perfiles for delete to authenticated
  using (public.es_dueno());

-- configuracion: lectura pública (la tienda necesita WhatsApp y pagos); solo dueño edita.
drop policy if exists conf_select on public.configuracion;
create policy conf_select on public.configuracion for select using (true);
drop policy if exists conf_update on public.configuracion;
create policy conf_update on public.configuracion for update to authenticated
  using (public.es_dueno()) with check (public.es_dueno());

-- ---------------------------------------------------------------------
-- 5) STORAGE — bucket público de lectura; escritura solo staff (§6/§7)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('dimex-media', 'dimex-media', true)
on conflict (id) do nothing;

drop policy if exists dimex_media_read on storage.objects;
create policy dimex_media_read on storage.objects for select
  using (bucket_id = 'dimex-media');
drop policy if exists dimex_media_insert on storage.objects;
create policy dimex_media_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'dimex-media' and public.es_staff_activo());
drop policy if exists dimex_media_update on storage.objects;
create policy dimex_media_update on storage.objects for update to authenticated
  using (bucket_id = 'dimex-media' and public.es_staff_activo());
drop policy if exists dimex_media_delete on storage.objects;
create policy dimex_media_delete on storage.objects for delete to authenticated
  using (bucket_id = 'dimex-media' and public.es_staff_activo());

-- ---------------------------------------------------------------------
-- 6) DATOS DE EJEMPLO (del prototipo)
-- ---------------------------------------------------------------------

-- Categorías
insert into public.categorias (slug, nombre, orden, activa) values
  ('cuadernos', 'Cuadernos y libretas',     1, true),
  ('escritura', 'Escritura',                 2, true),
  ('arte',      'Arte y dibujo',             3, true),
  ('escolar',   'Escolar',                   4, true),
  ('oficina',   'Oficina',                   5, true),
  ('archivo',   'Organización y archivo',    6, true)
on conflict (slug) do nothing;

-- Productos (categoria por slug; BEST = destacado; oldPrice = precio_anterior)
insert into public.productos (slug, nombre, descripcion, categoria_id, precio, precio_anterior, es_nuevo, destacado, activo)
select v.slug, v.nombre, v.descripcion, c.id, v.precio, v.precio_anterior, v.es_nuevo, v.destacado, true
from (values
  ('cuaderno-a5-punteado',        'Cuaderno A5 punteado',           'Tapa dura, 160 páginas, papel 100g.',            'cuadernos', 12.00, null::numeric, false, true),
  ('libreta-bolsillo-a6',         'Libreta bolsillo A6',            'Rayado, 96 hojas, tapa flexible.',               'cuadernos',  5.00, null,          false, false),
  ('cuaderno-espiral-a4',         'Cuaderno espiral A4',            'Cuadriculado, 200 hojas.',                       'cuadernos',  8.50, null,          false, false),
  ('bullet-journal-punteado',     'Bullet journal punteado',        'Tapa dura, papel 120g, cinta marcadora.',        'cuadernos', 14.00, null,          true,  false),
  ('block-notas-adhesivas',       'Block notas adhesivas',          'Colores neón, 400 hojas.',                       'cuadernos',  3.50, null,          false, false),
  ('set-boligrafos-gel-12u',      'Set bolígrafos gel · 12u',       'Colores surtidos, punta 0.5 mm.',                'escritura',  9.50, 13.00,         false, true),
  ('plumones-acuarelables-24u',   'Plumones acuarelables · 24u',    'Doble punta, base agua, lavables.',              'escritura', 18.00, null,          true,  true),
  ('resaltadores-pastel-6u',      'Resaltadores pastel · 6u',       'Tinta suave, secado rápido.',                    'escritura',  6.50, null,          false, false),
  ('lapices-grafito-hb-12u',      'Lápices grafito HB · 12u',       'Madera certificada, mina resistente.',           'escritura',  4.00, null,          false, false),
  ('rotuladores-punta-fina-4u',   'Rotuladores punta fina · 4u',    'Trazo 0.4 mm, tinta a prueba de agua.',          'escritura',  7.50, null,          false, false),
  ('acuarelas-12-colores',        'Acuarelas · 12 colores',         'Pastillas pigmentadas + pincel.',                'arte',      15.00, null,          false, false),
  ('set-de-pinceles-6u',          'Set de pinceles · 6u',           'Pelo sintético, mango de madera.',               'arte',      11.00, null,          false, false),
  ('block-de-dibujo-a4',          'Block de dibujo A4',             'Papel 180g, 40 hojas, grano medio.',             'arte',       9.00, null,          false, false),
  ('marcadores-al-alcohol-12u',   'Marcadores al alcohol · 12u',    'Doble punta, base alcohol, mezclables.',         'arte',      22.00, 27.00,         true,  true),
  ('estuche-doble-cierre',        'Estuche doble cierre',           'Tela resistente, dos compartimentos.',           'escolar',    8.00, null,          false, false),
  ('set-geometria-4-piezas',      'Set geometría · 4 piezas',       'Regla, escuadra, cartabón y transportador.',     'escolar',    5.50, null,          false, false),
  ('tijeras-punta-roma',          'Tijeras punta roma',             'Seguras para niños, acero inoxidable.',          'escolar',    3.00, null,          false, false),
  ('organizador-de-escritorio',   'Organizador de escritorio',      'Metal, varios compartimentos.',                  'oficina',   18.00, null,          false, false),
  ('grapadora-metalica',          'Grapadora metálica',             'Hasta 25 hojas, incluye grapas.',                'oficina',    9.50, null,          false, false),
  ('notas-adhesivas-neon-5-blocs','Notas adhesivas neón · 5 blocs', '76×76 mm, 100 hojas por bloc.',                  'oficina',    3.50, null,          false, false),
  ('archivador-de-palanca-a4',    'Archivador de palanca A4',       'Lomo 7 cm, rado metálico.',                      'archivo',    6.00, null,          false, false),
  ('folders-colgantes-10u',       'Fólders colgantes · 10u',        'Con pestaña e inserto etiquetable.',             'archivo',   12.00, null,          false, false),
  ('caja-de-archivo',             'Caja de archivo',                'Cartón reforzado, tapa incluida.',               'archivo',    7.00, null,          false, false)
) as v(slug, nombre, descripcion, cat_slug, precio, precio_anterior, es_nuevo, destacado)
join public.categorias c on c.slug = v.cat_slug
on conflict (slug) do nothing;

-- Colegios
insert into public.colegios (slug, nombre, orden, activo) values
  ('bellas-artes', 'U.E. Bellas Artes',      1, true),
  ('libertador',   'Colegio Libertador',     2, true),
  ('santa-maria',  'Instituto Santa María',  3, true)
on conflict (slug) do nothing;

-- Kits (por colegio)
insert into public.kits (slug, colegio_id, grado, precio, precio_suelto, activo)
select v.slug, c.id, v.grado, v.precio, v.suelto, true
from (values
  ('preescolar', 'bellas-artes', 'Preescolar', 38.00, 47.00),
  ('1er-grado',  'bellas-artes', '1er grado',  44.00, 55.00),
  ('2do-grado',  'bellas-artes', '2do grado',  46.00, 58.00),
  ('3er-grado',  'libertador',   '3er grado',  49.00, 62.00),
  ('4to-grado',  'libertador',   '4to grado',  52.00, 66.00),
  ('5to-grado',  'santa-maria',  '5to grado',  55.00, 70.00)
) as v(slug, colegio_slug, grado, precio, suelto)
join public.colegios c on c.slug = v.colegio_slug
on conflict (colegio_id, slug) do nothing;

-- Ítems de cada kit (JOIN de una lista (colegio, kit, texto, orden) con las tablas)
insert into public.kit_items (kit_id, texto, orden)
select k.id, v.texto, v.orden
from (values
  ('bellas-artes','preescolar', '2 cuadernos doble línea',    1),
  ('bellas-artes','preescolar', 'Caja de creyones · 12u',     2),
  ('bellas-artes','preescolar', 'Barras de plastilina',       3),
  ('bellas-artes','preescolar', 'Tijera punta roma',          4),
  ('bellas-artes','preescolar', '2 barras de pegamento',      5),
  ('bellas-artes','preescolar', 'Cartulinas surtidas',        6),

  ('bellas-artes','1er-grado', '4 cuadernos rayados',         1),
  ('bellas-artes','1er-grado', 'Lápices HB · 12u',            2),
  ('bellas-artes','1er-grado', 'Borrador y sacapuntas',       3),
  ('bellas-artes','1er-grado', 'Colores · 12u',               4),
  ('bellas-artes','1er-grado', 'Regla 30 cm',                 5),
  ('bellas-artes','1er-grado', '2 barras de pegamento',       6),
  ('bellas-artes','1er-grado', 'Cuaderno de dibujo',          7),

  ('bellas-artes','2do-grado', '5 cuadernos rayados',         1),
  ('bellas-artes','2do-grado', 'Cuaderno cuadriculado',       2),
  ('bellas-artes','2do-grado', 'Lápices HB · 12u',            3),
  ('bellas-artes','2do-grado', 'Colores · 24u',               4),
  ('bellas-artes','2do-grado', 'Marcadores · 12u',            5),
  ('bellas-artes','2do-grado', 'Regla y escuadra',            6),
  ('bellas-artes','2do-grado', 'Pega y tijera',               7),

  ('libertador','3er-grado', '6 cuadernos rayados',           1),
  ('libertador','3er-grado', '2 cuadernos cuadriculados',     2),
  ('libertador','3er-grado', 'Colores · 24u',                 3),
  ('libertador','3er-grado', 'Marcadores · 12u',              4),
  ('libertador','3er-grado', 'Compás y transportador',        5),
  ('libertador','3er-grado', 'Diccionario escolar',           6),
  ('libertador','3er-grado', 'Pega, tijera y sacapuntas',     7),

  ('libertador','4to-grado', '7 cuadernos',                   1),
  ('libertador','4to-grado', 'Juego de geometría',            2),
  ('libertador','4to-grado', 'Colores · 36u',                 3),
  ('libertador','4to-grado', 'Bolígrafos surtidos',           4),
  ('libertador','4to-grado', 'Resaltadores · 4u',             5),
  ('libertador','4to-grado', 'Carpeta con ganchos',           6),
  ('libertador','4to-grado', 'Calculadora básica',            7),

  ('santa-maria','5to-grado', '8 cuadernos',                  1),
  ('santa-maria','5to-grado', 'Juego de geometría completo',  2),
  ('santa-maria','5to-grado', 'Colores y marcadores',         3),
  ('santa-maria','5to-grado', 'Bolígrafos y resaltadores',    4),
  ('santa-maria','5to-grado', 'Carpetas y separadores',       5),
  ('santa-maria','5to-grado', 'Calculadora científica',       6)
) as v(colegio_slug, kit_slug, texto, orden)
join public.colegios c on c.slug = v.colegio_slug
join public.kits k on k.colegio_id = c.id and k.slug = v.kit_slug
on conflict (kit_id, orden) do nothing;

-- Configuración (fila única)
insert into public.configuracion (id, whatsapp, direccion, horario, metodos_pago, instagram_url, tiktok_url, mapa_embed)
values (
  1,
  '584246049228',
  'Av. 5 de Julio, Maracaibo, Zulia',                       -- TODO: dirección exacta
  'Lun a Sáb · 8:30 – 18:00',                               -- TODO: horario real
  array['Pago móvil','Efectivo $','Zelle','USDT','Transferencia'],
  null,                                                     -- TODO: Instagram
  null,                                                     -- TODO: TikTok
  'https://maps.google.com/maps?q=Maracaibo,%20Zulia,%20Venezuela&z=13&output=embed'
)
on conflict (id) do nothing;

-- Promoción inicial (alimenta el hero; el texto por defecto es 'Vuelta a clases')
insert into public.promociones (titulo, subtitulo, enlace, inicia_en, termina_en, activa)
select 'Vuelta a clases', 'Todo lo que escribe tu día, en un solo lugar.', '/kits', now(), null, true
where not exists (select 1 from public.promociones);

-- =====================================================================
-- FIN. Ahora ejecuta 0002_owner_seed.sql con tu correo para ser dueño.
-- =====================================================================
