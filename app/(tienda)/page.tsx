import Link from "next/link";
import {
  getPromocionActiva,
  getKits,
  getProductos,
  getCategorias,
  getConfiguracion,
} from "@/lib/queries";
import { SITE } from "@/lib/site";
import { waLink, WA_MENSAJES } from "@/lib/whatsapp";
import Reveal from "@/components/Reveal";
import MediaImagen from "@/components/MediaImagen";
import KitCard from "@/components/KitCard";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import JsonLd from "@/components/JsonLd";
import { localBusinessLd } from "@/lib/jsonld";
import { StoreIcon, TruckIcon, ChatIcon, PinIcon, WhatsAppIcon } from "@/components/icons";

// SSG con revalidación (§3): la página se regenera cada 5 minutos.
export const revalidate = 300;

const verMas = "text-sm font-semibold border-b border-current pb-px shrink-0";
const h2Cls = "m-0 text-[26px] font-extrabold tracking-[-.02em]";
const sectionCls = "max-w-[1280px] mx-auto px-4 sm:px-7 pt-14 pb-3";

export default async function HomePage() {
  // Traemos todo en paralelo.
  const [promo, kits, destacados, categorias, config] = await Promise.all([
    getPromocionActiva(),
    getKits(),
    getProductos({ destacados: true }),
    getCategorias(),
    getConfiguracion(),
  ]);

  // Primeros kits (combos) para destacar en el inicio.
  const featured = kits.slice(0, 3);

  const heroEyebrow = promo?.titulo ?? "Vuelta a clases";
  const heroTitulo = promo?.subtitulo ?? "Todo lo que escribe tu día, en un solo lugar.";
  const heroHref = promo?.enlace ?? "/kits";

  const direccion = config?.direccion ?? SITE.direccion;
  const horario = config?.horario ?? SITE.horario;
  const mapaEmbed = config?.mapa_embed ?? SITE.mapaEmbed;

  const beneficios = [
    { icon: <StoreIcon />, title: "Retiro en tienda", desc: "Recoge tu pedido el mismo día." },
    { icon: <TruckIcon />, title: "Delivery en Zulia", desc: "Coordinamos el envío por WhatsApp." },
    { icon: <ChatIcon />, title: "Pedido por WhatsApp", desc: "Sin pasarela, sin comisiones." },
  ];

  return (
    <>
      <JsonLd data={localBusinessLd(config)} />

      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-7 pt-[34px]">
        <div className="rounded-[18px] overflow-hidden bg-surface grid grid-cols-1 sm:grid-cols-[1.05fr_1fr] sm:min-h-[410px] [animation:heroIn_.8s_cubic-bezier(.16,.84,.44,1)_both]">
          <div className="order-2 sm:order-1 px-[22px] py-[30px] sm:px-[52px] sm:py-[60px] flex flex-col justify-center gap-5">
            <span className="self-start text-[13px] tracking-[.14em] uppercase text-accent font-bold">
              {heroEyebrow}
            </span>
            <h1 className="m-0 text-[30px] sm:text-[52px] leading-[1.02] tracking-[-.03em] font-extrabold text-ink text-balance">
              {heroTitulo}
            </h1>
            <p className="m-0 text-base leading-[1.55] text-[#4c545d] max-w-[400px]">
              Cuadernos, escritura, arte y kits. Pedido directo por WhatsApp, retiro en tienda o
              delivery en Maracaibo.
            </p>
            <div className="flex gap-3 flex-wrap mt-1">
              <Link
                href={heroHref}
                className="bg-brand text-white rounded-[11px] px-[26px] py-[15px] text-[15px] font-semibold"
              >
                Ver kits
              </Link>
              <Link
                href="/catalogo"
                className="border border-[#d4d9df] bg-white text-ink rounded-[11px] px-[26px] py-[15px] text-[15px] font-semibold"
              >
                Ver productos
              </Link>
            </div>
          </div>
          <div className="relative order-1 sm:order-2 aspect-[4/5] sm:aspect-auto min-h-[220px]">
            <MediaImagen
              src={promo?.imagen_url ?? null}
              alt="Productos de papelería DIMEX"
              label="imagen hero · productos sobre gris claro"
              sizes="(max-width: 640px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-7 pt-6">
        <div className="border border-line rounded-[14px] grid grid-cols-1 sm:grid-cols-3">
          {beneficios.map((b) => (
            <div key={b.title} className="px-6 py-5 flex items-center gap-[15px] border-t border-[#f0f2f4]">
              <span className="w-11 h-11 shrink-0 rounded-[11px] bg-[#eef2f7] text-brand flex items-center justify-center">
                {b.icon}
              </span>
              <div>
                <div className="text-[15px] font-bold tracking-[-.01em]">{b.title}</div>
                <div className="text-sm text-muted leading-[1.4]">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Kits */}
      {featured.length > 0 && (
        <section className={sectionCls}>
          <Reveal>
            <div className="flex items-baseline justify-between gap-4 mb-2">
              <h2 className={h2Cls}>Kits</h2>
              <Link href="/kits" className={verMas}>
                Ver todos
              </Link>
            </div>
          </Reveal>
          <p className="m-0 mb-[26px] text-muted text-[15px]">
            Combos listos para pedir: varios productos en un solo pedido.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[22px]">
            {featured.map((kit, i) => (
              <Reveal key={kit.id} delay={i}>
                <KitCard kit={kit} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Categorías */}
      {categorias.length > 0 && (
        <section className={sectionCls}>
          <Reveal>
            <div className="flex items-baseline justify-between mb-6">
              <h2 className={h2Cls}>Comprar por categoría</h2>
              <Link href="/catalogo" className={verMas}>
                Ver todo
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categorias.map((c, i) => (
              <Reveal key={c.id} delay={i}>
                <CategoryCard c={c} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Más vendidos */}
      {destacados.length > 0 && (
        <section id="mas-vendidos" className={sectionCls}>
          <Reveal>
            <div className="flex items-baseline justify-between mb-6">
              <h2 className={h2Cls}>Más vendidos</h2>
              <Link href="/catalogo" className={verMas}>
                Ver todos
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-[22px]">
            {destacados.map((p, i) => (
              <Reveal key={p.id} delay={i}>
                <ProductCard p={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Visítanos */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-7 pt-14 pb-6">
        <Reveal>
          <div className="mb-6">
            <h2 className={`${h2Cls} mb-2`}>Visítanos</h2>
            <p className="m-0 text-muted text-[15px]">
              Ven a nuestra tienda en Maracaibo o escríbenos y coordinamos tu pedido.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[22px] items-stretch">
          <Reveal className="rounded-2xl overflow-hidden border border-line min-h-[380px] bg-surface">
            <iframe
              title="Ubicación DIMEX"
              src={mapaEmbed}
              loading="lazy"
              className="w-full h-full min-h-[380px] border-0 block"
            />
          </Reveal>
          <Reveal delay={1} className="flex flex-col gap-[22px]">
            <div className="relative flex-1 min-h-[200px] rounded-2xl border border-line overflow-hidden">
              <MediaImagen src={null} alt="Foto del local DIMEX" label="foto del local · reemplázala aquí" />
            </div>
            <div className="border border-line rounded-2xl px-[26px] py-6 flex flex-col gap-3.5">
              <div>
                <div className="text-[17px] font-bold tracking-[-.01em]">DIMEX · Tienda principal</div>
                <div className="text-sm text-[#5c646d] leading-[1.5] mt-1">
                  {direccion}
                  <br />
                  {horario}
                </div>
              </div>
              <div className="flex gap-2.5 flex-wrap">
                <a
                  href="https://maps.google.com/maps?q=Maracaibo,%20Zulia,%20Venezuela"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-brand text-white rounded-[10px] px-[18px] py-3 text-sm font-semibold inline-flex items-center gap-2"
                >
                  <PinIcon size={17} />
                  Cómo llegar
                </a>
                <a
                  href={waLink(WA_MENSAJES.consultaGeneral)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-[#e3e6ea] text-wa rounded-[10px] px-[18px] py-3 text-sm font-semibold inline-flex items-center gap-2"
                >
                  <WhatsAppIcon size={17} />
                  Escríbenos
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
