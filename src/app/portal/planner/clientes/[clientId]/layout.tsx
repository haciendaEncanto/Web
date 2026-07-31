import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ClienteTabNav } from "@/components/portal/planner/ClienteTabNav";

const ALLOWED_ROLES = ["admin", "wedding_planner", "asesor_comercial"];

export default async function PlannerClienteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (!me || !ALLOWED_ROLES.includes(me.role)) redirect("/portal");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, email")
    .eq("id", clientId)
    .single();

  if (!profile) notFound();

  const name = profile.full_name ?? profile.email ?? clientId;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 text-[0.8rem] text-gris mb-3">
          <Link
            href="/portal/planner/clientes"
            className="inline-flex items-center gap-1 hover:text-negro transition-colors"
          >
            <ArrowLeft size={13} />
            Clientes
          </Link>
          <span>/</span>
          <span className="text-negro font-medium">{name}</span>
        </div>
        <ClienteTabNav clientId={clientId} role={me.role} />
      </div>
      {children}
    </div>
  );
}
