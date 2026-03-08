import { revalidatePath } from "next/cache";
import { purgeCloudflareCache } from "./cloudflare";

const SITE_URL = process.env.NEXTAUTH_URL || "https://garudaqua.in";

/** All public pages that should be warmed after any cache purge */
const ALL_PUBLIC_PAGES = ["/", "/products", "/blogs", "/contact", "/enquire"];

/**
 * Three-step cache invalidation:
 *   1. revalidatePath  — tells Vercel's ISR to regenerate the page
 *   2. purgeCloudflare — clears Cloudflare's ENTIRE CDN edge cache
 *   3. warm            — fetches ALL public pages so Vercel regenerates them NOW
 *                         (without this, the page only regenerates on the next real visit)
 */
export async function revalidateAndWarm(paths: string[]) {
  // Step 1 — invalidate Vercel ISR cache for the specific paths + all public pages
  const allPaths = [...new Set([...paths, ...ALL_PUBLIC_PAGES])];
  for (const p of allPaths) {
    revalidatePath(p);
  }

  // Step 2 — purge Cloudflare CDN for affected paths
  await purgeCloudflareCache(allPaths);

  // Step 3 — warm ALL public pages in parallel (fire-and-forget)
  for (const p of allPaths) {
    fetch(`${SITE_URL}${p}`, {
      headers: { "x-warmup": "1" },
      cache: "no-store",
    }).catch(() => {
      // swallow errors — warming is best-effort
    });
  }
}

