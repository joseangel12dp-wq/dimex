import Link from "next/link";
import { getCategoriasAdmin } from "@/lib/admin-queries";
import ProductoForm from "@/components/admin/ProductoForm";
import { crearProducto } from "../actions";

export default async function NuevoProductoPage() {
  const categorias = await getCategoriasAdmin();

  return (
    <div>
      <Link href="/admin/productos" className="text-sm text-muted-2 mb-4 inline-block">
        ← Volver a productos
      </Link>
      <h1 className="m-0 mb-6 text-2xl font-extrabold tracking-[-.02em] text-ink">Nuevo producto</h1>
      <ProductoForm categorias={categorias} action={crearProducto} />
    </div>
  );
}
