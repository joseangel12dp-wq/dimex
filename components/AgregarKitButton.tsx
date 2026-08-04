"use client";

import { useCart } from "@/components/cart/CartProvider";

/**
 * Botón para agregar un kit al carrito. Cliente pequeño y flexible (acepta su
 * propio estilo y texto), reutilizado en el detalle del kit y en la barra fija
 * móvil. El kit entra al carrito como una sola línea.
 */
export default function AgregarKitButton({
  id,
  name,
  price,
  className,
  children,
}: {
  id: string;
  name: string;
  price: number;
  className?: string;
  children: React.ReactNode;
}) {
  const { add } = useCart();
  return (
    <button type="button" onClick={() => add({ id, name, price })} className={className}>
      {children}
    </button>
  );
}
