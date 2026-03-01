import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const blog = await prisma.blogPost.findUnique({
      where: { slug, isPublished: true },
    });

    if (!blog) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    // Get related posts from same category
    const related = await prisma.blogPost.findMany({
      where: {
        isPublished: true,
        category: blog.category,
        id: { not: blog.id },
      },
      take: 3,
      orderBy: { publishedAt: "desc" },
    });

    return NextResponse.json({ blog, related });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}
