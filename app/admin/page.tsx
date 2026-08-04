import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false }, // el panel no se indexa
};

export default async function AdminLoginPage() {
  // Si ya hay sesión con perfil activo, directo al panel.
  const perfil = await getSessionProfile();
  if (perfil) redirect("/admin/productos");

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-6">
          <span className="font-extrabold text-[30px] text-accent tracking-[.03em]">DIMEX</span>
          <p className="mt-1 text-sm text-muted">Panel administrativo</p>
        </div>
        <div className="bg-white border border-line rounded-2xl p-6 sm:p-7 shadow-[0_18px_40px_-28px_rgba(20,30,45,.35)]">
          <LoginForm />
        </div>
        <p className="text-center mt-5 text-[13px] text-muted-2">
          ¿Problemas para entrar? Contacta al dueño de la tienda.
        </p>
      </div>
    </main>
  );
}
