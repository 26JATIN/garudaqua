import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const searchFilter = { contains: query, mode: "insensitive" as const };

    const [categories, subcategories, products] = await Promise.all([
      prisma.category.findMany({
        where: {
          isActive: true,
          name: searchFilter,
        },
        select: { id: true, name: true, image: true },
        take: 3,
      }),
      prisma.subcategory.findMany({
        where: {
          isActive: true,
          name: searchFilter,
        },
        select: {
          id: true,
          name: true,
          image: true,
          category: { select: { id: true, name: true } },
        },
        take: 3,
      }),
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: searchFilter },
            { description: searchFilter },
          ],
        },
        select: {
          id: true,
          name: true,
          image: true,
          category: { select: { id: true, name: true } },
          subcategory: { select: { id: true, name: true } },
        },
        take: 5,
      }),
    ]);

    const suggestions = [
      ...categories.map((c) => ({
        id: c.id,
        text: c.name,
        type: "category" as const,
        image: c.image || null,
        url: `/products?category=${c.id}`,
      })),
      ...subcategories.map((s) => ({
        id: s.id,
        text: s.name,
        type: "subcategory" as const,
        image: s.image || null,
        category: s.category.name,
        url: `/products?category=${s.category.id}&subcategory=${s.id}`,
      })),
      ...products.map((p) => ({
        id: p.id,
        text: p.name,
        type: "product" as const,
        image: p.image || null,
        category: p.category.name,
        subcategory: p.subcategory?.name || null,
        url: `/products/${p.id}`,
      })),
    ];

    return NextResponse.json(suggestions, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return NextResponse.json([], { status: 500 });
  }
}
