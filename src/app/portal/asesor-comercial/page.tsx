import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchAllBookingsWithClient } from "@/lib/eventos";
import { EventosManager } from "@/components/admin/EventosManager";
import { ContactosAsesorView } from "@/components/asesor/ContactosAsesorView";

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

  if (!profile || !["admin", "asesor_comercial", "wedding_planner"].includes(profile.role)) {
    redirect("/portal");
  }

  const isAdmin = profile.role === "admin";

  // Contactos asignados a este asesor (admin ve todos)
  const contactsQuery = isAdmin
    ? supabase
        .from("contact_messages")
        .select("id, name, email, phone, whatsapp, subject, message, status, created_at")
        .order("created_at", { ascending: false })
    : supabase
        .from("contact_messages")
        .select("id, name, email, phone, whatsapp, subject, message, status, created_at")
        .eq("assigned_asesor_id", user.id)
        .order("created_at", { ascending: false });

  const [{ data: contacts }, eventRows] = await Promise.all([
    contactsQuery,
    fetchAllBookingsWithClient(supabase, { restrictToUpcoming: !isAdmin }),
  ]);

  return (
    <div className="space-y-10">
      {/* Sección Contactos */}
      <div className="space-y-4">
        <div>
          <h2 className="font-serif text-[1.9rem] md:text-[2.3rem] text-negro leading-tight tracking-[-0.03em]">
            Mis <span className="text-dorado">Contactos</span>
          </h2>
          <p className="text-gris text-[0.88rem] mt-1">
            {isAdmin
              ? "Todos los contactos del formulario público"
              : "Contactos asignados a ti desde el formulario de contacto"}
          </p>
        </div>
        <ContactosAsesorView initialContacts={contacts ?? []} />
      </div>

      {/* Sección Eventos (pipeline ya convertido) */}
      <div className="space-y-4">
        <div>
          <h2 className="font-serif text-[1.6rem] text-negro leading-tight tracking-[-0.03em]">
            Eventos <span className="text-dorado">Activos</span>
          </h2>
          <p className="text-gris text-[0.88rem] mt-1">
            {isAdmin ? "Todos los eventos" : "Próximos 15 días"}
          </p>
        </div>
        <EventosManager rows={eventRows} />
      </div>
    </div>
  );
}
