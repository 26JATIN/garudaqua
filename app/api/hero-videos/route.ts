import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const videos = await prisma.heroVideo.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(videos, {
      headers: {
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error fetching hero videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero videos" },
      { status: 500 }
    );
  }
}
