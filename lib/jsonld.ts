const SITE_URL = "https://garudaqua.in";
const SITE_NAME = "Garud Aqua Solutions";
const LOGO_URL = `${SITE_URL}/DesktopLogo.png`;
const PHONE = "+91-94625-94603";
const EMAIL = "rkg210@gmail.com";

// ─── Organization (global, enhanced with E-E-A-T signals) ────────────────────

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Organization"],
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: LOGO_URL },
    image: LOGO_URL,
    telephone: PHONE,
    email: EMAIL,
    description:
      "Garud Aqua Solutions is a trusted manufacturer, retailer, and wholesale supplier of HDPE water tanks, PVC pipes, fittings, and agricultural water management products in Sriganganagar, Rajasthan, India.",
    foundingDate: "2014",
    founder: {
      "@type": "Person",
      name: "Mr. Rajesh Gupta",
      jobTitle: "Founder & Managing Director",
      description:
        "55+ years of expertise in pipe fitting and water tank retail. Pioneer in water management solutions across Rajasthan.",
    },
    numberOfEmployees: { "@type": "QuantitativeValue", minValue: 10 },
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, UPI, Bank Transfer",
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "Ground, Murraba No. 62, Killa No. 2, Sihagawali To Akkawali Road, 23 SDS",
      addressLocality: "Sadulshahar",
      addressRegion: "Rajasthan",
      postalCode: "335062",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "29.4507",
      longitude: "73.4340",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "09:00",
      closes: "18:00",
    },
    areaServed: [
      { "@type": "State", name: "Rajasthan" },
      { "@type": "Country", name: "India" },
    ],
    knowsAbout: [
      "HDPE Water Tanks",
      "PVC Pipes",
      "CPVC Pipes",
      "Water Fittings",
      "Agricultural Water Management",
      "Water Storage Solutions",
      "Sprayer Tanks",
      "Drip Irrigation Systems",
    ],
    sameAs: [],
  };
}

// ─── WebSite (global, with SearchAction) ─────────────────────────────────────

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ─── BreadcrumbList ──────────────────────────────────────────────────────────

export function breadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ─── WebPage (generic) ───────────────────────────────────────────────────────

export function webPageSchema(opts: {
  name: string;
  description: string;
  url: string;
  type?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": opts.type || "WebPage",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

// ─── CollectionPage (for product/blog listings) ──────────────────────────────

export function collectionPageSchema(opts: {
  name: string;
  description: string;
  url: string;
}) {
  return webPageSchema({ ...opts, type: "CollectionPage" });
}

// ─── Product ─────────────────────────────────────────────────────────────────

export function productSchema(product: {
  name: string;
  description?: string;
  image?: string;
  images?: string[];
  id: string;
  category?: { name: string } | null;
  guarantee?: string;
}) {
  const allImages = [
    ...(product.image ? [product.image] : []),
    ...(product.images || []),
  ];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.description ||
      `${product.name} from Garud Aqua Solutions — quality water management product.`,
    image: allImages.length > 0 ? allImages : undefined,
    url: `${SITE_URL}/products/${product.id}`,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    manufacturer: { "@id": `${SITE_URL}/#organization` },
    category: product.category?.name,
    ...(product.guarantee
      ? {
          hasWarranty: {
            "@type": "WarrantyPromise",
            warrantyScope: {
              "@type": "WarrantyScope",
              name: product.guarantee,
            },
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      seller: { "@id": `${SITE_URL}/#organization` },
      url: `${SITE_URL}/products/${product.id}`,
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "INR",
      },
    },
  };
}

// ─── Article / BlogPosting ───────────────────────────────────────────────────

export function articleSchema(blog: {
  title: string;
  excerpt?: string | null;
  content?: string | null;
  featuredImage?: string | null;
  author?: string | null;
  slug: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  tags?: string[];
  readTime?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description:
      blog.excerpt ||
      `Read "${blog.title}" on the Garud Aqua Solutions blog.`,
    image: blog.featuredImage || undefined,
    url: `${SITE_URL}/blogs/${blog.slug}`,
    datePublished: blog.publishedAt || undefined,
    dateModified: blog.updatedAt || blog.publishedAt || undefined,
    wordCount: blog.content
      ? blog.content.replace(/<[^>]*>/g, "").split(/\s+/).length
      : undefined,
    timeRequired: blog.readTime ? `PT${blog.readTime}M` : undefined,
    keywords: blog.tags?.join(", ") || undefined,
    author: {
      "@type": "Person",
      name: blog.author || "Garud Aqua Team",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: LOGO_URL },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blogs/${blog.slug}`,
    },
  };
}

// ─── ContactPage ─────────────────────────────────────────────────────────────

export function contactPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Garud Aqua Solutions",
    description:
      "Get in touch with Garud Aqua Solutions for water tanks, pipes, and fittings enquiries.",
    url: `${SITE_URL}/contact`,
    mainEntity: { "@id": `${SITE_URL}/#organization` },
  };
}

// ─── AboutPage ───────────────────────────────────────────────────────────────

export function aboutPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Garud Aqua Solutions",
    description:
      "Learn about Garud Aqua Solutions — founded by Mr. Rajesh Gupta with 55+ years of water management expertise. Trusted supplier since 2014.",
    url: `${SITE_URL}/about`,
    mainEntity: { "@id": `${SITE_URL}/#organization` },
  };
}
