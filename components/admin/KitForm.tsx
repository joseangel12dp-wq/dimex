"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Kit } from "@/types/db";
import type { FormState } from "@/lib/admin";
import ImageUploader from "@/components/admin/ImageUploader";

const inputCls =
  "border border-[#e3e6ea] rounded-[10px] px-[15px] py-3 text-[15px] outline-none focus:border-brand bg-white";
const labelCls = "text-[13px] font-semibold text-[#4a5158]";

/** Formulario para crear o editar un kit (combo). */
export default function KitForm({
  kit,
  action,
}: {
  kit?: Kit;
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});

  return (
    <form action={formAction} className="max-w-[640px] flex flex-col gap-5">
      {kit && <input type="hidden" name="id" value={kit.id} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nombre" className={labelCls}>Nombre</label>
        <input id="nombre" name="nombre" required defaultValue={kit?.nombre} className={inputCls} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="descripcion" className={labelCls}>
          Descripción (lista aquí lo que incluye el combo)
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows={4}
          defaultValue={kit?.descripcion ?? ""}
          placeholder="Incluye 6 cuadernos, colores, marcadores, pega, tijera…"
          className={`${inputCls} resize-y`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="precio" className={labelCls}>Precio (USD)</label>
          <input
            id="precio"
            name="precio"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={kit?.precio}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="orden" className={labelCls}>Orden (menor aparece primero)</label>
          <input
            id="orden"
            name="orden"
            type="number"
            step="1"
            defaultValue={kit?.orden ?? 0}
            className={inputCls}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-[#2a2f36] cursor-pointer">
        <input type="checkbox" name="activo" defaultChecked={kit ? kit.activo : true} className="w-4 h-4" />
        Visible en la tienda
      </label>

      <div className="flex flex-col gap-2">
        <span className={labelCls}>Imagen</span>
        <ImageUploader tipo="kit" folder="kits" currentUrl={kit?.imagen_url} />
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
          href="/admin/kits"
          className="text-[15px] font-semibold text-muted px-4 h-12 inline-flex items-center"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
