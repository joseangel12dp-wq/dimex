"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { slugUnico, type FormState } from "@/lib/admin";

// Refresca la tienda pública y el listado del panel tras un cambio.
function revalidar() {
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/admin/productos");
}

// Lee y valida los campos del formulario de producto.
function parse(formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim() || null;
  const categoria_id = String(formData.get("categoria_id") ?? "") || null;
  const precio = Number(String(formData.get("precio") ?? "").replace(",", "."));
  const anteriorRaw = String(formData.get("precio_anterior") ?? "").replace(",", ".").trim();
  const precio_anterior = anteriorRaw ? Number(anteriorRaw) : null;
  const es_nuevo = formData.get("es_nuevo") === "on";
  const destacado = formData.get("destacado") === "on";
  const activo = formData.get("activo") === "on";
  const codigo = String(formData.get("codigo") ?? "").trim() || null;
  const existencia = Number(String(formData.get("existencia") ?? "0").replace(",", ".") || 0);
  const unidad = String(formData.get("unidad") ?? "").trim() || null;
  // Lista de fotos en orden (galería). La primera es la portada.
  const imagenes = formData.getAll("imagen_urls").map(String).filter(Boolean);
  const imagen_url = imagenes[0] ?? null; // portada = primera foto
  return {
    nombre,
    descripcion,
    categoria_id,
    precio,
    precio_anterior,
    es_nuevo,
    destacado,
    activo,
    codigo,
    existencia,
    unidad,
    imagen_url,
    imagenes,
  };
}

// Reescribe la galería de un producto con la lista ordenada de URLs.
async function guardarImagenes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productoId: string,
  urls: string[]
): Promise<string | null> {
  const del = await supabase.from("producto_imagenes").delete().eq("producto_id", productoId);
  if (del.error) return del.error.message;
  if (urls.length === 0) return null;
  const filas = urls.map((url, i) => ({ producto_id: productoId, url, orden: i }));
  const ins = await supabase.from("producto_imagenes").insert(filas);
  return ins.error ? ins.error.message : null;
}

function validar(d: ReturnType<typeof parse>): string | null {
  if (!d.nombre) return "El nombre es obligatorio.";
  if (!Number.isFinite(d.precio) || d.precio < 0) return "El precio no es válido.";
  if (d.precio_anterior !== null && (!Number.isFinite(d.precio_anterior) || d.precio_anterior < 0))
    return "El precio anterior no es válido.";
  if (!Number.isFinite(d.existencia) || d.existencia < 0) return "La existencia no es válida.";
  return null;
}

export async function crearProducto(_prev: FormState, formData: FormData): Promise<FormState> {
  const perfil = await getSessionProfile();
  if (!perfil) return { error: "Tu sesión expiró. Vuelve a entrar." };

  const d = parse(formData);
  const err = validar(d);
  if (err) return { error: err };

  const { imagenes, ...campos } = d; // `imagenes` no es columna de productos
  const supabase = await createClient();
  const slug = await slugUnico(supabase, "productos", slugify(d.nombre));
  const { data, error } = await supabase
    .from("productos")
    .insert({ ...campos, slug })
    .select("id")
    .single();
  if (error || !data) return { error: error?.message ?? "No se pudo crear el producto." };

  const imgErr = await guardarImagenes(supabase, data.id, imagenes);
  if (imgErr) return { error: imgErr };

  revalidar();
  redirect("/admin/productos");
}

export async function actualizarProducto(_prev: FormState, formData: FormData): Promise<FormState> {
  const perfil = await getSessionProfile();
  if (!perfil) return { error: "Tu sesión expiró. Vuelve a entrar." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Falta el identificador del producto." };

  const d = parse(formData);
  const err = validar(d);
  if (err) return { error: err };

  const { imagenes, ...campos } = d; // `imagenes` no es columna de productos
  const supabase = await createClient();
  const slug = await slugUnico(supabase, "productos", slugify(d.nombre), id);
  const { error } = await supabase.from("productos").update({ ...campos, slug }).eq("id", id);
  if (error) return { error: error.message };

  const imgErr = await guardarImagenes(supabase, id, imagenes);
  if (imgErr) return { error: imgErr };

  revalidar();
  redirect("/admin/productos");
}

// Ocultar/mostrar (empleados y dueño). Llamada directa desde un <form>.
export async function alternarActivoProducto(formData: FormData): Promise<void> {
  const perfil = await getSessionProfile();
  if (!perfil) return;
  const id = String(formData.get("id") ?? "");
  const activo = formData.get("activo") === "true";
  const supabase = await createClient();
  await supabase.from("productos").update({ activo }).eq("id", id);
  revalidar();
}

// Eliminar definitivamente: SOLO dueño (la RLS también lo exige).
export async function eliminarProducto(formData: FormData): Promise<void> {
  const perfil = await getSessionProfile();
  if (!perfil || perfil.rol !== "dueno") return;
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("productos").delete().eq("id", id);
  revalidar();
}
