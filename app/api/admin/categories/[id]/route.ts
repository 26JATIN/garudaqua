import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteCloudinaryByUrl } from "@/lib/cloudinary";
import { revalidateAndWarm } from "@/lib/revalidate";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-guard";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return unauthorizedResponse();
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.category.findUnique({ where: { id } });

    const newSlug = body.name !== existing?.name
      ? slugify(body.name)
      : (existing?.slug || slugify(body.name));

    // formerSlugs — same invariant as products/blogs:
    // never contain the new live slug, no duplicates, cap at 10.
    const MAX_FORMER_SLUGS = 10;
    const slugChanged = existing?.slug && newSlug !== existing.slug;
    const updatedFormerSlugs = [
      ...new Set([
        ...(existing?.formerSlugs ?? []),
        ...(slugChanged ? [existing!.slug] : []),
      ]),
    ]
      .filter((s) => s !== newSlug)
      .slice(-MAX_FORMER_SLUGS);

    // If this category's new slug was a formerSlug on another category, strip it.
    if (slugChanged) {
      const staleHolders = await prisma.category.findMany({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        where: { id: { not: id }, formerSlugs: { has: newSlug } } as any,
        select: { id: true, formerSlugs: true },
      });
      await Promise.all(
        staleHolders.map((c) =>
          prisma.category.update({
            where: { id: c.id },
            data: { formerSlugs: c.formerSlugs.filter((s) => s !== newSlug) },
          })
        )
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: body.name,
        slug: newSlug,
        formerSlugs: updatedFormerSlugs,
        description: body.description,
        image: body.image,
        sortOrder: body.sortOrder,
        isActive: body.isActive,
        hasSeoPage: body.hasSeoPage ?? false,
        seoContent: body.seoContent || "",
        seoHeroImage: body.seoHeroImage || "",
        metaTitle: body.metaTitle || "",
        metaDesc: body.metaDesc || "",
      },
    });

    // Delete old image from Cloudinary if changed
    if (existing?.image && existing.image !== body.image) {
      await deleteCloudinaryByUrl(existing.image);
    }
    if (existing?.seoHeroImage && existing.seoHeroImage !== body.seoHeroImage) {
      await deleteCloudinaryByUrl(existing.seoHeroImage);
    }

    // Purge listing page, new + old category filter URLs
    const pathsToPurge = [
      "/", 
      "/products", 
      `/products?category=${newSlug}`,
      `/categories/${newSlug}`
    ];
    if (existing?.slug && existing.slug !== newSlug) {
      pathsToPurge.push(`/products?category=${existing.slug}`);
      pathsToPurge.push(`/categories/${existing.slug}`);
      // Also purge all formerSlug filter URLs so stale CDN entries are cleared
      (existing.formerSlugs ?? []).forEach((s) => {
        pathsToPurge.push(`/products?category=${s}`);
        pathsToPurge.push(`/categories/${s}`);
      });
    }
    await revalidateAndWarm(pathsToPurge);
    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
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

    const category = await prisma.category.findUnique({ where: { id } });
    await prisma.category.delete({ where: { id } });

    if (category?.image) await deleteCloudinaryByUrl(category.image);
    if (category?.seoHeroImage) await deleteCloudinaryByUrl(category.seoHeroImage);

    // Purge the listing page, the live category filter URL, and every former
    // slug filter URL so no stale Cloudflare-cached page survives the deletion.
    const pathsToPurge = ["/", "/products"];
    if (category?.slug) {
      pathsToPurge.push(`/products?category=${category.slug}`);
      pathsToPurge.push(`/categories/${category.slug}`);
    }
    (category?.formerSlugs ?? []).forEach((s) => {
      pathsToPurge.push(`/products?category=${s}`);
      pathsToPurge.push(`/categories/${s}`);
    });
    await revalidateAndWarm(pathsToPurge);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
