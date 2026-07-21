"use client";

import { useRef, useState, useTransition } from "react";
import { FileText, Download, Loader2, PenLine, CheckCircle2, Lock } from "lucide-react";
import { getDocumentoDownloadUrl, type DocumentoConSize } from "@/app/actions/documentos";
import { requestContratoFirmadoUpload, confirmContratoFirmadoUpload } from "@/app/actions/contrato-firmado";
import { uploadFileToSignedUrl } from "@/lib/uploads/client";

const TYPE_LABEL: Record<string, string> = {
  contrato: "Contrato",
  contrato_firmado: "Contrato firmado",
};

const MAX_SIGNED_BYTES = 15 * 1024 * 1024;

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

function FirmarContratoSection({
  bookingId,
  isLocked,
  yaFirmo,
}: {
  bookingId: string;
  isLocked: boolean;
  yaFirmo: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(yaFirmo || isLocked);
  const [err, setErr] = useState("");

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") { setErr("Solo se aceptan archivos PDF"); return; }
    if (file.size > MAX_SIGNED_BYTES) { setErr("El archivo supera 15 MB"); return; }
    setErr("");
    setUploading(true);
    try {
      const req = await requestContratoFirmadoUpload({
        bookingId, fileName: file.name, contentType: file.type, size: file.size,
      });
      if (req.error || !req.signedUrl || !req.token || !req.path) {
        setErr(req.error ?? "Error al solicitar la subida"); return;
      }
      const upErr = await uploadFileToSignedUrl(req.signedUrl, req.token, file, "signed-contract");
      if (upErr) { setErr(upErr); return; }

      const confirm = await confirmContratoFirmadoUpload(bookingId, req.path);
      if (confirm.error) { setErr(confirm.error); return; }
      setDone(true);
    } finally {
      setUploading(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
        <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-[0.85rem] text-negro font-medium">Contrato firmado entregado</p>
          <p className="text-[0.8rem] text-gris mt-0.5">
            Gracias. El equipo revisará tu contrato firmado y se pondrá en contacto contigo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
      <div className="flex items-start gap-3">
        <PenLine size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-[0.88rem] text-negro font-medium">Contrato pendiente de firma</p>
          <p className="text-[0.8rem] text-gris/80 mt-0.5">
            Descarga el contrato, fírmalo e imprime, luego súbelo aquí en formato PDF.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-dorado text-blanco text-[0.82rem] font-medium rounded-xl hover:bg-dorado/90 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          {uploading ? "Subiendo…" : "Subir contrato firmado (PDF)"}
        </button>
        {isLocked && (
          <span className="inline-flex items-center gap-1 text-[0.75rem] text-gris">
            <Lock size={12} /> Bloqueado
          </span>
        )}
      </div>
      {err && <p className="text-[0.78rem] text-rojo">{err}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

interface Props {
  documentos: DocumentoConSize[];
  bookingId?: string;
  isLocked?: boolean;
}

export function DocumentosClienteView({ documentos, bookingId, isLocked = false }: Props) {
  const tieneContrato = documentos.some((d) => d.type === "contrato");
  const yaFirmo = documentos.some((d) => d.type === "contrato_firmado");
  const mostrarFirma = tieneContrato && bookingId;

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
      {mostrarFirma && (
        <FirmarContratoSection
          bookingId={bookingId}
          isLocked={isLocked}
          yaFirmo={yaFirmo}
        />
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
