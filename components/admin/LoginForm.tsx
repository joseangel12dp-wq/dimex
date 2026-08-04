"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** Formulario de acceso al panel (email + contraseña de Supabase Auth). */
export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }
    router.push("/admin/productos");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-[13px] font-semibold text-[#4a5158]">
          Correo
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-[#e3e6ea] rounded-[10px] px-[15px] py-3 text-[15px] h-12 outline-none focus:border-brand"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-[13px] font-semibold text-[#4a5158]">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-[#e3e6ea] rounded-[10px] px-[15px] py-3 text-[15px] h-12 outline-none focus:border-brand"
        />
      </div>

      {error && <p className="m-0 text-sm text-accent">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-1 bg-brand text-white rounded-[10px] h-12 text-[15px] font-semibold cursor-pointer disabled:opacity-60"
      >
        {loading ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
