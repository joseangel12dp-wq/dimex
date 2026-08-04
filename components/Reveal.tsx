"use client";

import { useEffect, useRef } from "react";

/**
 * Envuelve contenido y lo hace aparecer con un leve desplazamiento cuando entra
 * en pantalla (efecto del prototipo). Si no hay JS o IntersectionObserver, el
 * contenido se muestra normal. `prefers-reduced-motion` lo vuelve instantáneo
 * (vía globals.css).
 */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) return;

    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = "opacity .6s ease, transform .7s cubic-bezier(.16,.84,.44,1)";
    el.style.transitionDelay = `${delay * 70}ms`;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.style.opacity = "1";
            el.style.transform = "none";
            io.unobserve(el);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
