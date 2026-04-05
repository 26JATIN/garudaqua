const CF_ZONE_ID = process.env.CF_ZONE_ID;
const CF_API_TOKEN = process.env.CF_API_TOKEN;

/**
 * Purges specific paths from Cloudflare Edge Cache.
 * If no paths are provided, it falls back to purging everything.
 */
export async function purgeCloudflareCache(paths?: string[]) {
  if (!CF_ZONE_ID || !CF_API_TOKEN) {
    console.log("[CF] Skipping cache purge — env vars not set");
    return;
  }

  try {
    let body;

    // If specific paths are provided, purge only canonical www URLs
    if (paths && paths.length > 0) {
      const filesToPurge: string[] = [];
      for (const path of paths) {
        filesToPurge.push(`https://www.garudaqua.in${path}`);
      }
      body = { files: filesToPurge };
      console.log(`[CF] Purging specific paths:`, paths);
    } else {
      // Fallback to purge everything
      body = { purge_everything: true };
      console.log(`[CF] Purging entire cache...`);
    }

    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    if (!data.success) {
      console.error("[CF] Cache purge failed:", JSON.stringify(data.errors));
    } else {
      console.log(paths && paths.length > 0 ? "[CF] Purged specific paths ✅" : "[CF] Purged entire cache ✅");
    }
  } catch (e) {
    console.error("[CF] Cache purge request failed:", e);
  }
}
