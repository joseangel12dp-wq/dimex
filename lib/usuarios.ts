import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile } from "@/lib/auth";
import type { Perfil, Rol } from "@/types/db";

export type UsuarioAdmin = {
  id: string;
  nombre: string | null;
  rol: Rol;
  activo: boolean;
  email: string | null;
};

/**
 * Lista de usuarios del panel con su correo. Usa el cliente admin (service_role)
 * porque el correo vive en `auth.users`. Solo el dueño obtiene resultados.
 */
export async function getUsuariosAdmin(): Promise<UsuarioAdmin[]> {
  const perfil = await getSessionProfile();
  if (!perfil || perfil.rol !== "dueno") return [];

  const admin = createAdminClient();
  const [{ data: perfiles }, { data: lista }] = await Promise.all([
    admin.from("perfiles").select("*"),
    admin.auth.admin.listUsers(),
  ]);

  const emailPorId = new Map((lista?.users ?? []).map((u) => [u.id, u.email ?? null]));

  return ((perfiles ?? []) as Perfil[])
    .map((p) => ({
      id: p.id,
      nombre: p.nombre,
      rol: p.rol,
      activo: p.activo,
      email: emailPorId.get(p.id) ?? null,
    }))
    .sort((a, b) =>
      a.rol === b.rol
        ? (a.nombre ?? a.email ?? "").localeCompare(b.nombre ?? b.email ?? "")
        : a.rol === "dueno"
          ? -1
          : 1
    );
}
