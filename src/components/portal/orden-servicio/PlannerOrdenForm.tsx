"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import {
  savePlannerItems,
  initServiceOrder,
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

type Booking = {
  id: string;
  event_type: string | null;
  event_date: string | null;
  guest_count: number | null;
  status: string | null;
  notes: string | null;
  client_name: string | null;
};

// ─── Campo de formulario ──────────────────────────────────────────────

const inputCls =
  "w-full border border-negro/10 bg-crema/20 px-3 py-2.5 text-[0.83rem] text-negro placeholder:text-gris/35 focus:outline-none focus:border-dorado/70 transition-colors rounded-lg";

function FormField({
  item,
  value,
  onChange,
}: {
  item: Item;
  value: string;
  onChange: (v: string) => void;
}) {
  const opts = Array.isArray(item.options) ? (item.options as string[]) : [];

  switch (item.item_type) {
    case "select":
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        >
          <option value="">Seleccionar…</option>
          {opts.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );

    case "textarea":
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={`${inputCls} resize-none`}
          placeholder="Escribir aquí…"
        />
      );

    case "boolean":
      return (
        <button
          type="button"
          role="switch"
          aria-checked={value === "true"}
          onClick={() => onChange(value === "true" ? "false" : "true")}
          className={[
            "relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-dorado",
            value === "true" ? "bg-dorado" : "bg-negro/20",
          ].join(" ")}
        >
          <span
            className={[
              "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-blanco shadow-sm transition-transform duration-200",
              value === "true" ? "translate-x-5" : "translate-x-0",
            ].join(" ")}
          />
        </button>
      );

    case "date":
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      );

    case "time":
      return (
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      );

    case "number":
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={0}
          className={inputCls}
        />
      );

    case "url":
      return (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          className={inputCls}
        />
      );

    default:
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      );
  }
}

// ─── Sección editable ─────────────────────────────────────────────────

