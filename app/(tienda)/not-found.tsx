import Link from "next/link";

// 404 dentro de la tienda: se muestra con la cabecera y el pie (§9).
// Aparece cuando un kit/categoría no existe o está inactivo, o en rutas
// inexistentes bajo la tienda.
export default function NotFound() {
  return (
    <section className="max-w-[720px] mx-auto px-4 sm:px-7 py-20 text-center">
      <span className="inline-block text-[13px] tracking-[.14em] uppercase text-accent font-bold mb-3">
        Página no encontrada
      </span>
      <h1 className="m-0 text-3xl sm:text-4xl font-extrabold tracking-[-.025em] text-ink">
        No encontramos esta página
      </h1>
      <p className="mt-3 text-muted text-[15px] max-w-[460px] mx-auto">
        Puede que el enlace haya cambiado o el producto ya no esté disponible. Vuelve al inicio o
        mira nuestros kits.
      </p>
      <div className="mt-7 flex gap-3 justify-center flex-wrap">
        <Link href="/" className="bg-brand text-white rounded-[11px] px-[26px] py-[14px] text-[15px] font-semibold">
          Ir al inicio
        </Link>
        <Link
          href="/kits"
          className="border border-[#d4d9df] bg-white text-ink rounded-[11px] px-[26px] py-[14px] text-[15px] font-semibold"
        >
          Ver kits
        </Link>
      </div>
    </section>
  );
}
