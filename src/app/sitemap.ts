import type { MetadataRoute } from "next";

const BASE = "https://www.hacienda-encanto.com";
const LAST_MODIFIED = new Date("2026-07-24");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`,                      lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 1.0 },
    { url: `${BASE}/bodas`,                 lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/quince-anos`,           lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/eventos-empresariales`, lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/revelacion-de-genero`,  lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.9 },
  ];
}
