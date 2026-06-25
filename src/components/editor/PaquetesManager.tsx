"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import {
  createPaquete, updatePaquete, deletePaquete, type PaqueteData,
} from "@/app/actions/editor/paquetes";

type Paquete = {
  id: string; name: string; event_type: string | null;
  description: string | null; includes: string[]; is_active: boolean;
};

const EVENT_TYPES = [
  { value: "Boda", label: "Boda" },
  { value: "Quince Años", label: "Quince Años" },
  { value: "Evento Empresarial", label: "Evento Empresarial" },
  { value: "Revelación de Género", label: "Revelación de Género" },
];

const inputCls = "w-full border border-negro/10 bg-crema/20 px-3 py-2.5 text-[0.83rem] text-negro rounded-lg focus:outline-none focus:border-dorado/70 transition-colors";

function PaqueteForm({
  initial, onDone, onCancel,
}: {
  initial?: Paquete; onDone: () => void; onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [eventType, setEventType] = useState(initial?.event_type ?? "Boda");
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [includesText, setIncludesText] = useState(initial?.includes.join("\n") ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const includes = includesText.split("\n").map(l => l.trim()).filter(Boolean);
    const data: PaqueteData = { name, event_type: eventType, description: desc, includes, is_active: isActive };
    startTransition(async () => {
      const res = initial ? await updatePaquete(initial.id, data) : await createPaquete(data);
      if (res.error) { setError(res.error); return; }
      onDone();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-crema/40 border border-dorado/20 rounded-2xl p-5 space-y-3">
      <h4 className="font-serif text-[0.95rem] text-negro">
        {initial ? "Editar paquete" : "Nuevo paquete"}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Nombre *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required className={inputCls} />
        </div>
        <div>
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Tipo de evento *</label>
          <select value={eventType} onChange={e => setEventType(e.target.value)} className={inputCls}>
            {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Descripción</label>
          <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className={inputCls}
            placeholder="Breve descripción del paquete…" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">
            Incluye (una línea por ítem)
          </label>
          <textarea value={includesText} onChange={e => setIncludesText(e.target.value)} rows={5}
            className={`${inputCls} resize-none font-mono text-[0.8rem]`}
            placeholder="Salón principal&#10;Sonido profesional&#10;Coordinador de eventos…" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="active" checked={isActive} onChange={e => setIsActive(e.target.checked)}
            className="w-4 h-4 accent-dorado" />
          <label htmlFor="active" className="text-[0.82rem] text-negro">Activo (visible en el sitio)</label>
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

export function PaquetesManager({ paquetes }: { paquetes: Paquete[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [isPending, startTransition] = useTransition();

  const filtered = filterType === "all"
    ? paquetes
    : paquetes.filter(p => p.event_type === filterType);

  function handleToggle(p: Paquete) {
    startTransition(async () => { await updatePaquete(p.id, { is_active: !p.is_active }); });
  }
  function handleDelete(id: string) {
    startTransition(async () => { await deletePaquete(id); setConfirmDelete(null); });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-serif text-[1.9rem] text-negro tracking-[-0.03em]">
            <span className="text-dorado">Paquetes</span>
          </h2>
          <p className="text-gris text-[0.88rem] mt-1">{paquetes.length} paquetes — sin precios visibles</p>
        </div>
        {!showForm && !editId && (
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-dorado text-blanco text-[0.8rem] font-medium rounded-xl hover:bg-dorado/90 transition-colors">
            <Plus size={15} /> Agregar paquete
          </button>
        )}
      </div>

      {/* Filtro por tipo */}
      <div className="flex flex-wrap gap-2">
        {[{ value: "all", label: "Todos" }, ...EVENT_TYPES].map(t => (
          <button key={t.value} onClick={() => setFilterType(t.value)}
            className={`px-3 py-1.5 rounded-lg text-[0.78rem] font-medium transition-colors border ${
              filterType === t.value ? "bg-dorado text-blanco border-dorado" : "bg-blanco text-gris border-negro/10 hover:border-dorado/30"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {showForm && <PaqueteForm onDone={() => setShowForm(false)} onCancel={() => setShowForm(false)} />}

      <div className="space-y-3">
        {filtered.length === 0 && !showForm ? (
          <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-10 text-center">
            <p className="text-gris text-[0.85rem]">Sin paquetes en esta categoría.</p>
          </div>
        ) : filtered.map((p) => {
          if (editId === p.id) {
            return <PaqueteForm key={p.id} initial={p} onDone={() => setEditId(null)} onCancel={() => setEditId(null)} />;
          }
          return (
            <div key={p.id}
              className={`bg-blanco rounded-2xl border border-negro/[0.07] px-5 py-4 ${!p.is_active ? "opacity-55" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-[0.9rem] font-medium text-negro">{p.name}</p>
                    <span className="text-[0.65rem] px-1.5 py-0.5 rounded bg-dorado/10 text-dorado border border-dorado/20">
                      {p.event_type}
                    </span>
                    {!p.is_active && (
                      <span className="text-[0.65rem] px-1.5 py-0.5 rounded bg-negro/5 text-gris border border-negro/10">Inactivo</span>
                    )}
                  </div>
                  {p.description && <p className="text-[0.78rem] text-gris mb-2">{p.description}</p>}
                  {p.includes.length > 0 && (
                    <ul className="space-y-0.5">
                      {p.includes.slice(0, 4).map((item, i) => (
                        <li key={i} className="text-[0.75rem] text-gris flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-dorado/60 shrink-0" />
                          {item}
                        </li>
                      ))}
                      {p.includes.length > 4 && (
                        <li className="text-[0.73rem] text-gris/60">+{p.includes.length - 4} más…</li>
                      )}
                    </ul>
                  )}
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button onClick={() => handleToggle(p)} disabled={isPending}
                    className="p-1.5 text-negro/30 hover:text-negro rounded-lg transition-colors disabled:opacity-50"
                    title={p.is_active ? "Desactivar" : "Activar"}>
                    {p.is_active ? <ToggleRight size={16} className="text-green-600" /> : <ToggleLeft size={16} />}
                  </button>
                  <button onClick={() => setEditId(p.id)}
                    className="p-1.5 text-negro/25 hover:text-negro hover:bg-negro/5 rounded-lg transition-colors">
                    <Pencil size={14} />
                  </button>
                  {confirmDelete === p.id ? (
                    <div className="flex items-center gap-1 text-[0.74rem]">
                      <button onClick={() => handleDelete(p.id)} disabled={isPending}
                        className="text-rojo font-medium hover:underline disabled:opacity-50">Sí</button>
                      <button onClick={() => setConfirmDelete(null)} className="text-gris hover:underline">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(p.id)}
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
