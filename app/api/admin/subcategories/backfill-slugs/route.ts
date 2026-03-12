import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function POST() {
  try {
    const subcategories = await prisma.subcategory.findMany({
      where: { slug: "" },
      select: { id: true, name: true },
    });

    if (subcategories.length === 0) {
      return NextResponse.json({ message: "All subcategories already have slugs.", updated: 0 });
    }

    const updates = await Promise.all(
      subcategories.map((sub) =>
        prisma.subcategory.update({
          where: { id: sub.id },
          data: { slug: slugify(sub.name) },
        })
      )
    );

    return NextResponse.json({ message: `Backfilled ${updates.length} subcategory slugs.`, updated: updates.length });
  } catch (error) {
    console.error("Subcategory slug backfill error:", error);
    return NextResponse.json({ error: "Backfill failed" }, { status: 500 });
  }
}
