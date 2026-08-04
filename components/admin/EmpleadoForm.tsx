"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { FormState } from "@/lib/admin";

const inputCls =
  "border border-[#e3e6ea] rounded-[10px] px-[15px] py-3 text-[15px] outline-none focus:border-brand bg-white";
const labelCls = "text-[13px] font-semibold text-[#4a5158]";

/** Formulario para crear un usuario del panel (empleado o dueño). */
export default function EmpleadoForm({
  action,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});

  return (
    <form action={formAction} className="max-w-[520px] flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nombre" className={labelCls}>Nombre</label>
        <input id="nombre" name="nombre" className={inputCls} placeholder="Nombre del empleado" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className={labelCls}>Correo (con el que entrará al panel)</label>
        <input id="email" name="email" type="email" required className={inputCls} />
      </div>

      <div className="flex flex-col gap-1.5 max-w-[320px]">
        <label htmlFor="password" className={labelCls}>Contraseña (mínimo 6 caracteres)</label>
        <input id="password" name="password" type="text" required minLength={6} className={inputCls} />
        <span className="text-[12px] text-muted-2">
          Compártela con el empleado; podrá cambiarla luego.
        </span>
      </div>

      <div className="flex flex-col gap-1.5 max-w-[220px]">
        <label htmlFor="rol" className={labelCls}>Rol</label>
        <select id="rol" name="rol" defaultValue="empleado" className={`${inputCls} cursor-pointer`}>
          <option value="empleado">Empleado</option>
          <option value="dueno">Dueño</option>
        </select>
      </div>

      {state.error && <p className="m-0 text-sm text-accent">{state.error}</p>}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="bg-brand text-white rounded-[10px] px-6 h-12 text-[15px] font-semibold cursor-pointer disabled:opacity-60"
        >
          {pending ? "Creando…" : "Crear usuario"}
        </button>
        <Link
          href="/admin/usuarios"
          className="text-[15px] font-semibold text-muted px-4 h-12 inline-flex items-center"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
