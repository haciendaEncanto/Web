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
