import type { Metadata } from "next";
import { aboutPageSchema } from "@/lib/jsonld";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "About Us — Our Story, Mission & Team",
  description:
    "Learn about Garud Aqua Solutions — founded in Sriganganagar, Rajasthan. Our mission, values, infrastructure and commitment to quality water management products across India.",
  alternates: { canonical: "https://www.garudaqua.in/about" },
  openGraph: {
    url: "https://www.garudaqua.in/about",
    title: "About Garud Aqua Solutions — Our Story & Mission",
    description:
      "Founded in Sriganganagar, Rajasthan. Learn about our mission to deliver high-quality water tanks, pipes & fittings with a bond of trust.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema()) }} />
      {children}
    </>
  );
}
