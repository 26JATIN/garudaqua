
import { revalidatePath } from "next/cache";
import { purgeCloudflareCache } from "./cloudflare";

/**
 * Paths that feed the Navbar (categories dropdown) and Footer.
 * These must be purged from Cloudflare on EVERY admin write so the
 * navbar dropdown never shows stale categories/blog-categories.
 */
const NAVBAR_PATHS = [
  "/api/categories",
  "/api/subcategories",
  "/api/blog-categories",
];

export async function revalidateAndWarm(paths?: string[]) {
  // Bust Next.js ISR cache immediately so server components re-run on next request
  if (paths && paths.length > 0) {
    for (const path of paths) {
      revalidatePath(path);
    }
  } else {
    revalidatePath("/", "layout");
  }

  // Build the final set of CF paths:
  // Always include navbar paths so the header dropdown stays fresh,
  // then merge with whatever specific paths were requested.
  let cfPaths: string[] | undefined;
  if (paths && paths.length > 0) {
    const merged = new Set([...NAVBAR_PATHS, ...paths]);
    cfPaths = Array.from(merged);
  }
  // If paths is undefined/empty → cfPaths stays undefined → purge_everything fires

  // Also purge Cloudflare Edge cache so CDN doesn't serve stale responses
  await purgeCloudflareCache(cfPaths);
  return;
}
