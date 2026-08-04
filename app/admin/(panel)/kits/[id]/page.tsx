import Link from "next/link";
import { notFound } from "next/navigation";
import { getKitAdmin } from "@/lib/admin-queries";
import KitForm from "@/components/admin/KitForm";
import { actualizarKit } from "../actions";

export default async function EditarKitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kit = await getKitAdmin(id);
  if (!kit) notFound();

  return (
    <div>
      <Link href="/admin/kits" className="text-sm text-muted-2 mb-4 inline-block">
        ← Volver a kits
      </Link>
      <h1 className="m-0 mb-6 text-2xl font-extrabold tracking-[-.02em] text-ink">Editar kit</h1>
      <KitForm kit={kit} action={actualizarKit} />
    </div>
  );
}
