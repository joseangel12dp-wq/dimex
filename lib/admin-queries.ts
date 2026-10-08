import { createClient } from "@/lib/supabase/server";
import type { Categoria, Kit, Producto, Promocion } from "@/types/db";

/**
 * Lecturas para el PANEL. Usan el cliente de servidor con la sesión del usuario,
 * así que la RLS deja ver también lo inactivo/oculto (a diferencia de las
 * lecturas públicas). Solo se llaman desde el panel protegido.
 */

function normProducto(p: Producto): Producto {
  return {
    ...p,
    precio: Number(p.precio),
    precio_anterior: p.precio_anterior == null ? null : Number(p.precio_anterior),
    existencia: Number(p.existencia ?? 0),
  };
}

// Limpiamos caracteres que romperían el filtro `or` de PostgREST.
function filtroBusqueda(search: string): string | null {
  const term = search.replace(/[,()%*]/g, " ").trim();
  return term ? `nombre.ilike.%${term}%,descripcion.ilike.%${term}%,codigo.ilike.%${term}%` : null;
}

/** TODOS los productos (en tandas de 1000, el máximo que entrega Supabase por consulta). */
export async function getProductosAdmin(search?: string): Promise<Producto[]> {
  const supabase = await createClient();
  const filtro = search ? filtroBusqueda(search) : null;
  const todos: Producto[] = [];
  for (let desde = 0; ; desde += 1000) {
    let q = supabase.from("productos").select("*");
    if (filtro) q = q.or(filtro);
    const { data, error } = await q.order("nombre").order("id").range(desde, desde + 999);
    if (error) {
      console.error("getProductosAdmin:", error.message);
      return todos;
    }
    todos.push(...(data ?? []).map((p) => normProducto(p as Producto)));
    if ((data ?? []).length < 1000) return todos;
  }
}

/** Una página del listado del panel, con búsqueda y filtro visible/oculto. */
export async function getProductosAdminPagina({
  search,
  estado,
  pagina,
  porPagina,
}: {
  search?: string;
  estado?: "visibles" | "ocultos";
  pagina: number;
  porPagina: number;
}): Promise<{ productos: Producto[]; total: number }> {
  const supabase = await createClient();
  let q = supabase.from("productos").select("*", { count: "exact" });
  const filtro = search ? filtroBusqueda(search) : null;
  if (filtro) q = q.or(filtro);
  if (estado) q = q.eq("activo", estado === "visibles");
  const desde = (pagina - 1) * porPagina;
  const { data, error, count } = await q
    .order("nombre")
    .order("id")
    .range(desde, desde + porPagina - 1);
  if (error) {
    console.error("getProductosAdminPagina:", error.message);
    return { productos: [], total: 0 };
  }
  return { productos: (data ?? []).map((p) => normProducto(p as Producto)), total: count ?? 0 };
}

export async function getProductoAdmin(id: string): Promise<Producto | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("productos").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("getProductoAdmin:", error.message);
    return null;
  }
  return data ? normProducto(data as Producto) : null;
}

/** URLs de las fotos de un producto, en orden (para precargar la galería del panel). */
export async function getImagenesProducto(productoId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("producto_imagenes")
    .select("url, orden")
    .eq("producto_id", productoId)
    .order("orden");
  if (error) {
    console.error("getImagenesProducto:", error.message);
    return [];
  }
  return (data ?? []).map((r) => (r as { url: string }).url);
}

export async function getCategoriasAdmin(): Promise<Categoria[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("orden")
    .order("nombre");
  if (error) {
    console.error("getCategoriasAdmin:", error.message);
    return [];
  }
  return (data ?? []) as Categoria[];
}

export async function getCategoriaAdmin(id: string): Promise<Categoria | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categorias").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("getCategoriaAdmin:", error.message);
    return null;
  }
  return data as Categoria | null;
}

// ----- Kits -----

function normKit(k: Kit): Kit {
  return { ...k, precio: Number(k.precio) };
}

export async function getKitsAdmin(search?: string): Promise<Kit[]> {
  const supabase = await createClient();
  let q = supabase.from("kits").select("*");
  if (search) {
    const term = search.replace(/[,()%*]/g, " ").trim();
    if (term) q = q.or(`nombre.ilike.%${term}%,descripcion.ilike.%${term}%`);
  }
  const { data, error } = await q.order("orden").order("nombre");
  if (error) {
    console.error("getKitsAdmin:", error.message);
    return [];
  }
  return (data ?? []).map((k) => normKit(k as Kit));
}

export async function getKitAdmin(id: string): Promise<Kit | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("kits").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("getKitAdmin:", error.message);
    return null;
  }
  return data ? normKit(data as Kit) : null;
}

// ----- Promociones -----

export async function getPromocionesAdmin(): Promise<Promocion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promociones")
    .select("*")
    .order("inicia_en", { ascending: false });
  if (error) {
    console.error("getPromocionesAdmin:", error.message);
    return [];
  }
  return (data ?? []) as Promocion[];
}

export async function getPromocionAdmin(id: string): Promise<Promocion | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("promociones").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("getPromocionAdmin:", error.message);
    return null;
  }
  return data as Promocion | null;
}

/** IDs de los productos asociados a una promoción (para precargar el selector). */
export async function getProductoIdsDePromocion(promocionId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promocion_productos")
    .select("producto_id")
    .eq("promocion_id", promocionId)
    .order("orden");
  if (error) {
    console.error("getProductoIdsDePromocion:", error.message);
    return [];
  }
  return (data ?? []).map((r) => (r as { producto_id: string }).producto_id);
}
