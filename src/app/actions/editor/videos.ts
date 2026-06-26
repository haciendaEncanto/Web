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

async function deactivatePage(
  admin: ReturnType<typeof createAdminClient>,
  eventType: string | null,
) {
  if (eventType === null || eventType === "") {
    await admin.from("hero_videos").update({ is_active: false }).is("event_type", null);
  } else {
    await admin.from("hero_videos").update({ is_active: false }).eq("event_type", eventType);
  }
}

// ─── Upload completo en servidor ──────────────────────────────────────────────

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

const VIDEO_FOLDER: Record<string, string> = {
  "":            "home",
  "boda":        "boda",
  "quince":      "quince",
  "empresarial": "empresarial",
  "revelacion":  "revelacion",
};

export type UploadedVideo = {
  id: string; url: string; title: string | null;
  event_type: string | null; is_active: boolean;
};

export async function uploadVideo(
  formData: FormData,
): Promise<{ video?: UploadedVideo; error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };

  const file      = formData.get("file") as File | null;
  const eventType = (formData.get("event_type") as string) ?? "";
  const title     = (formData.get("title") as string) ?? "";
  const isActive  = formData.get("is_active") === "true";

  if (!file || file.size === 0) return { error: "No se recibió ningún archivo" };
  if (!ALLOWED_VIDEO_TYPES.includes(file.type))
    return { error: "Formato no permitido. Usa MP4, WebM o MOV." };
  if (file.size > MAX_VIDEO_BYTES)
    return { error: `El archivo supera 50 MB (${(file.size / 1024 / 1024).toFixed(1)} MB)` };

  const admin  = createAdminClient();
  const folder = VIDEO_FOLDER[eventType] ?? "home";
  const ext    = file.name.split(".").pop()?.toLowerCase() ?? "mp4";
  const path   = `${folder}/${Date.now()}.${ext}`;

  if (isActive) {
    await deactivatePage(admin, eventType || null);
  }

  const { error: upErr } = await admin.storage
    .from("videos")
    .upload(path, file, { contentType: file.type || "video/mp4", upsert: false });

  if (upErr) return { error: `Error de Storage: ${upErr.message}` };

  const { data: { publicUrl } } = admin.storage.from("videos").getPublicUrl(path);

  const { data: vid, error: insErr } = await admin
    .from("hero_videos")
    .insert({
      url:        publicUrl,
      title:      title.trim() || null,
      event_type: eventType || null,
      is_active:  isActive,
      sort_order: 0,
    })
    .select("id, url, title, event_type, is_active")
    .single();

  if (insErr) {
    await admin.storage.from("videos").remove([path]);
    return { error: `Error al guardar: ${insErr.message}` };
  }

  revalidate();
  return { video: vid as UploadedVideo };
}

// ─── Acciones de estado y borrado ─────────────────────────────────────────────

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
  try {
    const parsed = new URL(url);
    const marker = "/object/public/videos/";
    const idx    = parsed.pathname.indexOf(marker);
    if (idx !== -1) {
      const storagePath = decodeURIComponent(parsed.pathname.slice(idx + marker.length));
      await admin.storage.from("videos").remove([storagePath]);
    }
  } catch { /* URL no parseable — borra solo el registro */ }
  const { error } = await admin.from("hero_videos").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidate();
  return {};
}
