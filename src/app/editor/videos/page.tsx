import { createAdminClient } from "@/lib/supabase/admin";
import { VideosManager } from "@/components/editor/VideosManager";

export default async function VideosPage() {
  const admin = createAdminClient();
  const { data: videos } = await admin
    .from("hero_videos")
    .select("id, url, title, event_type, is_active")
    .order("created_at", { ascending: false });

  return <VideosManager videos={videos ?? []} />;
}
