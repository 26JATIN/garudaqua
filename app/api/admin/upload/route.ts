import { NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";
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

    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique filename
    const ext = file.name.split(".").pop() || "bin";
    const timestamp = Math.floor(Date.now() / 1000).toString(36);
    const rand = Math.random().toString(36).slice(2, 8);
    const fileName = `${timestamp}-${rand}.${ext}`;

    const result = await uploadToR2(buffer, folder, fileName, file.type);

    return NextResponse.json(
      { url: result.url, publicId: result.key },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
