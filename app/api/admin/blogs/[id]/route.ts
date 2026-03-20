import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteCloudinaryByUrl } from "@/lib/cloudinary";
import { revalidateAndWarm } from "@/lib/revalidate";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-guard";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return unauthorizedResponse();
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    // When admin changes the slug, preserve the old one so old URLs 301-redirect.
    // Invariant: formerSlugs must never contain the new live slug, nor duplicates.
    // This means A→B→A bounce-testing never inflates the array.
    const MAX_FORMER_SLUGS = 10;
    const newBlogSlug = body.slug;
    const slugChanged = newBlogSlug && newBlogSlug !== existing.slug;
    const updatedFormerSlugs = [
      ...new Set([
        ...(existing.formerSlugs ?? []),
        ...(slugChanged && existing.slug ? [existing.slug] : []),
      ]),
    ]
      .filter((s) => s !== newBlogSlug)   // never keep the current live slug in history
      .slice(-MAX_FORMER_SLUGS);

    // Sync the legacy category string field when categoryId changes, so
    // BlogPostClient's categoryName fallback stays accurate.
    let categoryString = body.category;
    if (body.categoryId && body.categoryId !== existing.categoryId) {
      const cat = await prisma.blogCategory.findUnique({
        where: { id: body.categoryId },
        select: { slug: true },
      });
      if (cat) categoryString = cat.slug;
    }

    const blog = await prisma.blogPost.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        formerSlugs: updatedFormerSlugs,
        excerpt: body.excerpt,
        content: body.content,
        category: categoryString ?? body.category,
        categoryId: body.categoryId || null,
        tags: body.tags,
        featuredImage: body.featuredImage,
        featuredAlt: body.featuredAlt,
        metaTitle: body.metaTitle,
        metaDesc: body.metaDesc,
        metaUrl: body.metaUrl,
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

    // Purge new slug path, old slug path (if changed), and every previously-known
    // formerSlug path so no stale Cloudflare-cached page survives a rename.
    const pathsToPurge = ["/","/blogs", ...(blog.slug ? [`/blogs/${blog.slug}`] : [])];
    if (slugChanged && existing.slug) pathsToPurge.push(`/blogs/${existing.slug}`);
    (existing.formerSlugs ?? []).forEach((s) => pathsToPurge.push(`/blogs/${s}`));
    await revalidateAndWarm(pathsToPurge);
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
  const session = await requireAdmin();
  if (!session) return unauthorizedResponse();
  try {
    const { id } = await params;

    const blog = await prisma.blogPost.findUnique({ where: { id } });
    await prisma.blogPost.delete({ where: { id } });

    if (blog?.featuredImage) await deleteCloudinaryByUrl(blog.featuredImage);

    // Purge current slug + all former slugs so no stale page remains in Cloudflare
    const pathsToPurge = ["/","/blogs"];
    if (blog?.slug) pathsToPurge.push(`/blogs/${blog.slug}`);
    if (blog?.formerSlugs?.length) {
      blog.formerSlugs.forEach((s) => pathsToPurge.push(`/blogs/${s}`));
    }
    await revalidateAndWarm(pathsToPurge);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: 500 }
    );
  }
}
