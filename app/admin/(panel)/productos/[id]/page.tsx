import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductoAdmin,
  getCategoriasAdmin,
  getImagenesProducto,
} from "@/lib/admin-queries";
import ProductoForm from "@/components/admin/ProductoForm";
import { actualizarProducto } from "../actions";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [producto, categorias, imagenes] = await Promise.all([
    getProductoAdmin(id),
    getCategoriasAdmin(),
    getImagenesProducto(id),
  ]);
  if (!producto) notFound();

  return (
    <div>
      <Link href="/admin/productos" className="text-sm text-muted-2 mb-4 inline-block">
        ← Volver a productos
      </Link>
      <h1 className="m-0 mb-6 text-2xl font-extrabold tracking-[-.02em] text-ink">Editar producto</h1>
      <ProductoForm
        categorias={categorias}
        producto={producto}
        action={actualizarProducto}
        imagenes={imagenes}
      />
    </div>
  );
}
