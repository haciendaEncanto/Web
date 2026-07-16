"use client";

import { Music2 } from "lucide-react";
import {
  getPlaylistTemplate,
  CENTINELA_SECTION,
  OBSERVACIONES_SECTION,
  type PlaylistSection,
} from "@/lib/playlist-templates";
import { CopyButton } from "@/components/ui/CopyButton";

type PlaylistRow = { section: PlaylistSection; song_url: string | null; no_aplica: boolean };

export function PlaylistReadOnly({
  eventType,
  items,
}: {
  eventType: string;
  items: PlaylistRow[];
}) {
  const template = getPlaylistTemplate(eventType);
  const map = Object.fromEntries(items.map((i) => [i.section, i])) as Record<string, PlaylistRow>;
  const ownMusic = map[CENTINELA_SECTION]?.no_aplica ?? false;
  const observaciones = map[OBSERVACIONES_SECTION]?.song_url ?? null;

  if (ownMusic) {
    return (
      <div className="bg-dorado/8 border border-dorado/20 rounded-2xl px-6 py-5 flex items-start gap-3">
        <Music2 size={18} className="text-dorado shrink-0 mt-0.5" />
        <p className="text-[0.88rem] text-negro/70 leading-relaxed">
          El cliente indicó que llevará acompañamiento musical propio. No hay playlist para mostrar.
        </p>
      </div>
    );
  }

  if (template.length === 0) {
    return (
      <div className="bg-blanco rounded-2xl border border-negro/[0.07] p-8 text-center">
        <p className="text-gris text-[0.85rem]">Sin plantilla de playlist para este tipo de evento.</p>
      </div>
    );
  }

  return (
    <div className="bg-blanco rounded-2xl border border-negro/[0.07] overflow-hidden">
      {template.map((f) => {
        const url = map[f.section]?.song_url;
        return (
          <div
            key={f.section}
            className="px-6 py-3.5 border-b border-negro/[0.04] last:border-0"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-[0.82rem] text-gris">{f.label}</span>
              {url ? (
                <CopyButton value={url} />
              ) : (
                <span className="text-[0.78rem] text-negro/25 shrink-0">—</span>
              )}
            </div>
            {url && (
              <p className="text-[0.72rem] text-negro/50 mt-1 break-all">{url}</p>
            )}
          </div>
        );
      })}
      {observaciones && (
        <div className="px-6 py-4 bg-crema/30">
          <p className="text-[0.68rem] text-gris uppercase tracking-wider mb-1">Observaciones</p>
          <p className="text-[0.85rem] text-negro whitespace-pre-line">{observaciones}</p>
        </div>
      )}
    </div>
  );
}
