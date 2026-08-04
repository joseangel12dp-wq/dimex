import Link from "next/link";
import { getKitsAdmin } from "@/lib/admin-queries";
import { getSessionProfile } from "@/lib/auth";
import { money } from "@/lib/format";
import DeleteButton from "@/components/admin/DeleteButton";
import { SearchIcon } from "@/components/icons";
import { alternarActivoKit, eliminarKit } from "./actions";

export default async function KitsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const [kits, perfil] = await Promise.all([getKitsAdmin(q || undefined), getSessionProfile()]);
  const esDueno = perfil?.rol === "dueno";

  return (
    <div>
      <header className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="m-0 text-2xl font-extrabold tracking-[-.02em] text-ink">Kits</h1>
          <p className="m-0 text-sm text-muted-2">
            {q
              ? `${kits.length} resultado${kits.length === 1 ? "" : "s"} para “${q}”`
              : `${kits.length} en total`}
          </p>
        </div>
        <Link
          href="/admin/kits/nuevo"
          className="bg-brand text-white rounded-[10px] px-[18px] py-2.5 text-sm font-semibold shrink-0"
        >
          + Nuevo kit
        </Link>
      </header>

      <form action="/admin/kits" className="mb-4 flex items-center gap-2.5 border border-line rounded-[10px] px-3.5 py-2.5 bg-white max-w-[440px]">
        <SearchIcon size={17} className="text-muted-2 shrink-0" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre o descripción…"
          aria-label="Buscar kits"
          className="border-0 outline-none w-full text-[15px] bg-transparent text-body"
        />
        {q && (
          <Link href="/admin/kits" className="text-xs font-semibold text-muted-2 shrink-0">
            Limpiar
          </Link>
        )}
      </form>

      {kits.length === 0 ? (
        <div className="border border-line rounded-xl bg-white p-10 text-center text-muted">
          {q ? `No se encontraron kits para “${q}”.` : "No hay kits todavía. Crea el primero con “Nuevo kit”."}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {kits.map((k) => (
            <div key={k.id} className="flex items-center gap-3 border border-line rounded-xl bg-white p-3">
              <div className="w-12 h-12 rounded-lg shrink-0 bg-surface [background-image:repeating-linear-gradient(45deg,#eaedf0_0_7px,#f4f6f8_7px_14px)]" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[15px] truncate">{k.nombre}</div>
                <div className="text-xs text-muted-2 flex items-center gap-2">
                  <span className="tnum text-[#2a2f36] font-semibold">{money(k.precio)}</span>
                  <span>·</span>
                  <span className="tnum">orden {k.orden}</span>
                </div>
              </div>

              <span
                className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  k.activo ? "bg-[#e9f6ee] text-[#1f8f4e]" : "bg-surface text-muted-2"
                }`}
              >
                {k.activo ? "Visible" : "Oculto"}
              </span>

              <div className="flex items-center gap-3 shrink-0">
                <form action={alternarActivoKit}>
                  <input type="hidden" name="id" value={k.id} />
                  <input type="hidden" name="activo" value={k.activo ? "false" : "true"} />
                  <button type="submit" className="text-sm font-semibold text-brand hover:underline cursor-pointer">
                    {k.activo ? "Ocultar" : "Mostrar"}
                  </button>
                </form>
                <Link href={`/admin/kits/${k.id}`} className="text-sm font-semibold text-[#4a5158] hover:underline">
                  Editar
                </Link>
                {esDueno && (
                  <DeleteButton
                    action={eliminarKit}
                    id={k.id}
                    confirmMsg={`¿Eliminar “${k.nombre}” definitivamente? No se puede deshacer.`}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
