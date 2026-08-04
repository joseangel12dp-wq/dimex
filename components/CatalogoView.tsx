import Link from "next/link";
import type { Categoria, Producto } from "@/types/db";
import type { OrdenProductos } from "@/lib/queries";
import { waLink } from "@/lib/whatsapp";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import SortSelect from "@/components/SortSelect";
import JsonLd from "@/components/JsonLd";
import { productosItemListLd } from "@/lib/jsonld";

type Filtro = { name: string; href: string; count: number; active: boolean };

/**
 * Vista compartida por /catalogo y /categoria/[nombre]: migas, filtros por
 * categoría (chips en móvil, barra lateral en escritorio), orden y la cuadrícula
 * de productos. Muestra un mensaje claro cuando no hay resultados (§9).
 */
export default function CatalogoView({
  titulo,
  productos,
  categorias,
  totalCount,
  categoriaActiva,
  orden,
  q,
}: {
  titulo: string;
  productos: Producto[];
  categorias: (Categoria & { count: number })[];
  totalCount: number;
  categoriaActiva: string | null;
  orden: OrdenProductos;
  q?: string;
}) {
  const filtros: Filtro[] = [
    { name: "Todos", href: "/catalogo", count: totalCount, active: categoriaActiva === null },
    ...categorias.map((c) => ({
      name: c.nombre,
      href: `/categoria/${c.slug}`,
      count: c.count,
      active: c.slug === categoriaActiva,
    })),
  ];

  const chipCls = (active: boolean) =>
    `shrink-0 whitespace-nowrap rounded-[20px] px-[15px] py-[9px] text-sm border transition-colors ${
      active ? "border-brand bg-brand text-white font-semibold" : "border-[#e7e9ec] bg-white text-[#4a5158] font-medium"
    }`;

  const sideCls = (active: boolean) =>
    `flex items-center justify-between gap-2 text-left rounded-[9px] px-3 py-2.5 text-sm border transition-colors ${
      active ? "border-brand bg-brand text-white font-semibold" : "border-[#e7e9ec] bg-white text-[#4a5158] font-medium hover:border-brand"
    }`;

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-7 pt-[30px] pb-12">
      {productos.length > 0 && <JsonLd data={productosItemListLd(productos, titulo)} />}

      {/* Migas de pan */}
      <nav className="text-sm text-muted-2 mb-4" aria-label="Ruta">
        <Link href="/" className="text-muted-2">
          Inicio
        </Link>{" "}
        · <span className="text-[#4a5158] font-semibold">{titulo}</span>
      </nav>

      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h1 className="m-0 text-[30px] font-extrabold tracking-[-.025em]">{titulo}</h1>
        <span className="tnum text-sm text-muted-2 shrink-0">{productos.length} productos</span>
      </div>

      {/* Chips de categoría (móvil) */}
      <div className="sm:hidden noscroll flex gap-[9px] overflow-x-auto pb-3.5 mb-2">
        {filtros.map((f) => (
          <Link key={f.href} href={f.href} className={chipCls(f.active)}>
            {f.name}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[224px_1fr] gap-[34px] items-start">
        {/* Barra lateral (escritorio) */}
        <aside className="hidden sm:flex flex-col gap-[26px] sticky top-[118px]">
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold tracking-[.07em] uppercase text-muted-2">Categorías</span>
            {filtros.map((f) => (
              <Link key={f.href} href={f.href} className={sideCls(f.active)}>
                <span>{f.name}</span>
                <span className="tnum opacity-60 font-semibold">{f.count}</span>
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold tracking-[.07em] uppercase text-muted-2">Ordenar por</span>
            <SortSelect value={orden} />
          </div>
        </aside>

        {/* Cuadrícula de productos */}
        <div>
          {productos.length === 0 ? (
            <div className="border border-line rounded-2xl p-10 text-center">
              <h2 className="m-0 text-lg font-bold text-ink">No encontramos productos</h2>
              <p className="m-0 mt-2 text-muted text-[15px]">
                {q
                  ? `No hay resultados para “${q}”.`
                  : "No hay productos en esta categoría por ahora."}{" "}
                Escríbenos por WhatsApp y te ayudamos a encontrarlo.
              </p>
              <a
                href={waLink(
                  q
                    ? `Hola DIMEX, estoy buscando: ${q}`
                    : "Hola DIMEX, estoy buscando un producto."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 bg-brand text-white rounded-[10px] px-6 py-3 text-[15px] font-semibold"
              >
                Escríbenos
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-[22px]">
              {productos.map((p, i) => (
                <Reveal key={p.id} delay={i % 6}>
                  <ProductCard p={p} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
