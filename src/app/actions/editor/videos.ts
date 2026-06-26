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

function revalidate() {
  revalidatePath("/editor/videos");
  revalidatePath("/");
  revalidatePath("/bodas");
  revalidatePath("/quince-anos");
  revalidatePath("/eventos-empresariales");
  revalidatePath("/revelacion-de-genero");
}

// Desactiva todos los videos de la misma página antes de activar uno nuevo.
async function deactivatePage(admin: ReturnType<typeof createAdminClient>, eventType: string | null) {
  if (eventType === null || eventType === "") {
    await admin.from("hero_videos").update({ is_active: false }).is("event_type", null);
  } else {
    await admin.from("hero_videos").update({ is_active: false }).eq("event_type", eventType);
  }
}

export async function insertVideo(data: {
  url: string;
  title?: string;
  event_type: string | null;
  is_active: boolean;
}): Promise<{ error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };
  const admin = createAdminClient();
  if (data.is_active) {
    await deactivatePage(admin, data.event_type);
  }
  const { error } = await admin.from("hero_videos").insert({
    url: data.url,
    title: data.title || null,
    event_type: data.event_type || null,
    is_active: data.is_active,
    sort_order: 0,
  });
  if (error) return { error: error.message };
  revalidate();
  return {};
}

export async function activateVideo(id: string, eventType: string | null): Promise<{ error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };
  const admin = createAdminClient();
  await deactivatePage(admin, eventType);
  const { error } = await admin.from("hero_videos").update({ is_active: true }).eq("id", id);
  if (error) return { error: error.message };
  revalidate();
  return {};
}

export async function deactivateVideo(id: string): Promise<{ error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };
  const admin = createAdminClient();
  const { error } = await admin.from("hero_videos").update({ is_active: false }).eq("id", id);
  if (error) return { error: error.message };
  revalidate();
  return {};
}

export async function deleteVideo(id: string, url: string): Promise<{ error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };
  const admin = createAdminClient();
  // Extraer path de Storage desde la URL pública
  try {
    const parsed = new URL(url);
    const marker = "/object/public/videos/";
    const idx = parsed.pathname.indexOf(marker);
    if (idx !== -1) {
      const storagePath = parsed.pathname.slice(idx + marker.length);
      await admin.storage.from("videos").remove([storagePath]);
    }
  } catch {
    // Si la URL no es parseable, sólo borramos el registro
  }
  const { error } = await admin.from("hero_videos").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidate();
  return {};
}
