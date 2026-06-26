"use client";

import { useState, useTransition, useRef } from "react";
import {
  Upload, Trash2, Eye, EyeOff, Loader2,
  ArrowUp, ArrowDown, X, ImageIcon, CheckCircle2,
} from "lucide-react";
import {
  uploadGaleriaImage, updateGaleriaImage, deleteGaleriaImage, reorderGaleriaImages,
  type UploadedImage,
} from "@/app/actions/editor/galeria";

type GaleriaImage = {
  id: string; url: string; title: string | null;
  category: string | null; sort_order: number; is_published: boolean;
};

const CATS = [
  { value: "boda",        label: "Bodas" },
  { value: "quince",      label: "Quince Años" },
  { value: "empresarial", label: "Empresarial" },
  { value: "revelacion",  label: "Revelación de Género" },
  { value: "general",     label: "General" },
];
const CAT_LABEL: Record<string, string> = Object.fromEntries(CATS.map(c => [c.value, c.label]));

const inputCls =
  "w-full border border-negro/10 bg-crema/20 px-3 py-2.5 text-[0.83rem] text-negro " +
  "rounded-lg focus:outline-none focus:border-dorado/70 transition-colors";

// ─── Barra de progreso ────────────────────────────────────────────────────────

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="w-full bg-negro/8 rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full bg-dorado rounded-full transition-all duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Modal de upload ──────────────────────────────────────────────────────────

