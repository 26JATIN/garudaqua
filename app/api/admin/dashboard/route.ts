import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [products, categories, blogs, heroVideos, enquiries, newEnquiries] =
      await Promise.all([
        prisma.product.count(),
        prisma.category.count(),
        prisma.blogPost.count(),
        prisma.heroVideo.count(),
        prisma.enquiry.count(),
        prisma.enquiry.count({ where: { status: "NEW" } }),
      ]);

    return NextResponse.json({
      products,
      categories,
      blogs,
      heroVideos,
      enquiries,
      newEnquiries,
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard" },
      { status: 500 }
    );
  }
}
