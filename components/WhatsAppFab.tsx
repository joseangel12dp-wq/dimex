import { waLink, WA_MENSAJES } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/icons";

// Botón flotante de WhatsApp, presente en toda la tienda (§8).
export default function WhatsAppFab({ whatsapp }: { whatsapp: string }) {
  return (
    <a
      href={waLink(WA_MENSAJES.consultaGeneral, whatsapp)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      title="Escríbenos por WhatsApp"
      className="fixed bottom-6 right-6 z-40 w-[58px] h-[58px] rounded-full bg-wa text-white flex items-center justify-center shadow-[0_10px_30px_-8px_rgba(37,211,102,.6)] [animation:floatIn_.6s_cubic-bezier(.16,.84,.44,1)_both]"
    >
      <WhatsAppIcon size={30} />
    </a>
  );
}
