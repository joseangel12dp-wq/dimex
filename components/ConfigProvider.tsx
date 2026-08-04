"use client";

import { createContext, useContext } from "react";

/**
 * Datos de configuración que necesitan los componentes cliente de la tienda
 * (carrito, etc.). Se alimenta desde la tabla `configuracion` en el layout.
 */
export type SiteConfig = {
  whatsapp: string;
  metodosPago: string[];
};

const Ctx = createContext<SiteConfig | null>(null);

export function ConfigProvider({
  value,
  children,
}: {
  value: SiteConfig;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSiteConfig(): SiteConfig {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSiteConfig debe usarse dentro de <ConfigProvider>");
  return c;
}
