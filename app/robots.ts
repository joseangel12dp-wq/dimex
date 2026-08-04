import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * robots.txt: permite indexar la tienda pública, pero NO el panel /admin.
 * Apunta al sitemap para que los buscadores lo encuentren.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
