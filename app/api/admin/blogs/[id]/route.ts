import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteCloudinaryByUrl } from "@/lib/cloudinary";
import { purgeCloudflareCache } from "@/lib/cloudflare";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.blogPost.findUnique({ where: { id } });

    const blog = await prisma.blogPost.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt,
        content: body.content,
        category: body.category,
        categoryId: body.categoryId || null,
        tags: body.tags,
        featuredImage: body.featuredImage,
        featuredAlt: body.featuredAlt,
        isPublished: body.isPublished,
        readTime: body.readTime,
        author: body.author,
        publishedAt: body.publishedAt
          ? new Date(body.publishedAt)
          : undefined,
      },
    });

    if (existing?.featuredImage && existing.featuredImage !== body.featuredImage) {
      await deleteCloudinaryByUrl(existing.featuredImage);
    }

    const slugToPurge = blog.slug || existing?.slug;
    await purgeCloudflareCache(["/blogs", ...(slugToPurge ? [`/blogs/${slugToPurge}`] : [])]);
    return NextResponse.json(blog);
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const blog = await prisma.blogPost.findUnique({ where: { id } });
    await prisma.blogPost.delete({ where: { id } });

    if (blog?.featuredImage) await deleteCloudinaryByUrl(blog.featuredImage);

    await purgeCloudflareCache(["/blogs", ...(blog?.slug ? [`/blogs/${blog.slug}`] : [])]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: 500 }
    );
  }
}
