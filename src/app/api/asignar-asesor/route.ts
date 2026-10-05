import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const FALLBACK_PHONE = "573028331190";
const WA_TEXT = "%C2%A1Hola+Encantalover!+%F0%9F%8D%80+Me+gustaría+conocer+más+sobre+Hacienda+El+Encanto+y+hacer+realidad+el+evento+de+mis+sueños.+%E2%84%B9%EF%B8%8F+Al+continuar+acepto+la+Política+de+Tratamiento+de+Datos%3A+https%3A%2F%2Fwww.hacienda-encanto.com%2Fpolitica-de-privacidad";

export async function GET() {
  const admin = createAdminClient();

  // Fetch asesores activos con su teléfono
  const { data: asesores } = await admin
    .from("profiles")
    .select("id, phone")
    .eq("role", "asesor_comercial")
    .eq("is_active", true);

  if (!asesores || asesores.length === 0) {
    return NextResponse.redirect(`https://wa.me/${FALLBACK_PHONE}?text=${WA_TEXT}`, 302);
  }

  // Obtener o crear filas en asesor_assignments para cada asesor
  for (const a of asesores) {
    await admin
      .from("asesor_assignments")
      .upsert({ asesor_id: a.id, total_assignments: 0 }, { onConflict: "asesor_id", ignoreDuplicates: true });
  }

  // Leer contadores
  const { data: assignments } = await admin
    .from("asesor_assignments")
    .select("asesor_id, total_assignments")
    .in("asesor_id", asesores.map((a) => a.id))
    .order("total_assignments", { ascending: true })
    .order("last_assigned_at", { ascending: true, nullsFirst: true })
    .limit(1);

  const chosen = assignments?.[0];
  if (!chosen) {
    return NextResponse.redirect(`https://wa.me/${FALLBACK_PHONE}?text=${WA_TEXT}`, 302);
  }

  const asesor = asesores.find((a) => a.id === chosen.asesor_id);
  const rawPhone = asesor?.phone?.replace(/\D/g, "") ?? "";
  const phone = rawPhone
    ? rawPhone.startsWith("57") ? rawPhone : `57${rawPhone}`
    : FALLBACK_PHONE;

  // Incrementar contador
  await admin
    .from("asesor_assignments")
    .update({ total_assignments: chosen.total_assignments + 1, last_assigned_at: new Date().toISOString() })
    .eq("asesor_id", chosen.asesor_id);

  return NextResponse.redirect(`https://wa.me/${phone}?text=${WA_TEXT}`, 302);
}
