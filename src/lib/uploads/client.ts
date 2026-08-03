"use client";

import { createClient } from "@/lib/supabase/client";

export async function uploadFileToSignedUrl(
  bucket: string,
  path: string,
  token: string,
  file: File,
): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(bucket)
    .uploadToSignedUrl(path, token, file, { contentType: file.type });

  if (error) return { error: `Error al subir el archivo: ${error.message}` };
  return {};
}

/**
 * Sube un archivo directamente desde el navegador al endpoint PHP de Colombia Hosting.
 * El archivo nunca pasa por Vercel — evita el límite de 4.5 MB del body.
 * El token y la URL vienen de la Server Action (autenticada) que los generó.
 */
export async function uploadToHosting(
  uploadUrl: string,
  token: string,
  folder: string,
  file: File,
): Promise<{ url?: string; error?: string }> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);

  try {
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: { "X-Upload-Token": token },
      body: form,
    });
    if (!res.ok) {
      const text = await res.text();
      return { error: `Error HTTP ${res.status} del servidor de archivos: ${text}` };
    }
    const data = (await res.json()) as { success: boolean; url?: string; error?: string };
    console.log("[uploadToHosting] respuesta PHP:", data);
    if (!data.success) return { error: data.error ?? "Error en el servidor de archivos" };
    // Forzar HTTPS — el PHP debería devolverlo así, pero como salvaguarda:
    const url = data.url?.replace(/^http:\/\//i, "https://");
    console.log("[uploadToHosting] URL final guardada:", url);
    return { url };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error de red al subir archivo" };
  }
}
