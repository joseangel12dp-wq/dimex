import Link from "next/link";

// 404 global (para rutas que no coinciden con ningún segmento). No usa el
// layout de la tienda, así que es autónoma con su propia marca.
export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-white">
      <Link
        href="/"
        aria-label="DIMEX · Inicio"
        className="font-extrabold text-[34px] tracking-[.03em] text-accent mb-6"
      >
        DIMEX
      </Link>
      <span className="inline-block text-[13px] tracking-[.14em] uppercase text-accent font-bold mb-2">
        Error 404
      </span>
      <h1 className="m-0 text-3xl font-extrabold tracking-[-.025em] text-ink">
        Página no encontrada
      </h1>
      <p className="mt-3 text-muted text-[15px] max-w-[420px]">
        La dirección que buscas no existe. Vuelve al inicio de la tienda.
      </p>
      <Link
        href="/"
        className="mt-7 bg-brand text-white rounded-[11px] px-[26px] py-[14px] text-[15px] font-semibold"
      >
        Ir al inicio
      </Link>
    </main>
  );
}
