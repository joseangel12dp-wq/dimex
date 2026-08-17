"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { comprimirImagen, PRESETS, type TipoImagen } from "@/lib/image-compress";

const ASPECTO: Record<TipoImagen, string> = {
  producto: "aspect-square",
  kit: "aspect-[3/2]",
  promocion: "aspect-[8/5]",
  categoria: "aspect-[4/3]",
  local: "aspect-[3/2]",
};

/**
 * Selecciona una imagen, la comprime en el navegador y la sube al bucket
 * `dimex-media`. Guarda la URL pública en un campo oculto (`name`) para que la
 * acción de servidor la persista junto al resto del formulario.
 */
export default function ImageUploader({
  tipo,
  folder,
  currentUrl,
  name = "imagen_url",
}: {
  tipo: TipoImagen;
  folder: string;
  currentUrl?: string | null;
  name?: string;
}) {
  const [url, setUrl] = useState(currentUrl ?? "");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Comprime y sube una imagen (reutiliza el pipeline existente).
  const subir = async (file: File) => {
    setWorking(true);
    setError(null);
    try {
      const blob = await comprimirImagen(file, PRESETS[tipo]);
      const supabase = createClient();
      const path = `${folder}/${crypto.randomUUID()}.webp`;
      const { error: upErr } = await supabase.storage
        .from("dimex-media")
        .upload(path, blob, { contentType: "image/webp", upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("dimex-media").getPublicUrl(path);
      setUrl(data.publicUrl);
    } catch {
      setError("No se pudo subir la imagen. Prueba con otra (JPG o PNG).");
    } finally {
      setWorking(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) subir(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
    if (file) subir(file);
  };

  return (
    <div className="flex items-start gap-4">
      <input type="hidden" name={name} value={url} />

      {/* Zona de imagen: arrastrar aquí o hacer clic para elegir */}
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative w-40 ${ASPECTO[tipo]} rounded-xl overflow-hidden border-2 border-dashed bg-surface shrink-0 cursor-pointer transition-colors ${
          dragOver ? "border-brand" : "border-line"
        }`}
      >
        {url ? (
          <Image src={url} alt="Vista previa" fill sizes="160px" className="object-cover" />
        ) : (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-[11px] text-muted-2 text-center px-2 [background-image:repeating-linear-gradient(45deg,#eaedf0_0_9px,#f4f6f8_9px_18px)]">
            {working ? "Subiendo…" : "Arrastra o toca para subir"}
          </span>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onFile}
          disabled={working}
          className="hidden"
        />
      </label>

      <div className="flex flex-col gap-2 pt-1">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={working}
          className="inline-flex items-center gap-2 bg-white border border-[#e3e6ea] rounded-[10px] px-4 h-11 text-sm font-semibold text-[#2a2f36] cursor-pointer hover:border-brand w-fit disabled:opacity-60"
        >
          {working ? "Procesando…" : url ? "Cambiar imagen" : "Seleccionar imagen"}
        </button>

        {url && !working && (
          <button
            type="button"
            onClick={() => setUrl("")}
            className="text-sm font-semibold text-accent hover:underline w-fit cursor-pointer"
          >
            Quitar imagen
          </button>
        )}

        <span className="text-[12px] text-muted-2 max-w-[260px]">
          Arrastra una foto o tócala para elegir. Se recorta y comprime sola (WebP).
        </span>
        {error && <span className="text-sm text-accent">{error}</span>}
      </div>
    </div>
  );
}
