import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchClientBookingRows } from "@/lib/clientes";
import { UsuariosManager } from "@/components/admin/UsuariosManager";
import { ClientesTable } from "@/components/clientes/ClientesTable";

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
    .select("id, full_name, email, role, is_active, created_at")
    .neq("role", "client")
    .order("created_at", { ascending: false });

  type Row = {
    id: string; full_name: string | null; email: string;
    role: string; is_active: boolean; created_at: string;
  };

  const clienteRows = await fetchClientBookingRows(admin);

  return (
    <div className="space-y-10">
      <UsuariosManager usuarios={(usuarios ?? []) as Row[]} />

      <div>
        <div className="mb-6">
          <h2 className="font-serif text-[1.9rem] text-negro tracking-[-0.03em]">
            <span className="text-dorado">Clientes</span>
          </h2>
          <p className="text-gris text-[0.88rem] mt-1">
            Solo lectura — gestionados desde el portal del wedding planner
          </p>
        </div>
        <ClientesTable rows={clienteRows} readOnly />
      </div>
    </div>
  );
}
