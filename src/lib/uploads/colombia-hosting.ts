// Upload directo de imágenes al hosting de Colombia (contenido.hacienda-encanto.com)
// vía el script PHP upload-colombia-hosting.php desplegado en public_html/
//
// El CSP ya incluye https://contenido.hacienda-encanto.com en connect-src.

const PHP_UPLOAD_URL = "https://contenido.hacienda-encanto.com/upload.php";

export async function uploadToColombiaHosting(
  file: File,
  folder: "galeria/staff" | "galeria/blog",
): Promise<{ url?: string; error?: string }> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);

  try {
    const res = await fetch(PHP_UPLOAD_URL, { method: "POST", body: fd });
    if (!res.ok) return { error: `Error HTTP ${res.status}` };
    const json = (await res.json()) as { success: boolean; url?: string; error?: string };
    if (!json.success) return { error: json.error ?? "Error al subir imagen" };
    return { url: json.url };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error de red al subir imagen" };
  }
}
