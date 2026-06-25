"use client";

import { useState, useTransition } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { deleteClient } from "@/app/actions/eliminar-cliente";

interface Props {
  clientId: string;
  bookingId: string;
  clientName: string;
}

export function DeleteClientButton({ clientId, bookingId, clientName }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpen() {
    setError(null);
    setShowModal(true);
  }

  function handleCancel() {
    if (isPending) return;
    setShowModal(false);
    setError(null);
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteClient(clientId, bookingId);
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
        title={`Eliminar ${clientName}`}
        className="p-2 text-negro/25 hover:text-rojo hover:bg-rojo/5 rounded-lg transition-colors shrink-0"
      >
        <Trash2 size={15} />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-negro/50 flex items-center justify-center p-4">
          <div className="bg-blanco rounded-2xl shadow-xl w-full max-w-md p-6">
            {/* Cabecera del modal */}
            <div className="flex items-start gap-3 mb-5">
              <div className="shrink-0 w-9 h-9 rounded-full bg-rojo/10 flex items-center justify-center">
                <AlertTriangle size={18} className="text-rojo" />
              </div>
              <div>
                <h3 className="font-serif text-[1.15rem] text-negro leading-tight">
                  Eliminar cliente
                </h3>
                <p className="text-[0.82rem] text-gris mt-1 leading-relaxed">
                  ¿Confirmas eliminar a{" "}
                  <strong className="text-negro font-semibold">{clientName}</strong>?
                </p>
              </div>
            </div>

            {/* Detalles de lo que se borra */}
            <div className="bg-rojo/5 border border-rojo/15 rounded-xl px-4 py-3 mb-5">
              <p className="text-[0.75rem] text-rojo/80 font-medium mb-1.5">
                Se eliminará permanentemente:
              </p>
              <ul className="text-[0.75rem] text-gris space-y-0.5 list-disc list-inside">
                <li>Orden de servicio y todas sus secciones</li>
                <li>Documentos y archivos en Storage</li>
                <li>Pagos registrados</li>
                <li>Reserva y acceso al portal</li>
                <li>Cuenta de usuario (no puede recuperarse)</li>
              </ul>
            </div>

            {/* Error si falla */}
            {error && (
              <p className="text-[0.78rem] text-rojo bg-rojo/5 border border-rojo/20 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}

            {/* Acciones */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="px-4 py-2 text-[0.82rem] text-gris border border-negro/15 rounded-lg hover:bg-negro/5 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rojo text-blanco text-[0.82rem] font-medium rounded-lg hover:bg-rojo/90 transition-colors disabled:opacity-50"
              >
                {isPending && <Loader2 size={13} className="animate-spin" />}
                {isPending ? "Eliminando…" : "Sí, eliminar cliente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
