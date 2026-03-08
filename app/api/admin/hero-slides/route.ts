import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { purgeCloudflareCache } from "@/lib/cloudflare";

export async function GET() {
  try {
    const slides = await prisma.heroSlide.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(slides);
  } catch (error) {
    console.error("Error fetching hero slides:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero slides" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slide = await prisma.heroSlide.create({
      data: {
        image: body.image,
        mobileImage: body.mobileImage || "",
        title: body.title || "",
        order: body.order || 0,
        isActive: body.isActive ?? true,
      },
    });
    purgeCloudflareCache(["/"]);
    return NextResponse.json(slide, { status: 201 });
  } catch (error) {
    console.error("Error creating hero slide:", error);
    return NextResponse.json(
      { error: "Failed to create hero slide" },
      { status: 500 }
    );
  }
}
