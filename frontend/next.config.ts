import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdni.iconscout.com',
      },
    ],
  },
};

export default nextConfig;
