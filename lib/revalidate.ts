import { revalidatePath } from "next/cache";
import { purgeCloudflareCache } from "./cloudflare";

const SITE_URL = process.env.NEXTAUTH_URL || "https://garudaqua.in";

/**
 * Warm-up URL: hit Vercel's origin DIRECTLY, bypassing Cloudflare.
 * VERCEL_URL is set automatically on every Vercel deployment (e.g. "myapp-abc123.vercel.app").
 * This avoids the race condition where Cloudflare's purge hasn't propagated yet
 * and the warm-up re-caches the OLD page.
 */
const WARMUP_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : SITE_URL;

/** All public pages that should be warmed after any cache purge */
const ALL_PUBLIC_PAGES = ["/", "/products", "/blogs", "/contact", "/enquire"];

/**
 * Three-step cache invalidation:
 *   1. revalidatePath  — tells Vercel's ISR to regenerate the page
 *   2. purgeCloudflare — clears Cloudflare's CDN edge cache
 *   3. warm            — fetches pages DIRECTLY from Vercel origin (bypassing Cloudflare)
 *                         so Vercel regenerates them NOW, not on the next user visit
 */
export async function revalidateAndWarm(paths: string[]) {
  // Step 1 — invalidate Vercel ISR cache for specific paths + all public pages
  const allPaths = [...new Set([...paths, ...ALL_PUBLIC_PAGES])];
  for (const p of allPaths) {
    revalidatePath(p);
  }

  // Step 2 — purge Cloudflare CDN
  await purgeCloudflareCache(allPaths);

  // Small delay — give Cloudflare a moment to propagate the purge
  await new Promise((r) => setTimeout(r, 1000));

  // Step 3 — warm pages by fetching DIRECTLY from Vercel origin (not through Cloudflare)
  await Promise.all(
    allPaths.map((p) =>
      fetch(`${WARMUP_URL}${p}`, {
        headers: { "x-warmup": "1" },
        cache: "no-store",
      }).catch((e) => {
        console.error(`[Warm] Failed to warm ${p}:`, e);
      })
    )
  );
}
