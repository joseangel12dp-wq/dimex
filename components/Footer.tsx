import Link from "next/link";
import { SITE } from "@/lib/site";
import { waLink, WA_MENSAJES } from "@/lib/whatsapp";
import { WhatsAppIcon, InstagramIcon, TiktokIcon } from "@/components/icons";

/** Pie de página global de la tienda. Recibe datos de la configuración. */
export default function Footer({
  whatsapp,
  metodosPago,
  instagram,
  tiktok,
}: {
  whatsapp: string;
  metodosPago: string[];
  instagram: string;
  tiktok: string;
}) {
  return (
    <footer className="mt-[70px] border-t border-line-2 bg-[#fafbfc]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pt-10 pb-5 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-[22px] sm:gap-[26px]">
        <div className="flex flex-col gap-1.5">
          <span className="font-extrabold text-[22px] text-accent tracking-[.02em]">DIMEX</span>
          <span className="text-sm text-muted-2">{SITE.descripcion}</span>
        </div>

        <div className="flex flex-wrap items-center gap-[26px] text-sm text-[#5c646d]">
          <Link href="/kits" className="text-[#5c646d]">Kits</Link>
          <Link href="/catalogo" className="text-[#5c646d]">Productos</Link>
          <Link href="/nosotros" className="text-[#5c646d]">Nosotros</Link>
          <a
            href={waLink(WA_MENSAJES.consultaGeneral, whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-wa font-semibold flex items-center gap-1.5"
          >
            <WhatsAppIcon size={15} />
            WhatsApp
          </a>
          <span className="w-px h-5 bg-[#e3e6ea]" aria-hidden="true" />
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

      <div className="max-w-[1280px] mx-auto px-4 sm:px-7 pt-[18px] pb-10 border-t border-line-2 flex items-center gap-3.5 flex-wrap">
        <span className="text-[12.5px] font-bold tracking-[.05em] uppercase text-muted-2">
          Métodos de pago
        </span>
        <div className="flex gap-[9px] flex-wrap">
          {metodosPago.map((pm) => (
            <span
              key={pm}
              className="border border-[#e3e6ea] rounded-lg px-3 py-[7px] text-[13px] font-semibold text-[#4a5158] bg-white"
            >
              {pm}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
