import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SalonMapasManager } from "@/components/portal/planner/SalonMapasManager";

export default async function SalonMapasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (!me || !["admin", "wedding_planner"].includes(me.role)) redirect("/portal");

  const { data: maps } = await supabase
    .from("salon_maps")
    .select("id, name, image_url, min_guests, max_guests, is_active")
    .order("min_guests", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-[1.9rem] text-negro tracking-[-0.03em]">
          Mapas del <span className="text-dorado">salón</span>
        </h2>
        <p className="text-gris text-[0.88rem] mt-1">
          Gestiona los mapas de distribución de mesas por cantidad de invitados.
        </p>
      </div>
      <SalonMapasManager initialMaps={maps ?? []} />
    </div>
  );
}
