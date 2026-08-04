import Link from "next/link";
import type { Categoria } from "@/types/db";

/** Tarjeta de categoría (grid "Comprar por categoría" del inicio). */
export default function CategoryCard({ c }: { c: Categoria }) {
  return (
    <Link href={`/categoria/${c.slug}`} className="flex flex-col gap-3 text-body">
      <div className="relative aspect-square rounded-xl bg-[#f5f6f8] overflow-hidden flex items-center justify-center p-3.5 transition-[transform,box-shadow] duration-[350ms] hover:-translate-y-1 hover:shadow-[0_12px_26px_-14px_rgba(20,30,45,.28)] [background-image:repeating-linear-gradient(45deg,#eceef1_0_9px,#f5f6f8_9px_18px)]">
        <span className="[font-family:Archivo,monospace] text-[10.5px] text-[#9aa3ad] text-center">
          {c.slug}
        </span>
      </div>
      <span className="text-[14.5px] font-semibold text-center leading-[1.25]">{c.nombre}</span>
    </Link>
  );
}
