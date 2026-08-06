import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getKitBySlug, getKitSlugs, getConfiguracion } from "@/lib/queries";
import { money } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";
import MediaImagen from "@/components/MediaImagen";
import AgregarKitButton from "@/components/AgregarKitButton";
import JsonLd from "@/components/JsonLd";
import { kitProductLd } from "@/lib/jsonld";
import { WhatsAppIcon } from "@/components/icons";

export const revalidate = 300;

type Params = { slug: string };

// Rutas estáticas de todos los kits activos (SSG).
export async function generateStaticParams() {
  return await getKitSlugs();
}

// SEO por kit: título y descripción únicos.
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const kit = await getKitBySlug(slug);
  if (!kit) return { title: "Kit no encontrado" };

  const descripcion =
    kit.descripcion ??
    `${kit.nombre}: combo de papelería listo para pedir por WhatsApp en Maracaibo.`;
  return {
    title: kit.nombre,
    description: descripcion,
    openGraph: { title: `${kit.nombre} | DIMEX`, description: descripcion },
  };
}

export default async function KitDetallePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const [kit, config] = await Promise.all([getKitBySlug(slug), getConfiguracion()]);
  if (!kit) notFound();
  const mostrarPrecios = config?.mostrar_precios ?? true;

  const waHref = waLink(`Hola DIMEX, me interesa el kit: ${kit.nombre}`);

  return (
    <>
      <JsonLd data={kitProductLd(kit, mostrarPrecios)} />

      <section className="max-w-[1080px] mx-auto px-4 sm:px-7 pt-[30px] pb-[120px] sm:pb-12">
        {/* Migas de pan */}
        <nav className="text-sm text-muted-2 mb-[18px]" aria-label="Ruta">
          <Link href="/" className="text-muted-2">
            Inicio
          </Link>{" "}
          ·{" "}
          <Link href="/kits" className="text-muted-2">
            Kits
          </Link>{" "}
          · <span className="text-[#4a5158] font-semibold">{kit.nombre}</span>
        </nav>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[34px] items-start">
          {/* Imagen */}
          <div className="relative aspect-[3/2] rounded-2xl border border-line overflow-hidden bg-surface sm:sticky sm:top-[110px]">
            <MediaImagen
              src={kit.imagen_url}
              alt={kit.nombre}
              label="foto kit · 3:2"
              sizes="(max-width: 640px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Detalle */}
          <div className="flex flex-col gap-[18px]">
            <h1 className="m-0 text-[32px] font-extrabold tracking-[-.025em]">{kit.nombre}</h1>

            {mostrarPrecios && (
              <div className="flex items-baseline gap-3">
                <span className="tnum text-[34px] font-extrabold text-brand-ink tracking-[-.02em]">
                  {money(kit.precio)}
                </span>
              </div>
            )}

            {kit.descripcion && (
              <div className="border border-line rounded-[14px] px-[22px] py-5">
                <div className="text-xs font-bold tracking-[.06em] uppercase text-muted-2 mb-3">
                  Qué incluye
                </div>
                <p className="m-0 text-[15px] text-[#2a2f36] leading-[1.6]">{kit.descripcion}</p>
              </div>
            )}

            <div className="flex gap-3 flex-wrap">
              <AgregarKitButton
                id={kit.id}
                name={kit.nombre}
                price={kit.precio}
                className="flex-1 min-w-[180px] bg-brand text-white rounded-[11px] py-[15px] text-[15px] font-bold cursor-pointer"
              >
                Agregar al carrito
              </AgregarKitButton>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[180px] bg-wa text-white rounded-[11px] py-[15px] text-[15px] font-bold inline-flex items-center justify-center gap-2.5"
              >
                <WhatsAppIcon size={19} />
                Pedir por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Barra fija (móvil) */}
      <div className="sm:hidden fixed left-0 right-0 bottom-0 z-[45] bg-white border-t border-line-2 px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-8px_24px_-18px_rgba(0,0,0,.4)]">
        <div className="flex flex-col">
          <span className="text-xs text-muted-2 line-clamp-1 max-w-[150px]">{kit.nombre}</span>
          {mostrarPrecios && (
            <span className="tnum text-xl font-extrabold text-brand-ink">{money(kit.precio)}</span>
          )}
        </div>
        <AgregarKitButton
          id={kit.id}
          name={kit.nombre}
          price={kit.precio}
          className="flex-1 max-w-[220px] h-[52px] bg-brand text-white rounded-xl text-base font-bold cursor-pointer"
        >
          Agregar
        </AgregarKitButton>
      </div>
    </>
  );
}
