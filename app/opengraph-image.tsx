import { ImageResponse } from "next/og";

// Imagen que se muestra al compartir el sitio (WhatsApp, redes). 1200×630.
// Se genera de forma automática con los colores de marca; no requiere archivo.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "DIMEX · Papelería en Maracaibo";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#144276",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 150,
            fontWeight: 800,
            letterSpacing: 4,
            color: "#c01111",
            // Contorno blanco al estilo del logo.
            textShadow:
              "-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff",
          }}
        >
          DIMEX
        </div>
        <div style={{ fontSize: 40, marginTop: 8, opacity: 0.95 }}>
          Papelería en Maracaibo
        </div>
        <div style={{ fontSize: 28, marginTop: 20, opacity: 0.8 }}>
          Cuadernos · Escritura · Arte · Kits · Pedido por WhatsApp
        </div>
      </div>
    ),
    size
  );
}
