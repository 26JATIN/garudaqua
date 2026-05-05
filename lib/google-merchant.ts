/**
 * Google Merchant Center – Content API v2.1 integration
 * Uses a Service Account (JWT) for server-side auth (no OAuth flow required).
 *
 * Required env vars:
 *   GOOGLE_MERCHANT_ID          – numeric Merchant Center account ID
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL – service account client_email
 *   GOOGLE_SERVICE_ACCOUNT_KEY   – service account private_key (base64-encoded PEM, replace \n with \\n)
 *   NEXT_PUBLIC_SITE_URL         – canonical site URL, e.g. https://www.garudaqua.in
 */

const MERCHANT_API_BASE = "https://shoppingcontent.googleapis.com/content/v2.1";
const GOOGLE_AUTH_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/content";

// ─── JWT / Token Helpers ────────────────────────────────────────────────────

/** In-memory token cache — reused across same Lambda invocation. */
let _cachedToken: { token: string; expiresAt: number } | null = null;

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Signs a JWT and exchanges it for a Google OAuth2 access token.
 * Uses Node.js crypto — no external deps needed.
 */
async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  // Return cached token if still valid (with 60-s buffer)
  if (_cachedToken && _cachedToken.expiresAt > now + 60) {
    return _cachedToken.token;
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!email || !rawKey) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_KEY environment variables."
    );
  }

  // Decode base64 → could be a full JSON key file or a raw PEM
  const decoded = Buffer.from(rawKey, "base64").toString("utf-8");

  let pem: string;
  try {
    // Case 1: full service account JSON  { "private_key": "-----BEGIN..." }
    const json = JSON.parse(decoded) as { private_key?: string };
    if (!json.private_key) {
      throw new Error("Service account JSON does not contain a private_key field.");
    }
    // The JSON stores \n as the two-char escape sequence — convert to real newlines
    pem = json.private_key.replace(/\\n/g, "\n");
  } catch {
    // Case 2: already a raw PEM string (base64-encoded PEM directly)
    pem = decoded.replace(/\\n/g, "\n");
  }

  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      iss: email,
      scope: SCOPE,
      aud: GOOGLE_AUTH_URL,
      iat: now,
      exp: now + 3600,
    })
  );

  const signingInput = `${header}.${payload}`;

  // Sign with RS256 using Node crypto
  const { createSign } = await import("crypto");
  const sign = createSign("RSA-SHA256");
  sign.update(signingInput);
  sign.end();
  const signature = sign.sign(pem, "base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const jwt = `${signingInput}.${signature}`;

  const res = await fetch(GOOGLE_AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google token exchange failed: ${err}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  _cachedToken = { token: data.access_token, expiresAt: now + data.expires_in };
  return data.access_token;
}

// ─── Product Shape ──────────────────────────────────────────────────────────

export interface MerchantProduct {
  /** offerId must be stable across upserts — we use the Prisma product slug */
  offerId: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  additionalImageLinks?: string[];
  contentLanguage: string;
  targetCountry: string;
  channel: "online";
  availability: "in stock" | "out of stock" | "preorder";
  condition: "new" | "used" | "refurbished";
  brand: string;
  googleProductCategory: string;
  productTypes?: string[];
  price?: { value: string; currency: string };
  customAttributes?: Array<{ name: string; value: string }>;
}

// ─── Product Mapper ─────────────────────────────────────────────────────────

interface PricingOption {
  unit: string;
  label: string;
  price: number | null;
  isAvailable: boolean;
}

interface PrismaProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  images: string[];
  isActive: boolean;
  tags: string[];
  pricingOptions: unknown;
  category: { id: string; name: string } | null;
  subcategory?: { id: string; name: string } | null;
  metaTitle?: string;
  metaDesc?: string;
}

/**
 * Maps a Prisma Product to the Google Merchant Content API product shape.
 */
