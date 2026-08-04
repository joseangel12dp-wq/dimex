import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionProfile } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";
import SignOutButton from "@/components/admin/SignOutButton";

/**
 * Armazón del panel protegido. Verifica sesión + perfil activo (si no, al login)
 * y muestra la barra lateral con la navegación según el rol.
 * (El `proxy` ya bloqueó a los no autenticados; esto es la segunda barrera.)
 */
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const perfil = await getSessionProfile();
  if (!perfil) redirect("/admin");
  const esDueno = perfil.rol === "dueno";

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row md:min-h-screen">
        <aside className="md:w-[248px] shrink-0 bg-white border-b md:border-b-0 md:border-r border-line flex flex-col">
          <div className="px-5 pt-4 pb-2">
            <Link href="/admin/productos" className="font-extrabold text-[22px] text-accent tracking-[.03em]">
              DIMEX
            </Link>
            <div className="text-xs text-muted-2 mt-0.5">
              Panel · {esDueno ? "Dueño" : "Empleado"}
            </div>
          </div>

          <AdminNav esDueno={esDueno} />

          <div className="mt-auto px-4 py-3 border-t border-line flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-ink truncate">
                {perfil.nombre ?? "Usuario"}
              </div>
            </div>
            <SignOutButton />
          </div>
        </aside>

        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
