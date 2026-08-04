"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { slugUnico, type FormState } from "@/lib/admin";

function revalidar(slug?: string) {
  revalidatePath("/");
  revalidatePath("/kits");
  revalidatePath("/admin/kits");
  if (slug) revalidatePath(`/kits/${slug}`);
}

function parse(formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim() || null;
  const precio = Number(String(formData.get("precio") ?? "").replace(",", "."));
  const orden = Number(String(formData.get("orden") ?? "0")) || 0;
  const activo = formData.get("activo") === "on";
  const imagen_url = String(formData.get("imagen_url") ?? "").trim() || null;
  return { nombre, descripcion, precio, orden, activo, imagen_url };
}

function validar(d: ReturnType<typeof parse>): string | null {
  if (!d.nombre) return "El nombre es obligatorio.";
  if (!Number.isFinite(d.precio) || d.precio < 0) return "El precio no es válido.";
  return null;
}

export async function crearKit(_prev: FormState, formData: FormData): Promise<FormState> {
  const perfil = await getSessionProfile();
  if (!perfil) return { error: "Tu sesión expiró. Vuelve a entrar." };
  const d = parse(formData);
  const err = validar(d);
  if (err) return { error: err };

  const supabase = await createClient();
  const slug = await slugUnico(supabase, "kits", slugify(d.nombre));
  const { error } = await supabase.from("kits").insert({ ...d, slug });
  if (error) return { error: error.message };

  revalidar(slug);
  redirect("/admin/kits");
}

export async function actualizarKit(_prev: FormState, formData: FormData): Promise<FormState> {
  const perfil = await getSessionProfile();
  if (!perfil) return { error: "Tu sesión expiró. Vuelve a entrar." };
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta el identificador del kit." };
  const d = parse(formData);
  const err = validar(d);
  if (err) return { error: err };

  const supabase = await createClient();
  const slug = await slugUnico(supabase, "kits", slugify(d.nombre), id);
  const { error } = await supabase.from("kits").update({ ...d, slug }).eq("id", id);
  if (error) return { error: error.message };

  revalidar(slug);
  redirect("/admin/kits");
}

export async function alternarActivoKit(formData: FormData): Promise<void> {
  const perfil = await getSessionProfile();
  if (!perfil) return;
  const id = String(formData.get("id") ?? "");
  const activo = formData.get("activo") === "true";
  const supabase = await createClient();
  await supabase.from("kits").update({ activo }).eq("id", id);
  revalidar();
}

export async function eliminarKit(formData: FormData): Promise<void> {
  const perfil = await getSessionProfile();
  if (!perfil || perfil.rol !== "dueno") return;
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("kits").delete().eq("id", id);
  revalidar();
}
