import { revalidatePath } from "next/cache";
import { purgeCloudflareCache } from "./cloudflare";

const SITE_URL = process.env.NEXTAUTH_URL || "https://garudaqua.in";

/** All public pages to revalidate and warm after any admin update */
const ALL_PUBLIC_PAGES = ["/", "/products", "/blogs", "/contact", "/enquire"];

/**
 * Three-step cache invalidation + warm:
 *   1. revalidatePath  — tells Vercel's ISR to regenerate pages on next visit
 *   2. purgeCloudflare — purges ENTIRE Cloudflare CDN (same as dashboard "Purge All")
 *   3. warm            — waits 2s for purge to propagate, then fetches all pages
 *                         so both Vercel and Cloudflare are pre-loaded with fresh content
 */
export async function revalidateAndWarm(paths: string[]) {
  // Step 1 — invalidate Vercel ISR cache
  const allPaths = [...new Set([...paths, ...ALL_PUBLIC_PAGES])];
  for (const p of allPaths) {
    revalidatePath(p);
  }

  // Step 2 — purge entire Cloudflare CDN
  await purgeCloudflareCache();

  // Step 3 — wait for purge to propagate, then warm all pages
  await new Promise((r) => setTimeout(r, 2000));

  await Promise.allSettled(
    allPaths.map((p) =>
      fetch(`${SITE_URL}${p}`, {
        cache: "no-store",
        headers: { "x-warmup": "1" },
      })
    )
  );
}

