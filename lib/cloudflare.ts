const CF_ZONE_ID = process.env.CF_ZONE_ID;
const CF_API_TOKEN = process.env.CF_API_TOKEN;
const SITE_URL = process.env.NEXTAUTH_URL || "https://garudaqua.in";

/**
 * Purge specific paths from Cloudflare's edge cache.
 * Silently no-ops if CF env vars are not set.
 */
export async function purgeCloudflareCache(paths: string[] = ["/"]) {
  if (!CF_ZONE_ID || !CF_API_TOKEN) return;

  const files = paths.map((p) => `${SITE_URL}${p}`);

  try {
    await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ files }),
      }
    );
  } catch (e) {
    console.error("Cloudflare cache purge failed:", e);
  }
}
