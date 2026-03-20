import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import BlogsClient from "../../BlogsClient";
import { collectionPageSchema } from "@/lib/jsonld";

export const dynamic = "force-static";

const SITE_URL = "https://garudaqua.in";

async function getBlogCategory(slug: string) {
    return prisma.blogCategory.findFirst({
        where: { slug, isActive: true },
    });
}

export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
    const { slug } = await params;
    const blogCategory = await getBlogCategory(slug);

    if (!blogCategory) return {};

    const title = `${blogCategory.name} — Blog Articles | Garud Aqua Solutions`;
    const description = `Read expert articles about ${blogCategory.name.toLowerCase()} — tips, guides, and insights from Garud Aqua Solutions.`;
    const canonicalUrl = `${SITE_URL}/blogs/category/${slug}`;

    return {
        title,
        description,
        alternates: { canonical: canonicalUrl },
        openGraph: {
            url: canonicalUrl,
            title,
            description,
        },
    };
}

async function getCategoryData(slug: string) {
    const [blogCategory, allCategories] = await Promise.all([
        getBlogCategory(slug),
        prisma.blogCategory.findMany({
            where: { isActive: true },
            orderBy: { order: "asc" },
            select: { id: true, name: true, slug: true },
        }),
    ]);

    if (!blogCategory) return null;

    const blogs = await prisma.blogPost.findMany({
        where: { isPublished: true, categoryId: blogCategory.id },
        include: { blogCategory: { select: { name: true } } },
        orderBy: { publishedAt: "desc" },
        take: 10,
    });

    const total = await prisma.blogPost.count({
        where: { isPublished: true, categoryId: blogCategory.id },
    });

    return {
        blogCategory,
        categories: allCategories,
        blogs: blogs.map((b) => ({
            ...b,
            createdAt: b.createdAt.toISOString(),
            updatedAt: b.updatedAt.toISOString(),
            publishedAt: b.publishedAt ? b.publishedAt.toISOString() : new Date().toISOString(),
        })),
        total,
        totalPages: Math.ceil(total / 10),
    };
}

export default async function BlogCategoryPage(
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const data = await getCategoryData(slug);

    if (!data) {
        notFound();
    }

    const { blogCategory, categories, blogs, totalPages } = data;

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(
                        collectionPageSchema({
                            name: `${blogCategory.name} — Blog Articles`,
                            description: `Expert articles about ${blogCategory.name.toLowerCase()} from Garud Aqua Solutions.`,
                            url: `${SITE_URL}/blogs/category/${slug}`,
                        })
                    ),
                }}
            />
            <Suspense
                fallback={
                    <div className="min-h-screen bg-gray-50 dark:bg-black">
                        <div className="bg-[#2C2C2C] py-24">
                            <div className="container mx-auto px-4 text-center">
                                <div className="h-14 w-64 bg-white/10 rounded mx-auto mb-6 animate-pulse" />
                                <div className="h-6 w-96 bg-white/10 rounded mx-auto animate-pulse" />
                            </div>
                        </div>
                    </div>
                }
            >
                <BlogsClient
                    initialCategories={categories}
                    initialBlogs={blogs}
                    initialTotal={blogs.length}
                    initialTotalPages={totalPages}
                    initialCategory={slug}
                />
            </Suspense>
        </>
    );
}
