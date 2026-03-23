import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Record<string, unknown> = { isPublished: true };

    if (category && category !== "all") {
      // Resolve the category slug to a categoryId.
      // Only match by id if the value looks like a valid ObjectId (24 hex chars).
      const isObjectId = /^[a-f\d]{24}$/i.test(category);
      const blogCategory = await prisma.blogCategory.findFirst({
        where: isObjectId
          ? { OR: [{ slug: category }, { id: category }] }
          : { slug: category },
        select: { id: true },
      });
      if (blogCategory) {
        where.categoryId = blogCategory.id;
      } else {
        // Unknown category — return empty result set rather than ignoring the filter
        where.categoryId = "__not_found__";
      }
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }

    const [blogs, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: { blogCategory: { select: { name: true } } },
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({
      blogs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }, {
      headers: {
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}
