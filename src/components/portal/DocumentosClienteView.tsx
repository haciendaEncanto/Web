"use client";

import { useState, useTransition } from "react";
import { FileText, Download, Loader2, PenLine, CheckCircle2 } from "lucide-react";
import { getDocumentoDownloadUrl, type DocumentoConSize } from "@/app/actions/documentos";
import { aprobarContrato, solicitarAjustesContrato } from "@/app/actions/contrato-aprobacion";

const TYPE_LABEL: Record<string, string> = {
  contrato:         "Contrato",
  contrato_firmado: "Contrato firmado",
};

function formatBytes(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-CO", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function DownloadButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDownload() {
    startTransition(async () => {
      setError(null);
      const res = await getDocumentoDownloadUrl(id);
      if (res.error || !res.url) { setError(res.error ?? "No se pudo generar el enlace"); return; }
      window.open(res.url, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button" onClick={handleDownload} disabled={isPending}
        className="inline-flex items-center gap-1.5 px-3 py-2 bg-dorado text-blanco text-[0.78rem] font-medium rounded-lg hover:bg-dorado/90 transition-colors disabled:opacity-50"
      >
        {isPending ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
        Descargar
      </button>
      {error && <p className="text-[0.7rem] text-rojo">{error}</p>}
    </div>
  );
}

function ContratoAprobacionSection({
  bookingId,
  isLocked,
}: {
  bookingId: string;
  isLocked: boolean;
}) {
  const [showModal, setShowModal] = useState(false);
  const [showAjustes, setShowAjustes] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [approving, startApprove] = useTransition();
  const [sendingAjustes, startAjustes] = useTransition();
  const [approved, setApproved] = useState(isLocked);
  const [ajustesDone, setAjustesDone] = useState(false);
  const [err, setErr] = useState("");

  if (approved) {
    return (
      <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
        <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-[0.85rem] text-negro font-medium">Contrato aprobado</p>
          <p className="text-[0.8rem] text-gris mt-0.5">
            Has aprobado el contrato. El equipo ha sido notificado y la orden de servicio está lista.
          </p>
        </div>
      </div>
    );
  }

  function handleConfirmarAprobacion() {
    setErr("");
    startApprove(async () => {
      const res = await aprobarContrato(bookingId);
      if (res.error) { setErr(res.error); setShowModal(false); return; }
      setApproved(true);
      setShowModal(false);
    });
  }

  function handleEnviarAjustes() {
    if (!mensaje.trim()) return;
    setErr("");
    startAjustes(async () => {
      const res = await solicitarAjustesContrato(bookingId, mensaje);
      if (res.error) { setErr(res.error); return; }
      setAjustesDone(true);
      setMensaje("");
      setShowAjustes(false);
    });
  }

  return (
    <>
      {/* Modal de confirmación */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-negro/60 backdrop-blur-[2px]">
          <div className="bg-blanco rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-serif text-[1.15rem] text-negro mb-2 tracking-[-0.02em]">
              Confirmar aprobación
            </h3>
            <p className="text-[0.82rem] text-gris leading-relaxed mb-5">
              Esta acción no se puede deshacer. Una vez aprobado, el contrato quedará bloqueado y no podrá modificarse.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={approving}
                className="px-4 py-2 text-[0.82rem] text-negro border border-negro/15 rounded-xl hover:bg-negro/5 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarAprobacion}
                disabled={approving}
                className="inline-flex items-center gap-2 px-4 py-2 text-[0.82rem] bg-dorado text-blanco font-medium rounded-xl hover:bg-dorado/90 transition-colors disabled:opacity-50"
              >
                {approving && <Loader2 size={13} className="animate-spin" />}
                {approving ? "Aprobando…" : "Confirmar aprobación"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel de acciones */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-start gap-3">
          <FileText size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-[0.88rem] text-negro font-medium">Contrato pendiente de revisión</p>
            <p className="text-[0.8rem] text-gris/80 mt-0.5">
              Descarga el contrato, léelo detenidamente y luego apruébalo o solicita ajustes.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-dorado text-blanco text-[0.82rem] font-medium rounded-xl hover:bg-dorado/90 transition-colors"
          >
            <CheckCircle2 size={14} />
            Aprobar contrato
          </button>
          <button
            type="button"
            onClick={() => setShowAjustes((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blanco text-negro text-[0.82rem] font-medium border border-negro/15 rounded-xl hover:bg-negro/5 transition-colors"
          >
            <PenLine size={14} />
            Solicitar ajustes
          </button>
        </div>

        {showAjustes && (
          <div className="space-y-2.5 pt-1">
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={3}
              placeholder="Describe los ajustes que necesitas en el contrato…"
              className="w-full border border-amber-300 bg-blanco/70 px-3 py-2.5 text-[0.83rem] text-negro rounded-lg focus:outline-none focus:border-amber-500 transition-colors resize-y"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleEnviarAjustes}
                disabled={!mensaje.trim() || sendingAjustes}
                className="inline-flex items-center gap-2 px-4 py-2 bg-negro text-crema text-[0.82rem] font-medium rounded-xl hover:bg-negro/85 transition-colors disabled:opacity-50"
              >
                {sendingAjustes && <Loader2 size={13} className="animate-spin" />}
                {sendingAjustes ? "Enviando…" : "Enviar solicitud"}
              </button>
              {ajustesDone && (
                <span className="flex items-center gap-1.5 text-[0.78rem] text-green-600">
                  <CheckCircle2 size={13} />
                  Solicitud enviada al equipo
                </span>
              )}
            </div>
          </div>
        )}

        {err && <p className="text-[0.78rem] text-rojo">{err}</p>}
      </div>
    </>
  );
}

interface Props {
  documentos: DocumentoConSize[];
  bookingId?: string;
  isLocked?: boolean;
}

export function DocumentosClienteView({ documentos, bookingId, isLocked = false }: Props) {
  const tieneContrato = documentos.some((d) => d.type === "contrato");
  const mostrarAprobacion = tieneContrato && bookingId;

  if (documentos.length === 0) {
    return (
      <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-12 text-center">
        <FileText size={36} className="text-dorado/40 mx-auto mb-4" />
        <p className="font-serif text-[1.2rem] text-negro mb-2">Sin documentos aún</p>
        <p className="text-gris text-[0.85rem] max-w-[360px] mx-auto">
          El equipo de El Encanto subirá tus documentos aquí. Te notificaremos cuando estén disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {mostrarAprobacion && (
        <ContratoAprobacionSection bookingId={bookingId} isLocked={isLocked} />
      )}

      <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-negro/[0.06] bg-crema/40">
                <th className="px-5 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest">Nombre</th>
                <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest">Tipo</th>
                <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest whitespace-nowrap">Fecha</th>
                <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest">Tamaño</th>
                <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest text-right">&nbsp;</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-negro/[0.04]">
              {documentos.map((d) => (
                <tr key={d.id} className="hover:bg-crema/20 transition-colors">
                  <td className="px-5 py-4 text-[0.85rem] font-medium text-negro">{d.title}</td>
                  <td className="px-4 py-4 text-[0.82rem] text-gris">{TYPE_LABEL[d.type] ?? d.type}</td>
                  <td className="px-4 py-4 text-[0.82rem] text-gris whitespace-nowrap">{formatDate(d.created_at)}</td>
                  <td className="px-4 py-4 text-[0.82rem] text-gris">{formatBytes(d.size)}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end">
                      <DownloadButton id={d.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
