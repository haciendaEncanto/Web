"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { sendWhatsAppNotification, sendWhatsAppToPhone } from "@/lib/callmebot";

export type ContactState = { success?: boolean; error?: string } | null;

const schema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().refine(
    (v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    "Email inválido"
  ),
  phone: z.string().optional(),
  whatsapp: z
    .string()
    .min(1, "El número de WhatsApp es requerido")
    .refine(
      (v) => /^(\+?57)?3\d{9}$/.test(v),
      "Formato válido: +57 3XX XXX XXXX o 3XX XXX XXXX"
    ),
  subject: z.string().min(1, "Selecciona el tipo de evento"),
  event_date: z.string().min(1, "La fecha estimada es requerida"),
  guest_count: z.string().min(1, "El número de invitados es requerido"),
  message: z.string().min(5, "Cuéntanos un poco más sobre tu evento"),
  recaptchaToken: z.string(),
});

function buildWaMessage(params: {
  name: string;
  whatsapp: string;
  email: string;
  subject: string;
  event_date: string;
  guest_count: string;
  message: string;
  asesorName: string;
}): string {
  const lines: string[] = [
    "📩 *Nuevo contacto - Hacienda El Encanto*",
    `👤 Nombre: ${params.name}`,
    `📱 WhatsApp: ${params.whatsapp}`,
  ];
  if (params.email) lines.push(`📧 Email: ${params.email}`);
  lines.push(
    `🎉 Tipo de evento: ${params.subject}`,
    `📅 Fecha estimada: ${params.event_date}`,
    `👥 Invitados: ${params.guest_count}`,
    `💬 Mensaje: ${params.message}`,
    `🤝 Asignado a: ${params.asesorName}`
  );
  return lines.join("\n");
}

export async function submitContactForm(
  _prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { recaptchaToken, phone, email, event_date, guest_count, subject, message, whatsapp, name } =
    parsed.data;

  // reCAPTCHA v3 — omitido en dev si no está configurado
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (secretKey) {
    if (!recaptchaToken) {
      return { error: "Verificación de seguridad requerida." };
    }
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: secretKey, response: recaptchaToken }),
    });
    const captcha = await res.json();
    if (!captcha.success || captcha.score < 0.5) {
      return { error: "Verificación de seguridad fallida. Inténtalo de nuevo." };
    }
  }

  // Round-robin: asignar al asesor activo con menos asignaciones
  const admin = createAdminClient();

  const [{ data: assignments }, { data: asesorProfiles }] = await Promise.all([
    admin
      .from("asesor_assignments")
      .select("asesor_id, total_assignments, last_assigned_at")
      .order("total_assignments", { ascending: true })
      .order("last_assigned_at", { ascending: true, nullsFirst: true }),
    admin
      .from("profiles")
      .select("id, full_name, is_active, phone, callmebot_api_key")
      .in("role", ["asesor_comercial", "wedding_planner"]),
  ]);

  // Round-robin: incluir asesores activos aunque no tengan fila en asesor_assignments
  const activeAsesores = (asesorProfiles ?? []).filter((p) => p.is_active);
  const assignmentMap = new Map(
    (assignments ?? []).map((a) => [a.asesor_id, a])
  );
  const virtualList = activeAsesores.map((p) => ({
    asesor_id: p.id,
    total_assignments: assignmentMap.get(p.id)?.total_assignments ?? 0,
    last_assigned_at: assignmentMap.get(p.id)?.last_assigned_at ?? null,
  }));
  virtualList.sort((a, b) => {
    if (a.total_assignments !== b.total_assignments)
      return a.total_assignments - b.total_assignments;
    if (a.last_assigned_at === null) return -1;
    if (b.last_assigned_at === null) return 1;
    return a.last_assigned_at < b.last_assigned_at ? -1 : 1;
  });
  const selected = virtualList[0] ?? null;
  const assignedAsesorId = selected?.asesor_id ?? null;
  const assignedAsesor = (asesorProfiles ?? []).find((p) => p.id === assignedAsesorId) ?? null;
  const asesorName = assignedAsesor?.full_name ?? "el equipo";

  // Guardar en base de datos
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email: email || null,
    phone: phone ?? null,
    subject,
    message,
    event_date,
    guest_count,
    whatsapp,
    assigned_asesor_id: assignedAsesorId,
  });

  if (error) {
    return { error: "No pudimos enviar tu mensaje. Inténtalo de nuevo más tarde." };
  }

  // Incrementar contador — upsert maneja tanto nuevo registro como actualización
  if (selected) {
    await admin.from("asesor_assignments").upsert(
      {
        asesor_id: selected.asesor_id,
        total_assignments: selected.total_assignments + 1,
        last_assigned_at: new Date().toISOString(),
      },
      { onConflict: "asesor_id" }
    );
  }

  // Construir mensaje completo con todos los campos
  const waMsg = buildWaMessage({ name, whatsapp, email, subject, event_date, guest_count, message, asesorName });

  // Notificación al número central — fire and forget
  void sendWhatsAppNotification(waMsg);

  // Notificación al asesor en su número personal si tiene CallMeBot configurado
  if (assignedAsesor?.phone && assignedAsesor?.callmebot_api_key) {
    void sendWhatsAppToPhone(assignedAsesor.phone, assignedAsesor.callmebot_api_key, waMsg);
  }

  return { success: true };
}
