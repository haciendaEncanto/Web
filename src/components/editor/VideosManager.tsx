"use client";

import { useState, useRef, useTransition } from "react";
import { Upload, Trash2, ToggleLeft, ToggleRight, Loader2, Film, CheckCircle2 } from "lucide-react";
import { requestVideoUpload, confirmVideoUpload, activateVideo, deactivateVideo, deleteVideo, type UploadedVideo } from "@/app/actions/editor/videos";
import { uploadFileToSignedUrl } from "@/lib/uploads/client";

type HeroVideo = {
  id: string; url: string; title: string | null;
  event_type: string | null; is_active: boolean;
};

const EVENT_TYPES = [
  { value: "",            folder: "home",        label: "Home (principal)" },
  { value: "boda",        folder: "boda",        label: "Bodas" },
  { value: "quince",      folder: "quince",      label: "Quince Años" },
  { value: "empresarial", folder: "empresarial", label: "Eventos Empresariales" },
  { value: "revelacion",  folder: "revelacion",  label: "Revelación de Género" },
];

const EVENT_LABEL: Record<string, string> = Object.fromEntries(EVENT_TYPES.map(e => [e.value, e.label]));

const MAX_MB = 50;
const inputCls = "w-full border border-negro/10 bg-crema/20 px-3 py-2.5 text-[0.83rem] text-negro rounded-lg focus:outline-none focus:border-dorado/70 transition-colors";

// ─── Barra de progreso ────────────────────────────────────────────────────────

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="w-full bg-negro/8 rounded-full h-2 overflow-hidden">
      <div
        className="h-full bg-dorado rounded-full transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Formulario de upload ─────────────────────────────────────────────────────

