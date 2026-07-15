"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Loader2, Star, X, Upload, User } from "lucide-react";
import {
  createTestimonio, updateTestimonio, deleteTestimonio,
  requestTestimonioPhotoUpload, confirmTestimonioPhotoUpload,
  type TestimonioData,
} from "@/app/actions/editor/testimonios";
import { uploadFileToSignedUrl } from "@/lib/uploads/client";

type Testimonio = {
  id: string; client_name: string; event_type: string | null;
  rating: number | null; content: string; is_published: boolean;
  photo_url: string | null;
};

const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const PHOTO_ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

const EVENT_TYPES = [
  "Boda", "Quince Años", "Evento Empresarial", "Revelación de Género",
];

const inputCls = "w-full border border-negro/10 bg-crema/20 px-3 py-2.5 text-[0.83rem] text-negro rounded-lg focus:outline-none focus:border-dorado/70 transition-colors";

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star size={18} fill={n <= value ? "#C4975A" : "none"} className={n <= value ? "text-dorado" : "text-negro/20"} />
        </button>
      ))}
    </div>
  );
}

function TestimonioForm({
  initial, onDone, onCancel,
}: {
  initial?: Testimonio; onDone: () => void; onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.client_name ?? "");
  const [eventType, setEventType] = useState(initial?.event_type ?? "Boda");
  const [content, setContent] = useState(initial?.content ?? "");
  const [rating, setRating] = useState(initial?.rating ?? 5);
  const [published, setPublished] = useState(initial?.is_published ?? false);
  const [photoUrl, setPhotoUrl] = useState(initial?.photo_url ?? null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const photoRef = useRef<HTMLInputElement>(null);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > PHOTO_MAX_BYTES) { setError("La foto supera 5 MB"); return; }
    if (!PHOTO_ALLOWED_MIME.includes(f.type)) { setError("Solo se aceptan JPG, PNG y WebP"); return; }

    setUploadingPhoto(true);
    setError(null);
    try {
      const req = await requestTestimonioPhotoUpload({ fileName: f.name, contentType: f.type, size: f.size });
      if (req.error || !req.signedUrl || !req.token || !req.path) {
        setError(req.error ?? "No se pudo iniciar la subida");
        return;
      }
      const upErr = await uploadFileToSignedUrl("gallery", req.path, req.token, f);
      if (upErr.error) { setError(upErr.error); return; }

      const result = await confirmTestimonioPhotoUpload(req.path);
      if (result.error) { setError(result.error); return; }
      setPhotoUrl(result.url ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setUploadingPhoto(false);
      if (photoRef.current) photoRef.current.value = "";
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data: TestimonioData = { client_name: name, event_type: eventType, content, rating, is_published: published, photo_url: photoUrl };
    startTransition(async () => {
      const res = initial ? await updateTestimonio(initial.id, data) : await createTestimonio(data);
      if (res.error) { setError(res.error); return; }
      onDone();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-crema/40 border border-dorado/20 rounded-2xl p-5 space-y-3">
      <h4 className="font-serif text-[0.95rem] text-negro">
        {initial ? "Editar testimonio" : "Nuevo testimonio"}
      </h4>
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14 rounded-full overflow-hidden ring-1 ring-negro/10 bg-dorado/10 flex items-center justify-center shrink-0">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={name || "Foto del cliente"} className="w-full h-full object-cover" />
          ) : (
            <User size={22} className="text-dorado/50" />
          )}
          {uploadingPhoto && (
            <div className="absolute inset-0 bg-negro/55 flex items-center justify-center">
              <Loader2 size={16} className="animate-spin text-blanco" />
            </div>
          )}
        </div>
        <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhoto} />
        <button type="button" onClick={() => photoRef.current?.click()} disabled={uploadingPhoto}
          className="inline-flex items-center gap-1.5 px-3 py-2 border border-negro/15 rounded-lg text-[0.78rem] text-negro hover:bg-negro/5 disabled:opacity-40 transition-colors">
          <Upload size={13} /> {photoUrl ? "Cambiar foto" : "Agregar foto"}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Nombre del cliente *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required className={inputCls} />
        </div>
        <div>
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Tipo de evento *</label>
          <select value={eventType} onChange={e => setEventType(e.target.value)} className={inputCls}>
            {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Cita *</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={3} required
            className={`${inputCls} resize-none`} placeholder="Lo que dijo el cliente sobre El Encanto…" />
        </div>
        <div>
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Calificación</label>
          <StarRating value={rating} onChange={setRating} />
        </div>
        <div className="flex items-center gap-2 self-end">
          <input type="checkbox" id="pub" checked={published} onChange={e => setPublished(e.target.checked)}
            className="w-4 h-4 accent-dorado rounded" />
          <label htmlFor="pub" className="text-[0.82rem] text-negro">Publicar en el sitio</label>
        </div>
      </div>
      {error && <p className="text-[0.78rem] text-rojo">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-2 text-[0.8rem] text-gris border border-negro/15 rounded-lg hover:bg-negro/5">
          Cancelar
        </button>
        <button type="submit" disabled={isPending}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-dorado text-blanco text-[0.8rem] font-medium rounded-lg hover:bg-dorado/90 disabled:opacity-50">
          {isPending && <Loader2 size={12} className="animate-spin" />}
          {isPending ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}

export function TestimoniosManager({ testimonios }: { testimonios: Testimonio[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteTestimonio(id);
      setConfirmDelete(null);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-[1.9rem] text-negro tracking-[-0.03em]">
            <span className="text-dorado">Testimonios</span>
          </h2>
          <p className="text-gris text-[0.88rem] mt-1">{testimonios.length} testimonios</p>
        </div>
        {!showForm && !editId && (
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-dorado text-blanco text-[0.8rem] font-medium rounded-xl hover:bg-dorado/90 transition-colors">
            <Plus size={15} /> Agregar
          </button>
        )}
      </div>

      {showForm && <TestimonioForm onDone={() => setShowForm(false)} onCancel={() => setShowForm(false)} />}

      <div className="space-y-3">
        {testimonios.length === 0 && !showForm ? (
          <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-10 text-center">
            <p className="text-gris text-[0.85rem]">Sin testimonios. Agrega el primero.</p>
          </div>
        ) : testimonios.map((t) => {
          if (editId === t.id) {
            return <TestimonioForm key={t.id} initial={t} onDone={() => setEditId(null)} onCancel={() => setEditId(null)} />;
          }
          return (
            <div key={t.id}
              className={`bg-blanco rounded-2xl border border-negro/[0.07] px-5 py-4 ${!t.is_published ? "opacity-55" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-negro/10 bg-dorado/10 flex items-center justify-center shrink-0">
                  {t.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.photo_url} alt={t.client_name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={16} className="text-dorado/50" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[0.88rem] font-medium text-negro">{t.client_name}</p>
                    {!t.is_published && (
                      <span className="text-[0.65rem] px-1.5 py-0.5 rounded bg-negro/5 text-gris border border-negro/10">Borrador</span>
                    )}
                  </div>
                  <div className="flex gap-0.5 mb-1.5">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} size={12} fill={n <= (t.rating ?? 0) ? "#C4975A" : "none"}
                        className={n <= (t.rating ?? 0) ? "text-dorado" : "text-negro/15"} />
                    ))}
                  </div>
                  <p className="text-[0.8rem] text-gris leading-relaxed">{t.content}</p>
                  <p className="text-[0.72rem] text-gris/60 mt-1">{t.event_type}</p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button onClick={() => setEditId(t.id)}
                    className="p-1.5 text-negro/25 hover:text-negro hover:bg-negro/5 rounded-lg transition-colors">
                    <Pencil size={14} />
                  </button>
                  {confirmDelete === t.id ? (
                    <div className="flex items-center gap-1 text-[0.74rem]">
                      <button onClick={() => handleDelete(t.id)} disabled={isPending}
                        className="text-rojo font-medium hover:underline disabled:opacity-50">
                        {isPending ? <Loader2 size={12} className="animate-spin" /> : "Sí"}
                      </button>
                      <button onClick={() => setConfirmDelete(null)} className="text-gris hover:underline">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(t.id)}
                      className="p-1.5 text-negro/25 hover:text-rojo hover:bg-rojo/5 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
