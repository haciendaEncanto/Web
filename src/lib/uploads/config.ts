// Config compartida cliente/servidor para uploads directos a Supabase Storage
// vía signed URL. No contiene secretos — seguro de importar desde componentes cliente.

export type UploadKind = "hero-video" | "gallery-image" | "site-image";

export const HERO_VIDEO_FOLDER: Record<string, string> = {
  "": "home",
  boda: "boda",
  quince: "quince",
  empresarial: "empresarial",
  revelacion: "revelacion",
};

export const GALLERY_IMAGE_FOLDER: Record<string, string> = {
  boda: "bodas",
  quince: "quince",
  empresarial: "empresarial",
  revelacion: "revelacion",
  general: "general",
};

interface UploadKindConfig {
  bucket: string;
  maxBytes: number;
  allowedMimeTypes: string[];
}

export const UPLOAD_KINDS: Record<UploadKind, UploadKindConfig> = {
  "hero-video": {
    bucket: "videos",
    maxBytes: 50 * 1024 * 1024,
    allowedMimeTypes: ["video/mp4", "video/webm", "video/quicktime"],
  },
  "gallery-image": {
    bucket: "gallery",
    maxBytes: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  "site-image": {
    bucket: "gallery",
    maxBytes: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  // Futuro — módulos aún no construidos (ver "Pendiente" en CLAUDE.md):
  //   "document":        bucket "documents", 10MB, application/pdf
  //   "payment-receipt": bucket "documents", 10MB, application/pdf
  //   "guest-excel":     bucket "documents", 5MB — requiere migración para
  //                      agregar el mime type de Excel a allowed_mime_types
  //                      del bucket "documents" antes de poder usarse.
};

export function heroVideoPath(eventType: string, fileName: string): string {
  const folder = HERO_VIDEO_FOLDER[eventType] ?? "home";
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "mp4";
  return `${folder}/${Date.now()}.${ext}`;
}

export function galleryImagePath(category: string, fileName: string): string {
  const folder = GALLERY_IMAGE_FOLDER[category] ?? "general";
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 60);
  return `${folder}/${Date.now()}_${safe}`;
}

export function siteImagePath(key: string, fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
  return `sitio/${key}_${Date.now()}.${ext}`;
}

export const SITE_IMAGE_KEYS = [
  "img_card_boda",
  "img_card_quince",
  "img_card_empresarial",
  "img_card_revelacion",
  "img_nosotros",
  "img_servicio_catering",
  "img_servicio_fotografia",
  "img_servicio_decoracion",
] as const;

export type SiteImageKey = (typeof SITE_IMAGE_KEYS)[number];
