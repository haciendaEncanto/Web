"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function verifyEditor() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" as string };
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "editor"].includes(profile.role as string))
    return { error: "Sin permisos" as string };
  return { error: null };
}

export async function insertVideo(data: {
  url: string; title?: string; event_type?: string; sort_order?: number;
}): Promise<{ error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };
  const admin = createAdminClient();
  const { error } = await admin.from("hero_videos").insert({
    url: data.url,
    title: data.title || null,
    event_type: data.event_type || null,
    sort_order: data.sort_order ?? 0,
    is_active: true,
  });
  if (error) return { error: error.message };
  revalidatePath("/editor/videos");
  return {};
}

export async function updateVideo(
  id: string,
  data: { title?: string; event_type?: string | null; is_active?: boolean }
): Promise<{ error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };
  const admin = createAdminClient();
  const { error } = await admin.from("hero_videos").update(data).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/editor/videos");
  return {};
}

export async function deleteVideo(id: string, storagePath?: string): Promise<{ error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };
  const admin = createAdminClient();
  if (storagePath) {
    await admin.storage.from("videos").remove([storagePath]);
  }
  const { error } = await admin.from("hero_videos").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/editor/videos");
  return {};
}
