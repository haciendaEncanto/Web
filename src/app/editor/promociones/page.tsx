import { createRawAdminClient } from "@/lib/supabase/admin";
import { PromocionesManager } from "@/components/editor/PromocionesManager";
import type { PromocionRow } from "@/app/actions/editor/promociones";

export default async function PromocionesEditorPage() {
  const db = createRawAdminClient();
  const { data } = await db
    .from("promociones")
    .select("id, imagen_url, fecha_inicio, fecha_fin, sort_order, is_active, created_at")
    .order("sort_order");

  return <PromocionesManager promos={(data ?? []) as PromocionRow[]} />;
}
