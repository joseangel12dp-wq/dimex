// Marcador temporal para páginas cuyo contenido real se construye en etapas
// posteriores. Mantiene el sitio navegable durante el desarrollo.
export default function EnConstruccion({
  titulo,
  nota,
}: {
  titulo: string;
  nota?: string;
}) {
  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-7 py-20 text-center">
      <span className="inline-block text-[13px] tracking-[.14em] uppercase text-accent font-bold mb-3">
        En construcción
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-[-.025em] text-ink">
        {titulo}
      </h1>
      {nota && (
        <p className="mt-3 text-muted text-[15px] max-w-[520px] mx-auto">{nota}</p>
      )}
    </section>
  );
}
