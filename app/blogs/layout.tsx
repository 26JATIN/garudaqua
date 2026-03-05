import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Water Management Tips & Industry Insights",
  description:
    "Read expert articles on water storage, tank maintenance, pipe installation, agricultural water management and industry news from Garud Aqua Solutions.",
  alternates: { canonical: "https://garudaqua.in/blogs" },
  openGraph: {
    url: "https://garudaqua.in/blogs",
    title: "Blog — Water Management Tips & Insights | Garud Aqua Solutions",
    description:
      "Expert articles on water storage, tank maintenance, pipe installation and agricultural water management.",
  },
};

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
