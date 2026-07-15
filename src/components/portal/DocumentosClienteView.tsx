"use client";

import { useState, useTransition } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import { getDocumentoDownloadUrl, type DocumentoConSize } from "@/app/actions/documentos";

const TYPE_LABEL: Record<string, string> = {
  contrato: "Contrato",
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

export function DocumentosClienteView({ documentos }: { documentos: DocumentoConSize[] }) {
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
  );
}
