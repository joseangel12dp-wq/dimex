import { requireDueno } from "@/lib/auth";
import { getConfiguracion } from "@/lib/queries";
import ConfiguracionForm from "@/components/admin/ConfiguracionForm";
import { actualizarConfiguracion } from "./actions";

// Solo dueño (§5).
export default async function ConfiguracionAdminPage() {
  await requireDueno();
  const config = await getConfiguracion();

  return (
    <div>
      <h1 className="m-0 text-2xl font-extrabold tracking-[-.02em] text-ink">Configuración</h1>
      <p className="m-0 mb-6 text-sm text-muted-2">
        Datos del negocio. Se reflejan en la tienda (carrito, pie, botón de WhatsApp e inicio).
      </p>
      <ConfiguracionForm config={config} action={actualizarConfiguracion} />
    </div>
  );
}
