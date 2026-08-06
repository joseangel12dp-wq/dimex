import Link from "next/link";
import type { Kit } from "@/types/db";
import { money } from "@/lib/format";
import MediaImagen from "@/components/MediaImagen";

/** Tarjeta de kit (combo). Usada en el inicio y en el listado /kits. */
export default function KitCard({
  kit,
  mostrarPrecios = true,
}: {
  kit: Kit;
  mostrarPrecios?: boolean;
}) {
  const href = `/kits/${kit.slug}`;

  return (
    <div className="bg-white border border-line rounded-2xl overflow-hidden flex flex-col transition-[transform,box-shadow] duration-[350ms] hover:-translate-y-[5px] hover:shadow-[0_18px_40px_-22px_rgba(20,30,45,.35)]">
      <div className="relative aspect-[3/2] bg-surface overflow-hidden">
        <MediaImagen
          src={kit.imagen_url}
          alt={kit.nombre}
          label="foto kit · 3:2"
          sizes="(max-width: 640px) 100vw, 33vw"
        />
      </div>

      <div className="px-[22px] py-5 flex flex-col gap-2 flex-1">
        <h3 className="m-0 text-xl font-extrabold tracking-[-.015em]">{kit.nombre}</h3>
        {kit.descripcion && (
          <p className="m-0 text-[15px] text-muted leading-[1.45] line-clamp-2 flex-1">
            {kit.descripcion}
          </p>
        )}
        {mostrarPrecios && (
          <div className="flex items-baseline gap-2.5 mt-0.5">
            <span className="tnum text-[23px] font-extrabold text-brand-ink tracking-[-.02em]">
              {money(kit.precio)}
            </span>
          </div>
        )}
        <Link
          href={href}
          className="mt-2 bg-brand text-white rounded-[10px] py-[13px] text-center text-[15px] font-semibold hover:opacity-95"
        >
          Ver kit
        </Link>
      </div>
    </div>
  );
}
