"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Promocion } from "@/types/db";
import type { FormState } from "@/lib/admin";
import ImageUploader from "@/components/admin/ImageUploader";

const inputCls =
  "border border-[#e3e6ea] rounded-[10px] px-[15px] py-3 text-[15px] outline-none focus:border-brand bg-white";
const labelCls = "text-[13px] font-semibold text-[#4a5158]";

// ISO → "YYYY-MM-DD" para los input date.
const soloFecha = (iso: string | null) => (iso ? iso.slice(0, 10) : "");

/** Formulario para crear o editar una promoción del hero. */
export default function PromocionForm({
  promocion,
  action,
}: {
  promocion?: Promocion;
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});

  return (
    <form action={formAction} className="max-w-[640px] flex flex-col gap-5">
      {promocion && <input type="hidden" name="id" value={promocion.id} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="titulo" className={labelCls}>Etiqueta (texto pequeño arriba del hero)</label>
        <input
          id="titulo"
          name="titulo"
          required
          defaultValue={promocion?.titulo}
          placeholder="Vuelta a clases"
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="subtitulo" className={labelCls}>Titular grande</label>
        <input
          id="subtitulo"
          name="subtitulo"
          defaultValue={promocion?.subtitulo ?? ""}
          placeholder="Todo lo que escribe tu día, en un solo lugar."
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-1.5 max-w-[320px]">
        <label htmlFor="enlace" className={labelCls}>Enlace del botón (ej. /kits)</label>
        <input
          id="enlace"
          name="enlace"
          defaultValue={promocion?.enlace ?? ""}
          placeholder="/kits"
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className={labelCls}>Imagen del banner (opcional)</span>
        <ImageUploader tipo="promocion" folder="promociones" currentUrl={promocion?.imagen_url} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[420px]">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="inicia_en" className={labelCls}>Desde</label>
          <input
            id="inicia_en"
            name="inicia_en"
            type="date"
            defaultValue={promocion ? soloFecha(promocion.inicia_en) : ""}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="termina_en" className={labelCls}>Hasta (opcional)</label>
          <input
            id="termina_en"
            name="termina_en"
            type="date"
            defaultValue={promocion ? soloFecha(promocion.termina_en) : ""}
            className={inputCls}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-[#2a2f36] cursor-pointer">
        <input type="checkbox" name="activa" defaultChecked={promocion ? promocion.activa : true} className="w-4 h-4" />
        Activa (se muestra en el inicio si la fecha está vigente)
      </label>

      <p className="m-0 text-[13px] text-muted-2 bg-surface rounded-[10px] px-4 py-3">
        Solo se muestra una promoción a la vez en el hero: la activa y vigente más reciente. Si no
        hay ninguna, el inicio usa su texto por defecto.
      </p>

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
          href="/admin/promociones"
          className="text-[15px] font-semibold text-muted px-4 h-12 inline-flex items-center"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
