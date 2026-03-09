import { revalidatePath } from "next/cache";
import { purgeCloudflareCache } from "./cloudflare";

/** All public pages that should be revalidated after any admin update */
const ALL_PUBLIC_PAGES = ["/", "/products", "/blogs", "/contact", "/enquire"];

/**
 * Two-step cache invalidation:
 *   1. revalidatePath  — tells Vercel's ISR to regenerate pages on next visit
 *   2. purgeCloudflare — clears Cloudflare's CDN edge cache
 */
export async function revalidateAndWarm(paths: string[]) {
  // Step 1 — invalidate Vercel ISR cache
  const allPaths = [...new Set([...paths, ...ALL_PUBLIC_PAGES])];
  for (const p of allPaths) {
    revalidatePath(p);
  }

  // Wait 5 seconds for the DB update to fully propagate
  await new Promise((r) => setTimeout(r, 5000));

  // Step 2 — purge Cloudflare CDN
  await purgeCloudflareCache(allPaths);
}

