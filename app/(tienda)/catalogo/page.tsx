import type { Metadata } from "next";
import { getProductos, getCategoriasConConteo, parseOrden } from "@/lib/queries";
import CatalogoView from "@/components/CatalogoView";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Todos los productos de DIMEX: cuadernos, escritura, arte, escolar, oficina y archivo. Pedido por WhatsApp en Maracaibo.",
};

// Lee `q` (búsqueda) y `orden` de la URL, por eso se renderiza en el servidor.
export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; orden?: string }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" && sp.q.trim() ? sp.q.trim() : undefined;
  const orden = parseOrden(sp.orden);

  const [productos, categorias] = await Promise.all([
    getProductos({ search: q, orden }),
    getCategoriasConConteo(),
  ]);
  const total = categorias.reduce((n, c) => n + c.count, 0);

  return (
    <CatalogoView
      titulo={q ? `Resultados para “${q}”` : "Catálogo"}
      productos={productos}
      categorias={categorias}
      totalCount={total}
      categoriaActiva={null}
      orden={orden}
      q={q}
    />
  );
}
