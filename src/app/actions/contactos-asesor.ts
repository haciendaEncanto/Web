"use server";

import { createClient } from "@/lib/supabase/server";

type ContactStatus = "unread" | "read" | "replied" | "en_proceso";

export async function updateContactStatus(
  id: string,
  status: ContactStatus
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_messages")
    .update({ status })
    .eq("id", id);
  return { error: error?.message ?? null };
}
