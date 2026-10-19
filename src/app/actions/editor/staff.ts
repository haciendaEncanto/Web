"use server";

import { createClient } from "@/lib/supabase/server";
import { createRawAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function verifyEditor() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" as const };
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "editor"].includes(profile.role as string))
    return { error: "Sin permisos" as const };
  return { error: null };
}

export type StaffData = {
  nombre: string;
  cargo: string;
  descripcion?: string | null;
  foto_url?: string | null;
  is_aliado_externo?: boolean;
  frase?: string | null;
};

export type StaffRow = {
  id: string;
  nombre: string;
  cargo: string;
  descripcion: string | null;
  foto_url: string | null;
  sort_order: number;
  is_active: boolean;
  is_aliado_externo: boolean;
  frase: string | null;
};

function revalidate() {
  revalidatePath("/editor/staff");
  revalidatePath("/");
}

export async function createStaffMember(
  data: StaffData,
): Promise<{ row?: StaffRow; error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };
  if (!data.nombre.trim()) return { error: "El nombre es requerido" };
  if (!data.cargo.trim()) return { error: "El cargo es requerido" };

  const db = createRawAdminClient();
  const { data: last } = await db
    .from("staff").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const sortOrder = (last?.sort_order ?? 0) + 1;

  const { data: row, error } = await db
    .from("staff")
    .insert({
      nombre: data.nombre.trim(),
      cargo: data.cargo.trim(),
      descripcion: data.descripcion?.trim() || null,
      foto_url: data.foto_url || null,
      sort_order: sortOrder,
      is_aliado_externo: data.is_aliado_externo ?? false,
      frase: data.frase?.trim() || null,
    })
    .select("id,nombre,cargo,descripcion,foto_url,sort_order,is_active,is_aliado_externo,frase")
    .single();

  if (error) return { error: (error as { message: string }).message };
  revalidate();
  return { row: row as StaffRow };
}

export async function updateStaffMember(
  id: string,
  data: Partial<StaffData>,
): Promise<{ row?: StaffRow; error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };

  const db = createRawAdminClient();
  const { data: row, error } = await db
    .from("staff")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id,nombre,cargo,descripcion,foto_url,sort_order,is_active,is_aliado_externo,frase")
    .single();

  if (error) return { error: (error as { message: string }).message };
  revalidate();
  return { row: row as StaffRow };
}

// ─── Foto (Colombia Hosting — carpeta galeria/staff/) ─────────────────────────

const STAFF_PHOTO_MAX_BYTES = 10 * 1024 * 1024;
const STAFF_PHOTO_ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

export async function requestStaffPhotoUpload(meta: {
  fileName: string;
  contentType: string;
  size: number;
}): Promise<{ uploadUrl?: string; token?: string; folder?: string; error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };

  if (!STAFF_PHOTO_ALLOWED_MIME.includes(meta.contentType))
    return { error: `Formato no permitido: ${meta.contentType}` };
  if (meta.size <= 0)
    return { error: "El archivo está vacío" };
  if (meta.size > STAFF_PHOTO_MAX_BYTES)
    return { error: `El archivo supera el límite de 10 MB (${(meta.size / 1024 / 1024).toFixed(1)} MB)` };

  const uploadUrl = process.env.HOSTING_UPLOAD_URL;
  const token = process.env.HOSTING_UPLOAD_TOKEN;
  if (!uploadUrl || !token)
    return { error: "Servidor de archivos no configurado (HOSTING_UPLOAD_URL / HOSTING_UPLOAD_TOKEN)" };

  return { uploadUrl, token, folder: "galeria/staff" };
}

export async function confirmStaffPhotoUpload(meta: {
  id: string;
  url: string;
}): Promise<{ row?: StaffRow; error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };

  // Forzar HTTPS — salvaguarda server-side antes de persistir en BD
  const safeUrl = meta.url.replace(/^http:\/\//i, "https://");
  if (!safeUrl.startsWith("https://"))
    return { error: `URL inválida: debe comenzar con https:// (recibida: ${meta.url})` };

  const db = createRawAdminClient();
  const { data: row, error } = await db
    .from("staff")
    .update({ foto_url: safeUrl, updated_at: new Date().toISOString() })
    .eq("id", meta.id)
    .select("id,nombre,cargo,descripcion,foto_url,sort_order,is_active,is_aliado_externo,frase")
    .single();

  if (error) return { error: `Error al guardar la foto: ${(error as { message: string }).message}` };
  revalidate();
  return { row: row as StaffRow };
}

export async function deleteStaffMember(id: string): Promise<{ error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };

  const db = createRawAdminClient();
  const { error } = await db.from("staff").delete().eq("id", id);
  if (error) return { error: (error as { message: string }).message };
  revalidate();
  return {};
}

export async function toggleStaffActive(
  id: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };

  const db = createRawAdminClient();
  const { error } = await db
    .from("staff")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: (error as { message: string }).message };
  revalidate();
  return {};
}

export async function moveStaffMember(
  id: string,
  direction: "up" | "down",
): Promise<{ error?: string }> {
  const { error: authErr } = await verifyEditor();
  if (authErr) return { error: authErr };

  const db = createRawAdminClient();

  const { data: current } = await db
    .from("staff").select("sort_order").eq("id", id).single();
  if (!current) return { error: "Miembro no encontrado" };

  const { data: adjacent } = direction === "up"
    ? await db.from("staff")
        .select("id,sort_order")
        .lt("sort_order", current.sort_order)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle()
    : await db.from("staff")
        .select("id,sort_order")
        .gt("sort_order", current.sort_order)
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle();

  if (!adjacent) return {};

  await db.from("staff").update({ sort_order: adjacent.sort_order }).eq("id", id);
  await db.from("staff").update({ sort_order: current.sort_order }).eq("id", adjacent.id);

  revalidate();
  return {};
}
