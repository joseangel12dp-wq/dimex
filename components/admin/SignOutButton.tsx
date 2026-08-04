"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** Cierra la sesión del panel y vuelve al login. */
export default function SignOutButton() {
  const router = useRouter();

  const onClick = async () => {
    await createClient().auth.signOut();
    router.push("/admin");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-[9px] px-3 py-2 text-sm font-semibold text-accent border border-line hover:bg-surface cursor-pointer"
    >
      Salir
    </button>
  );
}
