// Prueba de conexión a Supabase con la clave pública `anon`.
// Verifica que la tienda puede leer los datos publicados y que la RLS
// esconde lo que debe (los perfiles del panel).
//
// Correr con:  npm run test:supabase
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error("❌ Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(url, anon);

const esperado = {
  categorias: 6,
  productos: 23,
  kits: 5,
  promociones: 1,
  configuracion: 1,
};

let ok = true;
console.log("\nLeyendo datos públicos (como lo haría la tienda)…\n");

for (const [tabla, n] of Object.entries(esperado)) {
  const { count, error } = await supabase
    .from(tabla)
    .select("*", { count: "exact", head: true });
  if (error) {
    console.log(`❌ ${tabla}: ${error.message}`);
    ok = false;
    continue;
  }
  const marca = count === n ? "✅" : "⚠️ ";
  if (count !== n) ok = false;
  console.log(`${marca} ${tabla}: ${count} (esperado ${n})`);
}

// La RLS debe impedir que el público (anon) lea los perfiles del panel.
const { data: perfiles } = await supabase.from("perfiles").select("id");
const visibles = perfiles?.length ?? 0;
console.log(
  `\n🔒 perfiles visibles para el público: ${visibles} (debe ser 0 por seguridad RLS)`
);
if (visibles !== 0) ok = false;

console.log(ok ? "\n✅ Conexión y seguridad OK.\n" : "\n⚠️  Revisa los avisos de arriba.\n");
process.exit(ok ? 0 : 1);
