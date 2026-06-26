"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const FOLDER: Record<string, string> = {
  boda:        "bodas",
  quince:      "quince",
  empresarial: "empresarial",
  revelacion:  "revelacion",
  general:     "general",
};

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

// ─── Upload completo en servidor (reemplaza el upload client-side) ────────────

export type UploadedImage = {
  id: string; url: string; title: string | null;
  category: string | null; sort_order: number; is_published: boolean;
};

export async function uploadGaleriaImage(
  formData: FormData,
): Promise<{ image?: UploadedImage; error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };

  const file     = formData.get("file") as File | null;
  const category = (formData.get("category") as string) || "general";
  const title    = (formData.get("title") as string) || "";

  if (!file || file.size === 0) return { error: "No se recibió ningún archivo" };
  if (!ALLOWED_TYPES.includes(file.type))
    return { error: "Formato no permitido. Usa JPG, PNG o WebP." };
  if (file.size > MAX_BYTES)
    return { error: `El archivo supera el límite de 5 MB (${(file.size / 1024 / 1024).toFixed(1)} MB)` };

  const admin  = createAdminClient();
  const folder = FOLDER[category] ?? "general";
  const safe   = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 60);
  const path   = `${folder}/${Date.now()}_${safe}`;

  // 1. Subir al bucket gallery usando admin client (bypasa RLS)
  const { error: upErr } = await admin.storage
    .from("gallery")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (upErr) return { error: `Error de Storage: ${upErr.message}` };

  const { data: { publicUrl } } = admin.storage.from("gallery").getPublicUrl(path);

  // 2. Insertar registro en gallery_images
  const { data: img, error: insErr } = await admin
    .from("gallery_images")
    .insert({
      url:          publicUrl,
      title:        title.trim() || null,
      category,
      sort_order:   0,
      is_published: true,
    })
    .select("id, url, title, category, sort_order, is_published")
    .single();

  if (insErr) {
    // Limpiar el archivo subido si falla el insert
    await admin.storage.from("gallery").remove([path]);
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
