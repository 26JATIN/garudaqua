const CF_ZONE_ID = process.env.CF_ZONE_ID;
const CF_API_TOKEN = process.env.CF_API_TOKEN;
const SITE_URL = process.env.NEXTAUTH_URL || "https://garudaqua.in";

/**
 * Purge specific paths from Cloudflare's edge cache.
 * Silently no-ops if CF env vars are not set (local dev).
 * MUST be awaited — otherwise the serverless function exits before the purge completes.
 */
export async function purgeCloudflareCache(paths: string[] = ["/"]) {
  if (!CF_ZONE_ID || !CF_API_TOKEN) {
    console.log("[CF] Skipping cache purge — env vars not set");
    return;
  }

  const files = paths.map((p) => `${SITE_URL}${p}`);

  try {
    const res = await fetch(
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

    const data = await res.json();

    if (!data.success) {
      console.error("[CF] Cache purge failed:", JSON.stringify(data.errors));
    } else {
      console.log("[CF] Purged:", files.join(", "));
    }
  } catch (e) {
    console.error("[CF] Cache purge request failed:", e);
  }
}