function UploadModal({
  onUploaded, onClose,
}: {
  onUploaded: (img: UploadedImage) => void;
  onClose: () => void;
}) {
  const [file, setFile]         = useState<File | null>(null);
  const [preview, setPreview]   = useState<string | null>(null);
  const [category, setCategory] = useState("general");
  const [title, setTitle]       = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError("El archivo supera 5 MB"); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setError("Solo se aceptan JPG, PNG y WebP"); return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Selecciona una imagen"); return; }
    setUploading(true);
    setProgress(0);
    setError(null);

    // Progreso simulado: avanza hasta 85 % durante el envío
    let sim = 0;
    const interval = setInterval(() => {
      sim = Math.min(sim + Math.random() * 10, 85);
      setProgress(Math.round(sim));
    }, 350);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", category);
      fd.append("title", title.trim());

      const result = await uploadGaleriaImage(fd);

      clearInterval(interval);

      if (result.error) {
        setError(result.error);
        setUploading(false);
        setProgress(0);
        return;
      }

      setProgress(100);
      setDone(true);
      setTimeout(() => {
        onUploaded(result.image!);
      }, 500);
    } catch (err) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : "Error inesperado");
      setUploading(false);
      setProgress(0);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-negro/40 backdrop-blur-sm" onClick={!uploading ? onClose : undefined} />
      <div className="relative bg-blanco rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-[1.1rem] text-negro">Subir imagen</h3>
          {!uploading && (
            <button onClick={onClose} className="p-1 text-gris hover:text-negro transition-colors">
              <X size={18} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dropzone */}
          <div
            onClick={() => !uploading && fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors
              ${uploading ? "cursor-default" : "cursor-pointer hover:border-dorado/50"}
              ${file ? "border-dorado/40 bg-dorado/5" : "border-negro/15"}`}
          >
            {done ? (
              <div className="flex flex-col items-center gap-2 text-verde-bosque py-2">
                <CheckCircle2 size={28} />
                <p className="text-[0.83rem] font-medium">¡Subida correctamente!</p>
              </div>
            ) : preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-36 mx-auto object-cover rounded-lg" />
            ) : (
              <>
                <ImageIcon size={28} className="text-negro/15 mx-auto mb-2" />
                <p className="text-[0.82rem] font-medium text-negro/40">Haz clic para seleccionar</p>
                <p className="text-[0.72rem] text-gris/50 mt-0.5">JPG, PNG, WebP · máx 5 MB</p>
              </>
            )}
          </div>
          <input
            ref={fileRef} type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden" onChange={pickFile}
          />

          {/* Barra de progreso */}
          {uploading && (
            <div className="space-y-1.5">
              <ProgressBar pct={progress} />
              <p className="text-[0.72rem] text-gris text-right">{progress}%</p>
            </div>
          )}

          {/* Categoría */}
          <div>
            <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">
              Categoría *
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              disabled={uploading}
              className={inputCls}
            >
              {CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Título opcional */}
          <div>
            <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">
              Título (opcional)
            </label>
            <input
              type="text" value={title}
              onChange={e => setTitle(e.target.value)}
              disabled={uploading}
              placeholder="Descripción de la foto…"
              className={inputCls}
            />
          </div>

          {error && (
            <p className="text-[0.78rem] text-rojo bg-rojo/5 border border-rojo/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            {!uploading && !done && (
              <button
                type="button" onClick={onClose}
                className="px-4 py-2 text-[0.8rem] text-gris border border-negro/15 rounded-lg hover:bg-negro/5"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit" disabled={uploading || done || !file}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-dorado text-blanco
                text-[0.8rem] font-medium rounded-lg hover:bg-dorado/90 disabled:opacity-40 transition-colors"
            >
              {uploading
                ? <><Loader2 size={13} className="animate-spin" /> Subiendo…</>
                : <><Upload size={13} /> Subir</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Manager principal ────────────────────────────────────────────────────────

export function GaleriaManager({ images: initial }: { images: GaleriaImage[] }) {
  const [images, setImages]     = useState(initial);
  const [showUpload, setShowUpload] = useState(false);
  const [filter, setFilter]     = useState("all");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = filter === "all" ? images : images.filter(i => i.category === filter);
  const sorted   = [...filtered].sort((a, b) => a.sort_order - b.sort_order);

  function handleUploaded(img: UploadedImage) {
    setImages(prev => [img, ...prev]);
    setShowUpload(false);
  }

  function handleTogglePublished(img: GaleriaImage) {
    startTransition(async () => {
      await updateGaleriaImage(img.id, { is_published: !img.is_published });
      setImages(prev =>
        prev.map(i => i.id === img.id ? { ...i, is_published: !i.is_published } : i),
      );
    });
  }

  function handleDelete(img: GaleriaImage) {
    setDeleting(img.id);
    startTransition(async () => {
      await deleteGaleriaImage(img.id, img.url);
      setImages(prev => prev.filter(i => i.id !== img.id));
      setDeleting(null);
    });
  }

  function handleMove(id: string, dir: -1 | 1) {
    const inView = [...filtered].sort((a, b) => a.sort_order - b.sort_order);
    const idx    = inView.findIndex(i => i.id === id);
    const other  = inView[idx + dir];
    if (!other) return;
    const updates = [
      { id: inView[idx].id, sort_order: other.sort_order },
      { id: other.id,       sort_order: inView[idx].sort_order },
    ];
    startTransition(async () => {
      await reorderGaleriaImages(updates);
      setImages(prev => prev.map(i => {
        const upd = updates.find(u => u.id === i.id);
        return upd ? { ...i, sort_order: upd.sort_order } : i;
      }));
    });
  }

  return (
    <>
      {showUpload && (
        <UploadModal
          onUploaded={handleUploaded}
          onClose={() => setShowUpload(false)}
        />
      )}

      <div className="space-y-6">
        {/* Cabecera */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-[1.9rem] text-negro tracking-[-0.03em]">
              <span className="text-dorado">Galería</span>
            </h2>
            <p className="text-gris text-[0.88rem] mt-1">
              {images.length} imagen{images.length !== 1 ? "es" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-dorado text-blanco
              text-[0.8rem] font-medium rounded-xl hover:bg-dorado/90 transition-colors"
          >
            <Upload size={15} /> Subir imagen
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          {[{ value: "all", label: "Todas" }, ...CATS].map(c => (
            <button
              key={c.value}
              onClick={() => setFilter(c.value)}
              className={`px-3 py-1.5 rounded-lg text-[0.78rem] font-medium transition-colors border ${
                filter === c.value
                  ? "bg-dorado text-blanco border-dorado"
                  : "bg-blanco text-gris border-negro/10 hover:border-dorado/30"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {sorted.length === 0 ? (
          <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-12 text-center">
            <ImageIcon size={32} className="text-negro/10 mx-auto mb-3" />
            <p className="text-gris text-[0.85rem]">
              {filter === "all"
                ? "Sin imágenes. Sube la primera."
                : "Sin imágenes en esta categoría."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {sorted.map((img, idx) => (
              <div
                key={img.id}
                className={`group relative bg-negro/5 rounded-xl overflow-hidden aspect-[4/3]
                  ${!img.is_published ? "opacity-50" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.title ?? ""}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Overlay de acciones */}
                <div className="absolute inset-0 bg-negro/0 group-hover:bg-negro/55 transition-colors
                  flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => handleMove(img.id, -1)}
                    disabled={idx === 0 || isPending}
                    className="p-1.5 bg-blanco/90 rounded-lg hover:bg-blanco disabled:opacity-30"
                    title="Mover antes"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    onClick={() => handleMove(img.id, 1)}
                    disabled={idx === sorted.length - 1 || isPending}
                    className="p-1.5 bg-blanco/90 rounded-lg hover:bg-blanco disabled:opacity-30"
                    title="Mover después"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    onClick={() => handleTogglePublished(img)}
                    disabled={isPending}
                    className="p-1.5 bg-blanco/90 rounded-lg hover:bg-blanco"
                    title={img.is_published ? "Ocultar" : "Publicar"}
                  >
                    {img.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button
                    onClick={() => handleDelete(img)}
                    disabled={isPending}
                    className="p-1.5 bg-rojo/90 rounded-lg hover:bg-rojo"
                    title="Eliminar"
                  >
                    {deleting === img.id
                      ? <Loader2 size={13} className="animate-spin text-blanco" />
                      : <Trash2 size={13} className="text-blanco" />}
                  </button>
                </div>

                {/* Badge de categoría */}
                {img.category && (
                  <span className="absolute top-2 left-2 text-[0.6rem] px-1.5 py-0.5 rounded
                    bg-negro/60 text-blanco uppercase tracking-wider pointer-events-none">
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
