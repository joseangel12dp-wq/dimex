import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Perfil } from "@/types/db";

/**
 * Perfil del usuario con sesión, o null si no hay sesión o el perfil está
 * inactivo. La RLS permite a cada usuario leer su propio perfil.
 */
export async function getSessionProfile(): Promise<Perfil | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const perfil = data as Perfil | null;
  return perfil && perfil.activo ? perfil : null;
}

/**
 * Exige sesión de DUEÑO. Redirige al login si no hay sesión, o al panel si es
 * empleado. Para las páginas solo-dueño: /admin/usuarios y /admin/configuracion.
 */
export async function requireDueno(): Promise<Perfil> {
  const perfil = await getSessionProfile();
  if (!perfil) redirect("/admin");
  if (perfil.rol !== "dueno") redirect("/admin/productos");
  return perfil;
}
