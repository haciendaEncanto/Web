import type { NextConfig } from "next";

const SUPABASE_HOST = "oewqyckeqolrpjbjevap.supabase.co";

// Content-Security-Policy para producción.
// next/font/google self-hostea las fuentes en build time — no necesita fonts.googleapis.com en runtime.
// 'unsafe-inline' y 'unsafe-eval' son necesarios para Next.js App Router en producción.
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://${SUPABASE_HOST} https://contenido.hacienda-encanto.com`,
  "font-src 'self' data:",
  `connect-src 'self' https://${SUPABASE_HOST} wss://${SUPABASE_HOST} https://www.google.com https://www.googleapis.com https://contenido.hacienda-encanto.com`,
  "frame-src https://www.google.com https://maps.google.com",
  `media-src 'self' blob: https://${SUPABASE_HOST} https://contenido.hacienda-encanto.com`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  // Previene clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Previene MIME type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Controla información del referer en requests cross-origin
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Desactiva funcionalidades del navegador no utilizadas
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Política de seguridad de contenido
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.hacienda-encanto.com",
      },
      {
        protocol: "https",
        hostname: SUPABASE_HOST,
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
