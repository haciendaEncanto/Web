"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createRawAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { hoyColombia } from "@/lib/fecha";
import { sendWhatsAppNotification, buildLeadMessage } from "@/lib/callmebot";

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
  event_date: z
    .string()
    .min(1, "La fecha estimada es requerida")
    // Comparación de strings YYYY-MM-DD contra hoy en Colombia (el servidor corre en UTC)
    .refine((date) => date >= hoyColombia(), "La fecha del evento no puede ser una fecha pasada"),
  guest_count: z.string().min(1, "El número de invitados es requerido"),
  message: z.string().min(5, "Cuéntanos un poco más sobre tu evento"),
  recaptchaToken: z.string(),
  // FormData entrega el checkbox como "true" (o ausente si no está marcado)
  aceptaPolitica: z.preprocess(
    (v) => v === true || v === "true" || v === "on",
    z.boolean().refine((val) => val === true, {
      message: "Debes aceptar la política de privacidad para continuar",
    }),
  ),
});

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

  // --- IP rate limiting (capa servidor) ---
  try {
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0].trim() ||
      headersList.get("x-real-ip") ||
      "unknown";

    const rawAdmin = createRawAdminClient();
    const now = new Date();
    const { data: row } = await rawAdmin
      .from("contact_attempts")
      .select("attempts, last_attempt_at, blocked_until")
      .eq("ip", ip)
      .maybeSingle();

    if (row) {
      // Rechazar si sigue bloqueado
      if (row.blocked_until && new Date(row.blocked_until) > now) {
        return { error: "Has enviado demasiados mensajes. Por favor intenta más tarde." };
      }

      // Calcular intentos en la ventana actual (reset si último intento fue hace más de 1 hora)
      const lastMs = new Date(row.last_attempt_at).getTime();
      const freshWindow = now.getTime() - lastMs > 60 * 60 * 1000;
      const attempts = freshWindow ? 1 : row.attempts + 1;

      if (attempts > 3) {
        // Duración de bloqueo: exponencial — 1h, 2h, 3h (máximo)
        const blockCount = attempts - 3;
        const blockHours = Math.min(Math.pow(2, blockCount - 1), 3);
        const blockedUntil = new Date(now.getTime() + blockHours * 60 * 60 * 1000);
        await rawAdmin.from("contact_attempts").upsert(
          { ip, attempts, last_attempt_at: now.toISOString(), blocked_until: blockedUntil.toISOString() },
          { onConflict: "ip" }
        );
        return { error: "Has enviado demasiados mensajes. Por favor intenta más tarde." };
      }

      await rawAdmin.from("contact_attempts").upsert(
        { ip, attempts, last_attempt_at: now.toISOString(), blocked_until: null },
        { onConflict: "ip" }
      );
    } else {
      await rawAdmin.from("contact_attempts").insert({
        ip,
        attempts: 1,
        last_attempt_at: now.toISOString(),
      });
    }
  } catch {
    // Supabase no disponible — permitir el envío sin bloquear
  }

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

  // Sin asignación automática — el lead se asigna manualmente desde /admin/leads
  const waMsg = buildLeadMessage({ name, whatsapp, email: email || null, subject, event_date, guest_count, message });

  // Guardar en base de datos
  try {
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
    });

    if (error) throw new Error(error.message);
  } catch {
    // Supabase no disponible — intentar notificación CallMeBot y guiar al usuario a WhatsApp
    void sendWhatsAppNotification(waMsg);
    return {
      error:
        "En este momento no podemos registrar tu mensaje. Por favor, escríbenos directamente al WhatsApp +57 315 006 1597",
    };
  }

  // Notificación CallMeBot al número central — fire and forget
  void sendWhatsAppNotification(waMsg);

  return { success: true };
}
