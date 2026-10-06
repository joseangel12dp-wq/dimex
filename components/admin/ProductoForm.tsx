"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Categoria, Producto } from "@/types/db";
import type { FormState } from "@/lib/admin";
import ProductImagesUploader from "@/components/admin/ProductImagesUploader";

const inputCls =
  "border border-[#e3e6ea] rounded-[10px] px-[15px] py-3 text-[15px] outline-none focus:border-brand bg-white";
const labelCls = "text-[13px] font-semibold text-[#4a5158]";

/** Formulario para crear o editar un producto (usa una acción de servidor). */
export default function ProductoForm({
  categorias,
  producto,
  action,
  imagenes = [],
}: {
  categorias: Categoria[];
  producto?: Producto;
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  imagenes?: string[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});

  return (
    <form action={formAction} className="max-w-[640px] flex flex-col gap-5">
      {producto && <input type="hidden" name="id" value={producto.id} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nombre" className={labelCls}>Nombre</label>
        <input id="nombre" name="nombre" required defaultValue={producto?.nombre} className={inputCls} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="descripcion" className={labelCls}>Descripción</label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows={3}
          defaultValue={producto?.descripcion ?? ""}
          className={`${inputCls} resize-y`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="categoria_id" className={labelCls}>Categoría</label>
          <select
            id="categoria_id"
            name="categoria_id"
            defaultValue={producto?.categoria_id ?? ""}
            className={`${inputCls} cursor-pointer`}
          >
            <option value="">Sin categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="precio" className={labelCls}>Precio (USD)</label>
          <input
            id="precio"
            name="precio"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={producto?.precio}
            className={inputCls}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 max-w-[280px]">
        <label htmlFor="precio_anterior" className={labelCls}>
          Precio anterior (opcional — marca rebaja)
        </label>
        <input
          id="precio_anterior"
          name="precio_anterior"
          type="number"
          step="0.01"
          min="0"
          defaultValue={producto?.precio_anterior ?? ""}
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="codigo" className={labelCls}>Código</label>
          <input id="codigo" name="codigo" defaultValue={producto?.codigo ?? ""} className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="existencia" className={labelCls}>Existencia</label>
          <input
            id="existencia"
            name="existencia"
            type="number"
            step="0.01"
            min="0"
            defaultValue={producto?.existencia ?? 0}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="unidad" className={labelCls}>Unidad</label>
          <input
            id="unidad"
            name="unidad"
            placeholder="PZA, PAQ, METRO…"
            defaultValue={producto?.unidad ?? ""}
            className={inputCls}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <label className="flex items-center gap-2 text-sm text-[#2a2f36] cursor-pointer">
          <input type="checkbox" name="es_nuevo" defaultChecked={producto?.es_nuevo ?? false} className="w-4 h-4" />
          Marcar como “NUEVO”
        </label>
        <label className="flex items-center gap-2 text-sm text-[#2a2f36] cursor-pointer">
          <input type="checkbox" name="destacado" defaultChecked={producto?.destacado ?? false} className="w-4 h-4" />
          Destacado (aparece en “Más vendidos”)
        </label>
        <label className="flex items-center gap-2 text-sm text-[#2a2f36] cursor-pointer">
          <input type="checkbox" name="activo" defaultChecked={producto ? producto.activo : true} className="w-4 h-4" />
          Visible en la tienda
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <span className={labelCls}>Fotos del producto</span>
        <p className="m-0 text-[13px] text-muted-2">
          Sube varias. La primera es la portada (la que se ve en la tienda). Arrastra las
          miniaturas para reordenar, o usa ◀ ▶ y “Portada”.
        </p>
        <ProductImagesUploader initial={imagenes} />
      </div>

      {state.error && <p className="m-0 text-sm text-accent">{state.error}</p>}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="bg-brand text-white rounded-[10px] px-6 h-12 text-[15px] font-semibold cursor-pointer disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <Link
          href="/admin/productos"
          className="text-[15px] font-semibold text-muted px-4 h-12 inline-flex items-center"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
