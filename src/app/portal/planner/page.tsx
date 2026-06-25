import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, Calendar, Users, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const EVENT_TYPE_LABEL: Record<string, string> = {
  boda: "Boda",
  quince: "Quinceañera",
  empresarial: "Empresarial",
  revelacion: "Revelación de Género",
};

const STATUS_STYLE: Record<string, string> = {
  confirmed: "text-green-700 bg-green-50 border-green-200",
  pending: "text-amber-700 bg-amber-50 border-amber-200",
  cancelled: "text-red-600 bg-red-50 border-red-200",
};

const STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmado",
  pending: "Pendiente",
  cancelled: "Cancelado",
};

export default async function PlannerPanel() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      `id, event_type, event_date, event_start_time, guest_count, status,
       service_order_approved,
       profiles (full_name, email)`
    )
    .in("status", ["pending", "confirmed"])
    .order("event_date", { ascending: true });

  type Row = {
    id: string;
    event_type: string | null;
    event_date: string | null;
    event_start_time: string | null;
    guest_count: number | null;
    status: string | null;
    service_order_approved: boolean | null;
    profiles: { full_name: string | null; email: string } | null;
  };

  const rows = (bookings ?? []) as Row[];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-[1.9rem] md:text-[2.3rem] text-negro leading-tight tracking-[-0.03em]">
              Panel <span className="text-dorado">Wedding Planner</span>
            </h2>
            <p className="text-gris text-[0.88rem] mt-1">
              Órdenes de servicio — eventos confirmados y pendientes
            </p>
          </div>
          <Link
            href="/portal/planner/nuevo-cliente"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-dorado text-blanco text-[0.8rem] font-medium rounded-xl hover:bg-dorado/90 transition-colors shrink-0 mt-1"
          >
            <UserPlus size={14} />
            Nuevo cliente
          </Link>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-10 text-center">
          <Calendar size={36} className="text-dorado/40 mx-auto mb-4" />
          <p className="font-serif text-[1.2rem] text-negro mb-2">
            Sin eventos por ahora
          </p>
          <p className="text-gris text-[0.85rem]">
            Los eventos confirmados aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((b) => {
            const stStyle =
              STATUS_STYLE[b.status ?? ""] ?? "text-gris bg-negro/5 border-negro/10";
            const stLabel = STATUS_LABEL[b.status ?? ""] ?? b.status ?? "—";
            const date = b.event_date
              ? new Date(b.event_date + "T00:00:00").toLocaleDateString(
                  "es-CO",
                  { day: "numeric", month: "long", year: "numeric" }
                )
              : "—";

            return (
              <div
                key={b.id}
                className="bg-blanco rounded-2xl border border-negro/[0.07] px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-medium text-[0.92rem] text-negro">
                      {b.profiles?.full_name ?? b.profiles?.email ?? "Cliente"}
                    </span>
                    <span
                      className={`text-[0.68rem] font-medium px-2 py-0.5 rounded-full border ${stStyle}`}
                    >
                      {stLabel}
                    </span>
                    {b.service_order_approved && (
                      <span className="text-[0.68rem] font-medium px-2 py-0.5 rounded-full border text-green-700 bg-green-50 border-green-200">
                        Orden aprobada ✓
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[0.78rem] text-gris">
                    <span>
                      {EVENT_TYPE_LABEL[b.event_type ?? ""] ??
                        b.event_type ??
                        "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {date}
                    </span>
                    {b.guest_count != null && (
                      <span className="flex items-center gap-1">
                        <Users size={11} />
                        {b.guest_count} invitados
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href={`/portal/planner/orden-servicio/${b.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-dorado/30 text-dorado text-[0.8rem] font-medium rounded-lg hover:bg-dorado/5 transition-colors shrink-0"
                >
                  <ClipboardList size={14} />
                  Ver orden
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
