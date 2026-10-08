import Link from "next/link";
import { getProductosAdminPagina, getCategoriasAdmin } from "@/lib/admin-queries";
import { getSessionProfile } from "@/lib/auth";
import { money } from "@/lib/format";
import DeleteButton from "@/components/admin/DeleteButton";
import { SearchIcon } from "@/components/icons";
import { alternarActivoProducto, eliminarProducto } from "./actions";

export default async function ProductosAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string; pagina?: string }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const estado = sp.estado === "visibles" || sp.estado === "ocultos" ? sp.estado : undefined;
  const pagina = Math.max(1, Number(sp.pagina) || 1);
  const POR_PAGINA = 100;

  const [{ productos, total }, categorias, perfil] = await Promise.all([
    getProductosAdminPagina({ search: q || undefined, estado, pagina, porPagina: POR_PAGINA }),
    getCategoriasAdmin(),
    getSessionProfile(),
  ]);
  const esDueno = perfil?.rol === "dueno";
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  // Arma la URL del listado conservando búsqueda/filtro.
  const url = (cambios: { estado?: string; pagina?: number }) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const e = "estado" in cambios ? cambios.estado : estado;
    if (e) params.set("estado", e);
    const pg = cambios.pagina ?? 1;
    if (pg > 1) params.set("pagina", String(pg));
    const s = params.toString();
    return s ? `/admin/productos?${s}` : "/admin/productos";
  };
  const nombreCat = (id: string | null) =>
    id ? categorias.find((c) => c.id === id)?.nombre ?? "—" : "Sin categoría";

  return (
    <div>
      <header className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="m-0 text-2xl font-extrabold tracking-[-.02em] text-ink">Productos</h1>
          <p className="m-0 text-sm text-muted-2">
            {q
              ? `${total} resultado${total === 1 ? "" : "s"} para “${q}”`
              : `${total} en total`}
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
        {estado && <input type="hidden" name="estado" value={estado} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre, descripción o código…"
          aria-label="Buscar productos"
          className="border-0 outline-none w-full text-[15px] bg-transparent text-body"
        />
        {q && (
          <Link href={estado ? `/admin/productos?estado=${estado}` : "/admin/productos"} className="text-xs font-semibold text-muted-2 shrink-0">
            Limpiar
          </Link>
        )}
      </form>

      {/* Filtro por visibilidad */}
      <div className="mb-4 flex gap-2">
        {([
          [undefined, "Todos"],
          ["visibles", "Visibles"],
          ["ocultos", "Ocultos"],
        ] as const).map(([valor, texto]) => (
          <Link
            key={texto}
            href={url({ estado: valor })}
            className={`text-sm font-semibold px-3.5 py-1.5 rounded-full border ${
              estado === valor ? "bg-brand text-white border-brand" : "bg-white text-[#4a5158] border-line"
            }`}
          >
            {texto}
          </Link>
        ))}
      </div>

      {productos.length === 0 ? (
        <div className="border border-line rounded-xl bg-white p-10 text-center text-muted">
          {q
            ? `No se encontraron productos para “${q}”.`
            : estado
            ? `No hay productos ${estado}.`
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

      {paginas > 1 && (
        <nav aria-label="Páginas" className="mt-5 flex items-center justify-center gap-4 text-sm">
          {pagina > 1 ? (
            <Link href={url({ pagina: pagina - 1 })} className="font-semibold text-brand hover:underline">
              ← Anterior
            </Link>
          ) : (
            <span className="text-muted-2">← Anterior</span>
          )}
          <span className="text-muted-2 tnum">
            Página {pagina} de {paginas}
          </span>
          {pagina < paginas ? (
            <Link href={url({ pagina: pagina + 1 })} className="font-semibold text-brand hover:underline">
              Siguiente →
            </Link>
          ) : (
            <span className="text-muted-2">Siguiente →</span>
          )}
        </nav>
      )}
    </div>
  );
}
