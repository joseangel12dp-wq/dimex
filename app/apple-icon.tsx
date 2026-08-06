import { ImageResponse } from "next/og";

// Ícono para "Agregar a inicio" en móviles (iOS/Android): "D" sobre azul de marca.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#144276",
          color: "#fff",
          fontSize: 120,
          fontWeight: 800,
          fontFamily: "sans-serif",
        }}
      >
        D
      </div>
    ),
    size
  );
}
