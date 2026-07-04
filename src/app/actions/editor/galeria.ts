"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { createSignedUpload, publicUrlFor, removeUploadedFile } from "@/lib/uploads/server";
import { galleryImagePath } from "@/lib/uploads/config";

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

function revalidateAll() {
  revalidatePath("/editor/galeria");
  revalidatePath("/");
  revalidatePath("/bodas");
  revalidatePath("/quince-anos");
  revalidatePath("/eventos-empresariales");
  revalidatePath("/revelacion-de-genero");
}

// ─── Upload directo a Supabase Storage (signed URL) ───────────────────────────

export type UploadedImage = {
  id: string; url: string; title: string | null;
  category: string | null; sort_order: number; is_published: boolean;
};

export async function requestGaleriaUpload(meta: {
  fileName: string;
  contentType: string;
  size: number;
  category: string;
}): Promise<{ signedUrl?: string; token?: string; path?: string; error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };

  const path = galleryImagePath(meta.category, meta.fileName);
  const { upload, error } = await createSignedUpload("gallery-image", {
    contentType: meta.contentType,
    size: meta.size,
    path,
  });
  if (error || !upload) return { error };

  return { signedUrl: upload.signedUrl, token: upload.token, path: upload.path };
}

export async function confirmGaleriaUpload(meta: {
  path: string;
  category: string;
  title: string;
}): Promise<{ image?: UploadedImage; error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };

  const admin = createAdminClient();

  const { data: img, error: insErr } = await admin
    .from("gallery_images")
    .insert({
      url:          publicUrlFor("gallery-image", meta.path),
      title:        meta.title.trim() || null,
      category:     meta.category,
      sort_order:   0,
      is_published: false,
    })
    .select("id, url, title, category, sort_order, is_published")
    .single();

  if (insErr) {
    await removeUploadedFile("gallery-image", meta.path);
    return { error: `Error al guardar: ${insErr.message}` };
  }

  revalidateAll();
  return { image: img as UploadedImage };
}

// ─── Acciones de edición / borrado / reorden ──────────────────────────────────

export async function updateGaleriaImage(
  id: string,
  data: { title?: string; category?: string; is_published?: boolean; sort_order?: number },
): Promise<{ error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };
  const admin = createAdminClient();
  const { error } = await admin.from("gallery_images").update(data).eq("id", id);
  if (error) return { error: error.message };
  revalidateAll();
  return {};
}

export async function deleteGaleriaImage(id: string, url: string): Promise<{ error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };
  const admin = createAdminClient();
  try {
    const parsed = new URL(url);
    const marker = "/object/public/gallery/";
    const idx    = parsed.pathname.indexOf(marker);
    if (idx !== -1) {
      const storagePath = decodeURIComponent(parsed.pathname.slice(idx + marker.length));
      await admin.storage.from("gallery").remove([storagePath]);
    }
  } catch { /* si la URL no es parseable, borramos solo el registro */ }
  const { error } = await admin.from("gallery_images").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidateAll();
  return {};
}

export async function reorderGaleriaImages(
  items: { id: string; sort_order: number }[],
): Promise<{ error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };
  const admin = createAdminClient();
  await Promise.all(
    items.map((item) =>
      admin.from("gallery_images").update({ sort_order: item.sort_order }).eq("id", item.id),
    ),
  );
  revalidateAll();
  return {};
}
