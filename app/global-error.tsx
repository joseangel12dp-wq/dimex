"use client";

// Último recinto de error: reemplaza TODO el documento si falla algo en el
// layout raíz. Debe traer sus propios <html>/<body>. Estilos en línea porque
// aquí puede no haber cargado el CSS.
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "0 16px",
          background: "#fff",
          color: "#12161b",
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 34, letterSpacing: 1, color: "#c01111" }}>
          DIMEX
        </div>
        <h1 style={{ fontSize: 24, margin: "18px 0 8px" }}>Algo salió mal</h1>
        <p style={{ color: "#6c747d", maxWidth: 400 }}>
          Ocurrió un error inesperado. Vuelve a intentarlo.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 20,
            border: 0,
            background: "#144276",
            color: "#fff",
            borderRadius: 11,
            padding: "14px 26px",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
