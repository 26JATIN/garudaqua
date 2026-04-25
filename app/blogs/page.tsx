import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import BlogsClient from './BlogsClient';
import { collectionPageSchema } from '@/lib/jsonld';

export const dynamic = "force-static";

const BLOGS_PAGE_SIZE = 12;

export const metadata: Metadata = {
  title: 'Blog — Tips, Guides & Insights | Garud Aqua Solutions',
  description:
    'Expert tips, guides, and insights on water tanks, pipes & plumbing solutions from Garud Aqua Solutions.',
  alternates: { canonical: 'https://www.garudaqua.in/blogs' },
  openGraph: {
    url: 'https://www.garudaqua.in/blogs',
    title: 'Blog — Tips, Guides & Insights | Garud Aqua Solutions',
    description:
      'Expert tips, guides, and insights on water tanks, pipes & plumbing solutions.',
  },
};




async function getInitialData() {
  const [categories, blogsData] = await Promise.all([
    prisma.blogCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
    prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: BLOGS_PAGE_SIZE,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        featuredImage: true,
        category: true,
        categoryId: true,
        tags: true,
        readTime: true,
        publishedAt: true,
        author: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        blogCategory: { select: { name: true } },
      },
    }),
  ]);

  const total = await prisma.blogPost.count({ where: { isPublished: true } });

  return {
    categories,
    blogs: blogsData.map((b) => ({
      ...b,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
      publishedAt: b.publishedAt ? b.publishedAt.toISOString() : new Date().toISOString(),
    })),
    total,
    totalPages: Math.ceil(total / BLOGS_PAGE_SIZE),
  };
}

export default async function Page() {
  const { categories, blogs, totalPages } = await getInitialData();

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 via-white to-gray-50 dark:from-black dark:via-[#050505] dark:to-[#0A0A0A] md:py-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema({
        name: "Blog — Tips, Guides & Insights",
        description: "Expert tips, guides, and insights on water tanks, pipes & plumbing solutions from Garud Aqua Solutions.",
        url: "https://www.garudaqua.in/blogs",
      })) }} />
      <section className="relative bg-linear-to-br from-[#2C2C2C] via-[#3A3A3A] to-[#2C2C2C] text-white py-14 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-5" aria-hidden="true">
          <div className="absolute top-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-[#2C2C2C] rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-[#2C2C2C] rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 mt-6 md:mt-0">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-wide mb-4 md:mb-6 text-white">
              Our <span className="text-[#7DD3FC]">Blog</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl font-light text-gray-300 max-w-2xl mx-auto leading-relaxed px-2 md:px-0">
              Expert tips, guides, and insights on water tanks, pipes & plumbing solutions
            </p>
          </div>
        </div>
      </section>
        <BlogsClient
          initialCategories={categories}
          initialBlogs={blogs}
          initialTotal={blogs.length}
          initialTotalPages={totalPages}
        />
    </div>
  );
}
