"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Loader2, Star, X } from "lucide-react";
import {
  createTestimonio, updateTestimonio, deleteTestimonio, type TestimonioData,
} from "@/app/actions/editor/testimonios";

type Testimonio = {
  id: string; client_name: string; event_type: string | null;
  rating: number | null; content: string; is_published: boolean;
};

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
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data: TestimonioData = { client_name: name, event_type: eventType, content, rating, is_published: published };
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
                <div className="min-w-0">
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