function EditableSection({
  section,
  values,
  onChange,
}: {
  section: Section;
  values: Record<string, string>;
  onChange: (id: string, v: string) => void;
}) {
  const items = [...section.service_order_items].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return (
    <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
      <div className="px-6 py-4 border-b border-negro/[0.05] bg-crema/30">
        <h3 className="font-serif text-[1.05rem] text-negro tracking-[-0.01em]">
          {section.name}
        </h3>
      </div>
      <div className="px-6 py-5 space-y-4">
        {items.map((item) => (
          <div key={item.id}>
            <label className="block text-[0.7rem] text-gris uppercase tracking-wider mb-1.5">
              {item.label}
            </label>
            <FormField
              item={item}
              value={values[item.id] ?? ""}
              onChange={(v) => onChange(item.id, v)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Vista de músca — solo lectura para el planner ────────────────────

function MusicaReadOnly({ section }: { section: Section }) {
  const items = [...section.service_order_items].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const centinela = items.find(
    (i) => i.label === "Llevo acompañamiento musical propio"
  );

  return (
    <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
      <div className="px-6 py-4 border-b border-negro/[0.05] bg-crema/30 flex items-center justify-between">
        <h3 className="font-serif text-[1.05rem] text-negro tracking-[-0.01em]">
          {section.name}
        </h3>
        <span className="text-[0.65rem] tracking-[0.18em] text-gris uppercase font-medium bg-negro/5 px-2.5 py-1 rounded-full">
          Lo llena el cliente
        </span>
      </div>
      <div className="px-6 py-1">
        {centinela?.value === "true" ? (
          <p className="py-4 text-[0.83rem] text-gris">
            El cliente indicó que lleva acompañamiento musical propio.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 py-3 border-b border-negro/[0.04] last:border-0"
            >
              <span className="text-[0.8rem] text-gris shrink-0">
                {item.label}
              </span>
              <span
                className={[
                  "text-[0.82rem] text-right max-w-[55%] break-all",
                  item.value ? "text-negro font-medium" : "text-negro/25",
                ].join(" ")}
              >
                {item.value || "—"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Botón inicializar orden ───────────────────────────────────────────

function InitButton({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleInit() {
    startTransition(async () => {
      const res = await initServiceOrder(bookingId);
      if (res.error) setError(res.error);
    });
  }

  return (
    <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-10 text-center">
      <RefreshCw size={32} className="text-dorado/50 mx-auto mb-4" />
      <p className="font-serif text-[1.2rem] text-negro mb-2">
        La orden aún no está inicializada
      </p>
      <p className="text-gris text-[0.85rem] mb-6 max-w-[300px] mx-auto">
        Inicia la orden de servicio para comenzar a registrar los detalles del
        evento.
      </p>
      <button
        onClick={handleInit}
        disabled={isPending}
        className="inline-flex items-center gap-2 px-6 py-3 bg-dorado text-blanco text-[0.83rem] font-medium rounded-xl hover:bg-dorado/90 transition-colors disabled:opacity-50"
      >
        {isPending && <Loader2 size={14} className="animate-spin" />}
        {isPending ? "Inicializando…" : "Inicializar orden de servicio"}
      </button>
      {error && (
        <p className="mt-3 text-[0.78rem] text-red-500">{error}</p>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────

export function PlannerOrdenForm({
  booking,
  sections,
}: {
  booking: Booking;
  sections: Section[];
}) {
  const plannerSections = sections.filter((s) =>
    s.service_order_items.some((i) => i.filled_by === "planner")
  );
  const musicaSection = sections.find((s) => s.name === "Música y playlist");

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      sections
        .flatMap((s) => s.service_order_items)
        .filter((i) => i.filled_by === "planner")
        .map((i) => [i.id, i.value ?? ""])
    )
  );
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<OrdenState>(null);

  // ── Modal Reiniciar orden ────────────────────────────────
  const [showReinitModal, setShowReinitModal] = useState(false);
  const [reinitMotivo, setReinitMotivo] = useState("");
  const [reinitMotivoError, setReinitMotivoError] = useState<string | null>(null);
  const [reinitIsPending, reinitStartTransition] = useTransition();

  function openReinitModal() {
    setReinitMotivo("");
    setReinitMotivoError(null);
    setShowReinitModal(true);
  }

  function handleReinit() {
    if (!reinitMotivo.trim()) {
      setReinitMotivoError("El motivo es obligatorio");
      return;
    }
    reinitStartTransition(async () => {
      const res = await initServiceOrder(booking.id, reinitMotivo.trim());
      if (res.error) {
        setReinitMotivoError(res.error);
      } else {
        setShowReinitModal(false);
        window.location.reload();
      }
    });
  }

  if (sections.length === 0) {
    return <InitButton bookingId={booking.id} />;
  }

  function handleChange(id: string, val: string) {
    setValues((v) => ({ ...v, [id]: val }));
    setResult(null);
  }

  function handleSave() {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("bookingId", booking.id);
      for (const [id, val] of Object.entries(values)) {
        fd.append(id, val);
      }
      const res = await savePlannerItems(null, fd);
      setResult(res);
    });
  }

  const eventTypeLabel: Record<string, string> = {
    boda: "Boda",
    quince: "Quinceañera",
    empresarial: "Empresarial",
    revelacion: "Revelación de Género",
  };

  return (
    <div className="space-y-4">
      {/* Resumen del booking */}
      <div className="bg-blanco rounded-2xl border border-negro/[0.07] px-6 py-5">
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <div>
            <span className="text-[0.7rem] text-gris uppercase tracking-wider">
              Cliente
            </span>
            <p className="text-[0.88rem] font-medium text-negro mt-0.5">
              {booking.client_name ?? "—"}
            </p>
          </div>
          <div>
            <span className="text-[0.7rem] text-gris uppercase tracking-wider">
              Tipo
            </span>
            <p className="text-[0.88rem] font-medium text-negro mt-0.5">
              {eventTypeLabel[booking.event_type ?? ""] ?? booking.event_type ?? "—"}
            </p>
          </div>
          {booking.event_date && (
            <div>
              <span className="text-[0.7rem] text-gris uppercase tracking-wider">
                Fecha
              </span>
              <p className="text-[0.88rem] font-medium text-negro mt-0.5">
                {new Date(booking.event_date + "T00:00:00").toLocaleDateString(
                  "es-CO",
                  { day: "numeric", month: "long", year: "numeric" }
                )}
              </p>
            </div>
          )}
          {booking.guest_count != null && (
            <div>
              <span className="text-[0.7rem] text-gris uppercase tracking-wider">
                Invitados
              </span>
              <p className="text-[0.88rem] font-medium text-negro mt-0.5">
                {booking.guest_count}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Secciones editables */}
      {plannerSections.map((s) => (
        <EditableSection
          key={s.id}
          section={s}
          values={values}
          onChange={handleChange}
        />
      ))}

      {/* Vista de música del cliente (solo bodas) */}
      {booking.event_type === "boda" && musicaSection && (
        <MusicaReadOnly section={musicaSection} />
      )}

      {/* Barra de acciones */}
      <div className="bg-blanco rounded-2xl border border-negro/[0.07] px-6 py-4 flex items-center justify-between gap-4">
        {/* Reiniciar — acción destructiva a la izquierda */}
        <button
          type="button"
          onClick={openReinitModal}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-[0.78rem] text-rojo/65 border border-rojo/20 rounded-lg hover:bg-rojo/5 hover:text-rojo hover:border-rojo/40 transition-colors"
        >
          <RefreshCw size={12} />
          Reiniciar orden
        </button>

        {/* Guardar — a la derecha */}
        <div className="flex items-center gap-3 shrink-0">
          {result?.success && (
            <span className="flex items-center gap-1.5 text-[0.78rem] text-green-600">
              <CheckCircle2 size={14} />
              Guardado
            </span>
          )}
          {result?.error && (
            <span className="text-[0.78rem] text-red-500">{result.error}</span>
          )}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-dorado text-blanco text-[0.82rem] font-medium rounded-lg hover:bg-dorado/90 transition-colors disabled:opacity-50"
          >
            {isPending && <Loader2 size={13} className="animate-spin" />}
            {isPending ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>

      {/* Modal: confirmar reinicio con motivo obligatorio */}
      {showReinitModal && (
        <div className="fixed inset-0 z-50 bg-negro/50 flex items-center justify-center p-4">
          <div className="bg-blanco rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="shrink-0 w-9 h-9 rounded-full bg-rojo/10 flex items-center justify-center">
                <AlertTriangle size={18} className="text-rojo" />
              </div>
              <div>
                <h3 className="font-serif text-[1.1rem] text-negro leading-tight">
                  Reiniciar orden de servicio
                </h3>
                <p className="text-[0.8rem] text-gris mt-1 leading-relaxed">
                  Se eliminarán todos los datos ingresados y se creará una nueva
                  orden en blanco. Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-[0.7rem] text-gris uppercase tracking-wider mb-1.5">
                Motivo <span className="text-rojo">*</span>
              </label>
              <textarea
                value={reinitMotivo}
                onChange={(e) => {
                  setReinitMotivo(e.target.value);
                  setReinitMotivoError(null);
                }}
                rows={3}
                placeholder="Ej: Cambio de fecha, cancelación y reprogramación, ajuste de tipo de evento…"
                className={`w-full border ${
                  reinitMotivoError ? "border-rojo" : "border-negro/10"
                } bg-crema/20 px-3 py-2.5 text-[0.83rem] rounded-lg focus:outline-none focus:border-dorado/70 resize-none transition-colors placeholder:text-gris/35`}
              />
              {reinitMotivoError && (
                <p className="text-[0.75rem] text-rojo mt-1">{reinitMotivoError}</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowReinitModal(false)}
                disabled={reinitIsPending}
                className="px-4 py-2 text-[0.82rem] text-gris border border-negro/15 rounded-lg hover:bg-negro/5 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleReinit}
                disabled={reinitIsPending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rojo text-blanco text-[0.82rem] font-medium rounded-lg hover:bg-rojo-pro transition-colors disabled:opacity-50"
              >
                {reinitIsPending && <Loader2 size={13} className="animate-spin" />}
                {reinitIsPending ? "Reiniciando…" : "Confirmar reinicio"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
