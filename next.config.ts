import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  // Increase API route body size limit
  serverRuntimeConfig: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
  },
};

export default nextConfig;
