import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { LeadsManager } from "@/components/admin/LeadsManager";

export const metadata = { title: "Leads — Hacienda El Encanto" };

export default async function LeadsPage() {
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

  const admin = createAdminClient();

  const [{ data: messages }, { data: asesores }] = await Promise.all([
    admin
      .from("contact_messages")
      .select(
        "id, created_at, name, email, phone, whatsapp, subject, event_date, guest_count, message, status, assigned_asesor_id"
      )
      .order("created_at", { ascending: false }),
    admin
      .from("profiles")
      .select("id, full_name, role")
      .in("role", ["asesor_comercial", "wedding_planner"])
      .eq("is_active", true)
      .order("full_name"),
  ]);

  // Obtener nombres de asesores asignados
  const asesorIds = [
    ...new Set(
      (messages ?? [])
        .map((m) => m.assigned_asesor_id)
        .filter((id): id is string => !!id)
    ),
  ];

  const { data: asesorProfiles } =
    asesorIds.length > 0
      ? await admin
          .from("profiles")
          .select("id, full_name, phone")
          .in("id", asesorIds)
      : { data: [] as { id: string; full_name: string | null; phone: string | null }[] };

  const profileMap = new Map((asesorProfiles ?? []).map((p) => [p.id, p]));

  const leads = (messages ?? []).map((m) => ({
    ...m,
    asesor_name: m.assigned_asesor_id
      ? (profileMap.get(m.assigned_asesor_id)?.full_name ?? null)
      : null,
    asesor_phone: m.assigned_asesor_id
      ? (profileMap.get(m.assigned_asesor_id)?.phone ?? null)
      : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-[2rem] md:text-[2.5rem] text-negro leading-tight tracking-[-0.03em]">
          Leads &{" "}
          <span className="text-dorado">Contactos</span>
        </h1>
        <p className="text-gris text-[0.88rem] mt-1">
          Todos los contactos recibidos desde el formulario público
        </p>
      </div>
      <LeadsManager initialLeads={leads} asesores={asesores ?? []} />
    </div>
  );
}
