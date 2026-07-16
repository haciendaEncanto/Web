"use client";

import { useTransition } from "react";
import { Download, Loader2, FileSpreadsheet, MapPin } from "lucide-react";
import { getGuestListDownloadUrl, type GuestListConSize } from "@/app/actions/invitados";

function formatBytes(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-CO", {
    day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit",
  });
}

function fileNameFromUrl(url: string): string {
  const last = url.split("/").pop() ?? url;
  return last.replace(/^\d+_/, "");
}

function DownloadBtn({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  function handle() {
    startTransition(async () => {
      const res = await getGuestListDownloadUrl(id);
      if (res.url) window.open(res.url, "_blank", "noopener,noreferrer");
    });
  }
  return (
    <button onClick={handle} disabled={isPending}
      className="inline-flex items-center gap-1.5 px-3 py-2 bg-dorado text-blanco text-[0.78rem] font-medium rounded-lg hover:bg-dorado/90 transition-colors disabled:opacity-50">
      {isPending ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
      Descargar
    </button>
  );
}

export function InvitadosReadOnly({
  mapUrl,
  mapName,
  files,
}: {
  mapUrl: string | null;
  mapName: string | null;
  files: GuestListConSize[];
}) {
  return (
    <div className="space-y-6">
      <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
        <div className="px-6 py-4 border-b border-negro/[0.05] bg-crema/30">
          <h3 className="font-serif text-[1.05rem] text-negro tracking-[-0.01em]">Mapa asignado</h3>
        </div>
        <div className="p-6">
          {mapUrl ? (
            <div className="space-y-3">
              {mapName && <p className="text-[0.85rem] font-medium text-negro">{mapName}</p>}
              <div className="relative rounded-xl overflow-hidden ring-1 ring-negro/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mapUrl} alt={mapName ?? "Mapa de distribución"} className="w-full h-auto" />
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <MapPin size={32} className="text-dorado/40 mx-auto mb-3" />
              <p className="text-gris text-[0.85rem]">
                Aún no hay un mapa asignado para la cantidad de invitados de este evento.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
        <div className="px-6 py-4 border-b border-negro/[0.05] bg-crema/30">
          <h3 className="font-serif text-[1.05rem] text-negro tracking-[-0.01em]">
            Lista de invitados por mesa
          </h3>
          <p className="text-[0.78rem] text-gris mt-1">Archivos Excel subidos por el cliente.</p>
        </div>

        {files.length === 0 ? (
          <div className="p-8 text-center">
            <FileSpreadsheet size={32} className="text-dorado/40 mx-auto mb-3" />
            <p className="text-gris text-[0.85rem]">El cliente aún no ha subido ningún archivo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-negro/[0.06] bg-crema/20">
                  <th className="px-5 py-3 text-[0.68rem] font-semibold text-gris uppercase tracking-widest">Archivo</th>
                  <th className="px-4 py-3 text-[0.68rem] font-semibold text-gris uppercase tracking-widest whitespace-nowrap">Fecha</th>
                  <th className="px-4 py-3 text-[0.68rem] font-semibold text-gris uppercase tracking-widest">Tamaño</th>
                  <th className="px-4 py-3 text-[0.68rem] font-semibold text-gris uppercase tracking-widest text-right">&nbsp;</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-negro/[0.04]">
                {files.map((f) => (
                  <tr key={f.id} className="hover:bg-crema/20 transition-colors">
                    <td className="px-5 py-4 text-[0.85rem] font-medium text-negro break-all">
                      {f.file_url ? fileNameFromUrl(f.file_url) : "—"}
                    </td>
                    <td className="px-4 py-4 text-[0.82rem] text-gris whitespace-nowrap">{formatDate(f.uploaded_at)}</td>
                    <td className="px-4 py-4 text-[0.82rem] text-gris">{formatBytes(f.size)}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end">
                        <DownloadBtn id={f.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
