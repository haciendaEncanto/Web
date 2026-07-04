"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { createSignedUpload, publicUrlFor, removeUploadedFile } from "@/lib/uploads/server";
import { siteImagePath, SITE_IMAGE_KEYS, type SiteImageKey } from "@/lib/uploads/config";

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
  revalidatePath("/editor/imagenes-sitio");
  revalidatePath("/");
  revalidatePath("/bodas");
  revalidatePath("/quince-anos");
  revalidatePath("/eventos-empresariales");
  revalidatePath("/revelacion-de-genero");
}

function removeOldSiteImage(admin: ReturnType<typeof createAdminClient>, url: string | null) {
  if (!url) return;
  try {
    const parsed = new URL(url);
    const marker = "/object/public/gallery/";
    const idx = parsed.pathname.indexOf(marker);
    if (idx === -1) return;
    const storagePath = decodeURIComponent(parsed.pathname.slice(idx + marker.length));
    if (storagePath.startsWith("sitio/")) {
      void admin.storage.from("gallery").remove([storagePath]);
    }
  } catch { /* URL no parseable — se ignora */ }
}

export async function requestSiteImageUpload(meta: {
  fileName: string;
  contentType: string;
  size: number;
  key: SiteImageKey;
}): Promise<{ signedUrl?: string; token?: string; path?: string; error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };
  if (!SITE_IMAGE_KEYS.includes(meta.key)) return { error: "Clave de imagen inválida" };

  const path = siteImagePath(meta.key, meta.fileName);
  const { upload, error } = await createSignedUpload("site-image", {
    contentType: meta.contentType,
    size: meta.size,
    path,
  });
  if (error || !upload) return { error };

  return { signedUrl: upload.signedUrl, token: upload.token, path: upload.path };
}

export async function confirmSiteImageUpload(meta: {
  key: SiteImageKey;
  path: string;
}): Promise<{ url?: string; error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };

  const admin = createAdminClient();
  const url = publicUrlFor("site-image", meta.path);

  const { data: existing } = await admin
    .from("site_content").select("content").eq("key", meta.key).maybeSingle();

  const { error } = await admin
    .from("site_content")
    .upsert({ key: meta.key, content: url }, { onConflict: "key" });

  if (error) {
    await removeUploadedFile("site-image", meta.path);
    return { error: `Error al guardar: ${error.message}` };
  }

  removeOldSiteImage(admin, existing?.content ?? null);
  revalidate();
  return { url };
}

export async function deleteSiteImage(key: SiteImageKey): Promise<{ error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("site_content").select("content").eq("key", key).maybeSingle();

  const { error } = await admin
    .from("site_content")
    .upsert({ key, content: null }, { onConflict: "key" });
  if (error) return { error: error.message };

  removeOldSiteImage(admin, existing?.content ?? null);
  revalidate();
  return {};
}
