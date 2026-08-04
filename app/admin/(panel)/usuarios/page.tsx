import Link from "next/link";
import { requireDueno } from "@/lib/auth";
import { getUsuariosAdmin } from "@/lib/usuarios";
import DeleteButton from "@/components/admin/DeleteButton";
import {
  cambiarRolUsuario,
  alternarActivoUsuario,
  eliminarUsuario,
} from "./actions";

export default async function UsuariosAdminPage() {
  const dueno = await requireDueno();

  // Sin la clave service_role no se pueden gestionar cuentas de acceso.
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <div>
        <h1 className="m-0 text-2xl font-extrabold tracking-[-.02em] text-ink">Usuarios</h1>
        <div className="mt-4 border border-line rounded-xl bg-white p-6 max-w-[560px]">
          <p className="m-0 text-[15px] text-[#2a2f36]">
            Falta configurar la clave <span className="tnum font-semibold">service_role</span> en el
            servidor (<span className="tnum">.env.local</span>). Sin ella no se pueden crear ni
            gestionar usuarios. Agrégala y recarga.
          </p>
        </div>
      </div>
    );
  }

  const usuarios = await getUsuariosAdmin();

  return (
    <div>
      <header className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="m-0 text-2xl font-extrabold tracking-[-.02em] text-ink">Usuarios</h1>
          <p className="m-0 text-sm text-muted-2">{usuarios.length} en total</p>
        </div>
        <Link
          href="/admin/usuarios/nuevo"
          className="bg-brand text-white rounded-[10px] px-[18px] py-2.5 text-sm font-semibold shrink-0"
        >
          + Nuevo usuario
        </Link>
      </header>

      <div className="flex flex-col gap-2">
        {usuarios.map((u) => {
          const soyYo = u.id === dueno.id;
          const esDueno = u.rol === "dueno";
          return (
            <div key={u.id} className="flex items-center gap-3 border border-line rounded-xl bg-white p-3">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[15px] truncate">
                  {u.nombre ?? "—"}
                  {soyYo && <span className="text-muted-2 font-normal"> (tú)</span>}
                </div>
                <div className="text-xs text-muted-2 truncate">{u.email ?? "sin correo"}</div>
              </div>

              <span
                className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  esDueno ? "bg-[#eef2f7] text-brand" : "bg-surface text-[#4a5158]"
                }`}
              >
                {esDueno ? "Dueño" : "Empleado"}
              </span>
              <span
                className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  u.activo ? "bg-[#e9f6ee] text-[#1f8f4e]" : "bg-surface text-muted-2"
                }`}
              >
                {u.activo ? "Activo" : "Inactivo"}
              </span>

              {soyYo ? (
                <span className="shrink-0 text-xs text-muted-2 w-[220px] text-right">
                  Tu propia cuenta
                </span>
              ) : (
                <div className="flex items-center gap-3 shrink-0">
                  <form action={cambiarRolUsuario}>
                    <input type="hidden" name="id" value={u.id} />
                    <input type="hidden" name="rol" value={esDueno ? "empleado" : "dueno"} />
                    <button type="submit" className="text-sm font-semibold text-brand hover:underline cursor-pointer">
                      {esDueno ? "Hacer empleado" : "Hacer dueño"}
                    </button>
                  </form>
                  <form action={alternarActivoUsuario}>
                    <input type="hidden" name="id" value={u.id} />
                    <input type="hidden" name="activo" value={u.activo ? "false" : "true"} />
                    <button type="submit" className="text-sm font-semibold text-[#4a5158] hover:underline cursor-pointer">
                      {u.activo ? "Desactivar" : "Activar"}
                    </button>
                  </form>
                  <DeleteButton
                    action={eliminarUsuario}
                    id={u.id}
                    confirmMsg={`¿Quitar el acceso de ${u.nombre ?? u.email ?? "este usuario"}? No se puede deshacer.`}
                    label="Quitar"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
