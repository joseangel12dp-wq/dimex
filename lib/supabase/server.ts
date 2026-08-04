import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase para el SERVIDOR (Server Components, Route Handlers,
 * Server Actions). Usa la clave pública `anon` + las cookies de sesión, de
 * modo que respeta la sesión del usuario y la RLS.
 *
 * En Next 16, `cookies()` es asíncrono, por eso esta función es async.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local"
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // En Server Components no siempre se pueden escribir cookies; se ignora
        // el error. El refresco de sesión se maneja en el middleware (Etapa 5).
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          /* llamado desde un Server Component sin respuesta editable */
        }
      },
    },
  });
}
