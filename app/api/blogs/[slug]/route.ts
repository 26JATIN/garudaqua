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
      include: { blogCategory: true },
    });

    if (!blog) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    // Get related posts from same category
    const relatedWhere: Record<string, unknown> = {
      isPublished: true,
      id: { not: blog.id },
    };
    if (blog.categoryId) {
      relatedWhere.categoryId = blog.categoryId;
    } else {
      relatedWhere.category = blog.category;
    }

    const related = await prisma.blogPost.findMany({
      where: relatedWhere,
      include: { blogCategory: true },
      take: 3,
      orderBy: { publishedAt: "desc" },
    });

    // Add categoryName to blog and related
    const blogWithCategoryName = {
      ...blog,
      categoryName: blog.blogCategory?.name || blog.category.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
    };
    const relatedWithCategoryName = related.map((r) => ({
      ...r,
      categoryName: r.blogCategory?.name || r.category.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
    }));

    return NextResponse.json({ blog: blogWithCategoryName, related: relatedWithCategoryName }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}
