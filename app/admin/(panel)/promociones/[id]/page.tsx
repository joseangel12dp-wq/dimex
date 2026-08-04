import Link from "next/link";
import { notFound } from "next/navigation";
import { getPromocionAdmin } from "@/lib/admin-queries";
import PromocionForm from "@/components/admin/PromocionForm";
import { actualizarPromocion } from "../actions";

export default async function EditarPromocionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const promocion = await getPromocionAdmin(id);
  if (!promocion) notFound();

  return (
    <div>
      <Link href="/admin/promociones" className="text-sm text-muted-2 mb-4 inline-block">
        ← Volver a promociones
      </Link>
      <h1 className="m-0 mb-6 text-2xl font-extrabold tracking-[-.02em] text-ink">Editar promoción</h1>
      <PromocionForm promocion={promocion} action={actualizarPromocion} />
    </div>
  );
}
