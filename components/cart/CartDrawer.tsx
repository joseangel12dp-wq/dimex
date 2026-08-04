"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { useSiteConfig } from "@/components/ConfigProvider";
import { money } from "@/lib/format";
import { buildOrderMessage, waLink } from "@/lib/whatsapp";
import { CartIcon, WhatsAppIcon } from "@/components/icons";

/** Panel lateral del carrito, controlado por el contexto (useCart). */
export default function CartDrawer() {
  const {
    items,
    count,
    subtotal,
    fulfillment,
    customerName,
    paymentMethod,
    isOpen,
    inc,
    dec,
    remove,
    setFulfillment,
    setCustomerName,
    setPaymentMethod,
    closeCart,
  } = useCart();
  const { whatsapp, metodosPago } = useSiteConfig();

  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  // Accesibilidad (§10): Escape para cerrar, bloqueo de scroll, manejo de foco.
  useEffect(() => {
    if (!isOpen) return;
    lastFocused.current = document.activeElement as HTMLElement;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lastFocused.current?.focus();
    };
  }, [isOpen, closeCart]);

  const pickupOn = fulfillment === "pickup";
  const segBase =
    "flex-1 rounded-[9px] py-3 text-sm font-semibold cursor-pointer transition-colors min-h-11 border";
  const segOn = "border-brand bg-brand text-white";
  const segOff = "border-[#e3e6ea] bg-white text-[#4a5158]";

  const whatsappHref =
    count > 0
      ? waLink(buildOrderMessage(items, fulfillment, customerName, paymentMethod), whatsapp)
      : "#";

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeCart}
        aria-hidden="true"
        className={`fixed inset-0 z-[90] bg-[rgba(18,22,27,.42)] backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Tu pedido"
        className={`fixed top-0 right-0 bottom-0 z-[100] w-[420px] max-w-[92vw] bg-white shadow-[-20px_0_60px_-30px_rgba(18,22,27,.5)] flex flex-col transition-transform duration-[400ms] ease-[cubic-bezier(.16,.84,.44,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Encabezado */}
        <div className="px-[22px] py-5 border-b border-line-2 flex items-center justify-between gap-3">
          <div className="flex-1 flex items-baseline gap-2.5">
            <h2 className="m-0 text-[19px] font-extrabold tracking-[-.02em]">Tu pedido</h2>
            <span className="tnum text-[13px] text-muted-2">{count} artículos</span>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={closeCart}
            aria-label="Cerrar"
            className="border-0 bg-surface w-10 h-10 rounded-[9px] text-[17px] cursor-pointer text-[#4a5158]"
          >
            ✕
          </button>
        </div>

        {count === 0 ? (
          /* Estado vacío */
          <div className="flex-1 flex flex-col items-center justify-center gap-3.5 p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center">
              <CartIcon size={28} className="text-[#9aa3ad]" />
            </div>
            <p className="m-0 text-muted text-[15px]">
              Tu carrito está vacío.
              <br />
              Agrega productos o kits para empezar.
            </p>
            <button
              type="button"
              onClick={closeCart}
              className="border-0 bg-brand text-white rounded-[10px] px-6 py-3 text-[15px] font-semibold cursor-pointer"
            >
              Seguir comprando
            </button>
          </div>
        ) : (
          <>
            {/* Aviso */}
            <div className="px-[22px] pt-3.5 pb-0.5">
              <div className="bg-[#eef2f7] rounded-xl px-[15px] py-3 flex gap-[11px] items-start">
                <WhatsAppIcon size={19} className="text-brand shrink-0 mt-0.5" />
                <span className="text-[13.5px] text-[#3a434d] leading-[1.45]">
                  Confirmamos disponibilidad y envío por WhatsApp antes de cerrar tu pedido.
                </span>
              </div>
            </div>

            {/* Lista de ítems */}
            <div className="noscroll flex-1 overflow-y-auto px-[22px] py-1">
              {items.map((l) => (
                <div key={l.id} className="flex gap-3.5 py-[18px] border-b border-[#f0f2f4]">
                  <div className="w-16 h-16 rounded-[10px] shrink-0 bg-surface [background-image:repeating-linear-gradient(45deg,#eaedf0_0_8px,#f4f6f8_8px_16px)]" />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex justify-between gap-2.5">
                      <span className="text-[15px] font-semibold leading-[1.25]">{l.name}</span>
                      <button
                        type="button"
                        onClick={() => remove(l.id)}
                        aria-label={`Quitar ${l.name}`}
                        className="border-0 bg-transparent text-[#b0b7be] text-base cursor-pointer p-0 h-5"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-[#e3e6ea] rounded-[9px] overflow-hidden">
                        <button
                          type="button"
                          onClick={() => dec(l.id)}
                          aria-label="Quitar uno"
                          className="border-0 bg-[#fafbfc] w-[34px] h-[34px] text-[17px] cursor-pointer text-[#4a5158]"
                        >
                          –
                        </button>
                        <span className="tnum w-9 text-center text-[15px] font-semibold">{l.qty}</span>
                        <button
                          type="button"
                          onClick={() => inc(l.id)}
                          aria-label="Agregar uno"
                          className="border-0 bg-[#fafbfc] w-[34px] h-[34px] text-[17px] cursor-pointer text-[#4a5158]"
                        >
                          +
                        </button>
                      </div>
                      <span className="tnum text-[15px] font-bold text-brand-ink">
                        {money(l.price * l.qty)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pie: entrega, nombre, subtotal, envío */}
            <div className="border-t border-line-2 px-[22px] py-5 flex flex-col gap-[15px]">
              <div className="flex flex-col gap-[9px]">
                <span className="text-xs font-bold tracking-[.06em] uppercase text-muted-2">Entrega</span>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFulfillment("pickup")}
                    className={`${segBase} ${pickupOn ? segOn : segOff}`}
                  >
                    Retiro en tienda
                  </button>
                  <button
                    type="button"
                    onClick={() => setFulfillment("delivery")}
                    className={`${segBase} ${!pickupOn ? segOn : segOff}`}
                  >
                    Delivery
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="cart-name" className="text-[13px] font-semibold text-[#4a5158]">
                  Tu nombre
                </label>
                <input
                  id="cart-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="¿A nombre de quién?"
                  className="border border-[#e3e6ea] rounded-[10px] px-[15px] py-[13px] text-[15px] h-12 outline-none bg-[#fafbfc]"
                />
              </div>

              <div className="flex flex-col gap-[9px]">
                <span className="text-xs font-bold tracking-[.06em] uppercase text-muted-2">
                  Método de pago
                </span>
                <div className="flex flex-wrap gap-[7px]">
                  {metodosPago.map((pm) => {
                    const on = paymentMethod === pm;
                    return (
                      <button
                        key={pm}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setPaymentMethod(on ? "" : pm)}
                        className={`rounded-[7px] px-2.5 py-[6px] text-xs font-semibold border cursor-pointer transition-colors ${
                          on
                            ? "border-brand bg-brand text-white"
                            : "border-[#e7e9ec] bg-white text-muted hover:border-brand"
                        }`}
                      >
                        {pm}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-[15px] text-[#5c646d]">Subtotal</span>
                <span className="tnum text-[23px] font-extrabold text-ink tracking-[-.02em]">
                  {money(subtotal)}
                </span>
              </div>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-[54px] bg-wa text-white rounded-xl text-base font-bold flex items-center justify-center gap-2.5 hover:opacity-95"
              >
                <WhatsAppIcon size={20} />
                Enviar pedido por WhatsApp
              </a>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
