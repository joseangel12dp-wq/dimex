import type { Producto } from "@/types/db";
import { money, descuentoLabel } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";
import MediaImagen from "@/components/MediaImagen";
import AgregarButton from "@/components/AgregarButton";
import { WhatsAppIcon } from "@/components/icons";

/** Tarjeta de producto (usada en inicio, catálogo y categoría). */
export default function ProductCard({ p }: { p: Producto }) {
  const rebaja = descuentoLabel(p.precio, p.precio_anterior);
  const tieneRebaja = rebaja !== null;

  return (
    <div className="bg-white border border-line rounded-[15px] overflow-hidden flex flex-col transition-[transform,box-shadow] duration-[350ms] hover:-translate-y-[5px] hover:shadow-[0_18px_40px_-22px_rgba(20,30,45,.32)]">
      <div className="relative aspect-square bg-surface overflow-hidden">
        <MediaImagen
          src={p.imagen_url}
          alt={p.nombre}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {tieneRebaja && (
            <span className="tnum bg-accent text-white text-[11.5px] font-bold tracking-[.02em] px-[11px] py-[5px] rounded-[7px] shadow-[0_3px_9px_-2px_rgba(192,17,17,.45)]">
              {rebaja}
            </span>
          )}
          {p.es_nuevo && (
            <span className="bg-dark text-white text-[11px] font-bold tracking-[.09em] px-[11px] py-[5px] rounded-[7px] shadow-[0_3px_9px_-3px_rgba(0,0,0,.4)]">
              NUEVO
            </span>
          )}
        </div>
      </div>

      <div className="p-[18px] pt-[18px] flex flex-col gap-2 flex-1">
        <div className="flex items-baseline gap-[9px]">
          {tieneRebaja ? (
            <>
              <span className="tnum text-[19px] font-extrabold text-accent tracking-[-.02em]">
                {money(p.precio)}
              </span>
              <span className="tnum text-[13.5px] text-[#a2aab2] line-through">
                {money(p.precio_anterior!)}
              </span>
            </>
          ) : (
            <span className="tnum text-[19px] font-extrabold text-brand-ink tracking-[-.02em]">
              {money(p.precio)}
            </span>
          )}
        </div>

        <h3 className="m-0 text-[15.5px] font-bold tracking-[-.01em] leading-[1.25]">
          {p.nombre}
        </h3>
        {p.descripcion && (
          <p className="m-0 text-[15px] text-muted leading-[1.45] flex-1">{p.descripcion}</p>
        )}

        <div className="flex gap-2 mt-2">
          <AgregarButton id={p.id} name={p.nombre} price={p.precio} />
          <a
            href={waLink(`Hola DIMEX, me interesa: ${p.nombre}`)}
            target="_blank"
            rel="noopener noreferrer"
            title="Preguntar por WhatsApp"
            aria-label={`Preguntar por ${p.nombre} por WhatsApp`}
            className="w-11 h-11 border border-[#e3e6ea] rounded-[10px] flex items-center justify-center text-wa transition-colors hover:border-wa"
          >
            <WhatsAppIcon size={19} />
          </a>
        </div>
      </div>
    </div>
  );
}
