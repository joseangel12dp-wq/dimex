import type { createClient } from "@/lib/supabase/server";

/** Estado que devuelven las acciones de formulario del panel. */
export type FormState = { error?: string; ok?: boolean };

type SB = Awaited<ReturnType<typeof createClient>>;

/**
 * Devuelve un slug libre en la tabla dada a partir de uno base. Si ya existe,
 * agrega -2, -3, … (ignorando la propia fila al editar).
 */
export async function slugUnico(
  supabase: SB,
  tabla: "productos" | "kits" | "categorias",
  base: string,
  excludeId?: string
): Promise<string> {
  let slug = base || "item";
  for (let n = 2; ; n++) {
    const { data } = await supabase.from(tabla).select("id").eq("slug", slug);
    const ocupado = (data ?? []).some((r: { id: string }) => r.id !== excludeId);
    if (!ocupado) return slug;
    slug = `${base}-${n}`;
  }
}
