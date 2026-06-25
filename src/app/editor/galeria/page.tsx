import { createAdminClient } from "@/lib/supabase/admin";
import { GaleriaManager } from "@/components/editor/GaleriaManager";

export default async function GaleriaPage() {
  const admin = createAdminClient();
  const { data: images } = await admin
    .from("gallery_images")
    .select("id, url, title, category, sort_order, is_published")
    .order("sort_order", { ascending: true });

  return <GaleriaManager images={images ?? []} />;
}
