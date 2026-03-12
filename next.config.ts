import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    loader: "custom",
    loaderFile: "./lib/cloudinary-loader.ts",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  headers: async () => [
    {
      // Global security header
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
      ],
    },
    {
      // Public folder assets — immutable, long-lived cache
      source: "/:path*\\.(woff2|woff|ttf|ico|png|jpg|jpeg|webp|svg|avif)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
    {
      // Public read-only API routes — cache at CDN for 60s, stale-while-revalidate for 5min
      source: "/api/(hero-slides|hero-videos|gallery|categories|subcategories|blog-categories|products|blogs)",
      headers: [
        { key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=300" },
      ],
    },
    {
      // Search suggestions — short cache
      source: "/api/search/suggestions",
      headers: [
        { key: "Cache-Control", value: "public, s-maxage=30, stale-while-revalidate=120" },
      ],
    },
  ],
};

export default nextConfig;
