import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCategoriaBySlug,
  getCategoriasConConteo,
  getProductos,
  getConfiguracion,
  parseOrden,
} from "@/lib/queries";
import CatalogoView from "@/components/CatalogoView";

type Params = { nombre: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { nombre } = await params;
  const cat = await getCategoriaBySlug(nombre);
  if (!cat) return { title: "Categoría no encontrada" };
  const descripcion = `Productos de ${cat.nombre} en DIMEX. Pedido por WhatsApp, retiro en tienda o delivery en Maracaibo.`;
  return {
    title: cat.nombre,
    description: descripcion,
    openGraph: { title: `${cat.nombre} | DIMEX`, description: descripcion },
  };
}

export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ orden?: string }>;
}) {
  const { nombre } = await params;
  const sp = await searchParams;
  const cat = await getCategoriaBySlug(nombre);
  if (!cat) notFound();

  const orden = parseOrden(sp.orden);
  const [productos, categorias, config] = await Promise.all([
    getProductos({ categoriaSlug: nombre, orden }),
    getCategoriasConConteo(),
    getConfiguracion(),
  ]);
  const total = categorias.reduce((n, c) => n + c.count, 0);

  return (
    <CatalogoView
      titulo={cat.nombre}
      productos={productos}
      categorias={categorias}
      totalCount={total}
      categoriaActiva={cat.slug}
      orden={orden}
      mostrarPrecios={config?.mostrar_precios ?? true}
    />
  );
}
