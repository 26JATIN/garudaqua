import type { Metadata } from "next";
import dynamicImports from "next/dynamic";
import Hero from './components/hero';
import { prisma } from '@/lib/prisma';
import { webPageSchema, videoSchema } from '@/lib/jsonld';

export const dynamic = "force-static";

// Lazy load below-the-fold components to reduce initial JS bundle
const CategoryShowcase = dynamicImports(() => import('./components/CategoryShowcase'));
const Benefits = dynamicImports(() => import('./components/Benefits'));
const ImageGallery = dynamicImports(() => import('./components/ImageGallery'));
const VideoShowcaseSection = dynamicImports(() => import('./components/HeroVideoShowcase'));
const Testimonials = dynamicImports(() => import('./components/Testimonials'));
const LatestBlogs = dynamicImports(() => import('./components/LatestBlogs'));
const Newsletter = dynamicImports(() => import('./components/Newsletter'));
const Footer = dynamicImports(() => import('./components/Footer'));




export const metadata: Metadata = {
  title: "Garud Aqua Solutions — Water Tanks, Pipes & Fittings | Sriganganagar",
  description:
    "Garud Aqua Solutions is Sriganganagar's trusted supplier of HDPE water tanks, PVC pipes, pipe fittings & agricultural water management products. A Bond of Trust & Quality.",
  alternates: { canonical: "https://garudaqua.in" },
  openGraph: {
    url: "https://garudaqua.in",
    title: "Garud Aqua Solutions — Water Tanks, Pipes & Fittings",
    description:
      "Sriganganagar's trusted supplier of HDPE water tanks, PVC pipes & agricultural water management products.",
    images: [{ url: "https://garudaqua.in/DesktopLogo.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Garud Aqua Solutions — Water Tanks, Pipes & Fittings",
    description:
      "Sriganganagar's trusted supplier of HDPE water tanks, PVC pipes & agricultural water management products.",
    images: ["https://garudaqua.in/DesktopLogo.png"],
  },
};



async function getHeroSlides() {
  try {
    const slides = await prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
    return slides.map(s => ({
      id: s.id,
      image: s.image,
      mobileImage: s.mobileImage,
      title: s.title,
      order: s.order,
      isActive: s.isActive,
    }));
  } catch {
    return [];
  }
}

async function getCategoryData() {
  try {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, isActive: true, image: true, description: true },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: [{ category: { sortOrder: "asc" as const } }, { createdAt: "desc" as const }],
        take: 100,
        include: { category: { select: { id: true, name: true } } },
      }),
    ]);
    return {
      categories: categories.map(c => ({ id: c.id, name: c.name, isActive: c.isActive, image: c.image, description: c.description })),
      products: products.map(p => ({ 
        id: p.id, 
        name: p.name, 
        isActive: p.isActive, 
        image: p.image, 
        description: p.description,
        category: p.category ? { id: p.category.id, name: p.category.name } : { id: "", name: "" }
      })),
    };
  } catch {
    return { categories: [], products: [] };
  }
}

async function getGalleryData() {
  try {
    const items = await prisma.galleryItem.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
    return items
      .filter(item => item.mediaType === "IMAGE")
      .map(item => ({ image: item.mediaUrl, text: item.title }));
  } catch {
    return [];
  }
}

async function getBlogData() {
  try {
    const [categories, blogs] = await Promise.all([
      prisma.blogCategory.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: { id: true, name: true, slug: true },
      }),
      prisma.blogPost.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: "desc" },
        take: 6,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          featuredImage: true,
          readTime: true,
          publishedAt: true,
          categoryId: true,
          blogCategory: { select: { name: true } },
        },
      }),
    ]);
    return {
      categories,
      blogs: blogs.map(b => ({
        ...b,
        publishedAt: b.publishedAt?.toISOString() ?? new Date().toISOString(),
      })),
    };
  } catch {
    return { categories: [], blogs: [] };
  }
}

async function getVideoData() {
  try {
    const videos = await prisma.heroVideo.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
    return videos.map(v => ({
      id: v.id,
      title: v.title,
      description: v.description,
      videoUrl: v.videoUrl,
      thumbnailUrl: v.thumbnailUrl,
      order: v.order,
      isActive: v.isActive,
      duration: v.duration,
      linkedProductId: v.linkedProductId,
    }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const [heroSlides, categoryData, galleryItems, videoData, blogData] = await Promise.all([
    getHeroSlides(),
    getCategoryData(),
    getGalleryData(),
    getVideoData(),
    getBlogData(),
  ]);

  return (
    <main className="min-h-screen relative overflow-x-clip">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema({
        name: "Garud Aqua Solutions — Water Tanks, Pipes & Fittings",
        description: "Sriganganagar's trusted supplier of HDPE water tanks, PVC pipes, fittings & agricultural water management products.",
        url: "https://garudaqua.in",
      })) }} />
      {videoData.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(
          videoData.map(v => videoSchema({
            name: v.title,
            description: v.description || `${v.title} — product showcase by Garud Aqua Solutions`,
            thumbnailUrl: v.thumbnailUrl,
            uploadDate: new Date().toISOString(),
            contentUrl: v.videoUrl,
            duration: v.duration ? `PT${v.duration}S` : undefined,
          }))
        ) }} />
      )}

      {/* Gradient Background */}
      <div className="fixed inset-0 bg-linear-to-br from-white via-[#FEFEFE] to-[#F3F8FE] dark:from-black dark:via-[#050505] dark:to-[#0A0A0A] -z-10" />

      {/* Hero Section */}
      <Hero initialSlides={heroSlides} />
      {/*Category Showcase*/}
      <CategoryShowcase initialCategories={categoryData.categories} initialProducts={categoryData.products} />
      <div className="section-lazy">
        <Benefits/>
      </div>
      <div className="section-lazy">
        <ImageGallery initialItems={galleryItems}/>
      </div>
      <div className="section-lazy">
        <VideoShowcaseSection initialVideos={videoData}/>
      </div>
      <div className="section-lazy">
        <Testimonials/>
      </div>
      {blogData.blogs.length > 0 && (
        <div className="section-lazy">
          <LatestBlogs blogs={blogData.blogs} categories={blogData.categories} />
        </div>
      )}
      <div className="section-lazy">
        <Newsletter/>
      </div>
      <Footer/>
      
      
    </main>
  );
}