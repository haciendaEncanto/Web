"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { createSignedUpload, publicUrlFor, removeUploadedFile } from "@/lib/uploads/server";
import { heroVideoPath } from "@/lib/uploads/config";

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

// ─── Upload directo a Supabase Storage (signed URL) ───────────────────────────

export type UploadedVideo = {
  id: string; url: string; title: string | null;
  event_type: string | null; is_active: boolean;
};

export async function requestVideoUpload(meta: {
  fileName: string;
  contentType: string;
  size: number;
  eventType: string;
}): Promise<{ signedUrl?: string; token?: string; path?: string; error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };

  const path = heroVideoPath(meta.eventType, meta.fileName);
  const { upload, error } = await createSignedUpload("hero-video", {
    contentType: meta.contentType,
    size: meta.size,
    path,
  });
  if (error || !upload) return { error };

  return { signedUrl: upload.signedUrl, token: upload.token, path: upload.path };
}

export async function confirmVideoUpload(meta: {
  path: string;
  eventType: string;
  title: string;
  isActive: boolean;
}): Promise<{ video?: UploadedVideo; error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };

  const admin = createAdminClient();

  if (meta.isActive) {
    await deactivatePage(admin, meta.eventType || null);
  }

  const { data: vid, error: insErr } = await admin
    .from("hero_videos")
    .insert({
      url:        publicUrlFor("hero-video", meta.path),
      title:      meta.title.trim() || null,
      event_type: meta.eventType || null,
      is_active:  meta.isActive,
      sort_order: 0,
    })
    .select("id, url, title, event_type, is_active")
    .single();

  if (insErr) {
    await removeUploadedFile("hero-video", meta.path);
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
