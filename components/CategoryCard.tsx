import Link from "next/link";
import type { Categoria } from "@/types/db";
import MediaImagen from "@/components/MediaImagen";

/** Tarjeta de categoría (grid "Comprar por categoría" del inicio). */
export default function CategoryCard({ c }: { c: Categoria }) {
  return (
    <Link href={`/categoria/${c.slug}`} className="flex flex-col gap-3 text-body">
      <div className="relative aspect-square rounded-xl bg-[#f5f6f8] overflow-hidden transition-[transform,box-shadow] duration-[350ms] hover:-translate-y-1 hover:shadow-[0_12px_26px_-14px_rgba(20,30,45,.28)]">
        <MediaImagen
          src={c.imagen_url}
          alt={c.nombre}
          label={c.slug}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
        />
      </div>
      <span className="text-[14.5px] font-semibold text-center leading-[1.25]">{c.nombre}</span>
    </Link>
  );
}
