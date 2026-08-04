/**
 * Compresión de imágenes EN EL NAVEGADOR antes de subir (§7).
 * Recorta al aspecto correcto (cover), redimensiona al tamaño maestro y
 * exporta a WebP (calidad 80). Así las fotos pesan poco y cargan rápido en móvil.
 */

export type PresetImagen = { maxW: number; maxH: number };

// Tamaños maestros por tipo (§7 del anexo).
export const PRESETS = {
  producto: { maxW: 1200, maxH: 1200 }, // 1:1
  kit: { maxW: 1200, maxH: 800 }, //        3:2
  promocion: { maxW: 1920, maxH: 1200 }, // 8:5 (hero)
  categoria: { maxW: 800, maxH: 600 }, //   4:3
  local: { maxW: 1600, maxH: 1067 }, //     3:2
} as const satisfies Record<string, PresetImagen>;

export type TipoImagen = keyof typeof PRESETS;

export async function comprimirImagen(
  file: File,
  { maxW, maxH }: PresetImagen,
  quality = 0.8
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);

  // Recorte "cover" al aspecto destino.
  const targetRatio = maxW / maxH;
  const srcRatio = bitmap.width / bitmap.height;
  let sx = 0,
    sy = 0,
    sw = bitmap.width,
    sh = bitmap.height;
  if (srcRatio > targetRatio) {
    sw = Math.round(bitmap.height * targetRatio);
    sx = Math.round((bitmap.width - sw) / 2);
  } else {
    sh = Math.round(bitmap.width / targetRatio);
    sy = Math.round((bitmap.height - sh) / 2);
  }

  // No agrandar imágenes pequeñas más allá de su tamaño real.
  const escala = Math.min(1, maxW / sw, maxH / sh);
  const outW = Math.max(1, Math.round(sw * escala));
  const outH = Math.max(1, Math.round(sh * escala));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen.");
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, outW, outH);
  bitmap.close?.();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality)
  );
  if (!blob) throw new Error("No se pudo comprimir la imagen.");
  return blob;
}
