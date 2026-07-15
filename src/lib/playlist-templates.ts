import type { Database } from "@/types/database";

export type PlaylistSection = Database["public"]["Enums"]["playlist_section"];

export interface PlaylistFieldConfig {
  section: PlaylistSection;
  label: string;
  optional?: boolean;
}

// Fila especial: guarda el toggle único "llevo acompañamiento musical
// propio" para todo el booking (no_aplica = true/false), en vez de una
// columna aparte en la tabla.
export const CENTINELA_SECTION: PlaylistSection = "centinela";
export const OBSERVACIONES_SECTION: PlaylistSection = "observaciones";

export const PLAYLIST_TEMPLATES: Record<string, PlaylistFieldConfig[]> = {
  boda: [
    { section: "entrada_novio", label: "Canción entrada novio" },
    { section: "entrada_novia", label: "Canción entrada novia" },
    { section: "salida_recien_casados", label: "Canción salida recién casados" },
    { section: "entrada_salon", label: "Canción entrada salón" },
    { section: "vals_pareja", label: "Vals recién casados" },
    { section: "vals_opcion_2", label: "Vals opción 2", optional: true },
    { section: "vals_opcion_3", label: "Vals opción 3", optional: true },
    { section: "acompanamiento_zona_verde", label: "Playlist acompañamiento zona verde" },
    { section: "acompanamiento_salon", label: "Playlist acompañamiento salón" },
    { section: "playlist_ceremonia", label: "Playlist ceremonia" },
    { section: "playlist_cena", label: "Playlist cena" },
    { section: "playlist_rumba", label: "Playlist referencia rumba" },
  ],
  quince: [
    { section: "entrada_zona_verde", label: "Canción entrada zona verde" },
    { section: "entrada_salon", label: "Canción entrada salón" },
    { section: "vals_pareja", label: "Vals opción 1" },
    { section: "vals_opcion_2", label: "Vals opción 2", optional: true },
    { section: "vals_opcion_3", label: "Vals opción 3", optional: true },
    { section: "acompanamiento_zona_verde", label: "Playlist acompañamiento zona verde" },
    { section: "acompanamiento_salon", label: "Playlist acompañamiento salón" },
    { section: "playlist_rumba", label: "Playlist referencia rumba" },
  ],
  empresarial: [
    { section: "acompanamiento_zona_verde", label: "Playlist acompañamiento zona verde" },
  ],
  revelacion: [
    { section: "acompanamiento_zona_verde", label: "Playlist acompañamiento zona verde" },
  ],
};

export function getPlaylistTemplate(eventType: string): PlaylistFieldConfig[] {
  return PLAYLIST_TEMPLATES[eventType] ?? [];
}
