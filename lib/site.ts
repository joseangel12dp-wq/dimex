/**
 * Datos del negocio y constantes de marca.
 *
 * ⚠️ TEMPORAL: en la Etapa 6 varios de estos valores pasarán a leerse de la
 * tabla `configuracion` de Supabase (editable desde el panel por el dueño).
 * Por ahora viven aquí como valores por defecto para poder construir la tienda.
 * Reemplaza los marcados con TODO cuando tengas el dato real de producción.
 */

// Número de WhatsApp de producción (formato internacional, sin "+" ni espacios).
export const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? "584246049228";

// URL pública del sitio (para SEO: sitemap, robots, enlaces absolutos).
// En producción se define NEXT_PUBLIC_SITE_URL con el dominio real.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const SITE = {
  nombre: "DIMEX",
  descripcion: "Papelería en Maracaibo · Retiro y delivery",
  direccion: "Av. 5 de Julio, Maracaibo, Zulia", // TODO: dirección exacta de producción
  horario: "Lun a Sáb · 8:30 – 18:00", // TODO: confirmar horario real
  ciudad: "Maracaibo",
  estado: "Zulia",
  instagramUrl: "#", // TODO: enlace real de Instagram
  tiktokUrl: "#", // TODO: enlace real de TikTok
  // Embed de Google Maps (centrado en Maracaibo mientras no haya coordenadas exactas).
  mapaEmbed:
    "https://maps.google.com/maps?q=Maracaibo,%20Zulia,%20Venezuela&z=13&output=embed",
};

// Métodos de pago (footer del prototipo y tabla configuracion.metodos_pago).
export const METODOS_PAGO = [
  "Pago móvil",
  "Efectivo $",
  "Zelle",
  "USDT",
  "Transferencia",
];

// Navegación principal (URLs reales, sitio multipágina).
export const NAV = [
  { label: "Inicio", href: "/" },
  { label: "Kits", href: "/kits" },
  { label: "Categorías", href: "/catalogo" },
  { label: "Empresas", href: "/empresas" },
  { label: "Nosotros", href: "/nosotros" },
];
