import { createAdminClient } from "@/lib/supabase/admin";
import { ContenidoManager } from "@/components/editor/ContenidoManager";

// Solo las claves del contenido general del sitio.
// Las cláusulas/hacienda del contrato se editan en /admin/contrato.
// Las imágenes se editan en /editor/imagenes-sitio.
const CONTENIDO_KEYS = ["hero", "about", "stats", "contact", "tour_360_url"];

export default async function ContenidoPage() {
  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("site_content")
    .select("id, key, title, content, data, updated_at")
    .in("key", CONTENIDO_KEYS)
    .order("key");

  return <ContenidoManager rows={rows ?? []} />;
}
