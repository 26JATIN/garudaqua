import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-guard";

// Allow up to 60s for large video uploads on Vercel
export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return unauthorizedResponse();
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "garudaqua";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64 data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "application/octet-stream";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Determine resource type
    const resourceType = file.type.startsWith("video/") ? "video" : "image";

    const result = await uploadToCloudinary(dataUrl, folder, resourceType);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
