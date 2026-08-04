import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import { CartProvider } from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import { ConfigProvider } from "@/components/ConfigProvider";
import { getConfiguracion } from "@/lib/queries";
import { WHATSAPP, METODOS_PAGO, SITE } from "@/lib/site";

/**
 * Layout de la tienda pública. Lee la configuración del negocio y la reparte:
 * a los componentes cliente (carrito) vía ConfigProvider, y a los de servidor
 * (pie, botón de WhatsApp) como props. Usa valores por defecto si falta el dato.
 */
export default async function TiendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getConfiguracion();
  const whatsapp = config?.whatsapp?.trim() || WHATSAPP;
  const metodosPago = config?.metodos_pago?.length ? config.metodos_pago : METODOS_PAGO;
  const instagram = config?.instagram_url || SITE.instagramUrl;
  const tiktok = config?.tiktok_url || SITE.tiktokUrl;

  return (
    <CartProvider>
      <ConfigProvider value={{ whatsapp, metodosPago }}>
        <a href="#contenido" className="skip-link">
          Saltar al contenido
        </a>
        <AnnouncementBar />
        <Header />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Footer whatsapp={whatsapp} metodosPago={metodosPago} instagram={instagram} tiktok={tiktok} />
        <WhatsAppFab whatsapp={whatsapp} />
        <CartDrawer />
      </ConfigProvider>
    </CartProvider>
  );
}
