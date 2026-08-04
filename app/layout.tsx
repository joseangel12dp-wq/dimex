import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

// Fuente de marca. display "swap" para que el texto aparezca de inmediato (§10 rendimiento).
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

// URL pública del sitio (para Open Graph / SEO). En local usa localhost.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DIMEX · Papelería en Maracaibo",
    template: "%s | DIMEX",
  },
  description:
    "Papelería en Maracaibo: cuadernos, escritura, arte y kits. Pedido por WhatsApp, retiro en tienda o delivery en el Zulia.",
  openGraph: {
    type: "website",
    locale: "es_VE",
    siteName: "DIMEX",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${archivo.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
