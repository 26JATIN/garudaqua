import Link from "next/link";
import { Metadata } from "next";
import { webPageSchema } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0A0A0A] px-4 font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema({
        name: "Page Not Found — Garud Aqua Solutions",
        description: "The page you are looking for could not be found. Browse our products or read our blog.",
        url: "https://garudaqua.in/404",
      })) }} />
      {/* Icon / Graphics */}
      <div className="mb-8 text-[#0EA5E9] dark:text-[#38bdf8] opacity-80">
        <svg
          className="w-32 h-32"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h1 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-gray-100 mb-4 text-center">
        Oops, that went missing!
      </h1>
      
      <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-lg text-center font-light leading-relaxed">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Let&apos;s get you back on track.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Link
          href="/products"
          className="px-8 py-3 bg-[#0369A1] text-white rounded-full hover:bg-[#0284C7] transition-all shadow-lg hover:shadow-xl font-medium w-full sm:w-auto text-center"
        >
          View Products
        </Link>
        <Link
          href="/blogs"
          className="px-8 py-3 bg-white dark:bg-zinc-800 text-gray-800 dark:text-white border border-gray-200 dark:border-zinc-700 rounded-full hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all shadow-sm w-full sm:w-auto text-center"
        >
          Read our Blog
        </Link>
      </div>
    </div>
  );
}
