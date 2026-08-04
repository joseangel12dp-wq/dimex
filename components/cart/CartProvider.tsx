"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  cartCount,
  cartSubtotal,
  emptyCart,
  loadCart,
  saveCart,
  type CartLine,
  type CartState,
  type Fulfillment,
} from "@/lib/cart";

type CartContext = {
  items: CartLine[];
  fulfillment: Fulfillment;
  customerName: string;
  paymentMethod: string;
  count: number;
  subtotal: number;
  isOpen: boolean;
  add: (item: Omit<CartLine, "qty">) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  remove: (id: string) => void;
  setFulfillment: (f: Fulfillment) => void;
  setCustomerName: (name: string) => void;
  setPaymentMethod: (m: string) => void;
  openCart: () => void;
  closeCart: () => void;
};

const Ctx = createContext<CartContext | null>(null);

/**
 * Estado global del carrito. Envuelve la tienda (ver app/(tienda)/layout.tsx).
 * Se hidrata desde localStorage al montar y se guarda en cada cambio.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>(emptyCart);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Cargar del localStorage al montar (en el cliente).
  useEffect(() => {
    setState(loadCart());
    setHydrated(true);
  }, []);

  // Guardar cada vez que cambie (solo después de la carga inicial).
  useEffect(() => {
    if (hydrated) saveCart(state);
  }, [state, hydrated]);

  const add = useCallback((item: Omit<CartLine, "qty">) => {
    setState((s) => {
      const items = s.items.slice();
      const i = items.findIndex((l) => l.id === item.id);
      if (i >= 0) items[i] = { ...items[i], qty: items[i].qty + 1 };
      else items.push({ ...item, qty: 1 });
      return { ...s, items };
    });
    setIsOpen(true); // abrir el carrito al agregar
  }, []);

  const inc = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      items: s.items.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l)),
    }));
  }, []);

  const dec = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      items: s.items.flatMap((l) => {
        if (l.id !== id) return [l];
        const qty = l.qty - 1;
        return qty <= 0 ? [] : [{ ...l, qty }]; // llegar a 0 lo elimina
      }),
    }));
  }, []);

  const remove = useCallback((id: string) => {
    setState((s) => ({ ...s, items: s.items.filter((l) => l.id !== id) }));
  }, []);

  const setFulfillment = useCallback((f: Fulfillment) => {
    setState((s) => ({ ...s, fulfillment: f }));
  }, []);

  const setCustomerName = useCallback((name: string) => {
    setState((s) => ({ ...s, customerName: name }));
  }, []);

  const setPaymentMethod = useCallback((m: string) => {
    setState((s) => ({ ...s, paymentMethod: m }));
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContext>(
    () => ({
      items: state.items,
      fulfillment: state.fulfillment,
      customerName: state.customerName,
      paymentMethod: state.paymentMethod,
      count: cartCount(state.items),
      subtotal: cartSubtotal(state.items),
      isOpen,
      add,
      inc,
      dec,
      remove,
      setFulfillment,
      setCustomerName,
      setPaymentMethod,
      openCart,
      closeCart,
    }),
    [
      state,
      isOpen,
      add,
      inc,
      dec,
      remove,
      setFulfillment,
      setCustomerName,
      setPaymentMethod,
      openCart,
      closeCart,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
