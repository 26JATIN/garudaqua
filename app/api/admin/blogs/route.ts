import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { purgeCloudflareCache } from "@/lib/cloudflare";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  try {
    const blogs = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = body.slug || slugify(body.title);

    const blog = await prisma.blogPost.create({
      data: {
        title: body.title,
        slug,
        excerpt: body.excerpt || "",
        content: body.content || "",
        category: body.category || "other",
        categoryId: body.categoryId || null,
        tags: body.tags || [],
        featuredImage: body.featuredImage || "",
        featuredAlt: body.featuredAlt || "",
        isPublished: body.isPublished ?? false,
        readTime: body.readTime || 5,
        author: body.author || "Garud Aqua Team",
        publishedAt: body.publishedAt
          ? new Date(body.publishedAt)
          : new Date(),
      },
    });
    revalidatePath("/blogs");
    await purgeCloudflareCache(["/blogs"]);
    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { error: "Failed to create blog" },
      { status: 500 }
    );
  }
}
