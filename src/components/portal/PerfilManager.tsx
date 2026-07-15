"use client";

import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { requestOwnAvatarUpload, confirmOwnAvatarUpload } from "@/app/actions/portal/perfil";
import { uploadFileToSignedUrl } from "@/lib/uploads/client";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

export function PerfilManager({
  initial,
}: {
  initial: { full_name: string | null; email: string; avatar_url: string | null };
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatar_url);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initials = (initial.full_name ?? initial.email)
    .split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_BYTES) { setError("El archivo supera 2 MB"); return; }
    if (!ALLOWED_MIME.includes(f.type)) { setError("Solo se aceptan JPG, PNG y WebP"); return; }

    setUploading(true);
    setError(null);
    try {
      const req = await requestOwnAvatarUpload({ fileName: f.name, contentType: f.type, size: f.size });
      if (req.error || !req.signedUrl || !req.token || !req.path) {
        setError(req.error ?? "No se pudo iniciar la subida");
        return;
      }
      const upErr = await uploadFileToSignedUrl("avatars", req.path, req.token, f);
      if (upErr.error) { setError(upErr.error); return; }

      const result = await confirmOwnAvatarUpload(req.path);
      if (result.error) { setError(result.error); return; }
      setAvatarUrl(result.url ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h2 className="font-serif text-[1.9rem] text-negro tracking-[-0.03em]">
          <span className="text-dorado">Mi</span> perfil
        </h2>
        <p className="text-gris text-[0.88rem] mt-1">Actualiza tu foto de perfil.</p>
      </div>

      <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-6 flex items-center gap-5">
        <div className="relative w-20 h-20 rounded-full overflow-hidden ring-1 ring-negro/10 bg-dorado/15 flex items-center justify-center shrink-0">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={initial.full_name ?? initial.email} className="w-full h-full object-cover" />
          ) : (
            <span className="text-dorado text-[1.1rem] font-semibold">{initials}</span>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-negro/55 flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-blanco" />
            </div>
          )}
        </div>

        <div className="space-y-2 min-w-0">
          <p className="text-[0.9rem] font-medium text-negro truncate">{initial.full_name ?? "Usuario"}</p>
          <p className="text-[0.78rem] text-gris truncate">{initial.email}</p>
          <input
            ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
            className="hidden" onChange={handleFile}
          />
          <button
            type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-negro/15 rounded-lg text-[0.78rem] text-negro hover:bg-negro/5 disabled:opacity-40 transition-colors"
          >
            <Upload size={13} /> Cambiar foto
          </button>
        </div>
      </div>

      {error && <p className="text-[0.78rem] text-rojo">{error}</p>}
    </div>
  );
}
