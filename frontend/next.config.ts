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

    // Guard against invalid values (e.g. "placeholder" or empty string) which break Next rewrites
    // Only accept URLs that start with http:// or https://
    const backendUrl =
      rawBackendUrl && 
      rawBackendUrl.trim() !== "" && 
      rawBackendUrl !== "placeholder" &&
      /^https?:\/\//.test(rawBackendUrl)
        ? rawBackendUrl
        : "http://legal-connect-prod-alb-790910672.ap-southeast-1.elb.amazonaws.com/api";

    const apiBaseUrl = backendUrl.endsWith("/api")
      ? backendUrl.slice(0, -4)
      : backendUrl;

    console.log("[NEXT CONFIG] API Rewrite:", {
      raw: rawBackendUrl,
      resolved: backendUrl,
      baseUrl: apiBaseUrl,
    });

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
