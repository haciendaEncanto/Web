"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { z } from "zod";

export type AuthState = { error: string } | null;

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

const registerSchema = z
  .object({
    full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    phone: z.string().optional(),
    password: z.string().min(8, "La contraseña debe tener mínimo 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export async function login(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error, data } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Credenciales inválidas. Verifica tu email y contraseña." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  // Registrar actividad inicial para que proxy.ts no detecte sesión "expirada"
  // en el primer request tras el login (cuando last_active_at venía de antes).
  await createAdminClient()
    .from("profiles")
    .update({ last_active_at: new Date().toISOString() })
    .eq("id", data.user.id);

  const destinations: Record<string, string> = {
    client: "/portal/dashboard",
    admin: "/admin/dashboard",
    wedding_planner: "/portal/planner",
    asesor_comercial: "/portal/asesor-comercial",
    asesor_logistica: "/portal/asesor-logistica",
    staff: "/portal/staff",
    editor: "/editor/galeria",
    gerente: "/portal/gerente",
  };

  redirect(destinations[profile?.role ?? "client"] ?? "/portal/dashboard");
}

export type RegisterState = { error?: string; success?: boolean } | null;

export async function register(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { confirmPassword: _, ...fields } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: fields.email,
    password: fields.password,
    options: {
      data: { full_name: fields.full_name, phone: fields.phone ?? null },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export type ResetPasswordState = { error?: string; success?: boolean } | null;

export async function requestPasswordReset(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const email = (formData.get("email") as string)?.trim();
  if (!email || !email.includes("@")) return { error: "Ingresa un correo electrónico válido" };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://www.hacienda-encanto.com/update-password",
  });

  if (error) return { error: error.message };
  return { success: true };
}

export type UpdatePasswordState = { error?: string; success?: boolean } | null;

export async function updatePassword(
  _prev: UpdatePasswordState,
  formData: FormData
): Promise<UpdatePasswordState> {
  const password = formData.get("password") as string;
  const confirm = formData.get("confirmPassword") as string;

  if (!password || password.length < 8)
    return { error: "La contraseña debe tener mínimo 8 caracteres" };
  if (password !== confirm)
    return { error: "Las contraseñas no coinciden" };

  const supabase = await createClient();
  const { data: updateData, error } = await supabase.auth.updateUser({ password });

  if (error) {
    if (error.message.includes("session")) {
      return { error: "El enlace expiró o ya fue utilizado. Solicita uno nuevo." };
    }
    return { error: error.message };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", updateData.user.id)
    .single();

  const destinations: Record<string, string> = {
    client: "/portal/dashboard",
    admin: "/admin/dashboard",
    wedding_planner: "/portal/planner",
    asesor_comercial: "/portal/asesor-comercial",
    asesor_logistica: "/portal/asesor-logistica",
    staff: "/portal/staff",
    editor: "/editor/galeria",
    gerente: "/portal/gerente",
  };

  redirect(destinations[profile?.role ?? "client"] ?? "/portal/dashboard");
}
