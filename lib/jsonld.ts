const SITE_URL = "https://www.garudaqua.in";
const SITE_NAME = "Garud Aqua Solutions";
const LOGO_URL = `${SITE_URL}/DesktopLogo.png`;
const PHONE = "+91-94625-94603";
const EMAIL = "contact@garudaqua.in";

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
      "Garud Aqua Solutions is a trusted manufacturer, retailer, and wholesale supplier of HDPE, LLDPE water tanks, PVC pipes, fittings, and agricultural water management products in Sriganganagar, Rajasthan, India.",
    foundingDate: "2014",
    founder: {
      "@type": "Person",
      name: "Mr. Rajesh Gupta",
      jobTitle: "Founder & Managing Director",
      description:
        "25+ years of expertise in pipe fitting and water tank retail. Pioneer in water management solutions across Rajasthan.",
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
    hasMap: "https://maps.app.goo.gl/LH69FP4CLybZSRAX7",
    areaServed: [
      { "@type": "State", name: "Rajasthan" },
      { "@type": "Country", name: "India" },
    ],
    knowsAbout: [
      "HDPE Water Tanks",
      "LLDPE Water Tanks",
      "PVC Pipes",
      "CPVC Pipes",
      "Water Fittings",
      "Agricultural Water Management",
      "Water Storage Solutions",
      "Sprayer Tanks",
      "Drip Irrigation Systems",
    ],
    sameAs: [
      "https://maps.app.goo.gl/LH69FP4CLybZSRAX7",
      "https://www.facebook.com/garudaqua",
      "https://wa.me/919462594603"
    ],
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
  slug?: string;
  category?: { name: string } | null;
  guarantee?: string;
  price?: number | string | null;
  priceCurrency?: string;
  priceValidUntil?: string;
  pricingOptions?: Array<{
    unit: string;
    price?: number | string | null;
    isAvailable?: boolean;
  }>;
}) {
  const allImages = [
    ...(product.image ? [product.image] : []),
    ...(product.images || []),
  ];
  // Prefer slug for the canonical URL — falls back to id for legacy records
  const productPath = product.slug || product.id;
  const rawPrice = product.price;
  const availablePricing = (product.pricingOptions || []).filter(
    (option) => option && option.isAvailable !== false && option.price !== null && option.price !== undefined && String(option.price).trim() !== "" && Number.isFinite(Number(option.price))
  );
  const hasValidPrice =
    rawPrice !== null &&
    rawPrice !== undefined &&
    String(rawPrice).trim() !== "" &&
    Number.isFinite(Number(rawPrice));
  const lowestPricingOption = availablePricing.reduce<typeof availablePricing[number] | null>((lowest, option) => {
    const value = Number(option.price);
    if (!Number.isFinite(value)) return lowest;
    if (!lowest) return option;
    return value < Number(lowest.price) ? option : lowest;
  }, null);
  const lowestPricing = lowestPricingOption ? Number(lowestPricingOption.price) : null;
  const unitCodeByUnit: Record<string, string> = {
    litre: "LTR",
    kg: "KGM",
    piece: "H87",
  };
  const selectedUnit = lowestPricingOption?.unit;
  const selectedUnitCode = selectedUnit ? unitCodeByUnit[selectedUnit] : undefined;

  const normalizedPrice = hasValidPrice
    ? Number(rawPrice).toFixed(2)
    : lowestPricing !== null
      ? lowestPricing.toFixed(2)
      : undefined;
  const normalizedPriceCurrency = product.priceCurrency || "INR";

  const offer = (hasValidPrice || lowestPricing !== null)
    ? {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@id": `${SITE_URL}/#organization` },
        url: `${SITE_URL}/products/${productPath}`,
        price: normalizedPrice,
        priceCurrency: normalizedPriceCurrency,
        ...(product.priceValidUntil
          ? { priceValidUntil: product.priceValidUntil }
          : {}),
        ...(selectedUnitCode
          ? {
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: normalizedPrice,
                priceCurrency: normalizedPriceCurrency,
                referenceQuantity: {
                  "@type": "QuantitativeValue",
                  value: 1,
                  unitCode: selectedUnitCode,
                },
              },
            }
          : {}),
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "IN",
            addressRegion: ["Rajasthan", "Punjab", "Haryana", "Gujarat",
              "Uttar Pradesh", "Himachal Pradesh", "Uttarakhand"],
          },
          // Shipping is by quote — direct buyers to the enquiry form
          shippingRate: {
            "@type": "MonetaryAmount",
            currency: "INR",
            value: "0",
            description:
              "Shipping charges vary by location and order size. Contact us for a quote — garudaqua.in/enquire",
          },
          // Delivery window is indicative; actual timeline confirmed on enquiry
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: {
              "@type": "QuantitativeValue",
              minValue: 1,
              maxValue: 3,
              unitCode: "DAY",
            },
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: 2,
              maxValue: 7,
              unitCode: "DAY",
            },
            description:
              "Estimated delivery 3–10 business days. Exact timeline confirmed on order. Contact us at garudaqua.in/enquire",
          },
          description:
            "Shipping available across Rajasthan and neighbouring states. Charges and exact delivery dates provided on enquiry.",
        },
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "IN",
          returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
          merchantReturnLink: `${SITE_URL}/enquire`,
          returnFees: "https://schema.org/FreeReturn",
          returnMethod: "https://schema.org/ReturnByMail",
          description:
            "Returns accepted only for manufacturing defects after verification. Contact us via the enquiry form for return requests.",
        },
      }
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.description ||
      `${product.name} from Garud Aqua Solutions — quality water management product.`,
    image: allImages.length > 0 ? allImages : undefined,
    url: `${SITE_URL}/products/${productPath}`,
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
    ...(offer ? { offers: offer } : {}),
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
    "@type": "BlogPosting",
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

// ─── FAQPage ──────────────────────────────────────────────────────────────────

export function faqSchema(
  faqs: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// ─── VideoObject ──────────────────────────────────────────────────────────────

export function videoSchema(video: {
  name: string;
  description: string;
  thumbnailUrl?: string;
  uploadDate: string;
  contentUrl?: string;
  embedUrl?: string;
  duration?: string;
}) {
  const thumbnailUrl = video.thumbnailUrl?.trim() || LOGO_URL;

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.name,
    description: video.description,
    thumbnailUrl,
    uploadDate: video.uploadDate,
    ...(video.contentUrl ? { contentUrl: video.contentUrl } : {}),
    ...(video.embedUrl ? { embedUrl: video.embedUrl } : {}),
    ...(video.duration ? { duration: video.duration } : {}),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: LOGO_URL },
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

// ─── EnquirePage ────────────────────────────────────────────────────────────

export function enquirePageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Product Enquiry — Garud Aqua Solutions",
    description:
      "Submit a product enquiry or request a quote for water tanks, pipes, and fittings from Garud Aqua Solutions.",
    url: `${SITE_URL}/enquire`,
    mainEntity: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "CommunicateAction",
      target: `${SITE_URL}/enquire`,
      name: "Request a Quote",
    },
  };
}

// ─── AboutPage ───────────────────────────────────────────────────────────────

export function aboutPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Garud Aqua Solutions",
    description:
      "Learn about Garud Aqua Solutions — founded by Mr. Rajesh Gupta with 25+ years of water management expertise. Trusted supplier since 2014.",
    url: `${SITE_URL}/about`,
    mainEntity: { "@id": `${SITE_URL}/#organization` },
  };
}
