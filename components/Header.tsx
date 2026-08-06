"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NAV } from "@/lib/site";
import { money } from "@/lib/format";
import { useCart } from "@/components/cart/CartProvider";
import { useSiteConfig } from "@/components/ConfigProvider";
import { CartIcon, SearchIcon, MenuIcon } from "@/components/icons";

/**
 * Cabecera de la tienda: logo, buscador, carrito y navegación.
 * El carrito (cantidad/subtotal y apertura) viene del contexto useCart; el panel
 * del carrito se renderiza en <CartDrawer/>. El menú móvil se maneja aquí.
 */
export default function Header() {
  const { count, subtotal, openCart } = useCart();
  const { mostrarPrecios } = useSiteConfig();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const menuCloseRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const router = useRouter();

  // Enviar la búsqueda al catálogo.
  const submitSearch: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const q = term.trim();
    router.push(q ? `/catalogo?q=${encodeURIComponent(q)}` : "/catalogo");
    setSearchOpen(false);
  };

  // Buscador móvil: enfocar el campo, Escape para cerrar, bloquear scroll (§10).
  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    searchInputRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [searchOpen]);

  // Animar la burbuja del carrito cuando aumenta la cantidad.
  const badgeRef = useRef<HTMLSpanElement>(null);
  const prevCount = useRef(count);
  useEffect(() => {
    if (count > prevCount.current && badgeRef.current) {
      const el = badgeRef.current;
      el.style.animation = "none";
      void el.offsetWidth; // reiniciar la animación
      el.style.animation = "badgePop .5s ease";
    }
    prevCount.current = count;
  }, [count]);

  // Accesibilidad (§10) para el menú móvil.
  useEffect(() => {
    if (!menuOpen) return;
    lastFocused.current = document.activeElement as HTMLElement;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    menuCloseRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lastFocused.current?.focus();
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-brand shadow-[0_8px_24px_-18px_rgba(0,0,0,.6)]">
        <div className="max-w-[1280px] mx-auto flex items-center gap-2.5 sm:gap-[22px] px-4 py-[11px] sm:px-7 sm:py-4">
          {/* Menú (móvil) */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            className="sm:hidden shrink-0 flex items-center justify-center border border-white/30 bg-white/10 text-white w-11 h-11 rounded-[10px] cursor-pointer"
          >
            <MenuIcon size={20} />
          </button>

          {/* Logo */}
          <Link
            href="/"
            aria-label="DIMEX · Inicio"
            className="flex-1 flex items-center justify-center sm:justify-start font-extrabold text-[26px] sm:text-[27px] tracking-[.03em] text-accent"
            style={{ WebkitTextStroke: "0.7px #fff", WebkitTextFillColor: "var(--accent)", paintOrder: "stroke fill" }}
          >
            DIMEX
          </Link>

          {/* Buscador (escritorio) → navega al catálogo */}
          <form
            action="/catalogo"
            role="search"
            className="hidden sm:flex sm:flex-none w-full max-w-[520px] mx-auto items-center gap-2.5 border border-white/25 rounded-[10px] px-[15px] py-[11px] bg-white"
          >
            <SearchIcon size={17} className="text-[#9aa3ad] shrink-0" />
            <input
              name="q"
              placeholder="Buscar cuadernos, bolígrafos, kits…"
              aria-label="Buscar"
              className="border-0 bg-transparent outline-none w-full text-[15px] text-body"
            />
          </form>

          {/* Acciones */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 ml-auto sm:ml-0 sm:flex-1 sm:justify-end">
            {/* Buscar (móvil) → abre la pantalla de búsqueda */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Buscar"
              className="sm:hidden flex items-center justify-center border border-white/30 bg-white/10 text-white w-11 h-11 rounded-[10px] cursor-pointer"
            >
              <SearchIcon size={19} />
            </button>

            {/* Carrito */}
            <button
              type="button"
              onClick={openCart}
              aria-label="Ver tu pedido"
              className="relative flex items-center justify-center gap-2.5 bg-accent text-white rounded-[10px] w-11 h-11 p-0 sm:w-auto sm:h-auto sm:px-[18px] sm:py-[11px] text-sm font-semibold cursor-pointer"
            >
              <CartIcon size={18} />
              {mostrarPrecios && <span className="tnum hidden sm:inline">{money(subtotal)}</span>}
              <span
                ref={badgeRef}
                className="tnum inline-flex items-center justify-center font-bold text-[11px] sm:text-xs absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-dark rounded-full sm:static sm:min-w-[20px] sm:h-5 sm:bg-white/20"
              >
                {count}
              </span>
            </button>
          </div>
        </div>

        {/* Navegación (escritorio) */}
        <nav className="hidden sm:block border-t border-white/15">
          <div className="max-w-[1280px] mx-auto px-7 py-3 flex items-center gap-[26px] text-[15px]">
            {NAV.map((n) => (
              <Link
                key={n.href + n.label}
                href={n.href}
                className="text-white font-medium opacity-90 hover:opacity-100"
              >
                {n.label}
              </Link>
            ))}
            <div className="hidden lg:flex ml-auto gap-[26px] text-[13px] text-white/70">
              <span>
                Retiro en tienda · <b className="text-white font-semibold">Maracaibo</b>
              </span>
              <span>
                Delivery · <b className="text-white font-semibold">Maracaibo</b>
              </span>
            </div>
          </div>
        </nav>
      </header>

      {/* Overlay del menú */}
      <div
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-[90] bg-[rgba(18,22,27,.42)] backdrop-blur-[2px] transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Menú lateral (móvil) */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
        className={`fixed top-0 left-0 bottom-0 z-[100] w-80 max-w-[82vw] bg-brand text-white shadow-[20px_0_60px_-30px_rgba(0,0,0,.6)] flex flex-col transition-transform duration-[400ms] ease-[cubic-bezier(.16,.84,.44,1)] ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-[22px] py-[18px] flex items-center justify-between border-b border-white/15">
          <span
            className="font-extrabold text-[22px] text-accent tracking-[.03em]"
            style={{ WebkitTextStroke: "0.7px #fff", WebkitTextFillColor: "var(--accent)", paintOrder: "stroke fill" }}
          >
            DIMEX
          </span>
          <button
            ref={menuCloseRef}
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Cerrar menú"
            className="border-0 bg-white/10 w-10 h-10 rounded-[9px] text-[17px] text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
        <nav className="p-2.5 flex flex-col">
          {NAV.map((n) => (
            <Link
              key={n.href + n.label}
              href={n.href}
              onClick={() => setMenuOpen(false)}
              className="text-white text-base font-semibold px-3.5 py-[15px] rounded-[10px] hover:bg-white/10"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-[22px] py-5 border-t border-white/15 flex flex-col gap-3 text-sm text-white/80">
          <span>
            Retiro en tienda · <b className="text-white">Maracaibo</b>
          </span>
          <span>
            Delivery · <b className="text-white">Maracaibo</b>
          </span>
        </div>
      </aside>

      {/* Pantalla de búsqueda (móvil) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buscar"
        className={`fixed inset-0 z-[110] bg-white flex flex-col transition-[opacity,transform] duration-[280ms] ${
          searchOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2.5 pointer-events-none"
        }`}
      >
        <form onSubmit={submitSearch} className="px-4 py-3.5 flex items-center gap-3 border-b border-line-2">
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            aria-label="Cerrar búsqueda"
            className="border-0 bg-surface w-11 h-11 rounded-[10px] cursor-pointer text-[#4a5158] flex items-center justify-center shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 flex items-center gap-2.5 border border-[#e3e6ea] rounded-[10px] px-3.5 py-3 bg-[#fafbfc]">
            <SearchIcon size={18} className="text-[#9aa3ad] shrink-0" />
            <input
              ref={searchInputRef}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar productos, kits…"
              aria-label="Buscar"
              className="border-0 bg-transparent outline-none w-full text-base text-body"
            />
          </div>
        </form>
        <div className="px-[18px] py-6">
          <p className="m-0 text-sm text-muted">
            Escribe lo que buscas y toca <b>Enter</b> para ver los resultados en el catálogo.
          </p>
        </div>
      </div>
    </>
  );
}
