import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

/**
 * En Next.js 16 el "middleware" se llama `proxy` (runtime nodejs).
 * Refresca la sesión de Supabase y protege las rutas del panel `/admin/*`.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
