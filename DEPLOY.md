# Desplegar DIMEX en Vercel

Guía para publicar la tienda en internet. El código ya está listo; esto conecta
el repositorio con Vercel y configura las variables de entorno.

## 1. Subir el código a GitHub

1. Crea un repositorio nuevo en <https://github.com/new> (privado está bien).
   Nómbralo `dimex`. **No** marques "Add README" (el proyecto ya tiene archivos).
2. En la terminal, dentro de `dimex/`:
   ```bash
   git add .
   git commit -m "DIMEX: tienda completa"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/dimex.git
   git push -u origin main
   ```

> `.env.local` NO se sube (está en `.gitignore`). Las claves se cargan en Vercel
> (paso 3), nunca en el repositorio.

## 2. Conectar el proyecto a Vercel

1. Entra a <https://vercel.com> con tu cuenta de GitHub.
2. **Add New → Project** → importa el repositorio `dimex`.
3. Vercel detecta Next.js automáticamente. **No cambies** los ajustes de build.

## 3. Variables de entorno en Vercel

En la pantalla de importación (o luego en **Project → Settings → Environment
Variables**) agrega estas, para el entorno **Production** (y Preview):

| Nombre | Valor | ¿Secreta? |
|--------|-------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | la URL de tu proyecto Supabase | no |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | la clave `anon` | no |
| `SUPABASE_SERVICE_ROLE_KEY` | la clave `service_role` | **SÍ** |
| `NEXT_PUBLIC_WHATSAPP` | `584246049228` | no |
| `NEXT_PUBLIC_SITE_URL` | tu dominio final, ej. `https://dimex.vercel.app` | no |

> Copia los valores desde tu archivo `.env.local`. `NEXT_PUBLIC_SITE_URL` debe ser
> el dominio real: hace que el sitemap, los enlaces y las imágenes para compartir
> (Open Graph) apunten a tu sitio y no a localhost.

4. **Deploy**. En ~1–2 minutos la tienda estará en línea.

## 4. Después del despliegue

- Si cambias el dominio (p. ej. conectas uno propio), actualiza
  `NEXT_PUBLIC_SITE_URL` en Vercel y vuelve a desplegar.
- **Supabase → Authentication → URL Configuration:** agrega tu dominio de Vercel
  a "Redirect URLs" / "Site URL" para que el login del panel funcione en producción.
- Cada `git push` a `main` vuelve a desplegar automáticamente.

## Comprobación rápida en producción

- La tienda abre y muestra productos/kits.
- `/admin` pide login y entras con tu usuario dueño.
- `tudominio/sitemap.xml` y `tudominio/robots.txt` responden.
