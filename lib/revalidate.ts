
import { purgeCloudflareCache } from "./cloudflare";

export async function revalidateAndWarm(paths?: string[]) {
  // Purge specific paths from Cloudflare Edge caching
  await purgeCloudflareCache(paths);
  return;
}

