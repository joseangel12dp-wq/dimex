-- =====================================================================
-- DIMEX · 0004 — Interruptor de precios, métodos de pago y mapa real
-- =====================================================================
-- Cómo usar: SQL Editor → New query → pega todo → Run.
-- Es idempotente (se puede re-ejecutar sin problema).
-- =====================================================================

-- 1) Interruptor global "Mostrar precios en la tienda" (por defecto: sí)
alter table public.configuracion
  add column if not exists mostrar_precios boolean not null default true;

-- 2) Nuevos métodos de pago por defecto (para instalaciones nuevas)
alter table public.configuracion
  alter column metodos_pago set default array['Pago móvil','Zelle','Punto de venta','Efectivo'];

-- 3) Actualizar la fila única (id = 1): métodos de pago + mapa real con pin
update public.configuracion set
  metodos_pago = array['Pago móvil','Zelle','Punto de venta','Efectivo'],
  mapa_embed = 'https://maps.google.com/maps?q=10.680094324205516,-71.60626154338263(Papeler%C3%ADa%20DIMEX,%20Maracaibo)&z=16&output=embed'
where id = 1;
