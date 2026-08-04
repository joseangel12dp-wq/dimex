/** Formateo de dinero y derivaciones de precio (reutilizable en toda la tienda). */

/** "$12.00" — precios en USD, siempre con dos decimales. */
export function money(n: number): string {
  return "$" + (Number(n) || 0).toFixed(2);
}

/** "-30%" a partir del precio actual y el anterior; null si no hay rebaja. */
export function descuentoLabel(
  precio: number,
  precioAnterior: number | null
): string | null {
  if (!precioAnterior || precioAnterior <= precio) return null;
  return "-" + Math.round((1 - precio / precioAnterior) * 100) + "%";
}
