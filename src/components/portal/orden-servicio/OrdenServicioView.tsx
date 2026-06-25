"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Clock3, Music2 } from "lucide-react";
import {
  saveMusicItems,
  approveServiceOrder,
  type OrdenState,
} from "@/app/actions/orden-servicio";
import type { Json } from "@/types/database";

// ─── Tipos ────────────────────────────────────────────────────────────

type Item = {
  id: string;
  label: string;
  value: string | null;
  item_type: string;
  options: Json;
  sort_order: number;
  filled_by: string;
};

type Section = {
  id: string;
  name: string;
  sort_order: number;
  service_order_items: Item[];
};

// ─── Helpers ──────────────────────────────────────────────────────────

function sortedItems(items: Item[]) {
  return [...items].sort((a, b) => a.sort_order - b.sort_order);
}

function formatDisplayValue(item: Item): string {
  const v = item.value;
  if (!v || v.trim() === "") return "—";
  if (item.item_type === "boolean") return v === "true" ? "Sí" : "No";
  if (item.item_type === "date") {
    const d = new Date(v + "T00:00:00");
    return d.toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  if (item.item_type === "time") {
    const [h, m] = v.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${h12}:${m} ${ampm}`;
  }
  return v;
}

// ─── Sección solo lectura (cabecera / bebidas) ────────────────────────

const COND_PARENT = "Actividades adicionales";
const COND_CHILD  = "Descripción de actividades adicionales";

function ReadOnlySection({ section }: { section: Section }) {
  const items = sortedItems(section.service_order_items);
  const parentItem = items.find((i) => i.label === COND_PARENT);
  const actividades = parentItem?.value;

  return (
    <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
      <div className="px-6 py-4 border-b border-negro/[0.05] bg-crema/30">
        <h3 className="font-serif text-[1.05rem] text-negro tracking-[-0.01em]">
          {section.name}
        </h3>
      </div>
      <div className="px-6 py-1">
        {items.map((item) => {
          // Descripción: solo visible cuando Actividades adicionales = Sí
          if (item.label === COND_CHILD && actividades !== "Sí") return null;
          return (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 py-3 border-b border-negro/[0.04] last:border-0"
            >
              <span className="text-[0.8rem] text-gris">{item.label}</span>
              <span
                className={[
                  "text-[0.82rem] font-medium text-right max-w-[55%] break-words",
                  item.value ? "text-negro" : "text-negro/25",
                ].join(" ")}
              >
                {formatDisplayValue(item)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sección Música — editable por el cliente ────────────────────────

function MusicaSection({
  section,
  bookingId,
}: {
  section: Section;
  bookingId: string;
}) {
  const items = sortedItems(section.service_order_items);
  const centinela = items.find(
    (i) => i.label === "Llevo acompañamiento musical propio"
  );
  const observaciones = items.find(
    (i) => i.label === "Observaciones del cliente"
  );
  const urlItems = items.filter(
    (i) =>
      i.id !== centinela?.id &&
      i.id !== observaciones?.id
  );

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(items.map((i) => [i.id, i.value ?? ""]))
  );
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<OrdenState>(null);

  const ownMusic = values[centinela?.id ?? ""] === "true";

  function set(id: string, val: string) {
    setValues((v) => ({ ...v, [id]: val }));
    setResult(null);
  }

  function handleSave() {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("bookingId", bookingId);
      for (const [id, val] of Object.entries(values)) {
        fd.append(id, val);
      }
      const res = await saveMusicItems(null, fd);
      setResult(res);
    });
  }

  return (
    <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-negro/[0.05] bg-crema/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Music2 size={16} className="text-dorado/70" />
          <h3 className="font-serif text-[1.05rem] text-negro tracking-[-0.01em]">
            {section.name}
          </h3>
        </div>
        <span className="text-[0.65rem] tracking-[0.18em] text-dorado uppercase font-medium bg-dorado/10 px-2.5 py-1 rounded-full">
          Lo llenas tú
        </span>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Toggle centinela */}
        {centinela && (
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <button
              type="button"
              role="switch"
              aria-checked={ownMusic}
              onClick={() =>
                set(centinela.id, ownMusic ? "false" : "true")
              }
              className={[
                "relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-dorado",
                ownMusic ? "bg-dorado" : "bg-negro/20",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-blanco shadow-sm transition-transform duration-200",
                  ownMusic ? "translate-x-5" : "translate-x-0",
                ].join(" ")}
              />
            </button>
            <span className="text-[0.85rem] text-negro">
              {centinela.label}
            </span>
          </label>
        )}

        {/* Mensaje cuando lleva acompañamiento propio */}
        {ownMusic && (
          <div className="bg-dorado/8 border border-dorado/20 rounded-xl px-4 py-3 text-[0.82rem] text-negro/65 leading-relaxed">
            Has indicado que llevarás acompañamiento musical propio. Si
            cambias de opinión puedes actualizar esta opción.
          </div>
        )}

        {/* Campos de URL — ocultos cuando lleva acompañamiento propio */}
        {!ownMusic && (
          <div className="space-y-4">
            {urlItems.map((item) => (
              <div key={item.id}>
                <label className="block text-[0.7rem] text-gris uppercase tracking-wider mb-1.5">
                  {item.label}{" "}
                  <span className="normal-case text-gris/40">(opcional)</span>
                </label>
                <input
                  type="url"
                  value={values[item.id] ?? ""}
                  onChange={(e) => set(item.id, e.target.value)}
                  placeholder="https://open.spotify.com/…  ·  youtube.com/watch?v=…"
                  className="w-full border border-negro/10 bg-crema/20 px-3 py-2.5 text-[0.82rem] text-negro placeholder:text-gris/35 focus:outline-none focus:border-dorado/60 transition-colors rounded-lg"
                />
              </div>
            ))}

            {/* Observaciones */}
            {observaciones && (
              <div>
                <label className="block text-[0.7rem] text-gris uppercase tracking-wider mb-1.5">
                  {observaciones.label}
                </label>
                <textarea
                  value={values[observaciones.id] ?? ""}
                  onChange={(e) => set(observaciones.id, e.target.value)}
                  placeholder="Indicaciones adicionales para el equipo de sonido…"
                  rows={3}
                  className="w-full border border-negro/10 bg-crema/20 px-3 py-2.5 text-[0.82rem] text-negro placeholder:text-gris/35 focus:outline-none focus:border-dorado/60 transition-colors rounded-lg resize-none"
                />
              </div>
            )}
          </div>
        )}

        {/* Botón guardar */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-5 py-2.5 bg-dorado text-blanco text-[0.82rem] font-medium rounded-lg hover:bg-dorado/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Guardando…" : "Guardar cambios"}
          </button>
          {result?.success && (
            <span className="flex items-center gap-1.5 text-[0.78rem] text-green-600">
              <CheckCircle2 size={14} />
              Guardado
            </span>
          )}
          {result?.error && (
            <span className="text-[0.78rem] text-red-500">{result.error}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Barra de progreso ────────────────────────────────────────────────

function ProgressBar({
  total,
  filled,
}: {
  total: number;
  filled: number;
}) {
  const pct = total === 0 ? 0 : Math.round((filled / total) * 100);
  const complete = pct === 100;

  return (
    <div className="bg-blanco rounded-xl border border-negro/[0.07] px-5 py-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[0.75rem] text-gris">
          Información completada por el equipo
        </span>
        <span
          className={[
            "text-[0.75rem] font-semibold tabular-nums",
            complete ? "text-green-600" : "text-negro",
          ].join(" ")}
        >
          {pct}%
        </span>
      </div>
      <div className="h-1.5 bg-negro/[0.06] rounded-full overflow-hidden">
        <div
          className={[
            "h-full rounded-full transition-all duration-700",
            complete ? "bg-green-500" : "bg-dorado",
          ].join(" ")}
          style={{ width: `${pct}%` }}
        />
      </div>
      {complete && (
        <p className="flex items-center gap-1.5 text-[0.72rem] text-green-600 mt-1.5">
          <CheckCircle2 size={12} />
          Información completa — puedes aprobar la orden
        </p>
      )}
    </div>
  );
}

// ─── Vista principal ──────────────────────────────────────────────────

export function OrdenServicioView({
  bookingId,
  eventType,
  isApproved,
  sections,
}: {
  bookingId: string;
  eventType: string;
  isApproved: boolean;
  sections: Section[];
}) {
  const [approving, startApprove] = useTransition();
  const [approveError, setApproveError] = useState<string | null>(null);
  const [approved, setApproved] = useState(isApproved);

  if (sections.length === 0) {
    return (
      <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-12 text-center">
        <Clock3 size={36} className="text-dorado/40 mx-auto mb-4" />
        <p className="font-serif text-[1.3rem] text-negro mb-2">
          Preparando tu orden de servicio
        </p>
        <p className="text-gris text-[0.85rem] max-w-[320px] mx-auto">
          El equipo de Hacienda El Encanto está preparando los detalles de tu
          orden. Pronto la encontrarás aquí.
        </p>
      </div>
    );
  }

  const allItems = sections.flatMap((s) => s.service_order_items);
  const plannerItems = allItems.filter((i) => i.filled_by === "planner");
  const filledPlanner = plannerItems.filter(
    (i) => i.value && i.value.trim() !== ""
  );
  const plannerComplete = filledPlanner.length === plannerItems.length;

  const cabeceraSection = sections.find((s) => s.name === "Cabecera");
  const bebidasSection = sections.find((s) => s.name === "Bebidas");
  const musicaSection = sections.find((s) => s.name === "Música y playlist");

  function handleApprove() {
    startApprove(async () => {
      const res = await approveServiceOrder(bookingId);
      if (res.error) {
        setApproveError(res.error);
      } else {
        setApproved(true);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Barra de progreso */}
      <ProgressBar
        total={plannerItems.length}
        filled={filledPlanner.length}
      />

      {/* Cabecera */}
      {cabeceraSection && <ReadOnlySection section={cabeceraSection} />}

      {/* Bebidas */}
      {bebidasSection && <ReadOnlySection section={bebidasSection} />}

      {/* Música — solo bodas */}
      {eventType === "boda" && musicaSection && (
        <MusicaSection section={musicaSection} bookingId={bookingId} />
      )}

      {/* Aprobación */}
      {approved ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-3">
          <CheckCircle2 size={20} className="text-green-600 shrink-0" />
          <div>
            <p className="text-[0.88rem] font-semibold text-green-700">
              Orden de servicio aprobada
            </p>
            <p className="text-[0.78rem] text-green-600/80 mt-0.5">
              Gracias por confirmar. Nos vemos el día de tu evento.
            </p>
          </div>
        </div>
      ) : (
        plannerComplete && (
          <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-[0.9rem] font-semibold text-negro mb-0.5">
                ¿Todo se ve correcto?
              </p>
              <p className="text-[0.78rem] text-gris">
                Al aprobar confirmas que los detalles de tu orden son correctos.
              </p>
            </div>
            <button
              onClick={handleApprove}
              disabled={approving}
              className="shrink-0 px-6 py-3 bg-[#2D6A4F] text-blanco text-[0.82rem] font-medium rounded-xl hover:bg-[#1B4332] transition-colors disabled:opacity-50"
            >
              {approving ? "Procesando…" : "Aprobar orden de servicio"}
            </button>
            {approveError && (
              <p className="text-[0.78rem] text-red-500 w-full sm:w-auto">
                {approveError}
              </p>
            )}
          </div>
        )
      )}
    </div>
  );
}
