/**
 * Lógica del carrito (independiente de React).
 * El estado vive en `localStorage`, clave `dimex_store`, para que sobreviva
 * a recargas y cierres del navegador, sin necesidad de cuenta (§8).
 */

export type CartLine = { id: string; name: string; price: number; qty: number };
export type Fulfillment = "pickup" | "delivery";
export type CartState = {
  items: CartLine[];
  fulfillment: Fulfillment;
  customerName: string;
  paymentMethod: string; // "" = ninguno seleccionado
};

const KEY = "dimex_store";

export const emptyCart: CartState = {
  items: [],
  fulfillment: "pickup",
  customerName: "",
  paymentMethod: "",
};

function isLine(l: unknown): l is CartLine {
  if (!l || typeof l !== "object") return false;
  const x = l as Record<string, unknown>;
  return (
    typeof x.id === "string" &&
    typeof x.name === "string" &&
    typeof x.price === "number" &&
    typeof x.qty === "number"
  );
}

/** Lee el carrito del localStorage. Si está corrupto o vacío, devuelve uno limpio (§9). */
export function loadCart(): CartState {
  if (typeof window === "undefined") return emptyCart;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyCart;
    const s = JSON.parse(raw) as Record<string, unknown>;
    return {
      items: Array.isArray(s.cart) ? (s.cart.filter(isLine) as CartLine[]) : [],
      fulfillment: s.fulfillment === "delivery" ? "delivery" : "pickup",
      customerName: typeof s.customerName === "string" ? s.customerName : "",
      paymentMethod: typeof s.paymentMethod === "string" ? s.paymentMethod : "",
    };
  } catch {
    return emptyCart;
  }
}

/** Guarda el carrito. Nunca lanza: si el almacenamiento falla, la tienda sigue. */
export function saveCart(s: CartState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        cart: s.items,
        fulfillment: s.fulfillment,
        customerName: s.customerName,
        paymentMethod: s.paymentMethod,
      })
    );
  } catch {
    /* almacenamiento lleno o bloqueado */
  }
}

export function cartCount(items: CartLine[]): number {
  return items.reduce((n, l) => n + l.qty, 0);
}

export function cartSubtotal(items: CartLine[]): number {
  return items.reduce((n, l) => n + l.price * l.qty, 0);
}
