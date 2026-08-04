import Link from "next/link";
import { getPromocionesAdmin } from "@/lib/admin-queries";
import { getSessionProfile } from "@/lib/auth";
import DeleteButton from "@/components/admin/DeleteButton";
import { alternarActivaPromocion, eliminarPromocion } from "./actions";

const fmtFecha = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" }) : null;

export default async function PromocionesAdminPage() {
  const [promos, perfil] = await Promise.all([getPromocionesAdmin(), getSessionProfile()]);
  const esDueno = perfil?.rol === "dueno";
  const ahora = Date.now();

  const vigente = (p: { activa: boolean; inicia_en: string; termina_en: string | null }) =>
    p.activa &&
    new Date(p.inicia_en).getTime() <= ahora &&
    (p.termina_en === null || new Date(p.termina_en).getTime() >= ahora);

  return (
    <div>
      <header className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="m-0 text-2xl font-extrabold tracking-[-.02em] text-ink">Promociones</h1>
          <p className="m-0 text-sm text-muted-2">{promos.length} en total</p>
        </div>
        <Link
          href="/admin/promociones/nuevo"
          className="bg-brand text-white rounded-[10px] px-[18px] py-2.5 text-sm font-semibold shrink-0"
        >
          + Nueva promoción
        </Link>
      </header>

      {promos.length === 0 ? (
        <div className="border border-line rounded-xl bg-white p-10 text-center text-muted">
          No hay promociones. El inicio usa su texto por defecto.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {promos.map((p) => {
            const enVivo = vigente(p);
            const desde = fmtFecha(p.inicia_en);
            const hasta = fmtFecha(p.termina_en);
            return (
              <div key={p.id} className="flex items-center gap-3 border border-line rounded-xl bg-white p-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[15px] truncate">
                    {p.titulo}
                    {p.subtitulo && <span className="text-muted-2 font-normal"> — {p.subtitulo}</span>}
                  </div>
                  <div className="text-xs text-muted-2">
                    {desde}
                    {hasta ? ` → ${hasta}` : " → sin fin"}
                  </div>
                </div>

                {enVivo && (
                  <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand text-white">
                    En vivo
                  </span>
                )}
                <span
                  className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    p.activa ? "bg-[#e9f6ee] text-[#1f8f4e]" : "bg-surface text-muted-2"
                  }`}
                >
                  {p.activa ? "Activa" : "Inactiva"}
                </span>

                <div className="flex items-center gap-3 shrink-0">
                  <form action={alternarActivaPromocion}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="activa" value={p.activa ? "false" : "true"} />
                    <button type="submit" className="text-sm font-semibold text-brand hover:underline cursor-pointer">
                      {p.activa ? "Desactivar" : "Activar"}
                    </button>
                  </form>
                  <Link href={`/admin/promociones/${p.id}`} className="text-sm font-semibold text-[#4a5158] hover:underline">
                    Editar
                  </Link>
                  {esDueno && (
                    <DeleteButton
                      action={eliminarPromocion}
                      id={p.id}
                      confirmMsg={`¿Eliminar la promoción “${p.titulo}”?`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
