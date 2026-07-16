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

// Ítems de música dentro de la orden de servicio (Ceremonia/Protocolo) que
// en vez de ser texto libre del planner, muestran en solo lectura lo que
// el cliente ya guardó en /portal/playlist — evita datos duplicados/
// desincronizados entre la orden y la playlist real.
export const ORDEN_MUSIC_FIELD_MAP: Record<string, Record<string, PlaylistSection>> = {
  boda: {
    "Canción ingreso al salón": "entrada_salon",
    "Canción vals": "vals_pareja",
    "Vals opción 2": "vals_opcion_2",
    "Vals opción 3": "vals_opcion_3",
  },
  quince: {
    "Canción ingreso zona verde": "entrada_zona_verde",
    "Canción ingreso al salón": "entrada_salon",
    "Canción vals": "vals_pareja",
    "Vals opción 2": "vals_opcion_2",
    "Vals opción 3": "vals_opcion_3",
  },
};

export function getOrdenMusicFieldMap(eventType: string): Record<string, PlaylistSection> {
  return ORDEN_MUSIC_FIELD_MAP[eventType] ?? {};
}
