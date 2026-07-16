import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchAllBookingsWithClient } from "@/lib/eventos";
import { EventosManager } from "@/components/admin/EventosManager";

export default async function AsesorComercialPanel() {
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

  if (!profile || !["admin", "asesor_comercial"].includes(profile.role)) {
    redirect("/portal");
  }

  const rows = await fetchAllBookingsWithClient(supabase, {
    restrictToUpcoming: profile.role !== "admin",
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-[1.9rem] md:text-[2.3rem] text-negro leading-tight tracking-[-0.03em]">
          Panel <span className="text-dorado">Asesor Comercial</span>
        </h2>
        <p className="text-gris text-[0.88rem] mt-1">
          {profile.role === "admin"
            ? "Todos los eventos"
            : "Eventos de las próximas 2 semanas"}
        </p>
      </div>
      <EventosManager rows={rows} />
    </div>
  );
}
