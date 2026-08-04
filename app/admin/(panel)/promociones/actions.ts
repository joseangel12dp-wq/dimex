"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import type { FormState } from "@/lib/admin";

function revalidar() {
  revalidatePath("/");
  revalidatePath("/admin/promociones");
}

// "YYYY-MM-DD" (input date) → timestamp. Inicio = 00:00; fin = 23:59:59.
function fecha(v: string, finDelDia = false): string | null {
  if (!v) return null;
  return finDelDia ? `${v}T23:59:59` : `${v}T00:00:00`;
}

function parse(formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const subtitulo = String(formData.get("subtitulo") ?? "").trim() || null;
  const enlace = String(formData.get("enlace") ?? "").trim() || null;
  const imagen_url = String(formData.get("imagen_url") ?? "").trim() || null;
  const iniciaRaw = String(formData.get("inicia_en") ?? "").trim();
  const terminaRaw = String(formData.get("termina_en") ?? "").trim();
  const activa = formData.get("activa") === "on";
  return { titulo, subtitulo, enlace, imagen_url, iniciaRaw, terminaRaw, activa };
}

export async function crearPromocion(_prev: FormState, formData: FormData): Promise<FormState> {
  const perfil = await getSessionProfile();
  if (!perfil) return { error: "Tu sesión expiró. Vuelve a entrar." };
  const d = parse(formData);
  if (!d.titulo) return { error: "El título es obligatorio." };

  const supabase = await createClient();
  const { error } = await supabase.from("promociones").insert({
    titulo: d.titulo,
    subtitulo: d.subtitulo,
    enlace: d.enlace,
    imagen_url: d.imagen_url,
    inicia_en: fecha(d.iniciaRaw) ?? new Date().toISOString(),
    termina_en: fecha(d.terminaRaw, true),
    activa: d.activa,
  });
  if (error) return { error: error.message };

  revalidar();
  redirect("/admin/promociones");
}

export async function actualizarPromocion(_prev: FormState, formData: FormData): Promise<FormState> {
  const perfil = await getSessionProfile();
  if (!perfil) return { error: "Tu sesión expiró. Vuelve a entrar." };
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta el identificador de la promoción." };
  const d = parse(formData);
  if (!d.titulo) return { error: "El título es obligatorio." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("promociones")
    .update({
      titulo: d.titulo,
      subtitulo: d.subtitulo,
      enlace: d.enlace,
      imagen_url: d.imagen_url,
      inicia_en: fecha(d.iniciaRaw) ?? new Date().toISOString(),
      termina_en: fecha(d.terminaRaw, true),
      activa: d.activa,
    })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidar();
  redirect("/admin/promociones");
}

export async function alternarActivaPromocion(formData: FormData): Promise<void> {
  const perfil = await getSessionProfile();
  if (!perfil) return;
  const id = String(formData.get("id") ?? "");
  const activa = formData.get("activa") === "true";
  const supabase = await createClient();
  await supabase.from("promociones").update({ activa }).eq("id", id);
  revalidar();
}

export async function eliminarPromocion(formData: FormData): Promise<void> {
  const perfil = await getSessionProfile();
  if (!perfil || perfil.rol !== "dueno") return;
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("promociones").delete().eq("id", id);
  revalidar();
}
