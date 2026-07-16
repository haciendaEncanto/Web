import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchAllBookingsWithClient } from "@/lib/eventos";
import { EventosManager } from "@/components/admin/EventosManager";

export default async function GerentePanel() {
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

  if (!profile || !["admin", "gerente"].includes(profile.role)) {
    redirect("/portal");
  }

  // Gerente ve todos los eventos sin restricción de fecha, igual que admin.
  const rows = await fetchAllBookingsWithClient(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-[1.9rem] md:text-[2.3rem] text-negro leading-tight tracking-[-0.03em]">
          Panel <span className="text-dorado">Gerente</span>
        </h2>
        <p className="text-gris text-[0.88rem] mt-1">Todos los eventos</p>
      </div>
      <EventosManager rows={rows} />
    </div>
  );
}