function UploadForm({ onDone }: { onDone: (video: UploadedVideo) => void }) {
  const [file, setFile]             = useState<File | null>(null);
  const [eventType, setEventType]   = useState("");
  const [title, setTitle]           = useState("");
  const [activar, setActivar]       = useState(true);
  const [progress, setProgress]     = useState(0);
  const [uploading, setUploading]   = useState(false);
  const [done, setDone]             = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`El archivo supera el límite de ${MAX_MB} MB`);
      return;
    }
    setFile(f);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Selecciona un archivo de video"); return; }
    setUploading(true);
    setProgress(0);
    setError(null);

    // Simulación de progreso: avanza hasta 85 % mientras sube, luego salta a 100 %.
    let sim = 0;
    const interval = setInterval(() => {
      sim = Math.min(sim + Math.random() * 8, 85);
      setProgress(Math.round(sim));
    }, 400);

    try {
      const req = await requestVideoUpload({
        fileName:    file.name,
        contentType: file.type,
        size:        file.size,
        eventType,
      });

      if (req.error || !req.signedUrl || !req.token || !req.path) {
        clearInterval(interval);
        setError(req.error ?? "No se pudo iniciar la subida");
        setUploading(false);
        setProgress(0);
        return;
      }

      const upErr = await uploadFileToSignedUrl("videos", req.path, req.token, file);
      if (upErr.error) {
        clearInterval(interval);
        setError(upErr.error);
        setUploading(false);
        setProgress(0);
        return;
      }

      const result = await confirmVideoUpload({
        path:      req.path,
        eventType,
        title:     title.trim(),
        isActive:  activar,
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
      setTimeout(() => { onDone(result.video!); }, 600);
    } catch (err) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : "Error al subir el video");
      setUploading(false);
      setProgress(0);
    }
  }

  return (
    <form onSubmit={handleSubmit}
      className="bg-crema/40 border border-dorado/20 rounded-2xl p-5 space-y-4">
      <h4 className="font-serif text-[0.95rem] text-negro">Subir nuevo video</h4>

      {/* Dropzone */}
      <div
        onClick={() => !uploading && fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors
          ${uploading ? "cursor-default" : "cursor-pointer hover:border-dorado/50"}
          ${file ? "border-dorado/40 bg-dorado/5" : "border-negro/15"}`}
      >
        {done ? (
          <div className="flex flex-col items-center gap-2 text-verde-bosque">
            <CheckCircle2 size={28} />
            <p className="text-[0.82rem] font-medium">¡Subido correctamente!</p>
          </div>
        ) : file ? (
          <div className="flex items-center justify-center gap-3">
            <Film size={20} className="text-dorado shrink-0" />
            <div className="text-left min-w-0">
              <p className="text-[0.82rem] font-medium text-negro truncate">{file.name}</p>
              <p className="text-[0.72rem] text-gris">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
          </div>
        ) : (
          <>
            <Upload size={26} className="text-gris/40 mx-auto mb-2" />
            <p className="text-[0.82rem] text-gris font-medium">Haz clic para seleccionar</p>
            <p className="text-[0.73rem] text-gris/60 mt-0.5">MP4, WebM, MOV · máx {MAX_MB} MB</p>
          </>
        )}
      </div>
      <input
        ref={fileRef} type="file"
        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
        className="hidden" onChange={pickFile}
      />

      {/* Barra de progreso */}
      {uploading && (
        <div className="space-y-1.5">
          <ProgressBar pct={progress} />
          <p className="text-[0.73rem] text-gris text-right">{progress}%</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Página */}
        <div>
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">
            Esta página *
          </label>
          <select value={eventType} onChange={e => setEventType(e.target.value)}
            disabled={uploading} className={inputCls}>
            {EVENT_TYPES.map(et => (
              <option key={et.value} value={et.value}>{et.label}</option>
            ))}
          </select>
        </div>

        {/* Título */}
        <div>
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">
            Título (opcional)
          </label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            disabled={uploading} placeholder="Ej: Video boda 2026" className={inputCls} />
        </div>
      </div>

      {/* Toggle activar */}
      <label className="flex items-center gap-3 cursor-pointer select-none w-fit">
        <button
          type="button"
          role="switch"
          aria-checked={activar}
          disabled={uploading}
          onClick={() => setActivar(v => !v)}
          className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0
            ${activar ? "bg-dorado" : "bg-negro/20"}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 bg-blanco rounded-full shadow transition-all
            ${activar ? "left-5" : "left-0.5"}`} />
        </button>
        <span className="text-[0.83rem] text-negro">Activar inmediatamente</span>
        {activar && (
          <span className="text-[0.7rem] text-gris">
            (desactiva el video anterior de esta página)
          </span>
        )}
      </label>

      {error && <p className="text-[0.78rem] text-rojo">{error}</p>}

      <div className="flex justify-end gap-2">
        <button type="submit" disabled={uploading || done}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-dorado text-blanco
            text-[0.82rem] font-medium rounded-xl hover:bg-dorado/90 disabled:opacity-40 transition-colors">
          {uploading ? (
            <><Loader2 size={13} className="animate-spin" /> Subiendo…</>
          ) : (
            <><Upload size={13} /> Subir video</>
          )}
        </button>
      </div>
    </form>
  );
}

// ─── Tarjeta de video ─────────────────────────────────────────────────────────

