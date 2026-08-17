import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPromocionBySlug,
  getPromocionSlugs,
  getConfiguracion,
} from "@/lib/queries";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import MediaImagen from "@/components/MediaImagen";
import JsonLd from "@/components/JsonLd";
import { productosItemListLd } from "@/lib/jsonld";
import { waLink, WA_MENSAJES } from "@/lib/whatsapp";

export const revalidate = 300;

type Params = { slug: string };

// Rutas estáticas de las promociones activas (SSG).
export async function generateStaticParams() {
  return await getPromocionSlugs();
}

// SEO por promoción: título y descripción únicos + Open Graph.
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPromocionBySlug(slug);
  if (!data) return { title: "Promoción no encontrada" };

  const { promocion } = data;
  const titulo = promocion.titulo;
  const descripcion =
    promocion.subtitulo ??
    `Colección ${promocion.titulo} en DIMEX: productos seleccionados listos para pedir por WhatsApp en Maracaibo.`;
  return {
    title: titulo,
    description: descripcion,
    openGraph: {
      title: `${titulo} | DIMEX`,
      description: descripcion,
      images: promocion.imagen_url ? [{ url: promocion.imagen_url }] : undefined,
    },
  };
}

export default async function PromocionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const [data, config] = await Promise.all([getPromocionBySlug(slug), getConfiguracion()]);
  if (!data) notFound();

  const { promocion, productos } = data;
  const mostrarPrecios = config?.mostrar_precios ?? true;

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-7 pt-[30px] pb-12">
      {productos.length > 0 && (
        <JsonLd data={productosItemListLd(productos, promocion.titulo, mostrarPrecios)} />
      )}

      {/* Migas de pan */}
      <nav className="text-sm text-muted-2 mb-4" aria-label="Ruta">
        <Link href="/" className="text-muted-2">
          Inicio
        </Link>{" "}
        · <span className="text-[#4a5158] font-semibold">{promocion.titulo}</span>
      </nav>

      {/* Banner de la promoción */}
      <div className="rounded-[18px] overflow-hidden bg-surface relative aspect-[8/5] sm:aspect-auto sm:h-[280px] mb-8">
        <MediaImagen
          src={promocion.imagen_url}
          alt={promocion.titulo}
          label="imagen de la promoción · 8:5"
          sizes="(max-width: 1280px) 100vw, 1280px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent flex items-end">
          <div className="p-6 sm:p-10">
            <h1 className="m-0 text-white text-[30px] sm:text-[42px] font-extrabold tracking-[-.025em] text-balance">
              {promocion.titulo}
            </h1>
            {promocion.subtitulo && (
              <p className="m-0 mt-2 text-white/90 text-[15px] sm:text-base max-w-[600px]">
                {promocion.subtitulo}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Cuadrícula de productos de la colección */}
      {productos.length === 0 ? (
        <div className="border border-line rounded-2xl p-10 text-center">
          <p className="m-0 text-muted text-[15px]">
            Esta promoción todavía no tiene productos. Escríbenos por WhatsApp y te ayudamos.
          </p>
          <a
            href={waLink(WA_MENSAJES.consultaGeneral)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 bg-brand text-white rounded-[10px] px-6 py-3 text-[15px] font-semibold"
          >
            Escríbenos
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-[22px]">
          {productos.map((p, i) => (
            <Reveal key={p.id} delay={i % 6}>
              <ProductCard p={p} mostrarPrecios={mostrarPrecios} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
