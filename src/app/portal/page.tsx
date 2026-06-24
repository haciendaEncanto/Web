import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ROLE_DESTINATIONS: Record<string, string> = {
  client: "/portal/dashboard",
  admin: "/admin/dashboard",
  wedding_planner: "/portal/planner",
  asesor_comercial: "/portal/asesor-comercial",
  asesor_logistica: "/portal/asesor-logistica",
  staff: "/portal/staff",
};

export default async function PortalRoot() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  redirect(ROLE_DESTINATIONS[profile?.role ?? "client"] ?? "/portal/dashboard");
}
