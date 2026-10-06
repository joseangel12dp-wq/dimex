import Link from "next/link";
import { getProductosAdmin, getCategoriasAdmin } from "@/lib/admin-queries";
import { getSessionProfile } from "@/lib/auth";
import { money } from "@/lib/format";
import DeleteButton from "@/components/admin/DeleteButton";
import { SearchIcon } from "@/components/icons";
import { alternarActivoProducto, eliminarProducto } from "./actions";

export default async function ProductosAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const [productos, categorias, perfil] = await Promise.all([
    getProductosAdmin(q || undefined),
    getCategoriasAdmin(),
    getSessionProfile(),
  ]);
  const esDueno = perfil?.rol === "dueno";
  const nombreCat = (id: string | null) =>
    id ? categorias.find((c) => c.id === id)?.nombre ?? "—" : "Sin categoría";

  return (
    <div>
      <header className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="m-0 text-2xl font-extrabold tracking-[-.02em] text-ink">Productos</h1>
          <p className="m-0 text-sm text-muted-2">
            {q
              ? `${productos.length} resultado${productos.length === 1 ? "" : "s"} para “${q}”`
              : `${productos.length} en total`}
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="bg-brand text-white rounded-[10px] px-[18px] py-2.5 text-sm font-semibold shrink-0"
        >
          + Nuevo producto
        </Link>
      </header>

      {/* Barra de búsqueda (formulario GET → ?q=) */}
      <form action="/admin/productos" className="mb-4 flex items-center gap-2.5 border border-line rounded-[10px] px-3.5 py-2.5 bg-white max-w-[440px]">
        <SearchIcon size={17} className="text-muted-2 shrink-0" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre, descripción o código…"
          aria-label="Buscar productos"
          className="border-0 outline-none w-full text-[15px] bg-transparent text-body"
        />
        {q && (
          <Link href="/admin/productos" className="text-xs font-semibold text-muted-2 shrink-0">
            Limpiar
          </Link>
        )}
      </form>

      {productos.length === 0 ? (
        <div className="border border-line rounded-xl bg-white p-10 text-center text-muted">
          {q
            ? `No se encontraron productos para “${q}”.`
            : "No hay productos todavía. Crea el primero con “Nuevo producto”."}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {productos.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 border border-line rounded-xl bg-white p-3"
            >
              <div className="w-12 h-12 rounded-lg shrink-0 bg-surface [background-image:repeating-linear-gradient(45deg,#eaedf0_0_7px,#f4f6f8_7px_14px)]" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[15px] truncate">{p.nombre}</div>
                <div className="text-xs text-muted-2 flex items-center gap-2 flex-wrap">
                  <span>{nombreCat(p.categoria_id)}</span>
                  <span>·</span>
                  <span className="tnum text-[#2a2f36] font-semibold">{money(p.precio)}</span>
                  <span>·</span>
                  <span className={`tnum font-semibold ${p.existencia > 0 ? "text-[#2a2f36]" : "text-accent"}`}>
                    {p.existencia > 0 ? `${p.existencia} ${p.unidad ?? "und"}` : "Sin existencia"}
                  </span>
                  {p.codigo && <span className="tnum">#{p.codigo}</span>}
                  {p.precio_anterior && (
                    <span className="tnum line-through">{money(p.precio_anterior)}</span>
                  )}
                  {p.es_nuevo && <span className="text-brand font-semibold">NUEVO</span>}
                  {p.destacado && <span className="text-brand font-semibold">★</span>}
                </div>
              </div>

              <span
                className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  p.activo ? "bg-[#e9f6ee] text-[#1f8f4e]" : "bg-surface text-muted-2"
                }`}
              >
                {p.activo ? "Visible" : "Oculto"}
              </span>

              <div className="flex items-center gap-3 shrink-0">
                <form action={alternarActivoProducto}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="activo" value={p.activo ? "false" : "true"} />
                  <button type="submit" className="text-sm font-semibold text-brand hover:underline cursor-pointer">
                    {p.activo ? "Ocultar" : "Mostrar"}
                  </button>
                </form>
                <Link href={`/admin/productos/${p.id}`} className="text-sm font-semibold text-[#4a5158] hover:underline">
                  Editar
                </Link>
                {esDueno && (
                  <DeleteButton
                    action={eliminarProducto}
                    id={p.id}
                    confirmMsg={`¿Eliminar “${p.nombre}” definitivamente? No se puede deshacer.`}
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
