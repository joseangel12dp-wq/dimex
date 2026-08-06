import type { Metadata } from "next";
import Link from "next/link";
import { getConfiguracion } from "@/lib/queries";
import { SITE } from "@/lib/site";
import { waLink, WA_MENSAJES } from "@/lib/whatsapp";
import Reveal from "@/components/Reveal";
import MediaImagen from "@/components/MediaImagen";
import { PinIcon, WhatsAppIcon, InstagramIcon, TiktokIcon } from "@/components/icons";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Conoce DIMEX: papelería en Maracaibo, Zulia. Nuestra historia, ubicación, horario y contacto. Pedido por WhatsApp, retiro en tienda o delivery.",
};

export default async function NosotrosPage() {
  const config = await getConfiguracion();
  const direccion = config?.direccion ?? SITE.direccion;
  const horario = config?.horario ?? SITE.horario;
  const mapaEmbed = config?.mapa_embed ?? SITE.mapaEmbed;
  const instagram = config?.instagram_url ?? SITE.instagramUrl;
  const tiktok = config?.tiktok_url ?? SITE.tiktokUrl;

  return (
    <section className="max-w-[1080px] mx-auto px-4 sm:px-7 pt-[30px] pb-12">
      {/* Migas de pan */}
      <nav className="text-sm text-muted-2 mb-[18px]" aria-label="Ruta">
        <Link href="/" className="text-muted-2">
          Inicio
        </Link>{" "}
        · <span className="text-[#4a5158] font-semibold">Nosotros</span>
      </nav>

      <h1 className="m-0 mb-4 text-[30px] font-extrabold tracking-[-.025em]">Nosotros</h1>

      {/* Historia — TODO: el dueño puede ajustar este texto cuando quiera. */}
      <div className="max-w-[640px] flex flex-col gap-4 text-[15.5px] text-[#3a434d] leading-[1.7] mb-10">
        <p className="m-0">
          En DIMEX creemos que los buenos materiales hacen el día más fácil. Somos una papelería en
          Maracaibo dedicada a surtir a estudiantes, oficinas, consultorios e instituciones de todo
          el Zulia, con atención cercana y precios justos.
        </p>
        <p className="m-0">
          Encuentra cuadernos, escritura, arte, útiles escolares, artículos de oficina y kits
          listos para pedir. Haces tu pedido por WhatsApp y lo retiras en tienda o te lo llevamos por
          delivery. Sencillo, rápido y sin complicaciones.
        </p>
      </div>

      {/* Visítanos: mapa + datos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[22px] items-stretch">
        <Reveal className="rounded-2xl overflow-hidden border border-line min-h-[340px] bg-surface">
          <iframe
            title="Ubicación DIMEX"
            src={mapaEmbed}
            loading="lazy"
            className="w-full h-full min-h-[340px] border-0 block"
          />
        </Reveal>

        <Reveal delay={1} className="flex flex-col gap-[22px]">
          <div className="relative flex-1 min-h-[160px] rounded-2xl border border-line overflow-hidden">
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
                href="https://www.google.com/maps/search/?api=1&query=10.680094324205516,-71.60626154338263"
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
            <div className="flex items-center gap-3 pt-1">
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                title="Instagram"
                className="w-[38px] h-[38px] border border-[#e3e6ea] rounded-full flex items-center justify-center text-[#5c646d] hover:text-accent hover:border-accent transition-colors"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href={tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                title="TikTok"
                className="w-[38px] h-[38px] border border-[#e3e6ea] rounded-full flex items-center justify-center text-[#5c646d] hover:text-accent hover:border-accent transition-colors"
              >
                <TiktokIcon size={17} />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
