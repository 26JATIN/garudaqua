import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "garudaqua.in",
          },
        ],
        destination: "https://www.garudaqua.in/:path*",
        permanent: true, // ✅ forces 301 instead of 307
      },
    ];
  },

  experimental: {
    inlineCss: true,
    optimizePackageImports: ["lucide-react", "sonner", "framer-motion"],
    serverActions: {
      bodySizeLimit: "100mb",
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
    // ⭐ HTML pages — immutable, Cloudflare purges on admin writes
    {
      source: "/((?!api).*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, s-maxage=31536000, immutable",
        },
      ],
    },

    // Security headers
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        {
          key: "Content-Security-Policy",
          value: "frame-ancestors 'self'",
        },
        {
          key: "Permissions-Policy",
          value:
            "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
        },
      ],
    },

    // Static assets — immutable
    {
      source: "/:path*\\.(woff2|woff|ttf|ico|png|jpg|jpeg|webp|svg|avif)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },

    // Public API — immutable, Cloudflare purges on admin writes
    {
      source:
        "/api/(hero-slides|hero-videos|gallery|categories|subcategories|blog-categories|products|blogs)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, s-maxage=31536000, immutable",
        },
      ],
    },

    // Search suggestions — immutable, Cloudflare purges on admin writes
    {
      source: "/api/search/suggestions",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, s-maxage=31536000, immutable",
        },
      ],
    },
  ],
};

export default nextConfig;