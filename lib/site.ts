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
  // Embed de Google Maps con la ubicación real de la tienda (pin con nombre).
  mapaEmbed:
    "https://maps.google.com/maps?q=10.680094324205516,-71.60626154338263(Papeler%C3%ADa%20DIMEX,%20Maracaibo)&z=16&output=embed",
};

// Coordenadas de la tienda (para "Cómo llegar" y datos estructurados).
export const COORDS = { lat: 10.680094324205516, lng: -71.60626154338263 };

// Métodos de pago por defecto (la lista real vive en configuracion.metodos_pago).
export const METODOS_PAGO = ["Pago móvil", "Zelle", "Punto de venta", "Efectivo"];

// Navegación principal (URLs reales, sitio multipágina).
// "Empresas" está oculta por ahora (se puede reactivar agregándola aquí,
// quitando el notFound() de su página y volviendo a listarla en el pie/sitemap).
export const NAV = [
  { label: "Inicio", href: "/" },
  { label: "Kits", href: "/kits" },
  { label: "Categorías", href: "/catalogo" },
  { label: "Nosotros", href: "/nosotros" },
];
