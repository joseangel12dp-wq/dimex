"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile } from "@/lib/auth";
import type { FormState } from "@/lib/admin";
import type { Perfil } from "@/types/db";

// Verifica que quien llama sea el dueño (candado antes de usar el cliente admin).
async function soloDueno(): Promise<Perfil | null> {
  const perfil = await getSessionProfile();
  return perfil && perfil.rol === "dueno" ? perfil : null;
}

export async function crearEmpleado(_prev: FormState, formData: FormData): Promise<FormState> {
  const dueno = await soloDueno();
  if (!dueno) return { error: "Solo el dueño puede crear usuarios." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const nombre = String(formData.get("nombre") ?? "").trim() || null;
  const password = String(formData.get("password") ?? "");
  const rol = formData.get("rol") === "dueno" ? "dueno" : "empleado";

  if (!email) return { error: "El correo es obligatorio." };
  if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres." };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // puede entrar de inmediato, sin confirmar correo
  });
  if (error || !data.user) {
    return { error: error?.message ?? "No se pudo crear el usuario." };
  }

  const { error: perr } = await admin
    .from("perfiles")
    .insert({ id: data.user.id, nombre, rol, activo: true });
  if (perr) {
    // Si falla el perfil, deshacemos el usuario de acceso para no dejar huérfanos.
    await admin.auth.admin.deleteUser(data.user.id);
    return { error: perr.message };
  }

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}

export async function cambiarRolUsuario(formData: FormData): Promise<void> {
  const dueno = await soloDueno();
  if (!dueno) return;
  const id = String(formData.get("id") ?? "");
  const rol = formData.get("rol") === "dueno" ? "dueno" : "empleado";
  if (id === dueno.id) return; // no cambiar el propio rol (evita quedarse sin dueño)
  const admin = createAdminClient();
  await admin.from("perfiles").update({ rol }).eq("id", id);
  revalidatePath("/admin/usuarios");
}

export async function alternarActivoUsuario(formData: FormData): Promise<void> {
  const dueno = await soloDueno();
  if (!dueno) return;
  const id = String(formData.get("id") ?? "");
  const activo = formData.get("activo") === "true";
  if (id === dueno.id) return; // no desactivarse a sí mismo
  const admin = createAdminClient();
  await admin.from("perfiles").update({ activo }).eq("id", id);
  revalidatePath("/admin/usuarios");
}

export async function eliminarUsuario(formData: FormData): Promise<void> {
  const dueno = await soloDueno();
  if (!dueno) return;
  const id = String(formData.get("id") ?? "");
  if (id === dueno.id) return; // no eliminarse a sí mismo
  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(id); // la cascada borra también su perfil
  revalidatePath("/admin/usuarios");
}
