import "server-only"; // ⛔ falla el build si esto se importa desde el navegador
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase con la clave `service_role` (SECRETA).
 * Salta la RLS, así que SOLO se usa en el servidor y para operaciones
 * privilegiadas del panel (p. ej. invitar/quitar empleados en la Etapa 6).
 *
 * El import "server-only" garantiza que esta clave NUNCA llegue al navegador.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno del servidor"
    );
  }
  return createSupabaseClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
