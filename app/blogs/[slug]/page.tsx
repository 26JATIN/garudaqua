import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import BlogPostClient from "./BlogPostClient";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  try {
    const { slug } = await params;
    const blog = await prisma.blogPost.findUnique({
      where: { slug, isPublished: true },
      select: {
        title: true,
        excerpt: true,
        featuredImage: true,
        author: true,
        publishedAt: true,
        tags: true,
      },
    });

    if (!blog) return { title: "Article Not Found" };

    const url = `https://garudaqua.in/blogs/${slug}`;
    const description =
      blog.excerpt?.slice(0, 155) ||
      `Read "${blog.title}" on the Garud Aqua Solutions blog — water management tips and industry insights.`;

    return {
      title: blog.title,
      description,
      keywords: Array.isArray(blog.tags) ? (blog.tags as string[]) : [],
      alternates: { canonical: url },
      openGraph: {
        type: "article",
        url,
        title: `${blog.title} | Garud Aqua Solutions`,
        description,
        publishedTime: blog.publishedAt?.toISOString(),
        authors: [blog.author || "Garud Aqua Solutions"],
        images: blog.featuredImage
          ? [{ url: blog.featuredImage, alt: blog.title }]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: `${blog.title} | Garud Aqua Solutions`,
        description,
        images: blog.featuredImage ? [blog.featuredImage] : [],
      },
    };
  } catch {
    return { title: "Blog | Garud Aqua Solutions" };
  }
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  return <BlogPostClient params={params} />;
}

