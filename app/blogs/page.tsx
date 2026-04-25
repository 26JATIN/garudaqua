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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema({
        name: "Blog — Tips, Guides & Insights",
        description: "Expert tips, guides, and insights on water tanks, pipes & plumbing solutions from Garud Aqua Solutions.",
        url: "https://www.garudaqua.in/blogs",
      })) }} />
        <BlogsClient
          initialCategories={categories}
          initialBlogs={blogs}
          initialTotal={blogs.length}
          initialTotalPages={totalPages}
        />
    </>
  );
}
