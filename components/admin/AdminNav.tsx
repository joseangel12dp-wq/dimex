"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Secciones del panel. Las de "solo dueño" se agregan según el rol.
const baseItems = [
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/kits", label: "Kits" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/promociones", label: "Promociones" },
];
const duenoItems = [
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/configuracion", label: "Configuración" },
];

export default function AdminNav({ esDueno }: { esDueno: boolean }) {
  const pathname = usePathname();
  const items = esDueno ? [...baseItems, ...duenoItems] : baseItems;

  return (
    <nav className="noscroll flex md:flex-col gap-1 overflow-x-auto px-3 md:px-4 py-2">
      {items.map((it) => {
        const active = pathname === it.href || pathname.startsWith(it.href + "/");
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`shrink-0 rounded-[9px] px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${
              active ? "bg-brand text-white" : "text-[#4a5158] hover:bg-surface"
            }`}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
