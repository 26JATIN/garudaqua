
import { revalidatePath } from "next/cache";
import { purgeCloudflareCache } from "./cloudflare";

export async function revalidateAndWarm(paths?: string[]) {
  // Bust Next.js ISR cache immediately so server components re-run on next request
  if (paths && paths.length > 0) {
    for (const path of paths) {
      revalidatePath(path);
    }
  } else {
    revalidatePath("/", "layout");
  }

  // Also purge Cloudflare Edge cache so CDN doesn't serve stale responses
  await purgeCloudflareCache(paths);
  return;
}
