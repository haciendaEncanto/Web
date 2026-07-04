"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import type { BookingEventRow } from "@/lib/eventos";

const EVENT_LABEL: Record<string, string> = {
  boda: "Boda",
  quince: "Quinceañera",
  empresarial: "Empresarial",
  revelacion: "Revelación de Género",
};

type EstadoFiltro = "todos" | "en_proceso" | "realizados" | "cancelados";

const TABS: { value: EstadoFiltro; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "en_proceso", label: "En proceso" },
  { value: "realizados", label: "Realizados" },
  { value: "cancelados", label: "Cancelados" },
];

function matchesTab(status: string | null, tab: EstadoFiltro): boolean {
  if (tab === "todos") return true;
  if (tab === "en_proceso") return status === "pending" || status === "confirmed";
  if (tab === "realizados") return status === "completed";
  return status === "cancelled";
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("es-CO", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatTime(t: string | null) {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "pm" : "am"}`;
}

function EstadoBadge({ status }: { status: string | null }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center text-[0.67rem] font-medium px-2 py-0.5 rounded-full border text-dorado bg-dorado/10 border-dorado/20">
        Realizado
      </span>
    );
  }
  if (status === "cancelled") {
    return (
      <span className="inline-flex items-center text-[0.67rem] font-medium px-2 py-0.5 rounded-full border text-rojo bg-rojo/10 border-rojo/20">
        Cancelado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-[0.67rem] font-medium px-2 py-0.5 rounded-full border text-blue-700 bg-blue-50 border-blue-200">
      En proceso
    </span>
  );
}

export function EventosManager({ rows }: { rows: BookingEventRow[] }) {
  const [tab, setTab] = useState<EstadoFiltro>("todos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const filtered = rows.filter((r) => {
    if (!matchesTab(r.status, tab)) return false;
    if (fechaInicio && (!r.event_date || r.event_date < fechaInicio)) return false;
    if (fechaFin && (!r.event_date || r.event_date > fechaFin)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Tabs de estado — línea dorada en el tab activo */}
      <div className="flex flex-wrap gap-1 border-b border-negro/[0.08]">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2.5 text-[0.82rem] font-medium transition-colors border-b-2 -mb-px ${
              tab === t.value
                ? "text-negro border-dorado"
                : "text-gris border-transparent hover:text-negro"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Rango de fechas */}
      <div className="flex flex-wrap items-end gap-4 bg-blanco rounded-2xl border border-negro/[0.07] p-4">
        <div>
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Desde</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="border border-negro/10 bg-crema/20 px-3 py-2 text-[0.82rem] text-negro rounded-lg focus:outline-none focus:border-dorado/70 transition-colors"
          />
        </div>
        <div>
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Hasta</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="border border-negro/10 bg-crema/20 px-3 py-2 text-[0.82rem] text-negro rounded-lg focus:outline-none focus:border-dorado/70 transition-colors"
          />
        </div>
        {(fechaInicio || fechaFin) && (
          <button
            onClick={() => { setFechaInicio(""); setFechaFin(""); }}
            className="text-[0.78rem] text-gris hover:text-negro underline transition-colors mb-2"
          >
            Limpiar rango
          </button>
        )}
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-10 text-center">
          <CalendarDays size={36} className="text-dorado/40 mx-auto mb-4" />
          <p className="font-serif text-[1.2rem] text-negro mb-2">Sin eventos</p>
          <p className="text-gris text-[0.85rem]">No hay eventos que coincidan con los filtros.</p>
        </div>
      ) : (
        <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-negro/[0.06] bg-crema/40">
                  <th className="px-5 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest whitespace-nowrap">Cliente</th>
                  <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest whitespace-nowrap">Evento</th>
                  <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest whitespace-nowrap">Fecha</th>
                  <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest whitespace-nowrap">Horario</th>
                  <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest whitespace-nowrap text-center">Invitados</th>
                  <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest whitespace-nowrap">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-negro/[0.04]">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-crema/20 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-[0.85rem] font-medium text-negro leading-tight">
                        {b.profiles?.full_name ?? b.profiles?.email ?? "Cliente"}
                      </p>
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
                      <EstadoBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
