import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Get a Quote or Enquiry",
  description:
    "Contact Garud Aqua Solutions in Sriganganagar, Rajasthan. Call +91 94625 94603 or email us for bulk pricing, product enquiries and water tank installation advice.",
  alternates: { canonical: "https://garudaqua.in/contact" },
  openGraph: {
    url: "https://garudaqua.in/contact",
    title: "Contact Garud Aqua Solutions",
    description:
      "Get in touch for product enquiries, bulk pricing and water management solutions. Based in Sriganganagar, Rajasthan.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
