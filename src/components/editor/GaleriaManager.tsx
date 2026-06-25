"use client";

import { useState, useTransition, useRef } from "react";
import { Upload, Trash2, Eye, EyeOff, Loader2, ArrowUp, ArrowDown, X } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import {
  insertGaleriaImage, updateGaleriaImage, deleteGaleriaImage, reorderGaleriaImages,
} from "@/app/actions/editor/galeria";

type GaleriaImage = {
  id: string; url: string; title: string | null;
  category: string | null; sort_order: number; is_published: boolean;
};

const CATS = ["boda", "quince", "empresarial", "revelacion", "general"];
const CAT_LABEL: Record<string, string> = {
  boda: "Boda", quince: "Quinceañera", empresarial: "Empresarial",
  revelacion: "Revelación", general: "General",
};

const inputCls = "w-full border border-negro/10 bg-crema/20 px-3 py-2.5 text-[0.83rem] text-negro rounded-lg focus:outline-none focus:border-dorado/70 transition-colors";

function UploadModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError("Máximo 5 MB"); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  }

  async function handleUpload() {
    if (!file) { setError("Selecciona una imagen"); return; }
    setUploading(true);
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const ext = file.name.split(".").pop();
      const path = `${category}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("gallery").upload(path, file);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("gallery").getPublicUrl(path);
      const { error: insErr } = await insertGaleriaImage({ url: publicUrl, title, category });
      if (insErr) throw new Error(insErr);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-negro/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-blanco rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-[1.05rem] text-negro">Subir imagen</h3>
          <button onClick={onClose}><X size={18} className="text-gris" /></button>
        </div>

        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-negro/20 rounded-xl p-6 text-center cursor-pointer hover:border-dorado/50 transition-colors"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-36 mx-auto object-cover rounded-lg" />
          ) : (
            <>
              <Upload size={28} className="text-gris/40 mx-auto mb-2" />
              <p className="text-[0.8rem] text-gris">JPG, PNG, WebP · máx 5 MB</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pickFile} />

        <div>
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Título</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Descripción de la foto…" className={inputCls} />
        </div>
        <div>
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Categoría *</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
            {CATS.map(c => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
          </select>
        </div>

        {error && <p className="text-[0.78rem] text-rojo">{error}</p>}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-[0.8rem] text-gris border border-negro/15 rounded-lg">Cancelar</button>
          <button onClick={handleUpload} disabled={uploading}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-dorado text-blanco text-[0.8rem] font-medium rounded-lg hover:bg-dorado/90 disabled:opacity-50">
            {uploading && <Loader2 size={13} className="animate-spin" />}
            {uploading ? "Subiendo…" : "Subir"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function GaleriaManager({ images: initial }: { images: GaleriaImage[] }) {
  const [images, setImages] = useState(initial);
  const [showUpload, setShowUpload] = useState(false);
  const [filter, setFilter] = useState("all");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = filter === "all" ? images : images.filter(i => i.category === filter);

  function handleTogglePublished(img: GaleriaImage) {
    startTransition(async () => {
      await updateGaleriaImage(img.id, { is_published: !img.is_published });
      setImages(prev => prev.map(i => i.id === img.id ? { ...i, is_published: !i.is_published } : i));
    });
  }

  function handleDelete(img: GaleriaImage) {
    setDeleting(img.id);
    startTransition(async () => {
      await deleteGaleriaImage(img.id);
      setImages(prev => prev.filter(i => i.id !== img.id));
      setDeleting(null);
    });
  }

  function handleMove(id: string, dir: -1 | 1) {
    const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex(i => i.id === id);
    const other = sorted[idx + dir];
    if (!other) return;
    const updates = [
      { id: sorted[idx].id, sort_order: other.sort_order },
      { id: other.id, sort_order: sorted[idx].sort_order },
    ];
    startTransition(async () => {
      await reorderGaleriaImages(updates);
      setImages(prev => prev.map(i => {
        const upd = updates.find(u => u.id === i.id);
        return upd ? { ...i, sort_order: upd.sort_order } : i;
      }));
    });
  }

  const sorted = [...filtered].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <>
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-[1.9rem] text-negro tracking-[-0.03em]">
              <span className="text-dorado">Galería</span>
            </h2>
            <p className="text-gris text-[0.88rem] mt-1">{images.length} imagen{images.length !== 1 ? "es" : ""}</p>
          </div>
          <button onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-dorado text-blanco text-[0.8rem] font-medium rounded-xl hover:bg-dorado/90 transition-colors">
            <Upload size={15} /> Subir imagen
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          {["all", ...CATS].map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-[0.78rem] font-medium transition-colors border ${
                filter === c ? "bg-dorado text-blanco border-dorado" : "bg-blanco text-gris border-negro/10 hover:border-dorado/30"
              }`}>
              {c === "all" ? "Todas" : CAT_LABEL[c]}
            </button>
          ))}
        </div>

        {/* Grid */}
        {sorted.length === 0 ? (
          <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-12 text-center">
            <p className="text-gris text-[0.85rem]">Sin imágenes en esta categoría. Sube la primera.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {sorted.map((img, idx) => (
              <div key={img.id}
                className={`group relative bg-negro/5 rounded-xl overflow-hidden aspect-[4/3] ${!img.is_published ? "opacity-50" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.title ?? ""} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-negro/0 group-hover:bg-negro/50 transition-colors flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                  <button onClick={() => handleMove(img.id, -1)} disabled={idx === 0 || isPending}
                    className="p-1.5 bg-blanco/90 rounded-lg hover:bg-blanco disabled:opacity-30">
                    <ArrowUp size={13} />
                  </button>
                  <button onClick={() => handleMove(img.id, 1)} disabled={idx === sorted.length - 1 || isPending}
                    className="p-1.5 bg-blanco/90 rounded-lg hover:bg-blanco disabled:opacity-30">
                    <ArrowDown size={13} />
                  </button>
                  <button onClick={() => handleTogglePublished(img)} disabled={isPending}
                    className="p-1.5 bg-blanco/90 rounded-lg hover:bg-blanco">
                    {img.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button onClick={() => handleDelete(img)} disabled={isPending}
                    className="p-1.5 bg-rojo/90 rounded-lg hover:bg-rojo">
                    {deleting === img.id ? <Loader2 size={13} className="animate-spin text-blanco" /> : <Trash2 size={13} className="text-blanco" />}
                  </button>
                </div>
                {img.category && (
                  <span className="absolute top-2 left-2 text-[0.6rem] px-1.5 py-0.5 rounded bg-negro/60 text-blanco uppercase tracking-wider">
                    {CAT_LABEL[img.category] ?? img.category}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