export function mapProductToMerchant(product: PrismaProduct): MerchantProduct {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://www.garudaqua.in";

  const pricingOptions: PricingOption[] = Array.isArray(product.pricingOptions)
    ? (product.pricingOptions as PricingOption[])
    : [];

  // Pick the first available price for the Google listing
  const activePricing = pricingOptions.find(
    (o) => o.isAvailable && o.price !== null && o.price > 0
  );

  const productTypes: string[] = [];
  if (product.category?.name) productTypes.push(product.category.name);
  if (product.subcategory?.name) productTypes.push(product.subcategory.name);

  const mapped: MerchantProduct = {
    offerId: product.slug,
    title: product.name,
    description: product.metaDesc || product.description || product.name,
    link: `${siteUrl}/products/${product.slug}`,
    imageLink: product.image || "",
    additionalImageLinks: product.images?.slice(0, 10) || [],
    contentLanguage: "en",
    targetCountry: "IN",
    channel: "online",
    availability: product.isActive ? "in stock" : "out of stock",
    condition: "new",
    brand: "Garud Aqua",
    // 638 = Water & Plumbing, if you have a more specific category update here
    googleProductCategory: "638",
    productTypes,
  };

  if (activePricing) {
    mapped.price = {
      value: activePricing.price!.toFixed(2),
      currency: "INR",
    };
  }

  if (product.tags?.length) {
    mapped.customAttributes = product.tags.map((t) => ({
      name: "tag",
      value: t,
    }));
  }

  return mapped;
}

// ─── API Helpers ────────────────────────────────────────────────────────────

function merchantId(): string {
  const id = process.env.GOOGLE_MERCHANT_ID;
  if (!id) throw new Error("Missing GOOGLE_MERCHANT_ID environment variable.");
  return id;
}

async function merchantFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAccessToken();
  return fetch(`${MERCHANT_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}

// ─── Public API ─────────────────────────────────────────────────────────────

export type MerchantSyncResult =
  | { ok: true; offerId: string; action: "inserted" | "updated" }
  | { ok: false; offerId: string; error: string };

/**
 * Inserts or updates a single product in Google Merchant Center.
 * Uses the "insert" endpoint which acts as an upsert.
 */
export async function syncProductToMerchant(
  product: PrismaProduct
): Promise<MerchantSyncResult> {
  const mid = merchantId();
  const payload = mapProductToMerchant(product);

  if (!payload.imageLink) {
    return {
      ok: false,
      offerId: payload.offerId,
      error: "Product has no image — skipped.",
    };
  }

  const res = await merchantFetch(`/${mid}/products`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = await res.text();
    return {
      ok: false,
      offerId: payload.offerId,
      error: `HTTP ${res.status}: ${errBody}`,
    };
  }

  return { ok: true, offerId: payload.offerId, action: "inserted" };
}

/**
 * Deletes a product from Google Merchant Center by its offerId (slug).
 */
export async function deleteProductFromMerchant(
  slug: string
): Promise<{ ok: boolean; error?: string }> {
  const mid = merchantId();
  // productId format: online:en:IN:<offerId>
  const productId = `online:en:IN:${slug}`;

  const res = await merchantFetch(
    `/${mid}/products/${encodeURIComponent(productId)}`,
    { method: "DELETE" }
  );

  if (res.status === 404) return { ok: true }; // Already gone
  if (!res.ok) {
    const errBody = await res.text();
    return { ok: false, error: `HTTP ${res.status}: ${errBody}` };
  }
  return { ok: true };
}

/**
 * Batch-syncs an array of Prisma products using concurrent individual inserts.
 * The custombatch path (/products/batch) requires specific scoping; using
 * individual POST /{merchantId}/products is simpler and equally fast for
 * typical catalogue sizes (runs 5 at a time in parallel).
 */
export async function batchSyncProducts(
  products: PrismaProduct[]
): Promise<MerchantSyncResult[]> {
  const withImages = products.filter((p) => !!p.image);
  const skipped: MerchantSyncResult[] = products
    .filter((p) => !p.image)
    .map((p) => ({ ok: false, offerId: p.slug, error: "No image — skipped." }));

  if (withImages.length === 0) return skipped;

  // Run in chunks of 5 to stay well within rate limits
  const CONCURRENCY = 5;
  const results: MerchantSyncResult[] = [];

  for (let i = 0; i < withImages.length; i += CONCURRENCY) {
    const chunk = withImages.slice(i, i + CONCURRENCY);
    const chunkResults = await Promise.all(
      chunk.map((p) => syncProductToMerchant(p))
    );
    results.push(...chunkResults);
  }

  return [...results, ...skipped];
}

/**
 * Fetches all products currently listed in Merchant Center.
 */
export async function listMerchantProducts(): Promise<{
  ok: boolean;
  products?: unknown[];
  error?: string;
}> {
  const mid = merchantId();
  const res = await merchantFetch(`/${mid}/products?maxResults=250`);

  if (!res.ok) {
    const errBody = await res.text();
    return { ok: false, error: `HTTP ${res.status}: ${errBody}` };
  }

  const data = (await res.json()) as { resources?: unknown[] };
  return { ok: true, products: data.resources || [] };
}
