import { createAdminClient } from "@/lib/supabase/admin";
import { ContenidoManager } from "@/components/editor/ContenidoManager";

export default async function ContenidoPage() {
  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("site_content")
    .select("id, key, title, content, data, updated_at")
    .order("key");

  return <ContenidoManager rows={rows ?? []} />;
}
