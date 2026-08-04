"use client";

import { useActionState } from "react";
import type { Configuracion } from "@/types/db";
import type { FormState } from "@/lib/admin";

const inputCls =
  "border border-[#e3e6ea] rounded-[10px] px-[15px] py-3 text-[15px] outline-none focus:border-brand bg-white";
const labelCls = "text-[13px] font-semibold text-[#4a5158]";

/** Formulario de configuración del negocio (solo dueño). */
export default function ConfiguracionForm({
  config,
  action,
}: {
  config: Configuracion | null;
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});

  return (
    <form action={formAction} className="max-w-[640px] flex flex-col gap-5">
      <div className="flex flex-col gap-1.5 max-w-[320px]">
        <label htmlFor="whatsapp" className={labelCls}>WhatsApp (solo números, con código de país)</label>
        <input
          id="whatsapp"
          name="whatsapp"
          required
          defaultValue={config?.whatsapp ?? ""}
          placeholder="584246049228"
          className={`${inputCls} tnum`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="direccion" className={labelCls}>Dirección</label>
        <input id="direccion" name="direccion" defaultValue={config?.direccion ?? ""} className={inputCls} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="horario" className={labelCls}>Horario</label>
        <input id="horario" name="horario" defaultValue={config?.horario ?? ""} className={inputCls} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="metodos_pago" className={labelCls}>Métodos de pago (uno por línea)</label>
        <textarea
          id="metodos_pago"
          name="metodos_pago"
          rows={5}
          defaultValue={(config?.metodos_pago ?? []).join("\n")}
          placeholder={"Pago móvil\nEfectivo $\nZelle"}
          className={`${inputCls} resize-y`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="instagram_url" className={labelCls}>Instagram (URL)</label>
          <input id="instagram_url" name="instagram_url" defaultValue={config?.instagram_url ?? ""} placeholder="https://instagram.com/…" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="tiktok_url" className={labelCls}>TikTok (URL)</label>
          <input id="tiktok_url" name="tiktok_url" defaultValue={config?.tiktok_url ?? ""} placeholder="https://tiktok.com/@…" className={inputCls} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="mapa_embed" className={labelCls}>Mapa (URL de inserción de Google Maps)</label>
        <input id="mapa_embed" name="mapa_embed" defaultValue={config?.mapa_embed ?? ""} className={inputCls} />
      </div>

      {state.error && <p className="m-0 text-sm text-accent">{state.error}</p>}
      {state.ok && <p className="m-0 text-sm font-semibold text-[#1f8f4e]">Guardado ✓</p>}

      <div className="pt-1">
        <button
          type="submit"
          disabled={pending}
          className="bg-brand text-white rounded-[10px] px-6 h-12 text-[15px] font-semibold cursor-pointer disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
