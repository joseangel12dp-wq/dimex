import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { waLink, WA_MENSAJES } from "@/lib/whatsapp";
import Reveal from "@/components/Reveal";
import { WhatsAppIcon } from "@/components/icons";

// ⛔ Página OCULTA por ahora (a pedido del dueño). El código se conserva intacto.
// Para reactivarla: quita este flag (o ponlo en true), vuelve a listar "Empresas"
// en NAV (lib/site.ts), en el pie (Footer) y en el sitemap.
const EMPRESAS_VISIBLE = false;

export const metadata: Metadata = {
  title: "Empresas",
  robots: { index: false, follow: false }, // no indexar mientras esté oculta
  description:
    "Suministro de papelería para oficinas, consultorios y colegios en Maracaibo. Compra por volumen con cuenta mensual, precios preferenciales y entrega programada. Cotización por WhatsApp.",
};

const valores = [
  { title: "Cuenta mensual", desc: "Compra durante el mes y recibe una sola factura consolidada." },
  { title: "Precios por volumen", desc: "Tarifas preferenciales según tu consumo recurrente." },
  { title: "Entrega programada", desc: "Coordinamos entregas fijas a tu oficina o institución." },
];

const pasos = [
  { n: "1", title: "Envías tu lista", desc: "Comparte los productos y cantidades que necesitas." },
  { n: "2", title: "Recibes tu cotización", desc: "Te enviamos precios por volumen y condiciones." },
  { n: "3", title: "Entregamos y facturamos", desc: "Programamos la entrega y cierras cuenta a fin de mes." },
];

export default function EmpresasPage() {
  if (!EMPRESAS_VISIBLE) notFound(); // ruta inaccesible mientras esté oculta

  return (
    <section className="max-w-[1080px] mx-auto px-4 sm:px-7 pt-[30px] pb-12">
      {/* Migas de pan */}
      <nav className="text-sm text-muted-2 mb-[18px]" aria-label="Ruta">
        <Link href="/" className="text-muted-2">
          Inicio
        </Link>{" "}
        · <span className="text-[#4a5158] font-semibold">Empresas</span>
      </nav>

      {/* Hero */}
      <div className="bg-brand rounded-[18px] px-6 py-9 sm:px-11 sm:py-12 text-white mb-[34px]">
        <span className="text-[13px] tracking-[.14em] uppercase font-bold opacity-85">
          DIMEX Empresas
        </span>
        <h1 className="mt-2.5 mb-3 text-[28px] sm:text-[34px] font-extrabold tracking-[-.025em] max-w-[640px] text-balance">
          Suministro de papelería para oficinas, consultorios y colegios.
        </h1>
        <p className="m-0 mb-6 text-base leading-[1.55] opacity-90 max-w-[560px]">
          Compra por volumen con cuenta mensual, precios preferenciales y entrega programada en
          Maracaibo.
        </p>
        <a
          href={waLink(WA_MENSAJES.cotizacionEmpresas)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 bg-wa text-white rounded-[11px] px-[26px] py-[15px] text-[15px] font-bold"
        >
          <WhatsAppIcon size={19} />
          Solicitar cotización
        </a>
      </div>

      {/* Valores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[22px] mb-[38px]">
        {valores.map((v, i) => (
          <Reveal key={v.title} delay={i}>
            <div className="border border-line rounded-[14px] px-6 py-[26px] h-full">
              <h2 className="m-0 mb-2 text-[17px] font-bold tracking-[-.01em] text-brand">
                {v.title}
              </h2>
              <p className="m-0 text-[15px] text-[#5c646d] leading-[1.55]">{v.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Cómo funciona */}
      <div className="border border-line rounded-2xl px-6 py-7 sm:px-[30px] sm:py-[30px]">
        <h2 className="m-0 mb-5 text-[21px] font-extrabold tracking-[-.02em]">Cómo funciona</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[26px]">
          {pasos.map((s) => (
            <div key={s.n} className="flex flex-col gap-2">
              <span className="tnum w-[34px] h-[34px] rounded-[9px] bg-[#eef2f7] text-brand flex items-center justify-center font-extrabold text-[15px]">
                {s.n}
              </span>
              <div className="text-[15.5px] font-bold">{s.title}</div>
              <p className="m-0 text-[14.5px] text-muted leading-[1.5]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
