import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const terms = query.split(/\s+/).filter(Boolean);

    // Categories must natively contain all typed words to match directly
    const categoryFilter = {
      AND: terms.map(term => ({
        name: { contains: term, mode: "insensitive" as const }
      }))
    };

    // Products intelligently scan all connected sub-trees for any combination of the words
    const productFilter = {
      AND: terms.map(term => ({
        OR: [
          { name: { contains: term, mode: "insensitive" as const } },
          { description: { contains: term, mode: "insensitive" as const } },
          { category: { name: { contains: term, mode: "insensitive" as const } } },
          { subcategory: { name: { contains: term, mode: "insensitive" as const } } }
        ]
      }))
    };

    const [categories, products] = await Promise.all([
      prisma.category.findMany({
        where: {
          isActive: true,
          ...categoryFilter
        },
        select: { id: true, name: true, slug: true, image: true },
        take: 2,
      }),
      prisma.product.findMany({
        where: {
          isActive: true,
          ...productFilter
        },
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
          category: { select: { id: true, name: true } },
          subcategory: { select: { id: true, name: true } },
        },
        take: 6,
      }),
    ]);

    const suggestions = [
      ...categories.map((c) => ({
        id: c.id,
        text: c.name,
        type: "category" as const,
        image: c.image || null,
        url: `/categories/${c.slug && c.slug !== "" ? c.slug : slugify(c.name)}`,
      })),
      ...products.map((p) => ({
        id: p.id,
        text: p.name,
        type: "product" as const,
        image: p.image || null,
        category: p.category.name,
        subcategory: p.subcategory?.name || null,
        // p.slug is always populated after backfill; guard against empty string only
        url: `/products/${p.slug && p.slug !== "" ? p.slug : slugify(p.name)}`,
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
