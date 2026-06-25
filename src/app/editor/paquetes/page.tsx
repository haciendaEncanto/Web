import { createAdminClient } from "@/lib/supabase/admin";
import { PaquetesManager } from "@/components/editor/PaquetesManager";

export default async function PaquetesPage() {
  const admin = createAdminClient();
  const { data: paquetes } = await admin
    .from("packages")
    .select("id, name, event_type, description, includes, is_active")
    .order("event_type, name");

  type Row = {
    id: string; name: string; event_type: string | null;
    description: string | null; includes: string[]; is_active: boolean;
  };

  return <PaquetesManager paquetes={(paquetes ?? []) as Row[]} />;
}
