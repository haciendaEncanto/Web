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

function revalidateAll() {
  revalidatePath("/editor/galeria");
  revalidatePath("/");
  revalidatePath("/bodas");
  revalidatePath("/quince-anos");
  revalidatePath("/eventos-empresariales");
  revalidatePath("/revelacion-de-genero");
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
  revalidateAll();
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
  revalidateAll();
  return {};
}

export async function deleteGaleriaImage(id: string, url: string): Promise<{ error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };
  const admin = createAdminClient();
  // Extraer path de Storage desde la URL pública
  try {
    const parsed = new URL(url);
    const marker = "/object/public/gallery/";
    const idx = parsed.pathname.indexOf(marker);
    if (idx !== -1) {
      const storagePath = parsed.pathname.slice(idx + marker.length);
      await admin.storage.from("gallery").remove([storagePath]);
    }
  } catch {
    // Si la URL no es parseable, solo borramos el registro
  }
  const { error } = await admin.from("gallery_images").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidateAll();
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
  revalidateAll();
  return {};
}
