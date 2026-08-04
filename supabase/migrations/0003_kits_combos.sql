-- =====================================================================
-- DIMEX · 0003 — Los kits pasan de "colegio/grado + lista" a COMBOS simples
-- =====================================================================
-- Cada kit ahora es: nombre, descripción (lo que incluye), imagen y precio.
-- Se elimina la relación con colegios y la lista estructurada de útiles.
--
-- Cómo usar: SQL Editor → New query → pega todo → Run.
-- ⚠️ Ejecutar UNA vez: reemplaza los kits de ejemplo. Si ya tuvieras kits
--    reales cargados, se perderían (aún son datos de prueba, así que ok).
-- =====================================================================

begin;

-- 1) Quitar lo que ataba los kits a colegios
drop table if exists public.kit_items cascade;
drop function if exists public.kit_esta_activo(uuid);

-- 2) Limpiar kits de ejemplo para poder reestructurar la tabla
delete from public.kits;

-- 3) Reestructurar `kits`
--    (dropear colegio_id también elimina su FK, su índice y el unique(colegio_id,slug))
alter table public.kits drop column if exists colegio_id;
alter table public.kits drop column if exists grado;
alter table public.kits drop column if exists precio_suelto;

alter table public.kits add column if not exists nombre text not null default '';
alter table public.kits add column if not exists descripcion text;
alter table public.kits add column if not exists orden int not null default 0;
alter table public.kits alter column nombre drop default;

-- El slug ahora es único a nivel global
create unique index if not exists kits_slug_key on public.kits (slug);

-- 4) Los colegios ya no se usan
drop table if exists public.colegios cascade;

-- 5) Datos de ejemplo: combos simples
insert into public.kits (slug, nombre, descripcion, precio, orden, activo) values
  ('vuelta-a-clases-preescolar', 'Kit Vuelta a Clases · Preescolar',
   'Incluye 2 cuadernos doble línea, caja de creyones · 12u, barras de plastilina, tijera punta roma, 2 barras de pegamento y cartulinas surtidas.',
   38.00, 1, true),
  ('vuelta-a-clases-primaria', 'Kit Vuelta a Clases · Primaria',
   'Incluye 6 cuadernos rayados, 2 cuadernos cuadriculados, colores · 24u, marcadores · 12u, compás y transportador, diccionario escolar, pega, tijera y sacapuntas.',
   49.00, 2, true),
  ('oficina-basico', 'Kit Oficina Básico',
   'Incluye organizador de escritorio, grapadora metálica, notas adhesivas neón, bolígrafos surtidos y resaltadores.',
   25.00, 3, true),
  ('arte-y-manualidades', 'Kit Arte y Manualidades',
   'Incluye acuarelas · 12 colores, set de pinceles · 6u, block de dibujo A4, marcadores al alcohol y plumones acuarelables.',
   32.00, 4, true),
  ('universitario', 'Kit Universitario',
   'Incluye 4 cuadernos espiral A4, bolígrafos gel, resaltadores pastel, block de notas, carpeta con ganchos y calculadora científica.',
   40.00, 5, true)
on conflict (slug) do nothing;

commit;

-- Comprobar: deberían quedar 5 kits y NO existir las tablas colegios / kit_items.
-- select count(*) from public.kits;   -- 5
