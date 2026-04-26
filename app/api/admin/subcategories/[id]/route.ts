import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteR2ByUrl } from "@/lib/r2";
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

    const existing = await prisma.subcategory.findUnique({ where: { id } });

    const newSlug = body.name !== existing?.name
      ? slugify(body.name)
      : (existing?.slug || slugify(body.name));

    // formerSlugs — same invariant as products/blogs/categories:
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

    // If this subcategory's new slug was a formerSlug on another subcategory, strip it.
    if (slugChanged) {
      const staleHolders = await prisma.subcategory.findMany({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        where: { id: { not: id }, formerSlugs: { has: newSlug } } as any,
        select: { id: true, formerSlugs: true },
      });
      await Promise.all(
        staleHolders.map((s) =>
          prisma.subcategory.update({
            where: { id: s.id },
            data: { formerSlugs: s.formerSlugs.filter((slug) => slug !== newSlug) },
          })
        )
      );
    }

    const subcategory = await prisma.subcategory.update({
      where: { id },
      data: {
        name: body.name,
        slug: newSlug,
        formerSlugs: updatedFormerSlugs,
        description: body.description,
        image: body.image,
        order: body.order,
        isActive: body.isActive,
        categoryId: body.categoryId,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (existing?.image && existing.image !== body.image) {
      await deleteR2ByUrl(existing.image);
    }

    // Purge listing page, new + old subcategory filter URLs
    const pathsToPurge = ["/", "/products", `/products?subcategory=${newSlug}`, "/api/subcategories"];
    if (existing?.slug && existing.slug !== newSlug) {
      pathsToPurge.push(`/products?subcategory=${existing.slug}`);
      // Also purge all formerSlug filter URLs
      (existing.formerSlugs ?? []).forEach((s) =>
        pathsToPurge.push(`/products?subcategory=${s}`)
      );
    }
    await revalidateAndWarm(pathsToPurge);
    return NextResponse.json(subcategory);
  } catch (error) {
    console.error("Error updating subcategory:", error);
    return NextResponse.json(
      { error: "Failed to update subcategory" },
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

    const subcategory = await prisma.subcategory.findUnique({ where: { id } });
    await prisma.subcategory.delete({ where: { id } });

    if (subcategory?.image) await deleteR2ByUrl(subcategory.image);

    // Purge the listing page, the live subcategory filter URL, and every former
    // slug filter URL so no stale Cloudflare-cached page survives the deletion.
    const pathsToPurge = ["/", "/products", "/api/subcategories"];
    if (subcategory?.slug) pathsToPurge.push(`/products?subcategory=${subcategory.slug}`);
    (subcategory?.formerSlugs ?? []).forEach((s) =>
      pathsToPurge.push(`/products?subcategory=${s}`)
    );
    await revalidateAndWarm(pathsToPurge);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    return NextResponse.json(
      { error: "Failed to delete subcategory" },
      { status: 500 }
    );
  }
}
