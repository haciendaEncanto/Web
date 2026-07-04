"use client";

import { useState, useTransition, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Upload, Trash2, EyeOff, Eye, Loader2, GripVertical,
  ArrowUp, ArrowDown, X, ImageIcon, CheckCircle2, AlertCircle, List,
} from "lucide-react";
import {
  requestGaleriaUpload,
  confirmGaleriaUpload,
  updateGaleriaImage,
  deleteGaleriaImage,
  reorderGaleriaImages,
  type UploadedImage,
} from "@/app/actions/editor/galeria";
import { uploadFileToSignedUrl } from "@/lib/uploads/client";

// ─── Types & constants ────────────────────────────────────────────────────────

type GaleriaImage = {
  id: string; url: string; title: string | null;
  category: string | null; sort_order: number; is_published: boolean;
};

const MAX_PUBLISHED = 8;

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

// ─── Progress Bar ─────────────────────────────────────────────────────────────

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

// ─── Upload Modal ─────────────────────────────────────────────────────────────

function UploadModal({
  onUploaded, onClose, defaultCategory,
}: {
  onUploaded: (img: UploadedImage) => void;
  onClose: () => void;
  defaultCategory: string;
}) {
  const [file, setFile]           = useState<File | null>(null);
  const [preview, setPreview]     = useState<string | null>(null);
  const [category, setCategory]   = useState(defaultCategory);
  const [title, setTitle]         = useState("");
  const [progress, setProgress]   = useState(0);
  const [uploading, setUploading] = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState<string | null>(null);
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

    let sim = 0;
    const interval = setInterval(() => {
      sim = Math.min(sim + Math.random() * 10, 85);
      setProgress(Math.round(sim));
    }, 350);

    try {
      const req = await requestGaleriaUpload({
        fileName:    file.name,
        contentType: file.type,
        size:        file.size,
        category,
      });

      if (req.error || !req.signedUrl || !req.token || !req.path) {
        clearInterval(interval);
        setError(req.error ?? "No se pudo iniciar la subida");
        setUploading(false);
        setProgress(0);
        return;
      }

      const upErr = await uploadFileToSignedUrl("gallery", req.path, req.token, file);
      if (upErr.error) {
        clearInterval(interval);
        setError(upErr.error);
        setUploading(false);
        setProgress(0);
        return;
      }

      const result = await confirmGaleriaUpload({
        path: req.path,
        category,
        title: title.trim(),
      });
      clearInterval(interval);

      if (result.error) {
        setError(result.error);
        setUploading(false);
        setProgress(0);
        return;
      }

      setProgress(100);
      setDone(true);
      setTimeout(() => { onUploaded(result.image!); }, 500);
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
          <div>
            <h3 className="font-serif text-[1.1rem] text-negro">Subir imagen</h3>
            <p className="text-[0.72rem] text-gris mt-0.5">
              Se guardará en <span className="font-medium text-negro/60">Archivadas</span> — publica cuando quieras
            </p>
          </div>
          {!uploading && (
            <button onClick={onClose} className="p-1 text-gris hover:text-negro transition-colors">
              <X size={18} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            onClick={() => !uploading && fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors
              ${uploading ? "cursor-default" : "cursor-pointer hover:border-dorado/50"}
              ${file ? "border-dorado/40 bg-dorado/5" : "border-negro/15"}`}
          >
            {done ? (
              <div className="flex flex-col items-center gap-2 text-verde-bosque py-2">
                <CheckCircle2 size={28} />
                <p className="text-[0.83rem] font-medium">¡Guardada en Archivadas!</p>
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
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
            className="hidden" onChange={pickFile} />

          {uploading && (
            <div className="space-y-1.5">
              <ProgressBar pct={progress} />
              <p className="text-[0.72rem] text-gris text-right">{progress}%</p>
            </div>
          )}

          <div>
            <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Categoría *</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              disabled={uploading} className={inputCls}>
              {CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Título (opcional)</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              disabled={uploading} placeholder="Descripción de la foto…" className={inputCls} />
          </div>

          {error && (
            <p className="text-[0.78rem] text-rojo bg-rojo/5 border border-rojo/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            {!uploading && !done && (
              <button type="button" onClick={onClose}
                className="px-4 py-2 text-[0.8rem] text-gris border border-negro/15 rounded-lg hover:bg-negro/5">
                Cancelar
              </button>
            )}
            <button type="submit" disabled={uploading || done || !file}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-dorado text-blanco
                text-[0.8rem] font-medium rounded-lg hover:bg-dorado/90 disabled:opacity-40 transition-colors">
              {uploading
                ? <><Loader2 size={13} className="animate-spin" /> Subiendo…</>
                : <><Upload size={13} /> Subir</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Sortable Photo Card (published · desktop dnd) ────────────────────────────

function SortablePhotoCard({ image, categoryCountLabel, onArchive, isPending }: {
  image: GaleriaImage;
  /** Shown when viewing "Todas" — e.g. "Bodas 3/8" */
  categoryCountLabel: string | null;
  onArchive: () => void;
  isPending: boolean;
}) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: image.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity:  isDragging ? 0.45 : 1,
    zIndex:   isDragging ? 20 : "auto",
    position: "relative",
  };

  return (
    <div ref={setNodeRef} style={style}
      className="group aspect-[4/3] rounded-xl overflow-hidden ring-1 ring-negro/10 bg-negro/5">
      {/* Drag handle */}
      <button {...attributes} {...listeners} tabIndex={-1}
        className="absolute top-1.5 left-1.5 z-10 p-1 rounded bg-negro/55 text-blanco
          opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
        title="Arrastrar para reordenar">
        <GripVertical size={12} />
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.url} alt={image.title ?? ""}
        className="w-full h-full object-cover pointer-events-none select-none"
        loading="lazy" draggable={false} />

      <div className="absolute inset-0 bg-negro/0 group-hover:bg-negro/35 transition-colors pointer-events-none" />

      {/* Desactivar */}
      <button onClick={onArchive} disabled={isPending}
        className="absolute top-1.5 right-1.5 z-10 p-1.5 rounded-lg bg-negro/60 text-blanco
          opacity-0 group-hover:opacity-100 hover:bg-negro/80 disabled:opacity-30 transition-all"
        title="Desactivar">
        <EyeOff size={12} />
      </button>

      {/* Bottom badges */}
      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-end justify-between gap-1 pointer-events-none">
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded
          bg-verde-bosque/80 text-blanco text-[0.58rem] uppercase tracking-wider shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-blanco/70 shrink-0" />
          Publicada
        </div>
        {/* Category / count badge */}
        {categoryCountLabel ? (
          <div className="px-1.5 py-0.5 rounded bg-negro/55 text-blanco text-[0.58rem] font-medium tracking-wide truncate">
            {categoryCountLabel}
          </div>
        ) : image.category ? (
          <div className="px-1.5 py-0.5 rounded bg-negro/45 text-blanco text-[0.58rem] uppercase tracking-wider truncate">
            {CAT_LABEL[image.category] ?? image.category}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ─── Mobile Reorder Item ──────────────────────────────────────────────────────

function MobileReorderItem({ image, isFirst, isLast, onMoveUp, onMoveDown, onArchive, isPending }: {
  image: GaleriaImage;
  isFirst: boolean; isLast: boolean;
  onMoveUp: () => void; onMoveDown: () => void;
  onArchive: () => void; isPending: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-blanco rounded-xl border border-negro/[0.07]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.url} alt="" className="w-16 h-11 object-cover rounded-lg shrink-0" loading="lazy" />
      <div className="flex-1 min-w-0">
        <p className="text-[0.8rem] font-medium text-negro truncate">{image.title ?? "Sin título"}</p>
        <p className="text-[0.7rem] text-gris">{CAT_LABEL[image.category ?? ""] ?? image.category ?? ""}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onMoveUp} disabled={isFirst || isPending}
          className="p-1.5 rounded-lg bg-negro/5 hover:bg-negro/10 disabled:opacity-25 transition-colors">
          <ArrowUp size={13} />
        </button>
        <button onClick={onMoveDown} disabled={isLast || isPending}
          className="p-1.5 rounded-lg bg-negro/5 hover:bg-negro/10 disabled:opacity-25 transition-colors">
          <ArrowDown size={13} />
        </button>
        <button onClick={onArchive} disabled={isPending}
          className="p-1.5 rounded-lg bg-negro/5 hover:bg-rojo/10 text-gris hover:text-rojo disabled:opacity-25 transition-colors"
          title="Desactivar">
          <EyeOff size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Published Section ────────────────────────────────────────────────────────

function PublishedSection({
  items, filterCategory, filterCount, filterAtLimit,
  publishedCountByCategory, onArchive, onReorder, isPending,
}: {
  items: GaleriaImage[];
  /** null = "Todas" */
  filterCategory: string | null;
  /** Published count for the active category (or total if "Todas") */
  filterCount: number;
  filterAtLimit: boolean;
  publishedCountByCategory: Record<string, number>;
  onArchive: (id: string) => void;
  onReorder: (reordered: GaleriaImage[]) => void;
  isPending: boolean;
}) {
  const [mobileReorder, setMobileReorder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex(i => i.id === active.id);
    const newIdx = items.findIndex(i => i.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    onReorder(arrayMove(items, oldIdx, newIdx));
  }

  function handleMobileMove(idx: number, dir: -1 | 1) {
    const next = idx + dir;
    if (next < 0 || next >= items.length) return;
    onReorder(arrayMove(items, idx, next));
  }

  const catLabel = filterCategory ? (CAT_LABEL[filterCategory] ?? filterCategory) : null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-[0.92rem] font-semibold text-negro tracking-[-0.01em]">
            Publicadas en el sitio
            {filterCategory ? (
              <span className="ml-2 text-[0.75rem] font-normal text-gris font-sans">
                {catLabel} · {filterCount}/{MAX_PUBLISHED}
              </span>
            ) : (
              <span className="ml-2 text-[0.75rem] font-normal text-gris font-sans">
                {filterCount} total
              </span>
            )}
          </h3>
          {filterAtLimit && catLabel && (
            <p className="flex items-center gap-1 text-[0.74rem] text-dorado mt-0.5">
              <AlertCircle size={12} className="shrink-0" />
              Límite de {MAX_PUBLISHED} fotos alcanzado para {catLabel}. Desactiva una para publicar otra.
            </p>
          )}
        </div>
        {items.length > 1 && (
          <button
            onClick={() => setMobileReorder(v => !v)}
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-[0.75rem]
              border border-negro/15 rounded-lg text-gris hover:bg-negro/5 transition-colors">
            <List size={13} />
            {mobileReorder ? "Cuadrícula" : "Reordenar"}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-negro/[0.03] rounded-xl p-8 text-center border border-dashed border-negro/10">
          <ImageIcon size={24} className="text-negro/10 mx-auto mb-2" />
          <p className="text-gris text-[0.82rem]">
            {filterCategory
              ? `Sin fotos publicadas en ${catLabel}.`
              : "Sin fotos publicadas."}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile list (reorder mode) */}
          {mobileReorder && (
            <div className="space-y-2 md:hidden">
              {items.map((img, idx) => (
                <MobileReorderItem
                  key={img.id} image={img}
                  isFirst={idx === 0} isLast={idx === items.length - 1}
                  onMoveUp={() => handleMobileMove(idx, -1)}
                  onMoveDown={() => handleMobileMove(idx, 1)}
                  onArchive={() => onArchive(img.id)}
                  isPending={isPending}
                />
              ))}
            </div>
          )}

          {/* DnD grid */}
          <div className={mobileReorder ? "hidden md:block" : ""}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {items.map(img => {
                    // Badge "Bodas 3/8" solo cuando se ven todas las categorías
                    const cat    = img.category ?? "general";
                    const count  = publishedCountByCategory[cat] ?? 0;
                    const atCatLimit = count >= MAX_PUBLISHED;
                    const countLabel = filterCategory === null
                      ? `${CAT_LABEL[cat] ?? cat} ${count}/${MAX_PUBLISHED}${atCatLimit ? " ⚠" : ""}`
                      : null;
                    return (
                      <SortablePhotoCard
                        key={img.id} image={img}
                        categoryCountLabel={countLabel}
                        onArchive={() => onArchive(img.id)}
                        isPending={isPending}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
            {items.length > 1 && (
              <p className="hidden md:block text-[0.7rem] text-gris/50 mt-2">
                Arrastra las fotos para cambiar el orden en el slider
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Archived Photo Card ──────────────────────────────────────────────────────

function ArchivedPhotoCard({ image, canPublish, blockedByCategory, onPublish, onDelete, isPending }: {
  image: GaleriaImage;
  canPublish: boolean;
  /** Category name that is at limit — shown in disabled tooltip */
  blockedByCategory: string | null;
  onPublish: () => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  const [confirmDel, setConfirmDel] = useState(false);

  const publishTitle = canPublish
    ? "Publicar esta foto"
    : `${blockedByCategory ?? "Esta categoría"} ya tiene ${MAX_PUBLISHED} fotos — desactiva una primero`;

  return (
    <div className="group relative aspect-[4/3] rounded-xl overflow-hidden ring-1 ring-negro/10 bg-negro/5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.url} alt={image.title ?? ""}
        className="w-full h-full object-cover grayscale pointer-events-none select-none"
        loading="lazy" />

      <div className="absolute inset-0 bg-negro/0 group-hover:bg-negro/55 transition-colors" />

      {/* Actions on hover */}
      <div className="absolute inset-0 flex flex-col items-stretch justify-center gap-2 px-3
        opacity-0 group-hover:opacity-100 transition-opacity">
        {confirmDel ? (
          <div className="bg-negro/75 backdrop-blur-sm rounded-xl p-3 text-center space-y-2">
            <p className="text-blanco text-[0.72rem] font-medium">¿Eliminar definitivamente?</p>
            <div className="flex gap-2 justify-center">
              <button onClick={onDelete} disabled={isPending}
                className="px-3 py-1 bg-rojo text-blanco text-[0.72rem] rounded-lg
                  hover:bg-rojo/80 disabled:opacity-40 transition-colors inline-flex items-center gap-1">
                {isPending && <Loader2 size={11} className="animate-spin" />}
                Eliminar
              </button>
              <button onClick={() => setConfirmDel(false)} disabled={isPending}
                className="px-3 py-1 bg-blanco/20 text-blanco text-[0.72rem] rounded-lg hover:bg-blanco/30 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={canPublish ? onPublish : undefined}
              disabled={!canPublish || isPending}
              title={publishTitle}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl
                bg-blanco text-negro text-[0.75rem] font-medium
                hover:bg-dorado hover:text-blanco
                disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <Eye size={13} /> Publicar
            </button>
            <button
              onClick={() => setConfirmDel(true)} disabled={isPending}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl
                bg-blanco/15 text-blanco text-[0.75rem] font-medium
                hover:bg-rojo/80 disabled:opacity-40 transition-colors">
              <Trash2 size={13} /> Eliminar
            </button>
          </>
        )}
      </div>

      {/* Badge archivada */}
      <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded
        bg-negro/45 text-blanco/70 text-[0.58rem] uppercase tracking-wider pointer-events-none">
        Archivada
      </div>

      {/* Badge categoría */}
      {image.category && (
        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded
          bg-negro/40 text-blanco text-[0.58rem] uppercase tracking-wider pointer-events-none">
          {CAT_LABEL[image.category] ?? image.category}
        </div>
      )}
    </div>
  );
}

// ─── Archived Section ─────────────────────────────────────────────────────────

function ArchivedSection({ items, publishedCountByCategory, onPublish, onDelete, isPending }: {
  items: GaleriaImage[];
  publishedCountByCategory: Record<string, number>;
  onPublish: (id: string) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-[0.92rem] font-semibold text-negro tracking-[-0.01em]">
        Archivadas
        <span className="ml-2 text-[0.75rem] font-normal text-gris font-sans">{items.length}</span>
      </h3>

      {items.length === 0 ? (
        <div className="bg-negro/[0.03] rounded-xl p-8 text-center border border-dashed border-negro/10">
          <p className="text-gris text-[0.82rem]">Sin fotos archivadas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map(img => {
            const cat       = img.category ?? "general";
            const catCount  = publishedCountByCategory[cat] ?? 0;
            const canPublish = catCount < MAX_PUBLISHED;
            const blockedBy  = !canPublish ? (CAT_LABEL[cat] ?? cat) : null;
            return (
              <ArchivedPhotoCard
                key={img.id} image={img}
                canPublish={canPublish}
                blockedByCategory={blockedBy}
                onPublish={() => onPublish(img.id)}
                onDelete={() => onDelete(img.id)}
                isPending={isPending}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Manager ─────────────────────────────────────────────────────────────

export function GaleriaManager({ images: initial }: { images: GaleriaImage[] }) {
  const [images, setImages]         = useState(initial);
  const [filter, setFilter]         = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Count published per category (all categories, ignores UI filter)
  const publishedCountByCategory = images
    .filter(i => i.is_published)
    .reduce<Record<string, number>>((acc, img) => {
      const cat = img.category ?? "general";
      acc[cat] = (acc[cat] ?? 0) + 1;
      return acc;
    }, {});

  const totalPublished = images.filter(i => i.is_published).length;

  // Sorted published list (global)
  const allPublished = [...images.filter(i => i.is_published)].sort((a, b) => a.sort_order - b.sort_order);
  const allArchived  = images.filter(i => !i.is_published);

  // Filtered for display
  const filteredPublished = filter === "all" ? allPublished : allPublished.filter(i => i.category === filter);
  const filteredArchived  = filter === "all" ? allArchived  : allArchived.filter(i => i.category === filter);

  // Limit info for the active filter category
  const filterCount    = filter === "all"
    ? totalPublished
    : (publishedCountByCategory[filter] ?? 0);
  const filterAtLimit  = filter !== "all" && filterCount >= MAX_PUBLISHED;

  function handleUploaded(img: UploadedImage) {
    setImages(prev => [{ ...img, is_published: false }, ...prev]);
    setShowUpload(false);
  }

  function handleArchive(id: string) {
    startTransition(async () => {
      await updateGaleriaImage(id, { is_published: false });
      setImages(prev => prev.map(i => i.id === id ? { ...i, is_published: false } : i));
    });
  }

  function handlePublish(id: string) {
    const img = images.find(i => i.id === id);
    if (!img) return;
    const cat = img.category ?? "general";
    if ((publishedCountByCategory[cat] ?? 0) >= MAX_PUBLISHED) return; // guard per-category
    startTransition(async () => {
      await updateGaleriaImage(id, { is_published: true });
      setImages(prev => prev.map(i => i.id === id ? { ...i, is_published: true } : i));
    });
  }

  function handleDelete(id: string) {
    const img = images.find(i => i.id === id);
    if (!img) return;
    startTransition(async () => {
      await deleteGaleriaImage(id, img.url);
      setImages(prev => prev.filter(i => i.id !== id));
    });
  }

  function handleReorder(reordered: GaleriaImage[]) {
    const updates    = reordered.map((item, idx) => ({ id: item.id, sort_order: idx * 10 }));
    const updatedMap = new Map(updates.map(u => [u.id, u.sort_order]));
    setImages(prev =>
      prev.map(i => {
        const next = updatedMap.get(i.id);
        return next !== undefined ? { ...i, sort_order: next } : i;
      }),
    );
    startTransition(async () => { await reorderGaleriaImages(updates); });
  }

  return (
    <>
      {showUpload && (
        <UploadModal
          onUploaded={handleUploaded}
          onClose={() => setShowUpload(false)}
          defaultCategory={filter === "all" ? "general" : filter}
        />
      )}

      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-[1.9rem] text-negro tracking-[-0.03em]">
              <span className="text-dorado">Galería</span>
            </h2>
            <p className="text-gris text-[0.88rem] mt-1">
              {images.length} imagen{images.length !== 1 ? "es" : ""} ·{" "}
              {totalPublished} publicadas · {allArchived.length} archivadas
            </p>
          </div>
          <button onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-dorado text-blanco
              text-[0.8rem] font-medium rounded-xl hover:bg-dorado/90 transition-colors">
            <Upload size={15} /> Subir imagen
          </button>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {[{ value: "all", label: "Todas" }, ...CATS].map(c => (
            <button key={c.value} onClick={() => setFilter(c.value)}
              className={`px-3 py-1.5 rounded-lg text-[0.78rem] font-medium transition-colors border ${
                filter === c.value
                  ? "bg-dorado text-blanco border-dorado"
                  : "bg-blanco text-gris border-negro/10 hover:border-dorado/30"
              }`}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Published */}
        <PublishedSection
          items={filteredPublished}
          filterCategory={filter === "all" ? null : filter}
          filterCount={filterCount}
          filterAtLimit={filterAtLimit}
          publishedCountByCategory={publishedCountByCategory}
          onArchive={handleArchive}
          onReorder={handleReorder}
          isPending={isPending}
        />

        {/* Divider */}
        <div className="border-t border-negro/[0.07]" />

        {/* Archived */}
        <ArchivedSection
          items={filteredArchived}
          publishedCountByCategory={publishedCountByCategory}
          onPublish={handlePublish}
          onDelete={handleDelete}
          isPending={isPending}
        />
      </div>
    </>
  );
}
