/**
 * Upload a file directly from the browser to Cloudinary.
 *
 * Flow:
 *   1. Ask our server for a signed upload token (lightweight JSON call)
 *   2. POST the file directly to Cloudinary's upload API (no server proxy)
 *
 * This removes Vercel's serverless body-size limits entirely.
 */
export async function uploadDirect(
  file: File,
  folder: string = "garudaqua",
  publicId?: string
): Promise<{ url: string; publicId: string; duration?: number }> {
  const resourceType = file.type.startsWith("video/") ? "video" : "image";

  // Step 1 — get a signed token from our server (tiny JSON payload)
  const signRes = await fetch("/api/admin/upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder, resourceType, publicId }),
  });

  if (!signRes.ok) {
    throw new Error("Failed to get upload signature");
  }

  const { signature, timestamp, cloudName, apiKey } = await signRes.json();

  // Step 2 — upload file directly to Cloudinary (browser → Cloudinary, no server)
  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", apiKey);
  fd.append("timestamp", String(timestamp));
  fd.append("signature", signature);
  fd.append("folder", folder);
  if (publicId) {
    fd.append("public_id", publicId);
  }

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: fd }
  );

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Cloudinary upload failed: ${errText}`);
  }

  const result = await uploadRes.json();

  return {
    url: result.secure_url,
    publicId: result.public_id,
    duration: result.duration ? Math.round(result.duration) : undefined,
  };
}
