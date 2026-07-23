"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { sendWhatsAppNotification } from "@/lib/callmebot";

export type ContactState = { success?: boolean; error?: string } | null;

const schema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  whatsapp: z
    .string()
    .min(1, "El número de WhatsApp es requerido")
    .refine(
      (v) => /^(\+?57)?3\d{9}$/.test(v),
      "Formato válido: +57 3XX XXX XXXX o 3XX XXX XXXX"
    ),
  subject: z.string().optional(),
  event_date: z.string().optional(),
  guest_count: z.string().optional(),
  message: z.string().min(5, "Cuéntanos un poco más sobre tu evento"),
  recaptchaToken: z.string(),
});

export async function submitContactForm(
  _prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { recaptchaToken, event_date, guest_count, message, whatsapp, ...rest } =
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

  // Armar mensaje completo con campos extra del formulario del home
  const parts: string[] = [];
  if (event_date) parts.push(`Fecha estimada: ${event_date}`);
  if (guest_count) parts.push(`Número de invitados: ${guest_count}`);
  parts.push(message);
  const fullMessage = parts.join("\n");

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
      .select("id, full_name, is_active")
      .in("role", ["asesor_comercial", "wedding_planner"]),
  ]);

  const activeIds = new Set(
    (asesorProfiles ?? []).filter((p) => p.is_active).map((p) => p.id)
  );
  const selected = (assignments ?? []).find((a) => activeIds.has(a.asesor_id)) ?? null;
  const assignedAsesorId = selected?.asesor_id ?? null;
  const asesorName =
    (asesorProfiles ?? []).find((p) => p.id === assignedAsesorId)?.full_name ??
    "el equipo";

  // Guardar en base de datos
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: rest.name,
    email: rest.email,
    phone: rest.phone ?? null,
    subject: rest.subject ?? null,
    message: fullMessage,
    whatsapp,
    assigned_asesor_id: assignedAsesorId,
  });

  if (error) {
    return { error: "No pudimos enviar tu mensaje. Inténtalo de nuevo más tarde." };
  }

  // Incrementar contador del asesor asignado
  if (selected) {
    await admin
      .from("asesor_assignments")
      .update({
        total_assignments: selected.total_assignments + 1,
        last_assigned_at: new Date().toISOString(),
      })
      .eq("asesor_id", selected.asesor_id);
  }

  // Notificación WhatsApp — fire and forget, nunca bloquea al usuario
  const eventType = rest.subject || "evento";
  const eventDate = event_date || "fecha por definir";
  void sendWhatsAppNotification(
    `📩 Nuevo contacto - Asignado a ${asesorName}: ${rest.name}, interesado en ${eventType} para ${eventDate}. WhatsApp cliente: ${whatsapp}`
  );

  return { success: true };
}
