"use client";

import { useRef, useState, useTransition } from "react";
import {
  Plus, Pencil, Trash2, Loader2, Upload, Megaphone,
  Eye, EyeOff, Calendar,
} from "lucide-react";
import {
  createPromocion, updatePromocion, deletePromocion, togglePromocionActiva,
  type PromocionRow,
} from "@/app/actions/editor/promociones";
import { uploadToColombiaHosting } from "@/lib/uploads/colombia-hosting";

const IMG_MAX_BYTES = 5 * 1024 * 1024;
const IMG_ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

const inputCls =
  "w-full border border-negro/10 bg-crema/20 px-3 py-2.5 text-[0.83rem] text-negro rounded-lg focus:outline-none focus:border-dorado/70 transition-colors";

// ─── Estado de la promoción ────────────────────────────────────────────────────

function getEstado(promo: PromocionRow): { label: string; cls: string } {
  const today = new Date().toISOString().slice(0, 10);
  if (!promo.is_active)
    return { label: "Inactiva", cls: "bg-negro/5 text-gris border-negro/10" };
  if (promo.fecha_fin < today)
    return { label: "Vencida", cls: "bg-rojo/10 text-rojo border-rojo/20" };
  if (promo.fecha_inicio > today)
    return { label: "Programada", cls: "bg-dorado/10 text-dorado border-dorado/20" };
  return { label: "Activa", cls: "bg-verde-bosque/10 text-verde-bosque border-verde-bosque/20" };
}

function fmtDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("es-CO", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ─── Formulario ────────────────────────────────────────────────────────────────

function PromoForm({
  initial,
  nextOrder,
  onDone,
  onCancel,
}: {
  initial?: PromocionRow;
  nextOrder: number;
  onDone: (row: PromocionRow) => void;
  onCancel: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [imagenUrl, setImagenUrl] = useState<string | null>(initial?.imagen_url ?? null);
  const [fechaInicio, setFechaInicio] = useState(initial?.fecha_inicio ?? today);
  const [fechaFin, setFechaFin] = useState(initial?.fecha_fin ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? nextOrder);
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const imgRef = useRef<HTMLInputElement>(null);

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > IMG_MAX_BYTES) { setError("La imagen supera 5 MB"); return; }
    if (!IMG_ALLOWED_MIME.includes(f.type)) { setError("Solo JPG, PNG o WebP"); return; }
    setUploading(true);
    setError(null);
    const result = await uploadToColombiaHosting(f, "promociones");
    setUploading(false);
    if (result.error) {
      const isCors = result.error.toLowerCase().includes("fetch") || result.error.toLowerCase().includes("network");
      setError(
        isCors
          ? `No se pudo conectar con el servidor de archivos. Verifica que la carpeta 'promociones/' exista en Colombia Hosting y que el sitio esté activo. Detalle: ${result.error}`
          : `Error al subir imagen: ${result.error}`
      );
      return;
    }
    setImagenUrl(result.url!);
    if (imgRef.current) imgRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imagenUrl) { setError("La imagen es requerida"); return; }
    if (!fechaFin) { setError("La fecha de fin es requerida"); return; }
    if (fechaFin < fechaInicio) { setError("La fecha de fin debe ser posterior a la de inicio"); return; }
    startTransition(async () => {
      const data = { imagen_url: imagenUrl, fecha_inicio: fechaInicio, fecha_fin: fechaFin, sort_order: sortOrder, is_active: isActive };
      const res = initial
        ? await updatePromocion(initial.id, data)
        : await createPromocion(data);
      if (res.error) { setError(res.error); return; }
      onDone(res.row!);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-crema/40 border border-dorado/20 rounded-2xl p-5 space-y-4"
    >
      <h4 className="font-serif text-[0.95rem] text-negro">
        {initial ? "Editar promoción" : "Nueva promoción"}
      </h4>

      {/* Vista previa imagen */}
      <div className="flex items-start gap-4">
        <div className="w-28 h-20 rounded-lg overflow-hidden ring-1 ring-negro/10 bg-dorado/5 flex items-center justify-center shrink-0">
          {imagenUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagenUrl} alt="Promoción" className="w-full h-full object-cover" />
          ) : (
            <Megaphone size={22} className="text-dorado/30" />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <input
            ref={imgRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImage}
          />
          <button
            type="button"
            onClick={() => imgRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-negro/15 rounded-lg text-[0.78rem] text-negro hover:bg-negro/5 disabled:opacity-40 transition-colors"
          >
            {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {imagenUrl ? "Cambiar imagen" : "Subir imagen"}
          </button>
          {imagenUrl && (
            <button
              type="button"
              onClick={() => setImagenUrl(null)}
              className="text-[0.72rem] text-rojo hover:underline text-left"
            >
              Quitar imagen
            </button>
          )}
          <p className="text-[0.68rem] text-negro/35">JPG, PNG o WebP · máx 5 MB</p>
        </div>
      </div>

      {/* Fechas y orden */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">
            Fecha inicio *
          </label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">
            Fecha fin *
          </label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            required
            min={fechaInicio}
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">
            Orden
          </label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            min={0}
            className={inputCls}
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-dorado"
            />
            <span className="text-[0.83rem] text-negro">Activa</span>
          </label>
        </div>
      </div>

      {error && <p className="text-[0.78rem] text-rojo">{error}</p>}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 text-[0.8rem] text-gris border border-negro/15 rounded-lg hover:bg-negro/5"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending || uploading}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-dorado text-blanco text-[0.8rem] font-medium rounded-lg hover:bg-dorado/90 disabled:opacity-50"
        >
          {isPending && <Loader2 size={12} className="animate-spin" />}
          {isPending ? "Guardando…" : initial ? "Actualizar" : "Crear"}
        </button>
      </div>
    </form>
  );
}

// ─── Manager ───────────────────────────────────────────────────────────────────

export function PromocionesManager({ promos: initial }: { promos: PromocionRow[] }) {
  const [promos, setPromos] = useState<PromocionRow[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const nextOrder = promos.length > 0 ? Math.max(...promos.map((p) => p.sort_order)) + 1 : 0;

  function handleCreated(row: PromocionRow) {
    setPromos((prev) => [...prev, row].sort((a, b) => a.sort_order - b.sort_order));
    setShowForm(false);
  }

  function handleUpdated(row: PromocionRow) {
    setPromos((prev) => prev.map((p) => (p.id === row.id ? row : p)).sort((a, b) => a.sort_order - b.sort_order));
    setEditId(null);
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deletePromocion(id);
      setPromos((prev) => prev.filter((p) => p.id !== id));
      setConfirmDelete(null);
    });
  }

  function handleToggle(id: string, isActive: boolean) {
    startTransition(async () => {
      await togglePromocionActiva(id, isActive);
      setPromos((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: isActive } : p)));
    });
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-[1.9rem] text-negro tracking-[-0.03em]">
            <span className="text-dorado">Promociones</span>
          </h2>
          <p className="text-gris text-[0.88rem] mt-1">{promos.length} banner{promos.length !== 1 ? "es" : ""}</p>
        </div>
        {!showForm && !editId && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-dorado text-blanco text-[0.8rem] font-medium rounded-xl hover:bg-dorado/90 transition-colors"
          >
            <Plus size={15} /> Nueva promoción
          </button>
        )}
      </div>

      {showForm && (
        <PromoForm
          nextOrder={nextOrder}
          onDone={handleCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Lista */}
      <div className="space-y-3">
        {promos.length === 0 && !showForm ? (
          <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-10 text-center">
            <Megaphone size={32} className="text-dorado/30 mx-auto mb-3" />
            <p className="text-gris text-[0.85rem]">Sin promociones. Crea el primero.</p>
          </div>
        ) : promos.map((promo) => {
          if (editId === promo.id) {
            return (
              <PromoForm
                key={promo.id}
                initial={promo}
                nextOrder={nextOrder}
                onDone={handleUpdated}
                onCancel={() => setEditId(null)}
              />
            );
          }
          const estado = getEstado(promo);
          return (
            <div
              key={promo.id}
              className={`bg-blanco rounded-2xl border border-negro/[0.07] px-5 py-4 ${!promo.is_active ? "opacity-60" : ""}`}
            >
              <div className="flex items-center gap-4">
                {/* Miniatura */}
                <div className="w-20 h-14 rounded-lg overflow-hidden bg-dorado/5 flex items-center justify-center shrink-0 ring-1 ring-negro/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={promo.imagen_url} alt="Banner" className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[0.62rem] px-1.5 py-0.5 rounded border ${estado.cls}`}
                    >
                      {estado.label}
                    </span>
                    <span className="text-[0.68rem] text-negro/35">Orden: {promo.sort_order}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[0.78rem] text-negro/60">
                    <Calendar size={11} className="shrink-0" />
                    <span>{fmtDate(promo.fecha_inicio)} → {fmtDate(promo.fecha_fin)}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => handleToggle(promo.id, !promo.is_active)}
                    disabled={isPending}
                    title={promo.is_active ? "Desactivar" : "Activar"}
                    className="p-1.5 text-negro/25 hover:text-negro hover:bg-negro/5 rounded-lg transition-colors disabled:opacity-40"
                  >
                    {promo.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={() => setEditId(promo.id)}
                    className="p-1.5 text-negro/25 hover:text-negro hover:bg-negro/5 rounded-lg transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  {confirmDelete === promo.id ? (
                    <div className="flex items-center gap-1 text-[0.74rem] ml-1">
                      <button
                        onClick={() => handleDelete(promo.id)}
                        disabled={isPending}
                        className="text-rojo font-medium hover:underline disabled:opacity-50"
                      >
                        {isPending ? <Loader2 size={12} className="animate-spin" /> : "Sí"}
                      </button>
                      <span className="text-negro/20">/</span>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-gris hover:underline"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(promo.id)}
                      className="p-1.5 text-negro/25 hover:text-rojo hover:bg-rojo/5 rounded-lg transition-colors"
                    >
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