function VideoCard({
  video,
  onToggle,
  onDelete,
  isPending,
}: {
  video: HeroVideo;
  onToggle: (v: HeroVideo) => void;
  onDelete: (v: HeroVideo) => void;
  isPending: boolean;
}) {
  const [confirmDel, setConfirmDel] = useState(false);

  return (
    <div className={`bg-blanco rounded-2xl border transition-all
      ${video.is_active ? "border-dorado/30 shadow-[0_0_0_1px_rgba(196,151,90,0.2)]" : "border-negro/[0.07]"}
      ${!video.is_active ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-4 p-4">

        {/* Preview */}
        <div className="w-32 h-[4.5rem] shrink-0 rounded-xl overflow-hidden bg-negro/5 relative">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={video.url}
            className="w-full h-full object-cover"
            muted
            preload="metadata"
          />
          {video.is_active && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500 shadow" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 py-0.5">
          <p className="text-[0.88rem] font-medium text-negro leading-tight truncate">
            {video.title ?? "Sin título"}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[0.7rem] px-2 py-0.5 rounded-full bg-dorado/10 text-dorado border border-dorado/20 font-medium">
              {EVENT_LABEL[video.event_type ?? ""] ?? "Home"}
            </span>
            {video.is_active ? (
              <span className="text-[0.7rem] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 font-medium">
                Activo
              </span>
            ) : (
              <span className="text-[0.7rem] px-2 py-0.5 rounded-full bg-negro/5 text-gris border border-negro/10">
                Inactivo
              </span>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggle(video)}
            disabled={isPending}
            title={video.is_active ? "Desactivar" : "Activar"}
            className="p-1.5 rounded-lg transition-colors disabled:opacity-40
              text-negro/30 hover:text-negro hover:bg-negro/5"
          >
            {video.is_active
              ? <ToggleRight size={20} className="text-green-600" />
              : <ToggleLeft size={20} />}
          </button>

          {confirmDel ? (
            <div className="flex items-center gap-1 text-[0.74rem] px-1">
              <button
                onClick={() => onDelete(video)}
                disabled={isPending}
                className="text-rojo font-medium hover:underline disabled:opacity-40"
              >
                {isPending ? <Loader2 size={12} className="animate-spin" /> : "Eliminar"}
              </button>
              <span className="text-gris/40">·</span>
              <button
                onClick={() => setConfirmDel(false)}
                className="text-gris hover:underline"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDel(true)}
              disabled={isPending}
              className="p-1.5 rounded-lg transition-colors disabled:opacity-40
                text-negro/30 hover:text-rojo hover:bg-rojo/5"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Manager principal ────────────────────────────────────────────────────────

export function VideosManager({ videos: initial }: { videos: HeroVideo[] }) {
  const [videos, setVideos]       = useState<HeroVideo[]>(initial);
  const [showForm, setShowForm]   = useState(false);
  const [isPending, startTrans]   = useTransition();

  function handleUploaded(video: UploadedVideo) {
    setVideos(prev => {
      // Si se activa, desactivar otros de la misma página en el estado local
      const updated = video.is_active
        ? prev.map(v =>
            v.event_type === video.event_type ? { ...v, is_active: false } : v
          )
        : prev;
      return [video, ...updated];
    });
    setShowForm(false);
  }

  function handleToggle(v: HeroVideo) {
    startTrans(async () => {
      if (v.is_active) {
        await deactivateVideo(v.id);
        setVideos(prev => prev.map(x => x.id === v.id ? { ...x, is_active: false } : x));
      } else {
        await activateVideo(v.id, v.event_type);
        setVideos(prev => prev.map(x => {
          if (x.id === v.id) return { ...x, is_active: true };
          if (x.event_type === v.event_type) return { ...x, is_active: false };
          return x;
        }));
      }
    });
  }

  function handleDelete(v: HeroVideo) {
    startTrans(async () => {
      await deleteVideo(v.id, v.url);
      setVideos(prev => prev.filter(x => x.id !== v.id));
    });
  }

  // Agrupar por página para mostrar en la lista
  const groups = EVENT_TYPES.map(et => ({
    ...et,
    items: videos.filter(v => (v.event_type ?? "") === et.value),
  })).filter(g => g.items.length > 0);

  return (
    <div className="space-y-6">

      {/* Cabecera */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-serif text-[1.9rem] text-negro tracking-[-0.03em]">
            <span className="text-dorado">Videos</span>
          </h2>
          <p className="text-gris text-[0.88rem] mt-1">
            {videos.length} video{videos.length !== 1 ? "s" : ""} · un activo por página
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-dorado text-blanco
              text-[0.8rem] font-medium rounded-xl hover:bg-dorado/90 transition-colors"
          >
            <Upload size={15} /> Subir nuevo video
          </button>
        )}
      </div>

      {/* Formulario de upload */}
      {showForm && <UploadForm onDone={handleUploaded} />}

      {/* Lista agrupada por página */}
      {videos.length === 0 && !showForm ? (
        <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-12 text-center">
          <Film size={32} className="text-negro/10 mx-auto mb-3" />
          <p className="text-gris text-[0.85rem]">Sin videos. Sube el primero.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(group => (
            <div key={group.value}>
              <p className="text-[0.7rem] uppercase tracking-widest text-gris/60 font-medium mb-2 px-0.5">
                {group.label}
              </p>
              <div className="space-y-2">
                {group.items.map(v => (
                  <VideoCard
                    key={v.id}
                    video={v}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    isPending={isPending}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
