import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function POST() {
  try {
    const categories = await prisma.category.findMany({
      where: { slug: "" },
      select: { id: true, name: true },
    });

    if (categories.length === 0) {
      return NextResponse.json({ message: "All categories already have slugs.", updated: 0 });
    }

    const updates = await Promise.all(
      categories.map((cat) =>
        prisma.category.update({
          where: { id: cat.id },
          data: { slug: slugify(cat.name) },
        })
      )
    );

    return NextResponse.json({ message: `Backfilled ${updates.length} category slugs.`, updated: updates.length });
  } catch (error) {
    console.error("Category slug backfill error:", error);
    return NextResponse.json({ error: "Backfill failed" }, { status: 500 });
  }
}
