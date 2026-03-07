import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Hero from './components/hero';
import Footer from './components/Footer';
import { prisma } from '@/lib/prisma';

// Lazy load below-the-fold components to reduce initial JS bundle
const CategoryShowcase = dynamic(() => import('./components/CategoryShowcase'));
const Benefits = dynamic(() => import('./components/Benefits'));
const ImageGallery = dynamic(() => import('./components/ImageGallery'));
const VideoShowcaseSection = dynamic(() => import('./components/HeroVideoShowcase'));
const Testimonials = dynamic(() => import('./components/Testimonials'));
const Newsletter = dynamic(() => import('./components/Newsletter'));

// ISR: serve cached page, revalidate every 60s in the background
export const revalidate = 60;

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
  },
};

// Build a Cloudinary URL for preloading
function buildPreloadUrl(src: string, width: number, quality: number) {
  if (!src.includes('res.cloudinary.com')) return src;
  const params = `w_${width},q_${quality},f_webp,c_limit`;
  return src.replace('/upload/', `/upload/${params}/`);
}

function buildPreloadSrcSet(src: string, quality: number, widths: number[]) {
  return widths
    .map(w => `${buildPreloadUrl(src, w, quality)} ${w}w`)
    .join(', ');
}

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
    const [categories, subcategories] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, isActive: true, image: true, description: true },
      }),
      prisma.subcategory.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
        include: { category: { select: { id: true, name: true } } },
        
      }),
    ]);
    return {
      categories: categories.map(c => ({ id: c.id, name: c.name, isActive: c.isActive, image: c.image, description: c.description })),
      subcategories: subcategories.map(s => ({ id: s.id, name: s.name, isActive: s.isActive, image: s.image, category: { id: s.category.id, name: s.category.name } })),
    };
  } catch {
    return { categories: [], subcategories: [] };
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
  const [heroSlides, categoryData, galleryItems, videoData] = await Promise.all([
    getHeroSlides(),
    getCategoryData(),
    getGalleryData(),
    getVideoData(),
  ]);

  return (
    <main className="min-h-screen relative overflow-x-hidden">
      {/* Preload first hero slide LCP image — starts fetching before JS hydration */}
      {heroSlides.length > 0 && heroSlides[0].mobileImage && (
        <link
          rel="preload"
          as="image"
          type="image/webp"
          imageSrcSet={buildPreloadSrcSet(heroSlides[0].mobileImage, 50, [256, 384, 640])}
          imageSizes="(min-width: 641px) 1px, 240px"
          fetchPriority="high"
        />
      )}
      {heroSlides.length > 0 && heroSlides[0].image && (
        <link
          rel="preload"
          as="image"
          type="image/webp"
          imageSrcSet={buildPreloadSrcSet(heroSlides[0].image, 50, [640, 828, 1080, 1200])}
          imageSizes="(max-width: 640px) 1px, 1200px"
          fetchPriority="high"
        />
      )}
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-linear-to-br from-white via-[#FEFEFE] to-[#F3F8FE] dark:from-black dark:via-[#050505] dark:to-[#0A0A0A] -z-10" />

      {/* Hero Section */}
      <Hero initialSlides={heroSlides} />
      {/*Category Showcase*/}
      <CategoryShowcase initialCategories={categoryData.categories} initialSubcategories={categoryData.subcategories} />
      <Benefits/>
      <ImageGallery initialItems={galleryItems}/>
      <VideoShowcaseSection initialVideos={videoData}/>
      <Testimonials/>
      <Newsletter/>
      <Footer/>
      
      
    </main>
  );
}