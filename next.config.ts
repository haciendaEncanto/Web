import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
