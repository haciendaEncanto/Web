"use client";

import { useState } from "react";
import { CalendarDays, Music2 } from "lucide-react";
import { PlaylistReadOnly } from "@/components/portal/PlaylistReadOnly";
import type { PlaylistSection } from "@/lib/playlist-templates";

const EVENT_LABEL: Record<string, string> = {
  boda: "Boda",
  quince: "Quinceañera",
  empresarial: "Empresarial",
  revelacion: "Revelación de Género",
};

export type EventoActivo = {
  bookingId: string;
  clientName: string;
  eventType: string;
  eventDate: string;
  playlist: { section: PlaylistSection; song_url: string | null; no_aplica: boolean }[];
};

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("es-CO", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function StaffEventsView({ eventos }: { eventos: EventoActivo[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(eventos[0]?.bookingId ?? null);
  const selected = eventos.find((e) => e.bookingId === selectedId);

  if (eventos.length === 0) {
    return (
      <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-10 text-center">
        <CalendarDays size={36} className="text-dorado/40 mx-auto mb-4" />
        <p className="font-serif text-[1.2rem] text-negro mb-2">Sin eventos activos</p>
        <p className="text-gris text-[0.85rem]">No hay eventos con reserva confirmada o pendiente por ahora.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-5">
      <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden divide-y divide-negro/[0.04] h-fit">
        {eventos.map((e) => (
          <button
            key={e.bookingId}
            type="button"
            onClick={() => setSelectedId(e.bookingId)}
            className={`w-full text-left px-4 py-3.5 transition-colors ${
              selectedId === e.bookingId ? "bg-dorado/10" : "hover:bg-crema/30"
            }`}
          >
            <p className={`text-[0.85rem] font-medium ${selectedId === e.bookingId ? "text-dorado" : "text-negro"}`}>
              {e.clientName}
            </p>
            <p className="text-[0.74rem] text-gris mt-0.5">
              {EVENT_LABEL[e.eventType] ?? e.eventType} · {formatDate(e.eventDate)}
            </p>
          </button>
        ))}
      </div>

      <div>
        {selected ? (
          <>
            <div className="flex items-center gap-2 mb-3">
              <Music2 size={18} className="text-dorado" />
              <h3 className="font-serif text-[1.2rem] text-negro">
                {selected.clientName}
                <span className="text-gris text-[0.85rem] font-sans ml-2">
                  {EVENT_LABEL[selected.eventType] ?? selected.eventType} · {formatDate(selected.eventDate)}
                </span>
              </h3>
            </div>
            <PlaylistReadOnly eventType={selected.eventType} items={selected.playlist} />
          </>
        ) : (
          <p className="text-gris text-[0.85rem]">Selecciona un evento de la lista.</p>
        )}
      </div>
    </div>
  );
}
