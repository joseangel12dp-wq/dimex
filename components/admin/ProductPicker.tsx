"use client";

import { useState } from "react";
import type { Producto } from "@/types/db";
import { money } from "@/lib/format";

/**
 * Selector manual de productos para una promoción. Renderiza un checkbox por
 * producto (name="producto_ids"); el buscador solo oculta filas visualmente,
 * así las marcas no se pierden al filtrar y todas se envían con el formulario.
 */
export default function ProductPicker({
  productos,
  seleccionados,
}: {
  productos: Producto[];
  seleccionados: string[];
}) {
  const [q, setQ] = useState("");
  const sel = new Set(seleccionados);
  const term = q.trim().toLowerCase();

  return (
    <div className="border border-line rounded-xl bg-white">
      <div className="p-3 border-b border-line">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar producto para marcar…"
          aria-label="Buscar producto"
          className="w-full border border-[#e3e6ea] rounded-[10px] px-3.5 py-2.5 text-[15px] outline-none focus:border-brand"
        />
      </div>

      <div className="max-h-[340px] overflow-y-auto p-2 flex flex-col">
        {productos.length === 0 ? (
          <p className="m-0 p-4 text-sm text-muted-2">
            No hay productos todavía. Crea productos primero para poder agruparlos.
          </p>
        ) : (
          productos.map((p) => {
            const oculto = term && !p.nombre.toLowerCase().includes(term);
            return (
              <label
                key={p.id}
                className={`flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-surface cursor-pointer ${
                  oculto ? "hidden" : ""
                }`}
              >
                <input
                  type="checkbox"
                  name="producto_ids"
                  value={p.id}
                  defaultChecked={sel.has(p.id)}
                  className="w-4 h-4 shrink-0"
                />
                <span className="flex-1 min-w-0 text-[15px] truncate">{p.nombre}</span>
                <span className="tnum text-[13px] text-muted-2 shrink-0">{money(p.precio)}</span>
                {!p.activo && (
                  <span className="text-[11px] text-muted-2 shrink-0">(oculto)</span>
                )}
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}
