import Link from "next/link";
import { redirect } from "next/navigation";
import { Pencil, ClipboardList, Users, CalendarDays } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CancelEventButton } from "@/components/portal/CancelEventButton";

const EVENT_LABEL: Record<string, string> = {
  boda: "Boda",
  quince: "Quinceañera",
  empresarial: "Empresarial",
  revelacion: "Revelación de Género",
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(t: string | null) {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "pm" : "am";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function OrdenBadge({ sections, approved }: { sections: { id: string }[]; approved: boolean | null }) {
  if (approved) {
    return (
      <span className="inline-flex items-center text-[0.67rem] font-medium px-2 py-0.5 rounded-full border text-green-700 bg-green-50 border-green-200">
        Completado
      </span>
    );
  }
  if (sections.length > 0) {
    return (
      <span className="inline-flex items-center text-[0.67rem] font-medium px-2 py-0.5 rounded-full border text-blue-700 bg-blue-50 border-blue-200">
        En progreso
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-[0.67rem] font-medium px-2 py-0.5 rounded-full border text-amber-700 bg-amber-50 border-amber-200">
      Pendiente
    </span>
  );
}

function EventoBadge({ status, isActive }: { status: string | null; isActive: boolean }) {
  const cancelled = status === "cancelled" || !isActive;
  return cancelled ? (
    <span className="inline-flex items-center text-[0.67rem] font-medium px-2 py-0.5 rounded-full border text-gris bg-negro/5 border-negro/15">
      Cancelado
    </span>
  ) : (
    <span className="inline-flex items-center text-[0.67rem] font-medium px-2 py-0.5 rounded-full border text-green-700 bg-green-50 border-green-200">
      Activo
    </span>
  );
}

export default async function ClientesPage() {
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

  if (!profile || !["admin", "wedding_planner"].includes(profile.role)) {
    redirect("/portal");
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      `id, client_id, event_type, event_date, event_start_time, event_end_time,
       guest_count, status, service_order_approved,
       profiles (id, full_name, email, is_active),
       service_order_sections (id)`
    )
    .order("event_date", { ascending: true });

  type Row = {
    id: string;
    client_id: string;
    event_type: string | null;
    event_date: string | null;
    event_start_time: string | null;
    event_end_time: string | null;
    guest_count: number | null;
    status: string | null;
    service_order_approved: boolean | null;
    profiles: { id: string; full_name: string | null; email: string; is_active: boolean } | null;
    service_order_sections: { id: string }[];
  };

  const rows = (bookings ?? []) as Row[];

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-[1.9rem] md:text-[2.3rem] text-negro leading-tight tracking-[-0.03em]">
            <span className="text-dorado">Clientes</span>
          </h2>
          <p className="text-gris text-[0.88rem] mt-1">
            Todos los clientes — activos y cancelados
          </p>
        </div>
        <Link
          href="/portal/planner/nuevo-cliente"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-dorado text-blanco text-[0.8rem] font-medium rounded-xl hover:bg-dorado/90 transition-colors shrink-0 mt-1"
        >
          + Nuevo cliente
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-10 text-center">
          <Users size={36} className="text-dorado/40 mx-auto mb-4" />
          <p className="font-serif text-[1.2rem] text-negro mb-2">Sin clientes</p>
          <p className="text-gris text-[0.85rem]">
            Los clientes creados por el planner aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-negro/[0.06] bg-crema/40">
                  <th className="px-5 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest whitespace-nowrap">Nombre</th>
                  <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest whitespace-nowrap">Evento</th>
                  <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest whitespace-nowrap">Fecha</th>
                  <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest whitespace-nowrap">Horario</th>
                  <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest whitespace-nowrap text-center">Invitados</th>
                  <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest whitespace-nowrap">Orden</th>
                  <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest whitespace-nowrap">Estado</th>
                  <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest whitespace-nowrap text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-negro/[0.04]">
                {rows.map((b) => {
                  const name = b.profiles?.full_name ?? b.profiles?.email ?? "Cliente";
                  const isCancelled = b.status === "cancelled" || !(b.profiles?.is_active ?? true);
                  return (
                    <tr
                      key={b.id}
                      className={[
                        "hover:bg-crema/20 transition-colors",
                        isCancelled ? "opacity-60" : "",
                      ].join(" ")}
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-[0.85rem] font-medium text-negro leading-tight">
                            {name}
                          </p>
                          <p className="text-[0.74rem] text-gris mt-0.5">
                            {b.profiles?.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[0.82rem] text-gris whitespace-nowrap">
                        {EVENT_LABEL[b.event_type ?? ""] ?? b.event_type ?? "—"}
                      </td>
                      <td className="px-4 py-4 text-[0.82rem] text-negro whitespace-nowrap">
                        {formatDate(b.event_date)}
                      </td>
                      <td className="px-4 py-4 text-[0.82rem] text-gris whitespace-nowrap">
                        {formatTime(b.event_start_time)} – {formatTime(b.event_end_time)}
                      </td>
                      <td className="px-4 py-4 text-[0.82rem] text-negro text-center">
                        {b.guest_count ?? "—"}
                      </td>
                      <td className="px-4 py-4">
                        <OrdenBadge
                          sections={b.service_order_sections}
                          approved={b.service_order_approved}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <EventoBadge
                          status={b.status}
                          isActive={b.profiles?.is_active ?? true}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/portal/planner/orden-servicio/${b.id}`}
                            title="Ver orden"
                            className="p-2 text-negro/30 hover:text-dorado hover:bg-dorado/5 rounded-lg transition-colors"
                          >
                            <ClipboardList size={15} />
                          </Link>
                          <Link
                            href={`/portal/planner/clientes/${b.client_id}/actividades`}
                            title="Agenda"
                            className="p-2 text-negro/30 hover:text-dorado hover:bg-dorado/5 rounded-lg transition-colors"
                          >
                            <CalendarDays size={15} />
                          </Link>
                          <Link
                            href={`/portal/planner/clientes/${b.client_id}/editar`}
                            title="Editar cliente"
                            className="p-2 text-negro/30 hover:text-negro hover:bg-negro/5 rounded-lg transition-colors"
                          >
                            <Pencil size={15} />
                          </Link>
                          {!isCancelled && (
                            <CancelEventButton
                              clientId={b.client_id}
                              bookingId={b.id}
                              clientName={name}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
