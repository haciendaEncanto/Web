"use client";

import { useState, useTransition } from "react";
import { Loader2, Save, ChevronDown, ChevronUp } from "lucide-react";
import { updateSiteContentText, updateSiteContentData } from "@/app/actions/editor/contenido";

type SiteContentRow = {
  id: string;
  key: string;
  title: string | null;
  content: string | null;
  data: unknown;
  updated_at: string;
};

const KEY_LABELS: Record<string, { section: string; titleLabel?: string; contentLabel?: string }> = {
  hero:        { section: "Hero principal", titleLabel: "Título principal", contentLabel: "Subtítulo" },
  about:       { section: "Sección Nosotros", titleLabel: "Título de sección", contentLabel: "Párrafo descriptivo" },
  stats:       { section: "Estadísticas", titleLabel: "Etiqueta interna" },
  contact:     { section: "Contacto", titleLabel: "Etiqueta interna" },
  tour_360_url:{ section: "Tour 360°", contentLabel: "URL del tour (Matterport / Kuula)" },
};

const SECTION_ORDER = ["hero", "about", "stats", "contact", "tour_360_url"];

const inputCls = "w-full border border-negro/10 bg-crema/20 px-3 py-2.5 text-[0.83rem] text-negro rounded-lg focus:outline-none focus:border-dorado/70 transition-colors";

function SaveButton({ dirty, pending, saved }: { dirty: boolean; pending: boolean; saved: boolean }) {
  return (
    <button type="submit" disabled={!dirty || pending}
      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 bg-dorado text-blanco text-[0.78rem] font-medium rounded-lg hover:bg-dorado/90 disabled:opacity-30 transition-all">
      {pending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
      {saved ? "✓" : "Guardar"}
    </button>
  );
}

function TextField({
  label, value: init, multiline, onSave,
}: {
  label: string; value: string | null; multiline?: boolean;
  onSave: (v: string | null) => Promise<{ error?: string }>;
}) {
  const [value, setValue] = useState(init ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const dirty = value !== (init ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await onSave(value || null);
      if (res.error) { setError(res.error); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setError(null);
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">{label}</label>
      <div className="flex gap-2 items-start">
        {multiline ? (
          <textarea rows={3} value={value} onChange={e => setValue(e.target.value)}
            className={`${inputCls} resize-y flex-1`} />
        ) : (
          <input type="text" value={value} onChange={e => setValue(e.target.value)}
            className={`${inputCls} flex-1`} />
        )}
        <SaveButton dirty={dirty} pending={isPending} saved={saved} />
      </div>
      {error && <p className="text-[0.72rem] text-rojo mt-1">{error}</p>}
    </form>
  );
}

function JsonField({ value: init, onSave }: {
  value: unknown;
  onSave: (json: string) => Promise<{ error?: string }>;
}) {
  const pretty = JSON.stringify(init, null, 2);
  const [value, setValue] = useState(pretty);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const dirty = value !== pretty;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await onSave(value);
      if (res.error) { setError(res.error); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setError(null);
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Data (JSON)</label>
      <div className="flex gap-2 items-start">
        <textarea rows={6} value={value} onChange={e => setValue(e.target.value)}
          className={`${inputCls} flex-1 resize-y font-mono text-[0.75rem]`} spellCheck={false} />
        <SaveButton dirty={dirty} pending={isPending} saved={saved} />
      </div>
      {error && <p className="text-[0.72rem] text-rojo mt-1">{error}</p>}
    </form>
  );
}

function ContentCard({ row }: { row: SiteContentRow }) {
  const [open, setOpen] = useState(true);
  const meta = KEY_LABELS[row.key];
  const sectionTitle = meta?.section ?? row.key;

  const hasData = row.data !== null && row.data !== undefined &&
    !(typeof row.data === "object" && !Array.isArray(row.data) && Object.keys(row.data as object).length === 0);

  return (
    <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-negro/[0.02] transition-colors">
        <span className="font-serif text-[0.95rem] text-negro">{sectionTitle}</span>
        {open ? <ChevronUp size={16} className="text-gris" /> : <ChevronDown size={16} className="text-gris" />}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-negro/[0.05] pt-4 space-y-4">
          {row.title !== null && (
            <TextField
              label={meta?.titleLabel ?? "Título"}
              value={row.title}
              onSave={(v) => updateSiteContentText(row.key, "title", v)}
            />
          )}
          {(row.content !== null || meta?.contentLabel) && (
            <TextField
              label={meta?.contentLabel ?? "Contenido"}
              value={row.content}
              multiline
              onSave={(v) => updateSiteContentText(row.key, "content", v)}
            />
          )}
          {hasData && (
            <JsonField
              value={row.data}
              onSave={(json) => updateSiteContentData(row.key, json)}
            />
          )}
        </div>
      )}
    </div>
  );
}

export function ContenidoManager({ rows }: { rows: SiteContentRow[] }) {
  const sorted = [...rows].sort((a, b) => {
    const ai = SECTION_ORDER.indexOf(a.key);
    const bi = SECTION_ORDER.indexOf(b.key);
    if (ai === -1 && bi === -1) return a.key.localeCompare(b.key);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-[1.9rem] text-negro tracking-[-0.03em]">
          <span className="text-dorado">Textos</span> del sitio
        </h2>
        <p className="text-gris text-[0.88rem] mt-1">
          Los cambios se reflejan en el sitio público al instante.
        </p>
      </div>
      <div className="space-y-3">
        {sorted.map(row => <ContentCard key={row.key} row={row} />)}
      </div>
    </div>
  );
}
