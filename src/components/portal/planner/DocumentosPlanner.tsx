"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Upload, Download, Trash2, Loader2 } from "lucide-react";
import {
  requestDocumentoUpload,
  confirmDocumentoUpload,
  deleteDocumento,
  getDocumentoDownloadUrl,
  type DocumentoConSize,
} from "@/app/actions/documentos";
import { uploadFileToSignedUrl } from "@/lib/uploads/client";

const MAX_BYTES = 10 * 1024 * 1024;
const TYPE_LABEL: Record<string, string> = { contrato: "Contrato" };

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

function UploadForm({
  bookingId,
  onDone,
  onCancel,
}: {
  bookingId: string;
  onDone: (doc: DocumentoConSize) => void;
  onCancel: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") { setError("Solo se aceptan archivos PDF"); return; }
    if (f.size > MAX_BYTES) { setError("El archivo supera 10 MB"); return; }
    setError(null);
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.pdf$/i, ""));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Selecciona un archivo PDF"); return; }
    if (!title.trim()) { setError("El nombre del documento es requerido"); return; }

    setUploading(true);
    setError(null);
    try {
      const req = await requestDocumentoUpload({
        bookingId, fileName: file.name, contentType: file.type, size: file.size,
      });
      if (req.error || !req.signedUrl || !req.token || !req.path) {
        setError(req.error ?? "No se pudo iniciar la subida");
        return;
      }
      const upErr = await uploadFileToSignedUrl("documents", req.path, req.token, file);
      if (upErr.error) { setError(upErr.error); return; }

      const result = await confirmDocumentoUpload({ bookingId, path: req.path, title: title.trim() });
      if (result.error || !result.document) { setError(result.error ?? "Error al guardar el documento"); return; }

      onDone({
        id: result.document.id,
        title: title.trim(),
        type: "contrato",
        created_at: result.document.created_at,
        size: file.size,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-crema/40 border border-dorado/20 rounded-2xl p-5 space-y-3">
      <h4 className="font-serif text-[0.95rem] text-negro">Subir documento</h4>
      <div>
        <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Nombre del documento *</label>
        <input
          type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Contrato de servicio" required
          className="w-full border border-negro/10 bg-blanco px-3 py-2.5 text-[0.83rem] text-negro rounded-lg focus:outline-none focus:border-dorado/70 transition-colors"
        />
      </div>
      <div>
        <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Archivo PDF *</label>
        <input ref={fileRef} type="file" accept="application/pdf" onChange={handleFile}
          className="w-full text-[0.8rem] text-negro file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-dorado file:text-blanco file:text-[0.78rem] file:font-medium hover:file:bg-dorado/90" />
        {file && <p className="text-[0.72rem] text-gris mt-1">{file.name} · {formatBytes(file.size)}</p>}
      </div>
      {error && <p className="text-[0.78rem] text-rojo">{error}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} disabled={uploading}
          className="px-3 py-2 text-[0.8rem] text-gris border border-negro/15 rounded-lg hover:bg-negro/5 transition-colors disabled:opacity-50">
          Cancelar
        </button>
        <button type="submit" disabled={uploading}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-dorado text-blanco text-[0.8rem] font-medium rounded-lg hover:bg-dorado/90 transition-colors disabled:opacity-50">
          {uploading && <Loader2 size={12} className="animate-spin" />}
          {uploading ? "Subiendo…" : "Subir documento"}
        </button>
      </div>
    </form>
  );
}

function DownloadBtn({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  function handle() {
    startTransition(async () => {
      const res = await getDocumentoDownloadUrl(id);
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

function DeleteBtn({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirm) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <span className="text-[0.74rem] text-rojo">¿Eliminar?</span>
        <button
          onClick={() => startTransition(async () => { await deleteDocumento(id); onDeleted(); })}
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

export function DocumentosPlanner({
  bookingId,
  initialDocumentos,
}: {
  bookingId: string;
  initialDocumentos: DocumentoConSize[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [documentos, setDocumentos] = useState(initialDocumentos);
  const router = useRouter();

  return (
    <div className="space-y-4">
      {!showForm && (
        <button type="button" onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-dorado text-blanco text-[0.82rem] font-medium rounded-xl hover:bg-dorado/90 transition-colors">
          <Upload size={15} />
          Subir documento
        </button>
      )}

      {showForm && (
        <UploadForm
          bookingId={bookingId}
          onDone={(doc) => {
            setDocumentos((prev) => [doc, ...prev]);
            setShowForm(false);
            router.refresh(); // sincroniza en background; la UI ya quedó actualizada arriba
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {documentos.length === 0 && !showForm ? (
        <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-8 text-center">
          <FileText size={32} className="text-dorado/40 mx-auto mb-3" />
          <p className="text-gris text-[0.85rem]">Sin documentos subidos aún.</p>
        </div>
      ) : (
        <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-negro/[0.06] bg-crema/40">
                  <th className="px-5 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest">Nombre</th>
                  <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest">Tipo</th>
                  <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest whitespace-nowrap">Fecha</th>
                  <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest">Tamaño</th>
                  <th className="px-4 py-3.5 text-[0.68rem] font-semibold text-gris uppercase tracking-widest text-right">Acciones</th>
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
                      <div className="flex items-center justify-end gap-0.5">
                        <DownloadBtn id={d.id} />
                        <DeleteBtn
                          id={d.id}
                          onDeleted={() => {
                            setDocumentos((prev) => prev.filter((doc) => doc.id !== d.id));
                            router.refresh();
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
