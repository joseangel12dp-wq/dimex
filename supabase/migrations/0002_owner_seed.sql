-- =====================================================================
-- DIMEX · Etapa 1 — Marcar al DUEÑO
-- =====================================================================
-- Requisito: primero crea tu usuario en Supabase → Authentication → Users
-- → "Add user" (tu correo + contraseña).
--
-- Luego: reemplaza el correo de abajo por el TUYO y ejecuta este script
-- en el SQL Editor. Esto crea tu fila en `perfiles` con rol 'dueno'.
--
-- (Este INSERT lo corres tú desde el SQL Editor, que tiene privilegios de
--  administrador; por eso no lo bloquea la RLS aunque todavía no haya dueño.)
-- =====================================================================

insert into public.perfiles (id, nombre, rol, activo)
select id, 'Dueño', 'dueno', true
from auth.users
where email = 'REEMPLAZA_TU_CORREO@ejemplo.com'   -- 👈 pon aquí tu correo
on conflict (id) do update
  set rol = 'dueno', activo = true;

-- Comprobar que quedó:
select p.rol, p.activo, u.email
from public.perfiles p
join auth.users u on u.id = p.id;
