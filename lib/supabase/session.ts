import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Refresca la sesión de Supabase en cada request al panel y protege las rutas
 * privadas. Lo usa `proxy.ts` (en Next 16, el "middleware" se llama proxy).
 *
 * El chequeo de ROL (dueño/empleado) NO va aquí: se hace en el layout del panel
 * (con una consulta a `perfiles`). Aquí solo verificamos que haya sesión.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const esLogin = path === "/admin";

  // Panel protegido: sin sesión y fuera del login → al login.
  if (!user && !esLogin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin";
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
