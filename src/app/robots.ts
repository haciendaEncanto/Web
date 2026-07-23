import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/portal/", "/admin/", "/editor/", "/login", "/api/"],
    },
    sitemap: "https://www.hacienda-encanto.com/sitemap.xml",
  };
}
