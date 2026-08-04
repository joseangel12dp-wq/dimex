import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase para LECTURAS PÚBLICAS (sin cookies ni sesión).
 *
 * Se usa en las páginas públicas de la tienda. Al no leer cookies, las páginas
 * pueden renderizarse de forma estática con revalidación (SSG/ISR) — más rápido
 * y mejor para SEO. La RLS aplica como usuario anónimo, así que solo devuelve
 * lo publicado.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local"
    );
  }
  return createSupabaseClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
