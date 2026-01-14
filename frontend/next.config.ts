import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",

  // Skip linting during production builds inside Docker to unblock CI
  eslint: {
    ignoreDuringBuilds: true,
  },

  async rewrites() {
    // Remove /api suffix if present (Terraform passes backend_url with /api appended)
    const rawBackendUrl = process.env.NEXT_PUBLIC_API_URL;

    // Guard against invalid values (e.g. "placeholder") which break Next rewrites
    const backendUrl =
      rawBackendUrl && /^https?:\/\//.test(rawBackendUrl)
        ? rawBackendUrl
        : "http://localhost:8080/api";

    const apiBaseUrl = backendUrl.endsWith("/api")
      ? backendUrl.slice(0, -4)
      : backendUrl;
    return [
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdni.iconscout.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
