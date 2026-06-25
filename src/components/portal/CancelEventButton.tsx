"use client";

import { useState, useTransition } from "react";
import { XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { cancelarEvento } from "@/app/actions/cancelar-evento";

interface Props {
  clientId: string;
  bookingId: string;
  clientName: string;
}

export function CancelEventButton({ clientId, bookingId, clientName }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [motivoError, setMotivoError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpen() {
    setMotivo("");
    setMotivoError(null);
    setError(null);
    setShowModal(true);
  }

  function handleCancel() {
    if (isPending) return;
    setShowModal(false);
  }

  function handleConfirm() {
    if (!motivo.trim()) {
      setMotivoError("El motivo es obligatorio");
      return;
    }
    startTransition(async () => {
      const res = await cancelarEvento(clientId, bookingId, motivo.trim());
      if (res.error) {
        setError(res.error);
      } else {
        setShowModal(false);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        title={`Cancelar evento de ${clientName}`}
        className="p-2 text-negro/25 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors shrink-0"
      >
        <XCircle size={15} />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-negro/50 flex items-center justify-center p-4">
          <div className="bg-blanco rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="shrink-0 w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle size={18} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-serif text-[1.1rem] text-negro leading-tight">
                  Cancelar evento
                </h3>
                <p className="text-[0.82rem] text-gris mt-1 leading-relaxed">
                  ¿Cancelar el evento de{" "}
                  <strong className="text-negro">{clientName}</strong>?
                </p>
                <p className="text-[0.78rem] text-gris/80 mt-1.5 leading-relaxed">
                  El cliente y sus datos permanecen en el sistema. El evento
                  quedará marcado como cancelado y el acceso al portal será
                  desactivado.
                </p>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-[0.7rem] text-gris uppercase tracking-wider mb-1.5">
                Motivo de cancelación <span className="text-rojo">*</span>
              </label>
              <textarea
                value={motivo}
                onChange={(e) => {
                  setMotivo(e.target.value);
                  setMotivoError(null);
                }}
                rows={3}
                placeholder="Ej: Solicitud del cliente, cambio de planes, fuerza mayor…"
                className={`w-full border ${
                  motivoError ? "border-rojo" : "border-negro/10"
                } bg-crema/20 px-3 py-2.5 text-[0.83rem] rounded-lg focus:outline-none focus:border-dorado/70 resize-none transition-colors placeholder:text-gris/35`}
              />
              {motivoError && (
                <p className="text-[0.75rem] text-rojo mt-1">{motivoError}</p>
              )}
            </div>

            {error && (
              <p className="text-[0.78rem] text-rojo bg-rojo/5 border border-rojo/20 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="px-4 py-2 text-[0.82rem] text-gris border border-negro/15 rounded-lg hover:bg-negro/5 transition-colors disabled:opacity-50"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-blanco text-[0.82rem] font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {isPending && <Loader2 size={13} className="animate-spin" />}
                {isPending ? "Cancelando…" : "Cancelar evento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
