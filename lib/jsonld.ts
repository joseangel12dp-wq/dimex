import { SITE_URL } from "@/lib/site";
import type { Configuracion, Kit, Producto } from "@/types/db";

/**
 * Constructores de datos estructurados (schema.org) para SEO (§3):
 * - LocalBusiness: el negocio (en el inicio).
 * - Product: cada kit (tiene su propia página).
 * - ItemList: listados de productos (catálogo/categoría) y de kits.
 */

export function localBusinessLd(config: Configuracion | null) {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "DIMEX",
    description:
      "Papelería en Maracaibo: cuadernos, escritura, arte, útiles escolares, oficina y kits. Pedido por WhatsApp, retiro en tienda o delivery.",
    url: SITE_URL,
    telephone: config?.whatsapp ? `+${config.whatsapp}` : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: config?.direccion ?? "Maracaibo, Zulia",
      addressLocality: "Maracaibo",
      addressRegion: "Zulia",
      addressCountry: "VE",
    },
    areaServed: "Zulia, Venezuela",
    openingHours: config?.horario ?? undefined,
    sameAs: [config?.instagram_url, config?.tiktok_url].filter(Boolean),
  };
}

export function kitProductLd(kit: Kit) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: kit.nombre,
    description: kit.descripcion ?? `Kit ${kit.nombre} de DIMEX.`,
    image: kit.imagen_url ?? undefined,
    url: `${SITE_URL}/kits/${kit.slug}`,
    brand: { "@type": "Brand", name: "DIMEX" },
    offers: {
      "@type": "Offer",
      price: kit.precio.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/kits/${kit.slug}`,
    },
  };
}

/** Lista de productos (catálogo o categoría). Emite un Product por ítem. */
export function productosItemListLd(productos: Producto[], nombreLista: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: nombreLista,
    numberOfItems: productos.length,
    itemListElement: productos.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.nombre,
        description: p.descripcion ?? undefined,
        image: p.imagen_url ?? undefined,
        offers: {
          "@type": "Offer",
          price: p.precio.toFixed(2),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };
}

/** Lista de kits (página /kits), enlazando a la página propia de cada kit. */
export function kitsItemListLd(kits: Kit[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Kits DIMEX",
    numberOfItems: kits.length,
    itemListElement: kits.map((k, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/kits/${k.slug}`,
      name: k.nombre,
    })),
  };
}
