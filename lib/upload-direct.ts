/**
 * Upload a file directly from the browser to Cloudflare R2.
 *
 * Flow:
 *   1. Ask our server for a presigned PUT URL (lightweight JSON call)
 *   2. PUT the file directly to R2 (no server proxy)
 *
 * This removes Vercel's serverless body-size limits entirely.
 */
export async function uploadDirect(
  file: File,
  folder: string = "garudaqua",
  publicId?: string
): Promise<{ url: string; publicId: string; duration?: number }> {
  const resourceType = file.type.startsWith("video/") ? "video" : "image";

  // Generate a unique filename if no publicId provided
  const ext = file.name.split(".").pop() || "bin";
  const timestamp = Math.floor(Date.now() / 1000).toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  const filename = publicId
    ? `${publicId}.${ext}`
    : `${timestamp}-${rand}.${ext}`;

  const key = `${folder}/${filename}`;

  // Step 1 — get a presigned PUT URL from our server (tiny JSON payload)
  const signRes = await fetch("/api/admin/upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, contentType: file.type, resourceType }),
  });

  if (!signRes.ok) {
    throw new Error("Failed to get upload URL");
  }

  const { presignedUrl, publicUrl } = await signRes.json();

  // Step 2 — upload file directly to R2 (browser → R2, no server)
  const uploadRes = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`R2 upload failed: ${errText}`);
  }

  // For videos, try to extract duration from the file
  let duration: number | undefined;
  if (resourceType === "video") {
    duration = await getVideoDuration(file).catch(() => undefined);
  }

  return {
    url: publicUrl,
    publicId: key,
    duration,
  };
}

/**
 * Get video duration from a File object.
 */
function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(Math.round(video.duration));
    };
    video.onerror = reject;
    video.src = URL.createObjectURL(file);
  });
}
