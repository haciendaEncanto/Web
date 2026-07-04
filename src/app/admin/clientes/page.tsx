import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchClientBookingRows } from "@/lib/clientes";
import { ClientesTable } from "@/components/clientes/ClientesTable";

export default async function AdminClientesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (!me || me.role !== "admin") redirect("/portal");

  const admin = createAdminClient();
  const rows = await fetchClientBookingRows(admin);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-[1.9rem] md:text-[2.3rem] text-negro leading-tight tracking-[-0.03em]">
            <span className="text-dorado">Clientes</span>
          </h2>
          <p className="text-gris text-[0.88rem] mt-1">
            Todos los clientes — activos, cumplidos y cancelados
          </p>
        </div>
        <Link
          href="/admin/clientes/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-dorado text-blanco text-[0.8rem] font-medium rounded-xl hover:bg-dorado/90 transition-colors shrink-0 mt-1"
        >
          + Nuevo cliente
        </Link>
      </div>

      <ClientesTable rows={rows} basePath="admin" />
    </div>
  );
}
