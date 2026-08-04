/** Convierte un texto en slug para URL: minúsculas, sin acentos, con guiones. */
export function slugify(text: string): string {
  // Separar los acentos de las letras y descartar las marcas combinantes
  // (rango 0x300–0x36f) sin usar regex de unicode.
  const sinAcentos = text
    .normalize("NFD")
    .split("")
    .filter((ch) => {
      const c = ch.charCodeAt(0);
      return c < 0x300 || c > 0x36f;
    })
    .join("");

  const s = sinAcentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return s || "item";
}
