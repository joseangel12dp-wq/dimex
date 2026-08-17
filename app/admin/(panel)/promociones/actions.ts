"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { slugUnico, type FormState } from "@/lib/admin";

function revalidar(slug?: string) {
  revalidatePath("/");
  revalidatePath("/admin/promociones");
  if (slug) revalidatePath(`/promocion/${slug}`);
}

// "YYYY-MM-DD" (input date) → timestamp. Inicio = 00:00; fin = 23:59:59.
function fecha(v: string, finDelDia = false): string | null {
  if (!v) return null;
  return finDelDia ? `${v}T23:59:59` : `${v}T00:00:00`;
}

function parse(formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const subtitulo = String(formData.get("subtitulo") ?? "").trim() || null;
  const imagen_url = String(formData.get("imagen_url") ?? "").trim() || null;
  const iniciaRaw = String(formData.get("inicia_en") ?? "").trim();
  const terminaRaw = String(formData.get("termina_en") ?? "").trim();
  const activa = formData.get("activa") === "on";
  // Productos seleccionados (checkboxes name="producto_ids").
  const productoIds = formData.getAll("producto_ids").map(String).filter(Boolean);
  return { titulo, subtitulo, imagen_url, iniciaRaw, terminaRaw, activa, productoIds };
}

// Reemplaza la lista de productos asociados a una promoción.
async function guardarProductos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  promocionId: string,
  productoIds: string[]
): Promise<string | null> {
  // Borrar las asociaciones previas y volver a insertarlas (simple y seguro).
  const del = await supabase.from("promocion_productos").delete().eq("promocion_id", promocionId);
  if (del.error) return del.error.message;
  if (productoIds.length === 0) return null;
  const filas = productoIds.map((producto_id, i) => ({
    promocion_id: promocionId,
    producto_id,
    orden: i,
  }));
  const ins = await supabase.from("promocion_productos").insert(filas);
  return ins.error ? ins.error.message : null;
}

export async function crearPromocion(_prev: FormState, formData: FormData): Promise<FormState> {
  const perfil = await getSessionProfile();
  if (!perfil) return { error: "Tu sesión expiró. Vuelve a entrar." };
  const d = parse(formData);
  if (!d.titulo) return { error: "El título es obligatorio." };

  const supabase = await createClient();
  const slug = await slugUnico(supabase, "promociones", slugify(d.titulo));
  const { data, error } = await supabase
    .from("promociones")
    .insert({
      titulo: d.titulo,
      slug,
      subtitulo: d.subtitulo,
      imagen_url: d.imagen_url,
      inicia_en: fecha(d.iniciaRaw) ?? new Date().toISOString(),
      termina_en: fecha(d.terminaRaw, true),
      activa: d.activa,
    })
    .select("id")
    .single();
  if (error || !data) return { error: error?.message ?? "No se pudo crear la promoción." };

  const perr = await guardarProductos(supabase, data.id, d.productoIds);
  if (perr) return { error: perr };

  revalidar(slug);
  redirect("/admin/promociones");
}

export async function actualizarPromocion(_prev: FormState, formData: FormData): Promise<FormState> {
  const perfil = await getSessionProfile();
  if (!perfil) return { error: "Tu sesión expiró. Vuelve a entrar." };
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta el identificador de la promoción." };
  const d = parse(formData);
  if (!d.titulo) return { error: "El título es obligatorio." };

  // El slug NO se cambia al editar: así la URL /promocion/[slug] no se rompe.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promociones")
    .update({
      titulo: d.titulo,
      subtitulo: d.subtitulo,
      imagen_url: d.imagen_url,
      inicia_en: fecha(d.iniciaRaw) ?? new Date().toISOString(),
      termina_en: fecha(d.terminaRaw, true),
      activa: d.activa,
    })
    .eq("id", id)
    .select("slug")
    .single();
  if (error) return { error: error.message };

  const perr = await guardarProductos(supabase, id, d.productoIds);
  if (perr) return { error: perr };

  revalidar(data?.slug);
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
  // Las asociaciones se borran solas (ON DELETE CASCADE).
  await supabase.from("promociones").delete().eq("id", id);
  revalidar();
}
