"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, ClipboardList, Users, CalendarDays, Eye } from "lucide-react";
import { CancelEventButton } from "@/components/portal/CancelEventButton";
import { getClientSegment, type ClientBookingRow, type ClientSegment } from "@/lib/clientes";

const EVENT_LABEL: Record<string, string> = {
  boda: "Boda",
  quince: "Quinceañera",
  empresarial: "Empresarial",
  revelacion: "Revelación de Género",
};

const TABS: { value: ClientSegment; label: string }[] = [
  { value: "activos", label: "Activos" },
  { value: "cumplidos", label: "Cumplidos" },
  { value: "cancelados", label: "Cancelados" },
];

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

const SEGMENT_BADGE: Record<ClientSegment, string> = {
  activos: "text-green-700 bg-green-50 border-green-200",
  cumplidos: "text-blue-700 bg-blue-50 border-blue-200",
  cancelados: "text-gris bg-negro/5 border-negro/15",
};
const SEGMENT_LABEL: Record<ClientSegment, string> = {
  activos: "Activo",
  cumplidos: "Cumplido",
  cancelados: "Cancelado",
};

function EstadoBadge({ segment }: { segment: ClientSegment }) {
  return (
    <span className={`inline-flex items-center text-[0.67rem] font-medium px-2 py-0.5 rounded-full border ${SEGMENT_BADGE[segment]}`}>
      {SEGMENT_LABEL[segment]}
    </span>
  );
}

export function ClientesTable({
  rows,
  readOnly = false,
  basePath = "planner",
}: {
  rows: ClientBookingRow[];
  readOnly?: boolean;
  basePath?: "planner" | "admin";
}) {
  const [tab, setTab] = useState<ClientSegment>("activos");

  const withSegment = rows.map((b) => ({
    ...b,
    segment: getClientSegment(b.status, b.profiles?.is_active ?? true),
  }));
  const counts: Record<ClientSegment, number> = {
    activos: withSegment.filter((b) => b.segment === "activos").length,
    cumplidos: withSegment.filter((b) => b.segment === "cumplidos").length,
    cancelados: withSegment.filter((b) => b.segment === "cancelados").length,
  };
  const filtered = withSegment.filter((b) => b.segment === tab);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 text-[0.8rem] font-medium rounded-lg border transition-colors ${
              tab === t.value
                ? "bg-dorado text-blanco border-dorado"
                : "bg-blanco text-negro/60 border-negro/10 hover:bg-crema/40"
            }`}
          >
            {t.label} <span className="opacity-70">({counts[t.value]})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-10 text-center">
          <Users size={36} className="text-dorado/40 mx-auto mb-4" />
          <p className="font-serif text-[1.2rem] text-negro mb-2">Sin clientes</p>
          <p className="text-gris text-[0.85rem]">
            No hay clientes en la sección &quot;{TABS.find((t) => t.value === tab)?.label}&quot;.
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
                  {!readOnly && (
                    <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest whitespace-nowrap text-right">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-negro/[0.04]">
                {filtered.map((b) => {
                  const name = b.profiles?.full_name ?? b.profiles?.email ?? "Cliente";
                  return (
                    <tr key={b.id} className={`hover:bg-crema/20 transition-colors ${b.segment === "cancelados" ? "opacity-60" : ""}`}>
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-[0.85rem] font-medium text-negro leading-tight">{name}</p>
                          <p className="text-[0.74rem] text-gris mt-0.5">{b.profiles?.email}</p>
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
                        <OrdenBadge sections={b.service_order_sections} approved={b.service_order_approved} />
                      </td>
                      <td className="px-4 py-4">
                        <EstadoBadge segment={b.segment} />
                      </td>
                      {!readOnly && (
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            {basePath === "admin" ? (
                              <Link
                                href={`/admin/clientes/${b.client_id}`}
                                title="Ver cliente"
                                className="p-2 text-negro/30 hover:text-dorado hover:bg-dorado/5 rounded-lg transition-colors"
                              >
                                <Eye size={15} />
                              </Link>
                            ) : (
                              <>
                                <Link
                                  href={`/portal/planner/orden-servicio/${b.id}`}
                                  title="Ver orden"
                                  className="p-2 text-negro/30 hover:text-dorado hover:bg-dorado/5 rounded-lg transition-colors"
                                >
                                  <ClipboardList size={15} />
                                </Link>
                                <Link
                                  href={`/portal/planner/clientes/${b.client_id}/editar`}
                                  title="Editar cliente"
                                  className="p-2 text-negro/30 hover:text-negro hover:bg-negro/5 rounded-lg transition-colors"
                                >
                                  <Pencil size={15} />
                                </Link>
                              </>
                            )}
                            <Link
                              href={`/portal/planner/clientes/${b.client_id}/actividades`}
                              title="Agenda"
                              className="p-2 text-negro/30 hover:text-dorado hover:bg-dorado/5 rounded-lg transition-colors"
                            >
                              <CalendarDays size={15} />
                            </Link>
                            {b.segment !== "cancelados" && (
                              <CancelEventButton clientId={b.client_id} bookingId={b.id} clientName={name} />
                            )}
                          </div>
                        </td>
                      )}
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
