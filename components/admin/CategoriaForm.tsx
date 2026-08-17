"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Categoria } from "@/types/db";
import type { FormState } from "@/lib/admin";
import ImageUploader from "@/components/admin/ImageUploader";

const inputCls =
  "border border-[#e3e6ea] rounded-[10px] px-[15px] py-3 text-[15px] outline-none focus:border-brand bg-white";
const labelCls = "text-[13px] font-semibold text-[#4a5158]";

/** Formulario para crear o editar una categoría. */
export default function CategoriaForm({
  categoria,
  action,
}: {
  categoria?: Categoria;
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});

  return (
    <form action={formAction} className="max-w-[520px] flex flex-col gap-5">
      {categoria && <input type="hidden" name="id" value={categoria.id} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nombre" className={labelCls}>Nombre</label>
        <input id="nombre" name="nombre" required defaultValue={categoria?.nombre} className={inputCls} />
      </div>

      <div className="flex flex-col gap-1.5 max-w-[220px]">
        <label htmlFor="orden" className={labelCls}>Orden (menor aparece primero)</label>
        <input
          id="orden"
          name="orden"
          type="number"
          step="1"
          defaultValue={categoria?.orden ?? 0}
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className={labelCls}>Imagen de la categoría</span>
        <ImageUploader tipo="categoria" folder="categorias" currentUrl={categoria?.imagen_url} />
      </div>

      <label className="flex items-center gap-2 text-sm text-[#2a2f36] cursor-pointer">
        <input type="checkbox" name="activa" defaultChecked={categoria ? categoria.activa : true} className="w-4 h-4" />
        Visible en la tienda
      </label>

      {categoria && (
        <p className="m-0 text-[13px] text-muted-2">
          Dirección de la categoría: <span className="tnum">/categoria/{categoria.slug}</span> (no
          cambia al renombrarla).
        </p>
      )}

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
          href="/admin/categorias"
          className="text-[15px] font-semibold text-muted px-4 h-12 inline-flex items-center"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
