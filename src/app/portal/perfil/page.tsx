import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PerfilManager } from "@/components/portal/PerfilManager";

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, avatar_url")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/login");

  return <PerfilManager initial={profile} />;
}
