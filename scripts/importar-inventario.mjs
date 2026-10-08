// Importa el inventario (CSV del sistema de la tienda) a la tabla `productos`.
//
//  - Productos NUEVOS: se crean OCULTOS (activo = false), precio 0, con nombre,
//    código, unidad y existencia. El dueño los revisa y los activa a mano.
//  - Productos que YA EXISTEN (mismo código):
//    solo se actualiza la existencia y la unidad. No se toca nombre, precio,
//    fotos ni visibilidad. Así el script sirve también para actualizar stock.
//
// Columnas esperadas: Código, Descripción, Unidad, Existencia, Observación
//
// Correr con:
//   node --env-file=.env.local scripts/importar-inventario.mjs ruta/al/archivo.csv
//   (agrega --prueba para ver qué haría sin escribir nada;
//    --solo-con-existencia para no crear productos que están en 0)
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const prueba = args.includes("--prueba");
// Con --solo-con-existencia no se CREAN productos en 0 o negativo
// (los que ya existen igual se actualizan, aunque queden en 0).
const soloConExistencia = args.includes("--solo-con-existencia");
const ruta = args.find((a) => !a.startsWith("--"));
if (!ruta) {
  console.error("❌ Indica el archivo CSV: node --env-file=.env.local scripts/importar-inventario.mjs archivo.csv");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

// --- CSV (soporta comillas y "" escapadas) ---------------------------------
function parseCSV(texto) {
  const filas = [];
  let fila = [], campo = "", comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i];
    if (comillas) {
      if (ch === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (ch === '"') comillas = false;
      else campo += ch;
    } else if (ch === '"') comillas = true;
    else if (ch === ",") { fila.push(campo); campo = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && texto[i + 1] === "\n") i++;
      fila.push(campo); filas.push(fila); fila = []; campo = "";
    } else campo += ch;
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila); }
  return filas.filter((f) => f.some((c) => c.trim()));
}

// Igual que lib/slug.ts
function slugify(text) {
  const s = text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return s || "item";
}

const [cabecera, ...datos] = parseCSV(readFileSync(ruta, "utf8").replace(/^﻿/, ""));
const col = (nombre) => cabecera.findIndex((c) => c.trim().toLowerCase() === nombre);
const iCod = col("código"), iDesc = col("descripción"), iUni = col("unidad"), iExi = col("existencia");
if (iDesc < 0 || iExi < 0) {
  console.error("❌ El CSV debe tener las columnas 'Descripción' y 'Existencia'. Cabecera:", cabecera);
  process.exit(1);
}

const filas = datos
  .map((f) => ({
    codigo: (f[iCod] ?? "").trim() || null,
    nombre: (f[iDesc] ?? "").trim().replace(/\s+/g, " "),
    unidad: (f[iUni] ?? "").trim() || null,
    existencia: Math.max(0, Number(String(f[iExi] ?? "0").replace(",", ".")) || 0), // negativos → 0
  }))
  .filter((x) => x.nombre);
// Sin código no se importa: el dueño los verifica primero.
const sinCodigo = filas.filter((x) => !x.codigo);
const items = filas.filter((x) => x.codigo);

// --- Estado actual en la base ----------------------------------------------
const actuales = [];
for (let desde = 0; ; desde += 1000) {
  const { data, error } = await supabase
    .from("productos")
    .select("id, slug, nombre, codigo")
    .range(desde, desde + 999);
  if (error) {
    console.error("❌ No se pudo leer productos:", error.message);
    if (/codigo/.test(error.message)) console.error("   ¿Corriste la migración 0008_inventario.sql?");
    process.exit(1);
  }
  actuales.push(...data);
  if (data.length < 1000) break;
}
const porCodigo = new Map(actuales.filter((p) => p.codigo).map((p) => [p.codigo, p]));
const slugs = new Set(actuales.map((p) => p.slug));
const slugUnico = (base) => {
  let s = base;
  for (let n = 2; slugs.has(s); n++) s = `${base}-${n}`;
  slugs.add(s);
  return s;
};

const nuevos = [];
const actualizar = [];
const sinExistencia = [];
for (const it of items) {
  const existente = porCodigo.get(it.codigo);
  if (existente) {
    actualizar.push({ id: existente.id, existencia: it.existencia, unidad: it.unidad, nombre: it.nombre });
  } else if (soloConExistencia && it.existencia <= 0) {
    sinExistencia.push(it);
  } else {
    nuevos.push({
      ...it,
      slug: slugUnico(slugify(it.nombre)),
      precio: 0,
      activo: false, // OCULTO: el dueño lo activa a mano
    });
  }
}

console.log(`\nCSV: ${items.length} productos`);
console.log(`  • Nuevos (se crean ocultos): ${nuevos.length}`);
console.log(`  • Ya existen (solo se actualiza existencia): ${actualizar.length}`);
if (sinExistencia.length) console.log(`  • No creados por estar en 0: ${sinExistencia.length}`);
if (sinCodigo.length) {
  console.log(`  • Omitidos por no tener código: ${sinCodigo.length}`);
  for (const x of sinCodigo) console.log(`      - ${x.nombre}`);
}

if (prueba) {
  console.log("\n(Modo prueba: no se escribió nada.)\n");
  process.exit(0);
}

// --- Escribir ----------------------------------------------------------------
for (let i = 0; i < nuevos.length; i += 200) {
  const lote = nuevos.slice(i, i + 200);
  const { error } = await supabase.from("productos").insert(lote);
  if (error) {
    console.error(`❌ Error creando productos (lote ${i / 200 + 1}):`, error.message);
    process.exit(1);
  }
}
let fallos = 0;
for (const a of actualizar) {
  const { error } = await supabase
    .from("productos")
    // Si el archivo no trae unidad, se conserva la que ya tenía.
    .update(a.unidad ? { existencia: a.existencia, unidad: a.unidad } : { existencia: a.existencia })
    .eq("id", a.id);
  if (error) { fallos++; console.error(`  ⚠️ ${a.nombre}: ${error.message}`); }
}

console.log(`\n✅ Listo. Creados ${nuevos.length}, actualizados ${actualizar.length - fallos}.`);
console.log("   Los nuevos están OCULTOS: actívalos desde /admin/productos.\n");
