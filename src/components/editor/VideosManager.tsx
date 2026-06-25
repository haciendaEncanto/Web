"use client";

import { useState, useTransition, useRef } from "react";
import { Upload, Trash2, ToggleLeft, ToggleRight, Loader2, X } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { insertVideo, updateVideo, deleteVideo } from "@/app/actions/editor/videos";

type HeroVideo = {
  id: string; url: string; title: string | null;
  event_type: string | null; is_active: boolean;
};

const EVENT_TYPES = [
  { value: "", label: "Home (principal)" },
  { value: "boda", label: "Bodas" },
  { value: "quince", label: "Quinceañeras" },
  { value: "empresarial", label: "Empresarial" },
  { value: "revelacion", label: "Revelación de Género" },
];

const inputCls = "w-full border border-negro/10 bg-crema/20 px-3 py-2.5 text-[0.83rem] text-negro rounded-lg focus:outline-none focus:border-dorado/70 transition-colors";

function AddModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!file) { setError("Selecciona un video"); return; }
    setUploading(true);
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("videos").upload(path, file, {
        contentType: file.type,
      });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("videos").getPublicUrl(path);
      const { error: insErr } = await insertVideo({
        url: publicUrl, title, event_type: eventType || undefined,
      });
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
          <h3 className="font-serif text-[1.05rem] text-negro">Subir video</h3>
          <button onClick={onClose}><X size={18} className="text-gris" /></button>
        </div>

        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-negro/20 rounded-xl p-8 text-center cursor-pointer hover:border-dorado/50 transition-colors"
        >
          {file ? (
            <p className="text-[0.82rem] text-negro font-medium">{file.name}</p>
          ) : (
            <>
              <Upload size={28} className="text-gris/40 mx-auto mb-2" />
              <p className="text-[0.8rem] text-gris">MP4, WebM · máx 500 MB</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden"
          onChange={e => setFile(e.target.files?.[0] ?? null)} />

        <div>
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Título</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Página de destino *</label>
          <select value={eventType} onChange={e => setEventType(e.target.value)} className={inputCls}>
            {EVENT_TYPES.map(et => <option key={et.value} value={et.value}>{et.label}</option>)}
          </select>
        </div>

        {error && <p className="text-[0.78rem] text-rojo">{error}</p>}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-[0.8rem] text-gris border border-negro/15 rounded-lg">Cancelar</button>
          <button onClick={handleUpload} disabled={uploading}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-dorado text-blanco text-[0.8rem] font-medium rounded-lg hover:bg-dorado/90 disabled:opacity-50">
            {uploading && <Loader2 size={13} className="animate-spin" />}
            {uploading ? "Subiendo…" : "Subir video"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function VideosManager({ videos }: { videos: HeroVideo[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [isPending, startTransition] = useTransition();

  const EVENT_LABEL: Record<string, string> = Object.fromEntries(EVENT_TYPES.map(e => [e.value, e.label]));

  function handleToggle(v: HeroVideo) {
    startTransition(async () => { await updateVideo(v.id, { is_active: !v.is_active }); });
  }
  function handleDelete(id: string) {
    startTransition(async () => { await deleteVideo(id); });
  }

  return (
    <>
      {showAdd && <AddModal onClose={() => setShowAdd(false)} />}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-[1.9rem] text-negro tracking-[-0.03em]">
              <span className="text-dorado">Videos</span> Hero
            </h2>
            <p className="text-gris text-[0.88rem] mt-1">{videos.length} video{videos.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-dorado text-blanco text-[0.8rem] font-medium rounded-xl hover:bg-dorado/90 transition-colors">
            <Upload size={15} /> Subir video
          </button>
        </div>

        <div className="space-y-3">
          {videos.length === 0 ? (
            <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-12 text-center">
              <p className="text-gris text-[0.85rem]">Sin videos. Sube el primero.</p>
            </div>
          ) : videos.map((v) => (
            <div key={v.id}
              className={`bg-blanco rounded-2xl border border-negro/[0.07] px-5 py-4 flex items-center gap-4 ${!v.is_active ? "opacity-55" : ""}`}>
              <video src={v.url} className="w-24 h-14 object-cover rounded-lg shrink-0 bg-negro/5" muted />
              <div className="flex-1 min-w-0">
                <p className="text-[0.85rem] font-medium text-negro truncate">{v.title ?? "Sin título"}</p>
                <p className="text-[0.75rem] text-gris mt-0.5">
                  {EVENT_LABEL[v.event_type ?? ""] ?? "Home"}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => handleToggle(v)} disabled={isPending}
                  title={v.is_active ? "Desactivar" : "Activar"}
                  className="p-1.5 text-negro/30 hover:text-negro rounded-lg transition-colors disabled:opacity-50">
                  {v.is_active ? <ToggleRight size={18} className="text-green-600" /> : <ToggleLeft size={18} />}
                </button>
                <button onClick={() => handleDelete(v.id)} disabled={isPending}
                  className="p-1.5 text-negro/30 hover:text-rojo hover:bg-rojo/5 rounded-lg transition-colors disabled:opacity-50">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
