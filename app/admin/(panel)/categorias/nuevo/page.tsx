import Link from "next/link";
import CategoriaForm from "@/components/admin/CategoriaForm";
import { crearCategoria } from "../actions";

export default function NuevaCategoriaPage() {
  return (
    <div>
      <Link href="/admin/categorias" className="text-sm text-muted-2 mb-4 inline-block">
        ← Volver a categorías
      </Link>
      <h1 className="m-0 mb-6 text-2xl font-extrabold tracking-[-.02em] text-ink">Nueva categoría</h1>
      <CategoriaForm action={crearCategoria} />
    </div>
  );
}
