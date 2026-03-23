import type { Metadata } from "next";
import { enquirePageSchema } from "@/lib/jsonld";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Product Enquiry — Request a Quote",
  description:
    "Submit a product enquiry to Garud Aqua Solutions. Request pricing for water tanks, pipes, fittings and agricultural water management equipment in Rajasthan.",
  alternates: { canonical: "https://garudaqua.in/enquire" },
  openGraph: {
    url: "https://garudaqua.in/enquire",
    title: "Product Enquiry | Garud Aqua Solutions",
    description:
      "Request pricing and availability for our water tanks, pipes and fittings. Fast response guaranteed.",
  },
};

export default function EnquireLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(enquirePageSchema()) }} />
      {children}
    </>
  );
}
