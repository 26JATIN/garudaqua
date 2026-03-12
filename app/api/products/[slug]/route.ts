import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** 24-char hex string = MongoDB ObjectId */
const isObjectId = (s: string) => /^[a-f\d]{24}$/i.test(s);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Try slug first; fall back to id for legacy ObjectId-based links
    const product = await prisma.product.findFirst({
      where: isObjectId(slug) ? { OR: [{ slug }, { id: slug }] } : { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        subcategory: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Get related products from same category
    const related = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        isActive: true,
        id: { not: product.id },
      },
      take: 4,
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        description: true,
        isActive: true,
        tags: true,
        hasVariants: true,
        guarantee: true,
        category: { select: { id: true, name: true, slug: true } },
        subcategory: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ product, related });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
