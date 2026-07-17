"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash2, Loader2, Map as MapIcon, Eye, EyeOff } from "lucide-react";
import {
  requestSalonMapUpload,
  confirmSalonMapUpload,
  toggleSalonMapActivo,
  deleteSalonMap,
} from "@/app/actions/salon-maps";
import { SALON_MAP_CAPACITIES, type SalonMapCapacity } from "@/lib/salon-map-capacities";
import { uploadFileToSignedUrl } from "@/lib/uploads/client";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png"];

export type SalonMap = {
  id: string;
  name: string;
  image_url: string;
  min_guests: number;
  max_guests: number;
  is_active: boolean;
};

function rangeLabel(min: number, max: number): string {
  return min === max ? `${min} invitados` : `${min}–${max} invitados`;
}

function capacityLabel(c: SalonMapCapacity): string {
  return c === "120-150" ? "120 – 150 (compartido)" : `${c} invitados`;
}

function UploadForm({ onDone, onCancel }: { onDone: (map: SalonMap) => void; onCancel: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState<SalonMapCapacity | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED_MIME.includes(f.type)) { setError("Solo se aceptan archivos JPG o PNG"); return; }
    if (f.size > MAX_BYTES) { setError("El archivo supera 10 MB"); return; }
    setError(null);
    setFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("El nombre del mapa es requerido"); return; }
    if (!capacity) { setError("Selecciona la capacidad"); return; }
    if (!file) { setError("Selecciona una imagen"); return; }

    setUploading(true);
    setError(null);
    try {
      const req = await requestSalonMapUpload({
        fileName: file.name, contentType: file.type, size: file.size,
      });
      if (req.error || !req.signedUrl || !req.token || !req.path) {
        setError(req.error ?? "No se pudo iniciar la subida");
        return;
      }
      const upErr = await uploadFileToSignedUrl("gallery", req.path, req.token, file);
      if (upErr.error) { setError(upErr.error); return; }

      const result = await confirmSalonMapUpload({ name: name.trim(), capacity, path: req.path });
      if (result.error || !result.map) { setError(result.error ?? "Error al guardar el mapa"); return; }

      onDone(result.map);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-crema/40 border border-dorado/20 rounded-2xl p-5 space-y-3">
      <h4 className="font-serif text-[0.95rem] text-negro">Subir nuevo mapa</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Nombre *</label>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Distribución 80 invitados" required
            className="w-full border border-negro/10 bg-blanco px-3 py-2.5 text-[0.83rem] text-negro rounded-lg focus:outline-none focus:border-dorado/70 transition-colors"
          />
        </div>
        <div>
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Capacidad *</label>
          <select
            value={capacity} onChange={(e) => setCapacity(e.target.value as SalonMapCapacity)} required
            className="w-full border border-negro/10 bg-blanco px-3 py-2.5 text-[0.83rem] text-negro rounded-lg focus:outline-none focus:border-dorado/70 transition-colors"
          >
            <option value="" disabled>Seleccionar…</option>
            {SALON_MAP_CAPACITIES.map((c) => (
              <option key={c} value={c}>{capacityLabel(c)}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">Imagen (JPG o PNG, máx. 10 MB) *</label>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png" onChange={handleFile}
          className="w-full text-[0.8rem] text-negro file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-dorado file:text-blanco file:text-[0.78rem] file:font-medium hover:file:bg-dorado/90" />
        {file && <p className="text-[0.72rem] text-gris mt-1">{file.name}</p>}
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
          {uploading ? "Subiendo…" : "Subir mapa"}
        </button>
      </div>
    </form>
  );
}

function MapCard({
  map,
  onToggled,
  onDeleted,
}: {
  map: SalonMap;
  onToggled: (id: string, isActive: boolean) => void;
  onDeleted: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirmDel, setConfirmDel] = useState(false);

  function handleToggle() {
    const next = !map.is_active;
    startTransition(async () => {
      const res = await toggleSalonMapActivo(map.id, next);
      if (!res.error) onToggled(map.id, next);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteSalonMap(map.id);
      if (!res.error) onDeleted(map.id);
    });
  }

  return (
    <div className={`bg-blanco rounded-2xl border overflow-hidden ${map.is_active ? "border-negro/[0.07]" : "border-negro/[0.07] opacity-60"}`}>
      <div className="relative aspect-[4/3] bg-negro/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={map.image_url} alt={map.name} className="w-full h-full object-cover" />
        <span className={`absolute top-2 right-2 inline-flex items-center text-[0.68rem] font-medium px-2 py-0.5 rounded-full border ${
          map.is_active
            ? "text-green-700 bg-green-50 border-green-200"
            : "text-gris bg-negro/5 border-negro/15"
        }`}>
          {map.is_active ? "Activo" : "Inactivo"}
        </span>
      </div>
      <div className="p-4 space-y-2">
        <p className="font-serif text-[0.95rem] text-negro leading-tight">{map.name}</p>
        <p className="text-[0.78rem] text-gris">{rangeLabel(map.min_guests, map.max_guests)}</p>
        <div className="flex items-center justify-between gap-2 pt-2">
          <button type="button" onClick={handleToggle} disabled={isPending}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[0.76rem] text-negro/70 border border-negro/15 rounded-lg hover:bg-negro/5 transition-colors disabled:opacity-50">
            {map.is_active ? <EyeOff size={12} /> : <Eye size={12} />}
            {map.is_active ? "Desactivar" : "Activar"}
          </button>
          {confirmDel ? (
            <div className="inline-flex items-center gap-1.5">
              <span className="text-[0.74rem] text-rojo">¿Eliminar?</span>
              <button onClick={handleDelete} disabled={isPending} className="text-[0.74rem] text-rojo font-medium hover:underline disabled:opacity-50">
                {isPending ? <Loader2 size={12} className="animate-spin" /> : "Sí"}
              </button>
              <button onClick={() => setConfirmDel(false)} className="text-[0.74rem] text-gris hover:underline">No</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDel(true)}
              className="p-1.5 text-negro/25 hover:text-rojo hover:bg-rojo/5 rounded-lg transition-colors">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function SalonMapasManager({ initialMaps }: { initialMaps: SalonMap[] }) {
  const [showForm, setShowForm] = useState(false);
  const [maps, setMaps] = useState(initialMaps);
  const router = useRouter();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-gris text-[0.85rem] max-w-md">
          Sube un mapa de distribución por cada capacidad. El cliente ve automáticamente el que corresponde a la cantidad de invitados de su evento.
        </p>
        {!showForm && (
          <button type="button" onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-dorado text-blanco text-[0.82rem] font-medium rounded-xl hover:bg-dorado/90 transition-colors shrink-0">
            <Upload size={15} />
            Subir nuevo mapa
          </button>
        )}
      </div>

      {showForm && (
        <UploadForm
          onDone={(map) => {
            setMaps((prev) => [map, ...prev]);
            setShowForm(false);
            router.refresh(); // sincroniza en background; la UI ya quedó actualizada arriba
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {maps.length === 0 && !showForm ? (
        <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-12 text-center">
          <MapIcon size={36} className="text-dorado/40 mx-auto mb-4" />
          <p className="font-serif text-[1.2rem] text-negro mb-2">Sin mapas aún</p>
          <p className="text-gris text-[0.85rem]">Sube el primer mapa de distribución del salón.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {maps.map((m) => (
            <MapCard
              key={m.id}
              map={m}
              onToggled={(id, isActive) => {
                setMaps((prev) => prev.map((map) => map.id === id ? { ...map, is_active: isActive } : map));
                router.refresh();
              }}
              onDeleted={(id) => {
                setMaps((prev) => prev.filter((map) => map.id !== id));
                router.refresh();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
