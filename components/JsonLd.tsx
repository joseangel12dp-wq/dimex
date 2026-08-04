/**
 * Inserta datos estructurados (JSON-LD) en la página. Los buscadores los leen
 * para entender qué es cada página (negocio, listas de productos, kits…).
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // El contenido es nuestro (no entrada de usuario), así que es seguro.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
