"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { slugUnico, type FormState } from "@/lib/admin";

function revalidar() {
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
}

function parse(formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const orden = Number(String(formData.get("orden") ?? "0")) || 0;
  const activa = formData.get("activa") === "on";
  return { nombre, orden, activa };
}

export async function crearCategoria(_prev: FormState, formData: FormData): Promise<FormState> {
  const perfil = await getSessionProfile();
  if (!perfil) return { error: "Tu sesión expiró. Vuelve a entrar." };
  const d = parse(formData);
  if (!d.nombre) return { error: "El nombre es obligatorio." };

  const supabase = await createClient();
  const slug = await slugUnico(supabase, "categorias", slugify(d.nombre));
  const { error } = await supabase.from("categorias").insert({ ...d, slug });
  if (error) return { error: error.message };

  revalidar();
  redirect("/admin/categorias");
}

export async function actualizarCategoria(_prev: FormState, formData: FormData): Promise<FormState> {
  const perfil = await getSessionProfile();
  if (!perfil) return { error: "Tu sesión expiró. Vuelve a entrar." };
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta el identificador de la categoría." };
  const d = parse(formData);
  if (!d.nombre) return { error: "El nombre es obligatorio." };

  // No tocamos el slug al editar: así la URL /categoria/[slug] no cambia.
  const supabase = await createClient();
  const { error } = await supabase.from("categorias").update(d).eq("id", id);
  if (error) return { error: error.message };

  revalidar();
  redirect("/admin/categorias");
}

export async function alternarActivaCategoria(formData: FormData): Promise<void> {
  const perfil = await getSessionProfile();
  if (!perfil) return;
  const id = String(formData.get("id") ?? "");
  const activa = formData.get("activa") === "true";
  const supabase = await createClient();
  await supabase.from("categorias").update({ activa }).eq("id", id);
  revalidar();
}

export async function eliminarCategoria(formData: FormData): Promise<void> {
  const perfil = await getSessionProfile();
  if (!perfil || perfil.rol !== "dueno") return;
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  // Los productos de esta categoría quedan "Sin categoría" (FK ON DELETE SET NULL).
  await supabase.from("categorias").delete().eq("id", id);
  revalidar();
}
