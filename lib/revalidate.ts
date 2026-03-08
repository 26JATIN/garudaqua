import { revalidatePath } from "next/cache";
import { purgeCloudflareCache } from "./cloudflare";

const SITE_URL = process.env.NEXTAUTH_URL || "https://garudaqua.in";

/**
 * Three-step cache invalidation:
 *   1. revalidatePath  — tells Vercel's ISR to regenerate the page
 *   2. purgeCloudflare — clears Cloudflare's CDN edge cache
 *   3. warm            — fetches the page so Vercel actually regenerates it NOW
 *                         (without this, the page only regenerates on the next real visit)
 */
export async function revalidateAndWarm(paths: string[]) {
  // Step 1 — invalidate Vercel ISR cache (synchronous, no await needed)
  for (const p of paths) {
    revalidatePath(p);
  }

  // Step 2 — purge Cloudflare CDN
  await purgeCloudflareCache(paths);

  // Step 3 — warm the cache by fetching each page in the background
  // Fire-and-forget so the admin API returns fast
  for (const p of paths) {
    fetch(`${SITE_URL}${p}`, {
      headers: { "x-warmup": "1" },
      cache: "no-store",
    }).catch(() => {
      // swallow errors — warming is best-effort
    });
  }
}
