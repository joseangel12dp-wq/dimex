"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Imagen que rellena su contenedor (que debe ser `relative` con proporción fija).
 * Si no hay `src` —o si la imagen falla al cargar— muestra el placeholder gris a
 * rayas con una etiqueta, para que nunca haya un ícono roto ni salto de layout
 * (§7 y §9).
 */
export default function MediaImagen({
  src,
  alt,
  label,
  sizes,
  priority = false,
}: {
  src: string | null;
  alt: string;
  label?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "(max-width: 640px) 50vw, 25vw"}
        priority={priority}
        className="object-cover"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span className="absolute inset-0 flex items-center justify-center [background-image:repeating-linear-gradient(45deg,#eaedf0_0_10px,#f4f6f8_10px_20px)]">
      <span className="[font-family:Archivo,monospace] text-[10.5px] text-[#9aa3ad] text-center px-2">
        {label ?? alt}
      </span>
    </span>
  );
}
