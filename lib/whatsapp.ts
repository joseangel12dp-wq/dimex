import { WHATSAPP } from "./site";
import { cartSubtotal, type CartLine, type Fulfillment } from "./cart";
import { money } from "./format";

/**
 * Construye un enlace `wa.me` con el mensaje ya codificado para URL.
 * El cierre de venta ocurre por WhatsApp (§8 del anexo), sin pasarela de pago.
 */
export function waLink(mensaje: string, numero: string = WHATSAPP): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

// Mensajes precargados reutilizables (§8).
export const WA_MENSAJES = {
  consultaGeneral: "Hola DIMEX, tengo una consulta.",
  cotizacionEmpresas:
    "Hola DIMEX Empresas, quiero solicitar una cotización por volumen. Mi empresa/institución es:",
};

/** Mensaje del pedido con el contenido del carrito (basado en el §8). */
export function buildOrderMessage(
  items: CartLine[],
  fulfillment: Fulfillment,
  customerName: string,
  paymentMethod = ""
): string {
  const lineas = items
    .map((l) => `• ${l.qty}x ${l.name} — ${money(l.price * l.qty)}`)
    .join("\n");
  const entrega = fulfillment === "delivery" ? "Delivery" : "Retiro en tienda";
  const nombre = customerName.trim() || "(sin especificar)";
  const pago = paymentMethod.trim() || "(por confirmar)";
  return `Hola DIMEX, quiero hacer un pedido:\n\n${lineas}\n\nSubtotal: ${money(
    cartSubtotal(items)
  )}\n\nEntrega: ${entrega}\nPago: ${pago}\nNombre: ${nombre}`;
}
