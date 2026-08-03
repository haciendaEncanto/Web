"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { removeUploadedFile } from "@/lib/uploads/server";

const SUPABASE_HOST = "oewqyckeqolrpjbjevap.supabase.co";

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

// ─── Upload directo a Colombia Hosting (3 pasos — el archivo nunca toca Vercel) ─

export type UploadedImage = {
  id: string; url: string; title: string | null;
  category: string | null; sort_order: number; is_published: boolean;
};

/**
 * Paso 1: valida permisos, tipo y tamaño. Devuelve las credenciales necesarias
 * para que el browser suba el archivo directamente a Colombia Hosting.
 */
export async function requestGaleriaUpload(meta: {
  fileName: string;
  contentType: string;
  size: number;
  category: string;
}): Promise<{ uploadUrl?: string; token?: string; folder?: string; error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(meta.contentType))
    return { error: `Formato no permitido: ${meta.contentType}` };
  if (meta.size <= 0)
    return { error: "El archivo está vacío" };
  if (meta.size > 10 * 1024 * 1024)
    return { error: `El archivo supera el límite de 10 MB (${(meta.size / 1024 / 1024).toFixed(1)} MB)` };

  const uploadUrl = process.env.HOSTING_UPLOAD_URL;
  const token = process.env.HOSTING_UPLOAD_TOKEN;
  if (!uploadUrl || !token)
    return { error: "Servidor de archivos no configurado (HOSTING_UPLOAD_URL / HOSTING_UPLOAD_TOKEN)" };

  const validCategories = ["boda", "quince", "empresarial", "revelacion", "general"];
  const category = validCategories.includes(meta.category) ? meta.category : "general";
  const folder = `galeria/${category}`;

  return { uploadUrl, token, folder };
}

/**
 * Paso 3: recibe la URL pública que devolvió Colombia Hosting e inserta en BD.
 * Si falla el INSERT, la imagen queda huérfana en el servidor (sin delete API).
 */
export async function confirmGaleriaUpload(meta: {
  url: string;
  category: string;
  title: string;
}): Promise<{ image?: UploadedImage; error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };

  const admin = createAdminClient();

  const { data: img, error: insErr } = await admin
    .from("gallery_images")
    .insert({
      url:          meta.url,
      title:        meta.title.trim() || null,
      category:     meta.category,
      sort_order:   0,
      is_published: false,
    })
    .select("id, url, title, category, sort_order, is_published")
    .single();

  if (insErr) return { error: `Error al guardar: ${insErr.message}` };

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

  // Imágenes antiguas en Supabase Storage: intentar borrar el archivo
  try {
    const parsed = new URL(url);
    if (parsed.hostname === SUPABASE_HOST) {
      const marker = "/object/public/gallery/";
      const idx    = parsed.pathname.indexOf(marker);
      if (idx !== -1) {
        const storagePath = decodeURIComponent(parsed.pathname.slice(idx + marker.length));
        await removeUploadedFile("gallery-image", storagePath);
      }
    }
    // Imágenes en Colombia Hosting no tienen endpoint de borrado — solo se elimina el registro
  } catch { /* URL no parseable */ }

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
