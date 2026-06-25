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

export async function insertGaleriaImage(data: {
  url: string; title: string; category: string; sort_order?: number;
}): Promise<{ error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };
  const admin = createAdminClient();
  const { error } = await admin.from("gallery_images").insert({
    url: data.url,
    title: data.title || null,
    category: data.category,
    sort_order: data.sort_order ?? 0,
    is_published: true,
  });
  if (error) return { error: error.message };
  revalidatePath("/editor/galeria");
  return {};
}

export async function updateGaleriaImage(
  id: string,
  data: { title?: string; category?: string; is_published?: boolean; sort_order?: number }
): Promise<{ error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };
  const admin = createAdminClient();
  const { error } = await admin.from("gallery_images").update(data).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/editor/galeria");
  return {};
}

export async function deleteGaleriaImage(id: string, storagePath?: string): Promise<{ error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };
  const admin = createAdminClient();
  if (storagePath) {
    await admin.storage.from("gallery").remove([storagePath]);
  }
  const { error } = await admin.from("gallery_images").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/editor/galeria");
  return {};
}

export async function reorderGaleriaImages(
  items: { id: string; sort_order: number }[]
): Promise<{ error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };
  const admin = createAdminClient();
  await Promise.all(
    items.map((item) =>
      admin.from("gallery_images").update({ sort_order: item.sort_order }).eq("id", item.id)
    )
  );
  revalidatePath("/editor/galeria");
  return {};
}
