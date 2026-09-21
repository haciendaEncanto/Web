// Upload directo al hosting de Colombia (contenido.hacienda-encanto.com)
// vía el script PHP upload-colombia-hosting.php desplegado en public_html/
//
// El CSP ya incluye https://contenido.hacienda-encanto.com en connect-src.

const PHP_UPLOAD_URL = "https://contenido.hacienda-encanto.com/upload.php";

export type ColombiaFolder =
  | "galeria/staff"
  | "galeria/blog"
  | "documentos/contratos"
  | "promociones"
  | "cotizaciones";

export async function uploadToColombiaHosting(
  file: File | Buffer,
  folder: ColombiaFolder,
): Promise<{ url?: string; error?: string }> {
  // En desarrollo, el script PHP solo permite el origen de producción (CORS).
  // Retornar URL de prueba para poder validar el flujo completo en localhost.
  if (process.env.NODE_ENV === "development") {
    const ext = Buffer.isBuffer(file) ? "pdf" : "jpg";
    return { url: `https://contenido.hacienda-encanto.com/${folder}/mock_${Date.now()}.${ext}` };
  }

  const fd = new FormData();

  if (Buffer.isBuffer(file)) {
    // Llamado server-side (SA): envolver el buffer como Blob para FormData
    const blob = new Blob([new Uint8Array(file)], { type: "application/pdf" });
    fd.append("file", blob, `doc_${Date.now()}.pdf`);
  } else {
    fd.append("file", file);
  }
  fd.append("folder", folder);

  try {
    const res = await fetch(PHP_UPLOAD_URL, { method: "POST", body: fd });
    const text = await res.text();
    console.log("[uploadToColombiaHosting] respuesta PHP:", {
      folder,
      status: res.status,
      contentType: res.headers.get("content-type"),
      body: text.slice(0, 500),
    });

    let json: { success: boolean; url?: string; error?: string };
    try {
      json = JSON.parse(text);
    } catch {
      return { error: `El servidor de archivos no devolvió JSON (HTTP ${res.status})` };
    }
    if (!res.ok || !json.success) {
      return { error: json.error ?? `Error HTTP ${res.status}` };
    }
    return { url: json.url };
  } catch (err) {
    console.error("[uploadToColombiaHosting] fetch falló:", err);
    return { error: err instanceof Error ? err.message : "Error de red al subir archivo" };
  }
}
