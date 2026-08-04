// Barra superior de anuncio. Estática por ahora; en el futuro podría alimentarse
// de una promoción activa (tabla `promociones`, Etapa 6).
export default function AnnouncementBar() {
  return (
    <div className="bg-dark text-[#eef0f2] text-[13px] tracking-[.01em] min-h-[38px] flex items-center justify-center text-center px-4 py-2">
      Papelería en Maracaibo · Haz tu pedido por WhatsApp
    </div>
  );
}
