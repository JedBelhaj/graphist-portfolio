import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/download/storage/v1/b/prd-shared-services.firebasestorage.app/**",
      },
    ],
  },
};

export default nextConfig;
