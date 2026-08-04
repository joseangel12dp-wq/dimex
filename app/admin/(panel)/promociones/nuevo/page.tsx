import Link from "next/link";
import PromocionForm from "@/components/admin/PromocionForm";
import { crearPromocion } from "../actions";

export default function NuevaPromocionPage() {
  return (
    <div>
      <Link href="/admin/promociones" className="text-sm text-muted-2 mb-4 inline-block">
        ← Volver a promociones
      </Link>
      <h1 className="m-0 mb-6 text-2xl font-extrabold tracking-[-.02em] text-ink">Nueva promoción</h1>
      <PromocionForm action={crearPromocion} />
    </div>
  );
}
