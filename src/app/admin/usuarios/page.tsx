import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { UsuariosManager } from "@/components/admin/UsuariosManager";

export default async function UsuariosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (!me || me.role !== "admin") redirect("/portal");

  const admin = createAdminClient();
  const { data: usuarios } = await admin
    .from("profiles")
    .select("id, full_name, email, role, is_active, created_at, avatar_url")
    .neq("role", "client")
    .order("created_at", { ascending: false });

  type Row = {
    id: string; full_name: string | null; email: string;
    role: string; is_active: boolean; created_at: string;
    avatar_url: string | null;
  };

  return <UsuariosManager usuarios={(usuarios ?? []) as Row[]} />;
}
