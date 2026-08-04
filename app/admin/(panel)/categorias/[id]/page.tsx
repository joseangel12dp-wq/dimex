import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoriaAdmin } from "@/lib/admin-queries";
import CategoriaForm from "@/components/admin/CategoriaForm";
import { actualizarCategoria } from "../actions";

export default async function EditarCategoriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categoria = await getCategoriaAdmin(id);
  if (!categoria) notFound();

  return (
    <div>
      <Link href="/admin/categorias" className="text-sm text-muted-2 mb-4 inline-block">
        ← Volver a categorías
      </Link>
      <h1 className="m-0 mb-6 text-2xl font-extrabold tracking-[-.02em] text-ink">Editar categoría</h1>
      <CategoriaForm categoria={categoria} action={actualizarCategoria} />
    </div>
  );
}
