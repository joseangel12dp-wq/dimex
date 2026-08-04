"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import type { FormState } from "@/lib/admin";

export async function actualizarConfiguracion(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const perfil = await getSessionProfile();
  if (!perfil || perfil.rol !== "dueno") {
    return { error: "Solo el dueño puede editar la configuración." };
  }

  const whatsapp = String(formData.get("whatsapp") ?? "").replace(/[^0-9]/g, ""); // solo dígitos
  const direccion = String(formData.get("direccion") ?? "").trim() || null;
  const horario = String(formData.get("horario") ?? "").trim() || null;
  const instagram_url = String(formData.get("instagram_url") ?? "").trim() || null;
  const tiktok_url = String(formData.get("tiktok_url") ?? "").trim() || null;
  const mapa_embed = String(formData.get("mapa_embed") ?? "").trim() || null;
  const metodos_pago = String(formData.get("metodos_pago") ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (!whatsapp) return { error: "El número de WhatsApp es obligatorio." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("configuracion")
    .update({ whatsapp, direccion, horario, instagram_url, tiktok_url, mapa_embed, metodos_pago })
    .eq("id", 1);
  if (error) return { error: error.message };

  // Refrescar las partes de la tienda que usan estos datos.
  revalidatePath("/");
  revalidatePath("/nosotros");
  revalidatePath("/admin/configuracion");
  return { ok: true };
}
