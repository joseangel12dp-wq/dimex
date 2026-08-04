// Marcador de sección del panel. El CRUD real llega en la Etapa 6.
export default function PanelPlaceholder({
  titulo,
  nota,
}: {
  titulo: string;
  nota?: string;
}) {
  return (
    <div>
      <h1 className="m-0 text-2xl font-extrabold tracking-[-.02em] text-ink">{titulo}</h1>
      <p className="mt-2 text-muted text-[15px] max-w-[520px]">
        {nota ?? "Esta sección se construye en la Etapa 6."}
      </p>
    </div>
  );
}
