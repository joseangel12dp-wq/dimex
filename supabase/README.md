# Supabase — DIMEX

SQL de la base de datos. Se ejecuta en **Supabase → SQL Editor** (o con la CLI de Supabase en el futuro).

## Orden de ejecución

1. **`migrations/0001_dimex_schema.sql`** — crea las 8 tablas, los triggers de `updated_at`,
   las funciones de rol, la **RLS** en todas las tablas, el bucket de Storage `dimex-media`
   y los **datos de ejemplo**. Es idempotente (se puede re-ejecutar).
2. Crea tu usuario en **Authentication → Users**.
3. **`migrations/0002_owner_seed.sql`** — reemplaza el correo por el tuyo y ejecútalo para
   quedar con rol `dueno`.
4. **`verificacion.sql`** — comprueba conteos y que la RLS quedó activa.

## Seguridad (resumen)

- RLS activa en todas las tablas.
- Catálogo: lectura pública solo de lo `activo`; el staff activo ve todo. Escritura: staff
  activo. Borrado definitivo: solo `dueno`.
- `configuracion`: lectura pública; solo `dueno` edita.
- `perfiles`: cada quien ve el suyo; el `dueno` gestiona a todos.
- Storage `dimex-media`: lectura pública, escritura solo staff.
- Las funciones `es_dueno()`, `es_staff_activo()` y `kit_esta_activo()` son `SECURITY DEFINER`
  para evitar recursión de RLS al consultar `perfiles`/`kits`.
