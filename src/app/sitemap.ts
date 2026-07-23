import type { MetadataRoute } from "next";

const BASE = "https://www.hacienda-encanto.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}`,                       lastModified: new Date(), changeFrequency: "monthly", priority: 1.0 },
    { url: `${BASE}/bodas`,                 lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/quince-anos`,           lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/eventos-empresariales`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/revelacion-de-genero`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
  ];
}
