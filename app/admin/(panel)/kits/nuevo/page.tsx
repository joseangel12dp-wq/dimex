import Link from "next/link";
import KitForm from "@/components/admin/KitForm";
import { crearKit } from "../actions";

export default function NuevoKitPage() {
  return (
    <div>
      <Link href="/admin/kits" className="text-sm text-muted-2 mb-4 inline-block">
        ← Volver a kits
      </Link>
      <h1 className="m-0 mb-6 text-2xl font-extrabold tracking-[-.02em] text-ink">Nuevo kit</h1>
      <KitForm action={crearKit} />
    </div>
  );
}
