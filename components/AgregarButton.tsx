"use client";

import { useCart } from "@/components/cart/CartProvider";
import { CartIcon } from "@/components/icons";

/**
 * Botón "agregar al carrito". Es un componente cliente pequeño para que las
 * tarjetas de producto puedan seguir siendo de servidor (mejor rendimiento).
 */
export default function AgregarButton({
  id,
  name,
  price,
}: {
  id: string;
  name: string;
  price: number;
}) {
  const { add } = useCart();
  return (
    <button
      type="button"
      onClick={() => add({ id, name, price })}
      aria-label={`Agregar ${name} al carrito`}
      title="Agregar al carrito"
      className="w-11 h-11 border-0 bg-brand text-white rounded-[10px] flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90"
    >
      <CartIcon size={19} />
    </button>
  );
}
