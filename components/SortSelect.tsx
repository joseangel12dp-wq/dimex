"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

/**
 * Selector "Ordenar por". Cambia el parámetro `orden` en la URL (conservando el
 * resto, como la búsqueda `q`), así el orden queda en un enlace compartible.
 */
export default function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const onChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const next = new URLSearchParams(params.toString());
    if (e.target.value && e.target.value !== "relevancia") next.set("orden", e.target.value);
    else next.delete("orden");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <select
      value={value}
      onChange={onChange}
      aria-label="Ordenar productos"
      className="border border-[#e3e6ea] rounded-[10px] px-[13px] py-[11px] text-[15px] bg-white text-body cursor-pointer"
    >
      <option value="relevancia">Relevancia</option>
      <option value="precio-asc">Precio: menor a mayor</option>
      <option value="precio-desc">Precio: mayor a menor</option>
      <option value="nuevos">Novedades</option>
    </select>
  );
}
