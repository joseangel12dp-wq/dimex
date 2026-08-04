"use client";

import { useEffect } from "react";
import Link from "next/link";

// Pantalla de error dentro de la tienda (§9): mensaje amable, nunca pantalla
// blanca. Ofrece reintentar y volver al inicio.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="max-w-[720px] mx-auto px-4 sm:px-7 py-20 text-center">
      <span className="inline-block text-[13px] tracking-[.14em] uppercase text-accent font-bold mb-3">
        Algo salió mal
      </span>
      <h1 className="m-0 text-3xl font-extrabold tracking-[-.025em] text-ink">
        Tuvimos un problema al cargar esto
      </h1>
      <p className="mt-3 text-muted text-[15px] max-w-[460px] mx-auto">
        Vuelve a intentarlo en un momento. Si el problema sigue, escríbenos por WhatsApp y te
        ayudamos con tu pedido.
      </p>
      <div className="mt-7 flex gap-3 justify-center flex-wrap">
        <button
          type="button"
          onClick={reset}
          className="bg-brand text-white rounded-[11px] px-[26px] py-[14px] text-[15px] font-semibold cursor-pointer"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="border border-[#d4d9df] bg-white text-ink rounded-[11px] px-[26px] py-[14px] text-[15px] font-semibold"
        >
          Ir al inicio
        </Link>
      </div>
    </section>
  );
}
