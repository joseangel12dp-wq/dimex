/**
 * Tipos TypeScript de las tablas de Supabase (espejo del esquema §4).
 *
 * Escritos a mano para que sean legibles. En el futuro se pueden regenerar
 * automáticamente con la CLI de Supabase:
 *   npx supabase gen types typescript --project-id <ref> > types/db.ts
 */

export type Rol = "dueno" | "empleado";

export type Categoria = {
  id: string;
  slug: string;
  nombre: string;
  orden: number;
  activa: boolean;
  imagen_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Producto = {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  categoria_id: string | null;
  precio: number;
  precio_anterior: number | null;
  es_nuevo: boolean;
  destacado: boolean;
  imagen_url: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

// Fotos de un producto (galería con orden; la primera es la portada).
export type ProductoImagen = {
  id: string;
  producto_id: string;
  url: string;
  orden: number;
  created_at: string;
};

// Un kit es un combo simple: nombre, descripción, imagen y precio.
export type Kit = {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen_url: string | null;
  orden: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type Promocion = {
  id: string;
  slug: string;
  titulo: string;
  subtitulo: string | null;
  imagen_url: string | null;
  enlace: string | null;
  inicia_en: string;
  termina_en: string | null;
  activa: boolean;
  created_at: string;
  updated_at: string;
};

export type Perfil = {
  id: string;
  nombre: string | null;
  rol: Rol;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type Configuracion = {
  id: number;
  whatsapp: string;
  direccion: string | null;
  horario: string | null;
  metodos_pago: string[];
  instagram_url: string | null;
  tiktok_url: string | null;
  mapa_embed: string | null;
  mostrar_precios: boolean;
  created_at: string;
  updated_at: string;
};

