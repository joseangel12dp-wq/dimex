import Link from "next/link";
import { getCategoriasAdmin } from "@/lib/admin-queries";
import { getSessionProfile } from "@/lib/auth";
import DeleteButton from "@/components/admin/DeleteButton";
import { alternarActivaCategoria, eliminarCategoria } from "./actions";

export default async function CategoriasAdminPage() {
  const [categorias, perfil] = await Promise.all([getCategoriasAdmin(), getSessionProfile()]);
  const esDueno = perfil?.rol === "dueno";

  return (
    <div>
      <header className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="m-0 text-2xl font-extrabold tracking-[-.02em] text-ink">Categorías</h1>
          <p className="m-0 text-sm text-muted-2">{categorias.length} en total</p>
        </div>
        <Link
          href="/admin/categorias/nuevo"
          className="bg-brand text-white rounded-[10px] px-[18px] py-2.5 text-sm font-semibold shrink-0"
        >
          + Nueva categoría
        </Link>
      </header>

      {categorias.length === 0 ? (
        <div className="border border-line rounded-xl bg-white p-10 text-center text-muted">
          No hay categorías todavía. Crea la primera con “Nueva categoría”.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {categorias.map((c) => (
            <div key={c.id} className="flex items-center gap-3 border border-line rounded-xl bg-white p-3">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[15px] truncate">{c.nombre}</div>
                <div className="text-xs text-muted-2 flex items-center gap-2">
                  <span className="tnum">/categoria/{c.slug}</span>
                  <span>·</span>
                  <span className="tnum">orden {c.orden}</span>
                </div>
              </div>

              <span
                className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  c.activa ? "bg-[#e9f6ee] text-[#1f8f4e]" : "bg-surface text-muted-2"
                }`}
              >
                {c.activa ? "Visible" : "Oculta"}
              </span>

              <div className="flex items-center gap-3 shrink-0">
                <form action={alternarActivaCategoria}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="activa" value={c.activa ? "false" : "true"} />
                  <button type="submit" className="text-sm font-semibold text-brand hover:underline cursor-pointer">
                    {c.activa ? "Ocultar" : "Mostrar"}
                  </button>
                </form>
                <Link href={`/admin/categorias/${c.id}`} className="text-sm font-semibold text-[#4a5158] hover:underline">
                  Editar
                </Link>
                {esDueno && (
                  <DeleteButton
                    action={eliminarCategoria}
                    id={c.id}
                    confirmMsg={`¿Eliminar “${c.nombre}”? Sus productos quedarán sin categoría.`}
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
