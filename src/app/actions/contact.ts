"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export type ContactState = { success?: boolean; error?: string } | null;

const schema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  subject: z.string().optional(),
  event_date: z.string().optional(),
  guest_count: z.string().optional(),
  message: z.string().min(5, "Cuéntanos un poco más sobre tu evento"),
  recaptchaToken: z.string(),
});

export async function submitContactForm(
  prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { recaptchaToken, event_date, guest_count, message, ...rest } =
    parsed.data;

  // Verificación reCAPTCHA v3 — se omite en dev si no está configurada
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (secretKey) {
    if (!recaptchaToken) {
      return { error: "Verificación de seguridad requerida." };
    }

    const res = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: secretKey,
          response: recaptchaToken,
        }),
      }
    );

    const captcha = await res.json();
    if (!captcha.success || captcha.score < 0.5) {
      return {
        error: "Verificación de seguridad fallida. Inténtalo de nuevo.",
      };
    }
  }

  // Armar mensaje completo con los campos extra del formulario del home
  const parts: string[] = [];
  if (event_date) parts.push(`Fecha estimada: ${event_date}`);
  if (guest_count) parts.push(`Número de invitados: ${guest_count}`);
  parts.push(message);
  const fullMessage = parts.join("\n");

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: rest.name,
    email: rest.email,
    phone: rest.phone ?? null,
    subject: rest.subject ?? null,
    message: fullMessage,
  });

  if (error) {
    return {
      error: "No pudimos enviar tu mensaje. Inténtalo de nuevo más tarde.",
    };
  }

  return { success: true };
}
