const CF_ZONE_ID = process.env.CF_ZONE_ID;
const CF_API_TOKEN = process.env.CF_API_TOKEN;

/**
 * Purge the ENTIRE Cloudflare edge cache for the zone.
 * URL-specific purge doesn't work reliably because Cloudflare caches
 * URL variants (www, trailing slash, query strings) that don't match
 * our exact paths. purge_everything matches what the dashboard "Purge All" does.
 */
export async function purgeCloudflareCache() {
  if (!CF_ZONE_ID || !CF_API_TOKEN) {
    console.log("[CF] Skipping cache purge — env vars not set");
    return;
  }

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ purge_everything: true }),
      }
    );

    const data = await res.json();

    if (!data.success) {
      console.error("[CF] Cache purge failed:", JSON.stringify(data.errors));
    } else {
      console.log("[CF] Purged entire cache ✅");
    }
  } catch (e) {
    console.error("[CF] Cache purge request failed:", e);
  }
}
