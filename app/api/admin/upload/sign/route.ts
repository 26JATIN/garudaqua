import { NextResponse } from "next/server";
import { getPresignedUploadUrl, r2PublicUrl } from "@/lib/r2";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-guard";

/**
 * Generate a presigned PUT URL so the browser can upload directly to R2
 * without going through our server. This removes file-size restrictions imposed
 * by Vercel's serverless function body limits.
 */
export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return unauthorizedResponse();
  try {
    const { key, contentType = "application/octet-stream" } =
      await request.json();

    if (!key) {
      return NextResponse.json(
        { error: "Missing 'key' in request body" },
        { status: 400 }
      );
    }

    const presignedUrl = await getPresignedUploadUrl(key, contentType);
    const publicUrl = r2PublicUrl(key);

    return NextResponse.json({
      presignedUrl,
      publicUrl,
      key,
    });
  } catch (error) {
    console.error("Error generating R2 presigned URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
