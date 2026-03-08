/**
 * Direct client-side upload to Cloudinary.
 * Bypasses Vercel's 4.5MB body size limit by uploading directly from the browser.
 *
 * Flow: client → /api/admin/upload/signature (tiny JSON) → Cloudinary (large file)
 */
export async function uploadToCloudinaryDirect(
  file: File,
  folder: string = "garudaqua"
): Promise<{ url: string; publicId: string; duration?: number }> {
  const resourceType = file.type.startsWith("video/") ? "video" : "image";

  // 1. Get a signed upload token from our backend (tiny request)
  const sigRes = await fetch("/api/admin/upload/signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder, resourceType }),
  });

  if (!sigRes.ok) {
    throw new Error("Failed to get upload signature");
  }

  const { signature, timestamp, cloudName, apiKey } = await sigRes.json();

  // 2. Upload the file directly to Cloudinary (large file → Cloudinary, not Vercel)
  const formData = new FormData();
  formData.append("file", file);
  formData.append("signature", signature);
  formData.append("timestamp", String(timestamp));
  formData.append("api_key", apiKey);
  formData.append("folder", folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error(err.error?.message || "Cloudinary upload failed");
  }

  const result = await uploadRes.json();

  return {
    url: result.secure_url,
    publicId: result.public_id,
    duration: result.duration ? Math.round(result.duration) : undefined,
  };
}
