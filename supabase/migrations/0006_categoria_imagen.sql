-- MIGRACIÓN — DIMEX 0006: imagen de categoría
-- Agrega la columna para guardar la URL de la foto de cada categoría.
-- (La foto se sube desde el panel y va al bucket dimex-media, como los productos.)
-- Idempotente: se puede re-ejecutar sin problema.

alter table public.categorias
  add column if not exists imagen_url text;
