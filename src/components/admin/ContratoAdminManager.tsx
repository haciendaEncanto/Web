"use client";

import { useState, useRef, useTransition } from "react";
import { CheckCircle2, Loader2, Upload, Trash2, FileSignature } from "lucide-react";
import {
  saveClausula,
  saveHaciendaField,
  requestFirmaUpload,
  confirmFirmaUpload,
  deleteFirma,
} from "@/app/actions/admin/contrato";
import { uploadFileToSignedUrl } from "@/lib/uploads/client";
import {
  HACIENDA_CONTENT_KEYS,
  HACIENDA_FIELD_LABELS,
  HACIENDA_INFO,
  CLAUSULA_KEYS,
} from "@/lib/contract-items";

interface Props {
  clauses: Record<string, string | null>;
  firmaUrl: string | null;
  haciendaValues: Record<string, string | null>;
}

function ClausulEditor({ index, clausulaKey, initial }: { index: number; clausulaKey: string; initial: string }) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setErr("");
    setSaved(false);
    startTransition(async () => {
      const res = await saveClausula(clausulaKey, value);
      if (res.error) { setErr(res.error); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-negro/5 bg-crema/30 flex items-center justify-between gap-3">
        <h3 className="font-serif text-[0.92rem] text-negro tracking-[-0.01em]">
          Cláusula {index + 1}
        </h3>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-[0.73rem] text-green-600">
              <CheckCircle2 size={12} /> Guardado
            </span>
          )}
          {err && <span className="text-[0.73rem] text-rojo">{err}</span>}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dorado text-blanco text-[0.75rem] font-medium rounded-lg hover:bg-dorado/90 transition-colors disabled:opacity-50"
          >
            {isPending && <Loader2 size={11} className="animate-spin" />}
            {isPending ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
      <div className="p-5">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={5}
          className="w-full border border-negro/10 bg-crema/10 px-3 py-2.5 text-[0.83rem] text-negro rounded-lg focus:outline-none focus:border-dorado/70 transition-colors resize-y leading-relaxed"
          placeholder={`Texto de la cláusula ${index + 1}…`}
        />
      </div>
    </div>
  );
}

function HaciendaFieldEditor({
  fieldKey,
  contentKey,
  label,
  initial,
}: {
  fieldKey: keyof typeof HACIENDA_INFO;
  contentKey: string;
  label: string;
  initial: string;
}) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setErr("");
    setSaved(false);
    startTransition(async () => {
      const res = await saveHaciendaField(contentKey, value);
      if (res.error) { setErr(res.error); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div>
      <label className="block text-[0.7rem] text-gris uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 border border-negro/10 bg-crema/20 px-3 py-2 text-[0.83rem] text-negro rounded-lg focus:outline-none focus:border-dorado/70 transition-colors"
        />
        <button
          onClick={handleSave}
          disabled={isPending || value === initial}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-dorado text-blanco text-[0.75rem] font-medium rounded-lg hover:bg-dorado/90 transition-colors disabled:opacity-50 shrink-0"
        >
          {isPending && <Loader2 size={11} className="animate-spin" />}
          {saved ? <CheckCircle2 size={12} /> : null}
          {isPending ? "…" : saved ? "¡Listo!" : "Guardar"}
        </button>
      </div>
      {err && <p className="text-[0.73rem] text-rojo mt-1">{err}</p>}
    </div>
  );
}

function FirmaSection({ initial }: { initial: string | null }) {
  const [url, setUrl] = useState<string | null>(initial);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setErr("");
    setUploading(true);
    try {
      const req = await requestFirmaUpload({
        fileName: file.name,
        contentType: file.type,
        size: file.size,
      });
      if (req.error || !req.signedUrl || !req.token || !req.path) {
        setErr(req.error ?? "Error al solicitar URL de subida");
        return;
      }
      const { error: upErr } = await uploadFileToSignedUrl("avatars", req.path, req.token, file);
      if (upErr) { setErr(upErr); return; }

      const confirm = await confirmFirmaUpload(req.path);
      if (confirm.error) { setErr(confirm.error); return; }
      setUrl(confirm.url ?? null);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    setErr("");
    setDeleting(true);
    const res = await deleteFirma();
    setDeleting(false);
    if (res.error) { setErr(res.error); return; }
    setUrl(null);
  }

  return (
    <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-negro/5 bg-crema/30">
        <h3 className="font-serif text-[0.92rem] text-negro tracking-[-0.01em]">
          Firma del representante legal
        </h3>
        <p className="text-[0.73rem] text-gris mt-0.5">
          JPG, PNG o WebP · máx. 2 MB · fondo blanco recomendado
        </p>
      </div>
      <div className="p-5">
        {url ? (
          <div className="flex items-start gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="Firma"
              className="h-20 object-contain border border-negro/10 rounded-lg p-2 bg-white"
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-negro/15 text-[0.78rem] text-negro rounded-lg hover:bg-negro/5 transition-colors disabled:opacity-50"
              >
                <Upload size={13} /> Cambiar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-rojo/30 text-[0.78rem] text-rojo rounded-lg hover:bg-rojo/5 transition-colors disabled:opacity-50"
              >
                {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                Eliminar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex flex-col items-center justify-center gap-2 w-full h-28 border-2 border-dashed border-negro/15 rounded-xl hover:border-dorado/40 hover:bg-crema/20 transition-all text-gris text-[0.8rem] disabled:opacity-50"
          >
            {uploading ? (
              <><Loader2 size={22} className="animate-spin text-dorado" /> Subiendo…</>
            ) : (
              <><Upload size={22} className="text-negro/30" /> Subir firma</>
            )}
          </button>
        )}
        {err && <p className="text-[0.75rem] text-rojo mt-2">{err}</p>}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

export function ContratoAdminManager({ clauses, firmaUrl, haciendaValues }: Props) {
  const haciendaFields = Object.keys(HACIENDA_CONTENT_KEYS) as (keyof typeof HACIENDA_INFO)[];

  return (
    <div className="space-y-8">
      {/* Datos editables de la hacienda */}
      <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-negro/5 bg-crema/30 flex items-center gap-2">
          <FileSignature size={15} className="text-dorado" />
          <h3 className="font-serif text-[0.92rem] text-negro tracking-[-0.01em]">
            Datos de la hacienda
          </h3>
        </div>
        <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {haciendaFields.map((fieldKey) => {
            const contentKey = HACIENDA_CONTENT_KEYS[fieldKey];
            return (
              <HaciendaFieldEditor
                key={fieldKey}
                fieldKey={fieldKey}
                contentKey={contentKey}
                label={HACIENDA_FIELD_LABELS[fieldKey]}
                initial={haciendaValues[contentKey] ?? HACIENDA_INFO[fieldKey]}
              />
            );
          })}
        </div>
      </div>

      {/* Firma */}
      <FirmaSection initial={firmaUrl} />

      {/* Cláusulas */}
      <div>
        <h2 className="font-serif text-[1.2rem] text-negro tracking-[-0.02em] mb-4">
          Cláusulas del contrato
        </h2>
        <div className="space-y-4">
          {CLAUSULA_KEYS.map((key, i) => (
            <ClausulEditor
              key={key}
              index={i}
              clausulaKey={key}
              initial={clauses[key] ?? ""}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
