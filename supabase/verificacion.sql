-- =====================================================================
-- DIMEX · Verificación rápida (tras 0001, 0002 y 0003)
-- Deberías ver estos conteos:
--   categorias 6 · productos 23 · kits 5 · promociones 1
--   configuracion 1 · perfiles 1
-- (Las tablas colegios y kit_items ya no existen: se eliminaron en 0003.)
-- =====================================================================
select 'categorias'    as tabla, count(*) from public.categorias
union all select 'productos',     count(*) from public.productos
union all select 'kits',          count(*) from public.kits
union all select 'promociones',   count(*) from public.promociones
union all select 'configuracion', count(*) from public.configuracion
union all select 'perfiles',      count(*) from public.perfiles
order by tabla;

-- Comprobar que RLS está activa en todas las tablas (rowsecurity = true):
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('categorias','productos','kits','promociones','perfiles','configuracion')
order by tablename;
