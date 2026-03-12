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

    const newSlug = body.name !== existing?.name ? slugify(body.name) : (existing?.slug || slugify(body.name));

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: body.name,
        // Regenerate slug when name changes; keep existing slug if name unchanged
        slug: newSlug,
        description: body.description,
        image: body.image,
        sortOrder: body.sortOrder,
        isActive: body.isActive,
      },
    });

    // Delete old image from Cloudinary if changed
    if (existing?.image && existing.image !== body.image) {
      await deleteCloudinaryByUrl(existing.image);
    }

    // Purge listing page, new category filter URL, and old filter URL (if slug changed)
    const pathsToPurge = ["/", "/products", `/products?category=${newSlug}`];
    if (existing?.slug && existing.slug !== newSlug) {
      pathsToPurge.push(`/products?category=${existing.slug}`);
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

    await revalidateAndWarm(["/", "/products"]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
