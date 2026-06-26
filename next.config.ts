import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.hacienda-encanto.com",
      },
      {
        protocol: "https",
        hostname: "oewqyckeqolrpjbjevap.supabase.co",
      },
    ],
  },
};

export default nextConfig;
