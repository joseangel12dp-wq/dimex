import { ImageResponse } from "next/og";

// Favicon de la pestaña del navegador: "D" blanca sobre azul de marca.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 46,
          fontWeight: 800,
          fontFamily: "sans-serif",
          borderRadius: 12,
        }}
      >
        D
      </div>
    ),
    size
  );
}
