import type { Metadata } from "next";
import Link from "next/link";
import { getKits } from "@/lib/queries";
import Reveal from "@/components/Reveal";
import KitCard from "@/components/KitCard";
import JsonLd from "@/components/JsonLd";
import { kitsItemListLd } from "@/lib/jsonld";
import { waLink, WA_MENSAJES } from "@/lib/whatsapp";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Kits",
  description:
    "Combos de papelería listos para pedir: cada kit trae varios productos en un solo pedido. Pedido por WhatsApp en Maracaibo.",
};

export default async function KitsPage() {
  const kits = await getKits();

  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-7 pt-[30px] pb-10">
      {kits.length > 0 && <JsonLd data={kitsItemListLd(kits)} />}

      {/* Migas de pan */}
      <nav className="text-sm text-muted-2 mb-4" aria-label="Ruta">
        <Link href="/" className="text-muted-2">
          Inicio
        </Link>{" "}
        · <span className="text-[#4a5158] font-semibold">Kits</span>
      </nav>

      <h1 className="m-0 mb-2 text-[30px] font-extrabold tracking-[-.025em]">Kits</h1>
      <p className="m-0 mb-[34px] text-muted text-[15px] max-w-[560px]">
        Combos listos para pedir: cada kit reúne varios productos en un solo pedido.
      </p>

      {kits.length === 0 ? (
        <div className="border border-line rounded-2xl p-10 text-center">
          <p className="m-0 text-muted text-[15px]">
            Aún no hay kits publicados. Escríbenos por WhatsApp y armamos el tuyo.
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[22px]">
          {kits.map((kit, i) => (
            <Reveal key={kit.id} delay={i}>
              <KitCard kit={kit} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
