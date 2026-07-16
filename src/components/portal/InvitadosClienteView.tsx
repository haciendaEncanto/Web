"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Download, Trash2, Loader2, FileSpreadsheet, MapPin } from "lucide-react";
import {
  requestGuestListUpload,
  confirmGuestListUpload,
  deleteGuestList,
  getGuestListDownloadUrl,
  type GuestListConSize,
} from "@/app/actions/invitados";
import { uploadFileToSignedUrl } from "@/lib/uploads/client";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

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

function UploadBtn({ bookingId, onDone }: { bookingId: string; onDone: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED_MIME.includes(f.type)) { setError("Solo se aceptan archivos Excel (.xlsx, .xls)"); return; }
    if (f.size > MAX_BYTES) { setError("El archivo supera 5 MB"); return; }

    setUploading(true);
    setError(null);
    try {
      const req = await requestGuestListUpload({
        bookingId, fileName: f.name, contentType: f.type, size: f.size,
      });
      if (req.error || !req.signedUrl || !req.token || !req.path) {
        setError(req.error ?? "No se pudo iniciar la subida");
        return;
      }
      const upErr = await uploadFileToSignedUrl("documents", req.path, req.token, f);
      if (upErr.error) { setError(upErr.error); return; }

      const result = await confirmGuestListUpload({ bookingId, path: req.path });
      if (result.error) { setError(result.error); return; }

      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <input
        ref={fileRef} type="file"
        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        className="hidden" onChange={handleFile}
      />
      <button
        type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-dorado text-blanco text-[0.82rem] font-medium rounded-xl hover:bg-dorado/90 transition-colors disabled:opacity-50"
      >
        {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
        {uploading ? "Subiendo…" : "Subir Excel"}
      </button>
      {error && <p className="text-[0.72rem] text-rojo max-w-[220px] text-right">{error}</p>}
    </div>
  );
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
      className="p-1.5 text-negro/25 hover:text-dorado hover:bg-dorado/5 rounded-lg transition-colors disabled:opacity-50">
      {isPending ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
    </button>
  );
}

function DeleteBtn({ id, bookingId, onDeleted }: { id: string; bookingId: string; onDeleted: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirm) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <span className="text-[0.74rem] text-rojo">¿Eliminar?</span>
        <button
          onClick={() => startTransition(async () => { await deleteGuestList(id, bookingId); onDeleted(); })}
          disabled={isPending}
          className="text-[0.74rem] text-rojo font-medium hover:underline disabled:opacity-50"
        >
          {isPending ? <Loader2 size={12} className="animate-spin" /> : "Sí"}
        </button>
        <button onClick={() => setConfirm(false)} className="text-[0.74rem] text-gris hover:underline">No</button>
      </div>
    );
  }
  return (
    <button onClick={() => setConfirm(true)}
      className="p-1.5 text-negro/25 hover:text-rojo hover:bg-rojo/5 rounded-lg transition-colors">
      <Trash2 size={14} />
    </button>
  );
}

export function InvitadosClienteView({
  bookingId,
  mapUrl,
  mapName,
  initialFiles,
}: {
  bookingId: string;
  mapUrl: string | null;
  mapName: string | null;
  initialFiles: GuestListConSize[];
}) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Mapa de distribución */}
      <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
        <div className="px-6 py-4 border-b border-negro/[0.05] bg-crema/30">
          <h3 className="font-serif text-[1.05rem] text-negro tracking-[-0.01em]">Mapa de distribución</h3>
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
              <p className="text-gris text-[0.85rem] max-w-[380px] mx-auto">
                El equipo está preparando el mapa de tu evento. Te notificaremos cuando esté disponible.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lista de invitados por mesa */}
      <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
        <div className="px-6 py-4 border-b border-negro/[0.05] bg-crema/30 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-serif text-[1.05rem] text-negro tracking-[-0.01em]">
              Mi lista de invitados por mesa
            </h3>
            <p className="text-[0.78rem] text-gris mt-1 max-w-md">
              Sube un archivo Excel con dos columnas: <strong className="text-negro/70">Mesa</strong> e{" "}
              <strong className="text-negro/70">Invitados</strong> (nombre de cada invitado por fila).
            </p>
          </div>
          <UploadBtn bookingId={bookingId} onDone={() => router.refresh()} />
        </div>

        {initialFiles.length === 0 ? (
          <div className="p-8 text-center">
            <FileSpreadsheet size={32} className="text-dorado/40 mx-auto mb-3" />
            <p className="text-gris text-[0.85rem]">Aún no has subido ningún archivo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-negro/[0.06] bg-crema/20">
                  <th className="px-5 py-3 text-[0.68rem] font-semibold text-gris uppercase tracking-widest">Archivo</th>
                  <th className="px-4 py-3 text-[0.68rem] font-semibold text-gris uppercase tracking-widest whitespace-nowrap">Fecha</th>
                  <th className="px-4 py-3 text-[0.68rem] font-semibold text-gris uppercase tracking-widest">Tamaño</th>
                  <th className="px-4 py-3 text-[0.68rem] font-semibold text-gris uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-negro/[0.04]">
                {initialFiles.map((f) => (
                  <tr key={f.id} className="hover:bg-crema/20 transition-colors">
                    <td className="px-5 py-4 text-[0.85rem] font-medium text-negro break-all">
                      {f.file_url ? fileNameFromUrl(f.file_url) : "—"}
                    </td>
                    <td className="px-4 py-4 text-[0.82rem] text-gris whitespace-nowrap">{formatDate(f.uploaded_at)}</td>
                    <td className="px-4 py-4 text-[0.82rem] text-gris">{formatBytes(f.size)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-0.5">
                        <DownloadBtn id={f.id} />
                        <DeleteBtn id={f.id} bookingId={bookingId} onDeleted={() => router.refresh()} />
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
