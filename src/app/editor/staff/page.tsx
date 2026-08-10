import { createRawAdminClient } from "@/lib/supabase/admin";
import { StaffManager } from "@/components/editor/StaffManager";
import type { StaffRow } from "@/app/actions/editor/staff";

export default async function StaffPage() {
  const db = createRawAdminClient();
  const { data } = await db
    .from("staff")
    .select("id,nombre,cargo,descripcion,foto_url,sort_order,is_active")
    .order("sort_order", { ascending: true });

  return <StaffManager members={(data ?? []) as StaffRow[]} />;
}
