import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getKitSlugs, getCategorias, getPromocionSlugs } from "@/lib/queries";

export const revalidate = 3600; // se regenera cada hora

/**
 * Mapa del sitio (sitemap.xml) con todas las URLs públicas indexables:
 * páginas fijas + cada kit + cada categoría. Las páginas de kits llevan la
 * mayor prioridad (son la principal fuente de tráfico del negocio).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [kits, categorias, promos] = await Promise.all([
    getKitSlugs(),
    getCategorias(),
    getPromocionSlugs(),
  ]);
  const now = new Date();

  const fijas: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/kits`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/catalogo`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    // /empresas está oculta por ahora (no se incluye en el sitemap).
    { url: `${SITE_URL}/nosotros`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const kitsUrls: MetadataRoute.Sitemap = kits.map((k) => ({
    url: `${SITE_URL}/kits/${k.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const catUrls: MetadataRoute.Sitemap = categorias.map((c) => ({
    url: `${SITE_URL}/categoria/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const promoUrls: MetadataRoute.Sitemap = promos.map((p) => ({
    url: `${SITE_URL}/promocion/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...fijas, ...kitsUrls, ...catUrls, ...promoUrls];
}
