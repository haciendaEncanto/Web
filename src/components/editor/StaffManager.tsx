"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  Plus, Pencil, Trash2, Loader2, Upload, User,
  ChevronUp, ChevronDown, Eye, EyeOff, Users, Handshake,
} from "lucide-react";
import {
  createStaffMember, updateStaffMember, deleteStaffMember,
  toggleStaffActive, moveStaffMember,
  requestStaffPhotoUpload, confirmStaffPhotoUpload,
  type StaffData, type StaffRow,
} from "@/app/actions/editor/staff";
import { uploadToHosting } from "@/lib/uploads/client";

const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const PHOTO_ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

const TIPO_OPTIONS = [
  {
    aliado: false,
    label: "Interno",
    desc: "Forma parte del equipo de la hacienda (aparece en “Nuestro Equipo”)",
    Icon: Users,
  },
  {
    aliado: true,
    label: "Aliado externo",
    desc: "Proveedor o colaborador externo (aparece en “Con quienes confiamos tu momento especial”)",
    Icon: Handshake,
  },
] as const;

const inputCls =
  "w-full border border-negro/10 bg-crema/20 px-3 py-2.5 text-[0.83rem] text-negro rounded-lg focus:outline-none focus:border-dorado/70 transition-colors";

// ─── Formulario ────────────────────────────────────────────────────────────────

