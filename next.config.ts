import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  allowedDevOrigins: ['10.255.255.25'],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // pindah ke dalam experimental
    },
  },
};

export default nextConfig;
