import type { NextConfig } from "next";

/* The admin (Sanity Studio) is hosted by Sanity, not by this site — see
   ../studio. /admin just forwards there, so editors have one address to
   remember. Set SANITY_STUDIO_URL once the studio is deployed. */
const STUDIO_URL = process.env.SANITY_STUDIO_URL;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      /* Everything uploaded through the studio is served from here. */
      { protocol: "https", hostname: "cdn.sanity.io" },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/download/storage/v1/b/prd-shared-services.firebasestorage.app/**",
      },
      /* MOCK imagery — drop these once real assets are in place. */
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "i.pravatar.cc" },
    ],
  },
  async redirects() {
    return STUDIO_URL ? [{ source: "/admin", destination: STUDIO_URL, permanent: false }] : [];
  },
};

export default nextConfig;
