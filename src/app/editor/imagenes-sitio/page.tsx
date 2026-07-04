import { createAdminClient } from "@/lib/supabase/admin";
import { ImagenesSitioManager } from "@/components/editor/ImagenesSitioManager";
import { SITE_IMAGE_KEYS, type SiteImageKey } from "@/lib/uploads/config";

export default async function ImagenesSitioPage() {
  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("site_content")
    .select("key, content")
    .in("key", SITE_IMAGE_KEYS);

  const initial = Object.fromEntries(
    SITE_IMAGE_KEYS.map((k) => [k, null]),
  ) as Record<SiteImageKey, string | null>;

  for (const row of rows ?? []) {
    if (SITE_IMAGE_KEYS.includes(row.key as SiteImageKey)) {
      initial[row.key as SiteImageKey] = row.content;
    }
  }

  return <ImagenesSitioManager initial={initial} />;
}
