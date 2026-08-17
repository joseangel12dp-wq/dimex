"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { comprimirImagen, PRESETS } from "@/lib/image-compress";

/**
 * Galería de fotos de un producto (Función 2). Reutiliza el pipeline de
 * compresión y el bucket dimex-media que ya usan los productos.
 *
 * - Arrastrar y soltar VARIAS fotos (o clic para elegir).
 * - Miniaturas que aparecen a medida que suben.
 * - Reordenar: arrastrando (escritorio) o con ◀ ▶ (confiable en móvil).
 * - "Hacer portada": mueve la foto al primer lugar (la portada = la primera).
 * - Borrar una foto sin afectar las demás.
 *
 * El orden final se envía como campos ocultos `imagen_urls`; la acción del
 * servidor guarda ese orden y fija la portada (primera) en productos.imagen_url.
 */
export default function ProductImagesUploader({ initial }: { initial: string[] }) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [working, setWorking] = useState(0); // cuántas se están subiendo
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Sube una lista de archivos (comprime cada uno y lo agrega al final).
  const subirVarias = async (files: File[]) => {
    const imgs = files.filter((f) => f.type.startsWith("image/"));
    if (imgs.length === 0) return;
    setError(null);
    setWorking((w) => w + imgs.length);
    const supabase = createClient();
    for (const file of imgs) {
      try {
        const blob = await comprimirImagen(file, PRESETS.producto);
        const path = `productos/${crypto.randomUUID()}.webp`;
        const { error: upErr } = await supabase.storage
          .from("dimex-media")
          .upload(path, blob, { contentType: "image/webp", upsert: false });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("dimex-media").getPublicUrl(path);
        setUrls((prev) => [...prev, data.publicUrl]);
      } catch {
        setError("Una foto no se pudo subir. Prueba con otra (JPG o PNG).");
      } finally {
        setWorking((w) => w - 1);
      }
    }
  };

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) subirVarias(Array.from(e.target.files));
    if (fileRef.current) fileRef.current.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) subirVarias(Array.from(e.dataTransfer.files));
  };

  // Reordenar / portada / borrar
  const mover = (from: number, to: number) => {
    setUrls((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = prev.slice();
      const [x] = next.splice(from, 1);
      next.splice(to, 0, x);
      return next;
    });
  };
  const hacerPortada = (i: number) => mover(i, 0);
  const borrar = (i: number) => setUrls((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-3">
      {/* Campos ocultos con el orden final (los lee la acción del servidor) */}
      {urls.map((u) => (
        <input key={u} type="hidden" name="imagen_urls" value={u} />
      ))}

      {/* Zona para arrastrar o tocar */}
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
          dragOver ? "border-brand bg-[#eef2f7]" : "border-line bg-surface"
        }`}
      >
        <div className="text-sm font-semibold text-[#2a2f36]">
          Arrastra tus fotos aquí o toca para elegir
        </div>
        <div className="text-[12px] text-muted-2 mt-1">
          Puedes subir varias a la vez. Se recortan y comprimen solas (WebP).
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onFiles}
          className="hidden"
        />
      </label>

      {working > 0 && (
        <div className="text-[13px] text-muted-2">Subiendo {working} foto(s)…</div>
      )}
      {error && <div className="text-sm text-accent">{error}</div>}

      {/* Miniaturas */}
      {urls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {urls.map((u, i) => (
            <div
              key={u}
              draggable
              onDragStart={() => (dragIndex.current = i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex.current !== null) mover(dragIndex.current, i);
                dragIndex.current = null;
              }}
              className="relative border border-line rounded-xl overflow-hidden bg-surface"
            >
              <div className="relative aspect-square">
                <Image src={u} alt={`Foto ${i + 1}`} fill sizes="120px" className="object-cover" />
              </div>

              {/* Distintivo de portada */}
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  Portada
                </span>
              )}

              {/* Borrar */}
              <button
                type="button"
                onClick={() => borrar(i)}
                aria-label="Borrar foto"
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/55 text-white text-xs flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>

              {/* Controles (móvil-first): mover y hacer portada */}
              <div className="flex items-center justify-between gap-1 p-1 bg-white border-t border-line">
                <button
                  type="button"
                  onClick={() => mover(i, i - 1)}
                  disabled={i === 0}
                  aria-label="Mover a la izquierda"
                  className="w-7 h-7 rounded-md text-[#4a5158] hover:bg-surface disabled:opacity-30 cursor-pointer"
                >
                  ◀
                </button>
                {i !== 0 ? (
                  <button
                    type="button"
                    onClick={() => hacerPortada(i)}
                    className="text-[11px] font-semibold text-brand hover:underline cursor-pointer px-1"
                  >
                    Portada
                  </button>
                ) : (
                  <span className="text-[11px] text-muted-2">Principal</span>
                )}
                <button
                  type="button"
                  onClick={() => mover(i, i + 1)}
                  disabled={i === urls.length - 1}
                  aria-label="Mover a la derecha"
                  className="w-7 h-7 rounded-md text-[#4a5158] hover:bg-surface disabled:opacity-30 cursor-pointer"
                >
                  ▶
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
