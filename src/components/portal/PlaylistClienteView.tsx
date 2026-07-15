"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { savePlaylist, type SavePlaylistItem } from "@/app/actions/playlist";
import {
  getPlaylistTemplate,
  CENTINELA_SECTION,
  OBSERVACIONES_SECTION,
  type PlaylistSection,
} from "@/lib/playlist-templates";

type PlaylistRow = { section: PlaylistSection; song_url: string | null; no_aplica: boolean };

const inputCls = "w-full border border-negro/10 bg-crema/20 px-3 py-2.5 text-[0.83rem] text-negro placeholder:text-gris/35 focus:outline-none focus:border-dorado/60 transition-colors rounded-lg";

export function PlaylistClienteView({
  bookingId,
  eventType,
  initialItems,
}: {
  bookingId: string;
  eventType: string;
  initialItems: PlaylistRow[];
}) {
  const template = getPlaylistTemplate(eventType);
  const initialMap = Object.fromEntries(initialItems.map((i) => [i.section, i])) as Record<string, PlaylistRow>;

  const [ownMusic, setOwnMusic] = useState(initialMap[CENTINELA_SECTION]?.no_aplica ?? false);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(template.map((f) => [f.section, initialMap[f.section]?.song_url ?? ""])),
  );
  const [observaciones, setObservaciones] = useState(initialMap[OBSERVACIONES_SECTION]?.song_url ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleOwnMusic() {
    setOwnMusic((v) => !v);
    setSaved(false);
  }

  function setValue(section: string, val: string) {
    setValues((v) => ({ ...v, [section]: val }));
    setSaved(false);
  }

  function handleSave() {
    setSaved(false);
    setError(null);

    const items: SavePlaylistItem[] = ownMusic
      ? [{ section: CENTINELA_SECTION, no_aplica: true }]
      : [
          { section: CENTINELA_SECTION, no_aplica: false },
          ...template.map((f) => ({ section: f.section, song_url: values[f.section] || null })),
          { section: OBSERVACIONES_SECTION, song_url: observaciones || null },
        ];

    startTransition(async () => {
      const res = await savePlaylist(bookingId, items);
      if (res.error) { setError(res.error); return; }
      setSaved(true);
    });
  }

  return (
    <div className="space-y-6">
      {/* Centinela */}
      <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-6">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <button
            type="button"
            role="switch"
            aria-checked={ownMusic}
            onClick={toggleOwnMusic}
            className={[
              "relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-dorado",
              ownMusic ? "bg-dorado" : "bg-negro/20",
            ].join(" ")}
          >
            <span
              className={[
                "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-blanco shadow-sm transition-transform duration-200",
                ownMusic ? "translate-x-5" : "translate-x-0",
              ].join(" ")}
            />
          </button>
          <span className="text-[0.9rem] font-medium text-negro">
            Llevaré acompañamiento musical propio
          </span>
        </label>
      </div>

      {ownMusic ? (
        <div className="bg-dorado/8 border border-dorado/20 rounded-2xl px-6 py-5 text-[0.88rem] text-negro/70 leading-relaxed">
          Has indicado que llevarás acompañamiento musical propio. Si cambias de opinión puedes desactivar esta opción.
        </div>
      ) : (
        <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-6 space-y-4">
          {template.map((f) => (
            <div key={f.section}>
              <label className="block text-[0.7rem] text-gris uppercase tracking-wider mb-1.5">
                {f.label}{" "}
                {f.optional && <span className="normal-case text-gris/40">(opcional)</span>}
              </label>
              <input
                type="url"
                value={values[f.section] ?? ""}
                onChange={(e) => setValue(f.section, e.target.value)}
                placeholder="https://open.spotify.com/…  ·  youtube.com/watch?v=…"
                className={inputCls}
              />
            </div>
          ))}

          <div>
            <label className="block text-[0.7rem] text-gris uppercase tracking-wider mb-1.5">
              Observaciones
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => { setObservaciones(e.target.value); setSaved(false); }}
              rows={3}
              placeholder="Indicaciones adicionales para el equipo de sonido…"
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-6 py-3 bg-dorado text-blanco text-[0.85rem] font-medium rounded-xl hover:bg-dorado/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Guardando…" : "Guardar mi música"}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-[0.82rem] text-green-600">
            <CheckCircle2 size={15} />
            Guardado
          </span>
        )}
        {error && <span className="text-[0.82rem] text-rojo">{error}</span>}
      </div>
    </div>
  );
}
