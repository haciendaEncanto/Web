"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function reassignLead(
  leadId: string,
  asesorId: string | null
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "gerente"].includes(profile.role)) {
    return { error: "Sin permisos para reasignar leads" };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("contact_messages")
    .update({ assigned_asesor_id: asesorId })
    .eq("id", leadId);

  return { error: error?.message ?? null };
}
