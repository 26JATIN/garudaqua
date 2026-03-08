import { Suspense } from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import BlogsClient from './BlogsClient';
import { collectionPageSchema } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'Blog — Tips, Guides & Insights | Garud Aqua Solutions',
  description:
    'Expert tips, guides, and insights on water tanks, pipes & plumbing solutions from Garud Aqua Solutions.',
  alternates: { canonical: 'https://garudaqua.in/blogs' },
  openGraph: {
    url: 'https://garudaqua.in/blogs',
    title: 'Blog — Tips, Guides & Insights | Garud Aqua Solutions',
    description:
      'Expert tips, guides, and insights on water tanks, pipes & plumbing solutions.',
  },
};

export const revalidate = 60;

async function getInitialData() {
  const [categories, blogsData] = await Promise.all([
    prisma.blogCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
    prisma.blogPost.findMany({
      where: { isPublished: true },
      include: { blogCategory: { select: { name: true } } },
      orderBy: { publishedAt: 'desc' },
      take: 10,
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
    totalPages: Math.ceil(total / 10),
  };
}

export default async function Page() {
  const { categories, blogs, totalPages } = await getInitialData();

  const preloadImages = blogs
    .filter((b: { featuredImage?: string }) => b.featuredImage?.includes('res.cloudinary.com'))
    .slice(0, 1)
    .map((b: { featuredImage: string }) =>
      b.featuredImage.replace('/upload/', '/upload/w_640,q_75,f_auto,c_limit/')
    );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema({
        name: "Blog — Tips, Guides & Insights",
        description: "Expert tips, guides, and insights on water tanks, pipes & plumbing solutions from Garud Aqua Solutions.",
        url: "https://garudaqua.in/blogs",
      })) }} />
      {preloadImages.map((src: string) => (
        <link key={src} rel="preload" as="image" href={src} fetchPriority="high" />
      ))}
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-black">
          <div className="bg-[#2C2C2C] py-24">
            <div className="container mx-auto px-4 text-center">
              <div className="h-14 w-64 bg-white/10 rounded mx-auto mb-6 animate-pulse" />
              <div className="h-6 w-96 bg-white/10 rounded mx-auto animate-pulse" />
            </div>
          </div>
          <div className="container mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-3xl overflow-hidden bg-white dark:bg-[#0A0A0A] shadow-md">
                  <div className="h-56 bg-gray-200 dark:bg-white/10 animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 w-24 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
                    <div className="h-6 w-full bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }>
        <BlogsClient
          initialCategories={categories}
          initialBlogs={blogs}
          initialTotal={blogs.length}
          initialTotalPages={totalPages}
        />
      </Suspense>
    </>
  );
}
