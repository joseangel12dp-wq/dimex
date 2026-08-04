import Link from "next/link";
import { requireDueno } from "@/lib/auth";
import EmpleadoForm from "@/components/admin/EmpleadoForm";
import { crearEmpleado } from "../actions";

export default async function NuevoUsuarioPage() {
  await requireDueno();

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <div>
        <h1 className="m-0 text-2xl font-extrabold tracking-[-.02em] text-ink">Nuevo usuario</h1>
        <p className="mt-4 text-[15px] text-muted max-w-[520px]">
          Falta la clave <span className="tnum font-semibold">service_role</span> en el servidor.
          Agrégala en <span className="tnum">.env.local</span> para poder crear usuarios.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/usuarios" className="text-sm text-muted-2 mb-4 inline-block">
        ← Volver a usuarios
      </Link>
      <h1 className="m-0 mb-6 text-2xl font-extrabold tracking-[-.02em] text-ink">Nuevo usuario</h1>
      <EmpleadoForm action={crearEmpleado} />
    </div>
  );
}
