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

    const existing = await prisma.subcategory.findUnique({ where: { id } });

    const newSlug = body.name !== existing?.name ? slugify(body.name) : (existing?.slug || slugify(body.name));

    const subcategory = await prisma.subcategory.update({
      where: { id },
      data: {
        name: body.name,
        slug: newSlug,
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
      await deleteCloudinaryByUrl(existing.image);
    }

    // Purge old subcategory filter URL if slug changed
    const pathsToPurge = ["/", "/products", `/products?subcategory=${newSlug}`];
    if (existing?.slug && existing.slug !== newSlug) {
      pathsToPurge.push(`/products?subcategory=${existing.slug}`);
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

    if (subcategory?.image) await deleteCloudinaryByUrl(subcategory.image);

    await revalidateAndWarm(["/", "/products"]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    return NextResponse.json(
      { error: "Failed to delete subcategory" },
      { status: 500 }
    );
  }
}