function StaffForm({
  initial,
  onDone,
  onCancel,
}: {
  initial?: StaffRow;
  onDone: (row: StaffRow) => void;
  onCancel: () => void;
}) {
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [cargo, setCargo] = useState(initial?.cargo ?? "");
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? "");
  const [frase, setFrase] = useState(initial?.frase ?? "");
  const [isAliado, setIsAliado] = useState(initial?.is_aliado_externo ?? false);
  const [fotoUrl, setFotoUrl] = useState<string | null>(initial?.foto_url ?? null);
  // Foto seleccionada pero aún no subida — se sube a Colombia Hosting al guardar
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Si la creación tuvo éxito pero falló la foto, reintentar como update (sin duplicar)
  const [savedId, setSavedId] = useState<string | null>(initial?.id ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (photoRef.current) photoRef.current.value = "";
    if (!f) return;
    if (f.size > PHOTO_MAX_BYTES) { setError("La foto supera 5 MB"); return; }
    if (!PHOTO_ALLOWED_MIME.includes(f.type)) { setError("Solo JPG, PNG o WebP"); return; }

    setError(null);
    setPendingFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  function clearPhoto() {
    setPendingFile(null);
    setPreviewUrl(null);
    setFotoUrl(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const data: StaffData = {
      nombre,
      cargo,
      descripcion: descripcion.trim() || null,
      foto_url: fotoUrl,
      is_aliado_externo: isAliado,
      frase: isAliado ? frase.trim() || null : null,
    };
    startTransition(async () => {
      try {
        // 1) Subir la foto primero: si falla, no se crea/modifica el registro
        let uploadedUrl: string | null = null;
        if (pendingFile) {
          const req = await requestStaffPhotoUpload({
            fileName: pendingFile.name,
            contentType: pendingFile.type,
            size: pendingFile.size,
          });
          if (req.error || !req.uploadUrl || !req.token || !req.folder) {
            setError(req.error ?? "No se pudo iniciar la subida");
            return;
          }
          const up = await uploadToHosting(req.uploadUrl, req.token, req.folder, pendingFile);
          if (up.error || !up.url) { setError(up.error ?? "No se pudo subir la foto"); return; }
          uploadedUrl = up.url;
        }

        // 2) Guardar datos del miembro
        const res = savedId
          ? await updateStaffMember(savedId, data)
          : await createStaffMember(data);
        if (res.error || !res.row) { setError(res.error ?? "No se pudo guardar"); return; }
        setSavedId(res.row.id);

        // 3) Confirmar la foto → staff.foto_url
        if (uploadedUrl) {
          const conf = await confirmStaffPhotoUpload({ id: res.row.id, url: uploadedUrl });
          if (conf.error || !conf.row) { setError(conf.error ?? "No se pudo guardar la foto"); return; }
          onDone(conf.row);
          return;
        }
        onDone(res.row);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error inesperado");
      }
    });
  }

  const shownPhoto = previewUrl ?? fotoUrl;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-crema/40 border border-dorado/20 rounded-2xl p-5 space-y-3"
    >
      <h4 className="font-serif text-[0.95rem] text-negro">
        {initial ? "Editar miembro" : "Nuevo miembro del equipo"}
      </h4>

      {/* Foto */}
      <div className="flex items-center gap-3">
        <div className="relative w-16 h-16 rounded-full overflow-hidden ring-1 ring-negro/10 bg-dorado/10 flex items-center justify-center shrink-0">
          {shownPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shownPhoto} alt="Foto" className="w-full h-full object-cover" />
          ) : (
            <User size={24} className="text-dorado/40" />
          )}
          {isPending && pendingFile && (
            <div className="absolute inset-0 bg-negro/55 flex items-center justify-center">
              <Loader2 size={16} className="animate-spin text-blanco" />
            </div>
          )}
        </div>
        <input
          ref={photoRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handlePhoto}
        />
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => photoRef.current?.click()}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-negro/15 rounded-lg text-[0.78rem] text-negro hover:bg-negro/5 disabled:opacity-40 transition-colors"
          >
            <Upload size={13} />
            {shownPhoto ? "Cambiar foto" : "Subir foto"}
          </button>
          {pendingFile ? (
            <p className="text-[0.7rem] text-gris truncate max-w-[220px]">
              {pendingFile.name} — se subirá al guardar
            </p>
          ) : (
            <p className="text-[0.7rem] text-gris">JPG, PNG o WebP · máx. 5 MB</p>
          )}
          {shownPhoto && (
            <button
              type="button"
              onClick={clearPhoto}
              disabled={isPending}
              className="text-[0.72rem] text-rojo hover:underline text-left disabled:opacity-40"
            >
              Quitar foto
            </button>
          )}
        </div>
      </div>

      {/* Tipo de miembro */}
      <div>
        <p className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1.5">Tipo *</p>
        <div role="radiogroup" aria-label="Tipo de miembro" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TIPO_OPTIONS.map(({ aliado, label, desc, Icon }) => {
            const selected = isAliado === aliado;
            return (
              <button
                key={label}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setIsAliado(aliado)}
                className={[
                  "flex items-start gap-2.5 text-left rounded-xl border px-3 py-2.5 transition-colors",
                  selected
                    ? "border-dorado bg-dorado/10 ring-1 ring-dorado/40"
                    : "border-negro/10 bg-blanco hover:border-dorado/40",
                ].join(" ")}
              >
                <span
                  className={[
                    "mt-0.5 h-4 w-4 shrink-0 rounded-full border flex items-center justify-center",
                    selected ? "border-dorado" : "border-negro/25",
                  ].join(" ")}
                >
                  {selected && <span className="h-2 w-2 rounded-full bg-dorado" />}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-[0.82rem] font-medium text-negro">
                    <Icon size={14} className="text-dorado" /> {label}
                  </span>
                  <span className="block text-[0.72rem] text-gris mt-0.5 leading-snug">{desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Campos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">
            Nombre *
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className={inputCls}
            placeholder="Ej. Jonny Delgado"
          />
        </div>
        <div>
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">
            Cargo *
          </label>
          <input
            type="text"
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            required
            className={inputCls}
            placeholder="Ej. Wedding Planner"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">
            Reseña
          </label>
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className={inputCls}
            placeholder="Ej. Más de 10 años creando momentos únicos"
          />
        </div>

        {/* Frase (solo para aliados) */}
        {isAliado && (
          <div className="sm:col-span-2">
            <label className="block text-[0.68rem] text-gris uppercase tracking-wider mb-1">
              Frase / Leyenda
            </label>
            <input
              type="text"
              value={frase}
              onChange={(e) => setFrase(e.target.value)}
              className={inputCls}
              placeholder="Ej. Cada instante merece ser eterno"
            />
          </div>
        )}
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
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-dorado text-blanco text-[0.8rem] font-medium rounded-lg hover:bg-dorado/90 disabled:opacity-50"
        >
          {isPending && <Loader2 size={12} className="animate-spin" />}
          {isPending ? (pendingFile ? "Subiendo foto…" : "Guardando…") : "Guardar"}
        </button>
      </div>
    </form>
  );
}

// ─── Manager ───────────────────────────────────────────────────────────────────

export function StaffManager({ members: initial }: { members: StaffRow[] }) {
  const [members, setMembers] = useState<StaffRow[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreated(row: StaffRow) {
    setMembers((prev) => [...prev, row]);
    setShowForm(false);
  }

  function handleUpdated(row: StaffRow) {
    setMembers((prev) => prev.map((m) => (m.id === row.id ? row : m)));
    setEditId(null);
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteStaffMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      setConfirmDelete(null);
    });
  }

  function handleToggle(id: string, isActive: boolean) {
    startTransition(async () => {
      await toggleStaffActive(id, isActive);
      setMembers((prev) => prev.map((m) => m.id === id ? { ...m, is_active: isActive } : m));
    });
  }

  function handleMove(id: string, direction: "up" | "down") {
    startTransition(async () => {
      await moveStaffMember(id, direction);
      // Reorder local state
      setMembers((prev) => {
        const arr = [...prev];
        const idx = arr.findIndex((m) => m.id === id);
        const target = direction === "up" ? idx - 1 : idx + 1;
        if (target < 0 || target >= arr.length) return arr;
        [arr[idx].sort_order, arr[target].sort_order] = [arr[target].sort_order, arr[idx].sort_order];
        return [...arr].sort((a, b) => a.sort_order - b.sort_order);
      });
    });
  }

  const sorted = [...members].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-[1.9rem] text-negro tracking-[-0.03em]">
            <span className="text-dorado">Equipo</span>
          </h2>
          <p className="text-gris text-[0.88rem] mt-1">{members.length} miembros</p>
        </div>
        {!showForm && !editId && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-dorado text-blanco text-[0.8rem] font-medium rounded-xl hover:bg-dorado/90 transition-colors"
          >
            <Plus size={15} /> Agregar miembro
          </button>
        )}
      </div>

      {showForm && (
        <StaffForm onDone={handleCreated} onCancel={() => setShowForm(false)} />
      )}

      {/* Lista */}
      <div className="space-y-3">
        {sorted.length === 0 && !showForm ? (
          <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-10 text-center">
            <p className="text-gris text-[0.85rem]">Sin miembros. Agrega el primero.</p>
          </div>
        ) : sorted.map((m, idx) => {
          if (editId === m.id) {
            return (
              <StaffForm
                key={m.id}
                initial={m}
                onDone={handleUpdated}
                onCancel={() => setEditId(null)}
              />
            );
          }
          return (
            <div
              key={m.id}
              className={`bg-blanco rounded-2xl border border-negro/[0.07] px-5 py-4 ${!m.is_active ? "opacity-50" : ""}`}
            >
              <div className="flex items-center gap-4">
                {/* Flechas de orden */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => handleMove(m.id, "up")}
                    disabled={idx === 0 || isPending}
                    className="p-0.5 text-negro/25 hover:text-negro disabled:opacity-20 transition-colors"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => handleMove(m.id, "down")}
                    disabled={idx === sorted.length - 1 || isPending}
                    className="p-0.5 text-negro/25 hover:text-negro disabled:opacity-20 transition-colors"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>

                {/* Foto */}
                <div className="w-11 h-11 rounded-full overflow-hidden ring-1 ring-negro/10 bg-dorado/10 flex items-center justify-center shrink-0">
                  {m.foto_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.foto_url} alt={m.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} className="text-dorado/40" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-[0.9rem] font-medium text-negro leading-tight">{m.nombre}</p>
                    {m.is_aliado_externo && (
                      <span className="text-[0.6rem] px-1.5 py-0.5 rounded-full bg-dorado/10 text-dorado border border-dorado/25 font-medium shrink-0">
                        Aliado
                      </span>
                    )}
                  </div>
                  <p className="text-[0.78rem] mt-0.5" style={{ color: "#C9A84C" }}>{m.cargo}</p>
                  {m.descripcion && (
                    <p className="text-[0.75rem] text-negro/40 mt-0.5 truncate">{m.descripcion}</p>
                  )}
                  {m.frase && (
                    <p className="text-[0.72rem] text-negro/30 mt-0.5 truncate italic">&ldquo;{m.frase}&rdquo;</p>
                  )}
                </div>

                {/* Badges estado */}
                {!m.is_active && (
                  <span className="text-[0.65rem] px-1.5 py-0.5 rounded bg-negro/5 text-gris border border-negro/10 shrink-0">
                    Inactivo
                  </span>
                )}

                {/* Acciones */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => handleToggle(m.id, !m.is_active)}
                    disabled={isPending}
                    title={m.is_active ? "Desactivar" : "Activar"}
                    className="p-1.5 text-negro/25 hover:text-negro hover:bg-negro/5 rounded-lg transition-colors disabled:opacity-40"
                  >
                    {m.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={() => setEditId(m.id)}
                    className="p-1.5 text-negro/25 hover:text-negro hover:bg-negro/5 rounded-lg transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  {confirmDelete === m.id ? (
                    <div className="flex items-center gap-1 text-[0.74rem] ml-1">
                      <button
                        onClick={() => handleDelete(m.id)}
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
                      onClick={() => setConfirmDelete(m.id)}
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

      <p className="text-[0.75rem] text-negro/35 pt-1">
        Las fotos se suben a{" "}
        <code className="bg-negro/5 px-1 py-0.5 rounded">contenido.hacienda-encanto.com/galeria/staff/</code>
      </p>
    </div>
  );
}
