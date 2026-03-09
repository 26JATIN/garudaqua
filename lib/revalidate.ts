
import { purgeCloudflareCache } from "./cloudflare";

export async function revalidateAndWarm(_paths?: string[]) {
  // Purging is completely disabled as per user request
  await purgeCloudflareCache();
  return;
}

