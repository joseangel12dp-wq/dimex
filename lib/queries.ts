import { createPublicClient } from "@/lib/supabase/public";
import type {
  Categoria,
  Configuracion,
  Kit,
  Producto,
  Promocion,
} from "@/types/db";

/**
 * Capa de lectura de datos (para Server Components: SSR/SSG).
 * Todas usan el cliente de servidor con la clave `anon`, así que la RLS
 * garantiza que el público solo vea lo que está activo/publicado.
 *
 * Ante un error de Supabase, devuelven un valor seguro (lista vacía o null)
 * y registran el problema, para que la tienda nunca se caiga (§9).
 */

// Los NUMERIC de Postgres pueden llegar como texto; los normalizamos a número.
function normProducto(p: Producto): Producto {
  return {
    ...p,
    precio: Number(p.precio),
    precio_anterior: p.precio_anterior == null ? null : Number(p.precio_anterior),
  };
}
function normKit(k: Kit): Kit {
  return { ...k, precio: Number(k.precio) };
}

// ---------------------------------------------------------------------
// Configuración y promociones
// ---------------------------------------------------------------------

export async function getConfiguracion(): Promise<Configuracion | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("configuracion")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    console.error("getConfiguracion:", error.message);
    return null;
  }
  return data as Configuracion | null;
}

/** La promoción vigente: activa y con la fecha de hoy dentro de su rango. */
export async function getPromocionActiva(): Promise<Promocion | null> {
  const supabase = createPublicClient();
  const ahora = new Date().toISOString();
  const { data, error } = await supabase
    .from("promociones")
    .select("*")
    .eq("activa", true)
    .lte("inicia_en", ahora)
    .or(`termina_en.is.null,termina_en.gte.${ahora}`)
    .order("inicia_en", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("getPromocionActiva:", error.message);
    return null;
  }
  return data as Promocion | null;
}

// ---------------------------------------------------------------------
// Categorías
// ---------------------------------------------------------------------

export async function getCategorias(): Promise<Categoria[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .eq("activa", true)
    .order("orden");
  if (error) {
    console.error("getCategorias:", error.message);
    return [];
  }
  return (data ?? []) as Categoria[];
}

export async function getCategoriaBySlug(slug: string): Promise<Categoria | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .eq("slug", slug)
    .eq("activa", true)
    .maybeSingle();
  if (error) {
    console.error("getCategoriaBySlug:", error.message);
    return null;
  }
  return data as Categoria | null;
}

/** Categorías activas con el número de productos activos en cada una (para los filtros). */
export async function getCategoriasConConteo(): Promise<(Categoria & { count: number })[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categorias")
    .select("*, productos(count)")
    .eq("activa", true)
    .eq("productos.activo", true)
    .order("orden");
  if (error) {
    console.error("getCategoriasConConteo:", error.message);
    return [];
  }
  return (data ?? []).map((row) => {
    const { productos, ...cat } = row as Categoria & { productos: { count: number }[] };
    return { ...cat, count: productos?.[0]?.count ?? 0 };
  });
}

// ---------------------------------------------------------------------
// Productos
// ---------------------------------------------------------------------

export type OrdenProductos = "relevancia" | "precio-asc" | "precio-desc" | "nuevos";

const ORDENES: OrdenProductos[] = ["relevancia", "precio-asc", "precio-desc", "nuevos"];

/** Valida el parámetro de orden de la URL; por defecto "relevancia". */
export function parseOrden(v: unknown): OrdenProductos {
  return typeof v === "string" && (ORDENES as string[]).includes(v)
    ? (v as OrdenProductos)
    : "relevancia";
}

export async function getProductos(opts: {
  categoriaSlug?: string;
  destacados?: boolean;
  search?: string;
  orden?: OrdenProductos;
} = {}): Promise<Producto[]> {
  const supabase = createPublicClient();
  let q = supabase.from("productos").select("*").eq("activo", true);

  if (opts.categoriaSlug) {
    const cat = await getCategoriaBySlug(opts.categoriaSlug);
    if (!cat) return [];
    q = q.eq("categoria_id", cat.id);
  }
  if (opts.destacados) q = q.eq("destacado", true);
  if (opts.search) {
    // Limpiamos caracteres que romperían el filtro `or` de PostgREST.
    const term = opts.search.replace(/[,()%*]/g, " ").trim();
    if (term) q = q.or(`nombre.ilike.%${term}%,descripcion.ilike.%${term}%`);
  }

  switch (opts.orden) {
    case "precio-asc":
      q = q.order("precio", { ascending: true });
      break;
    case "precio-desc":
      q = q.order("precio", { ascending: false });
      break;
    case "nuevos":
      q = q.order("es_nuevo", { ascending: false }).order("created_at", { ascending: false });
      break;
    default:
      q = q.order("destacado", { ascending: false }).order("nombre");
  }

  const { data, error } = await q;
  if (error) {
    console.error("getProductos:", error.message);
    return [];
  }
  return (data ?? []).map((p: Producto) => normProducto(p));
}

// ---------------------------------------------------------------------
// Kits (combos)
// ---------------------------------------------------------------------

/** Todos los kits activos, ordenados (para /kits e inicio). */
export async function getKits(): Promise<Kit[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("kits")
    .select("*")
    .eq("activo", true)
    .order("orden")
    .order("nombre");
  if (error) {
    console.error("getKits:", error.message);
    return [];
  }
  return (data ?? []).map((k) => normKit(k as Kit));
}

/** Detalle de un kit por su slug (para /kits/[slug]). */
export async function getKitBySlug(slug: string): Promise<Kit | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("kits")
    .select("*")
    .eq("slug", slug)
    .eq("activo", true)
    .maybeSingle();
  if (error) {
    console.error("getKitBySlug:", error.message);
    return null;
  }
  return data ? normKit(data as Kit) : null;
}

/** Slugs de kits activos (para generar rutas estáticas). */
export async function getKitSlugs(): Promise<{ slug: string }[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("kits")
    .select("slug")
    .eq("activo", true);
  if (error) {
    console.error("getKitSlugs:", error.message);
    return [];
  }
  return (data ?? []) as { slug: string }[];
}
