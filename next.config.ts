import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,

  experimental: {
    inlineCss: true,
    optimizePackageImports: ["lucide-react", "sonner"],
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
    // ⭐ Cache all HTML pages aggressively for CDN
    {
      source: "/((?!api).*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=31536000, stale-while-revalidate=86400",
        },
      ],
    },

    // Security header
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
      ],
    },

    // Static assets cache
    {
      source: "/:path*\\.(woff2|woff|ttf|ico|png|jpg|jpeg|webp|svg|avif)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },

    // Public API caching
    {
      source:
        "/api/(hero-slides|hero-videos|gallery|categories|subcategories|blog-categories|products|blogs)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=60, stale-while-revalidate=300",
        },
      ],
    },

    // Search suggestions cache
    {
      source: "/api/search/suggestions",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=30, stale-while-revalidate=120",
        },
      ],
    },
  ],
};

export default nextConfig;