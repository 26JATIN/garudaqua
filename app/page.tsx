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

export default async function Home() {
  const heroSlides = await getHeroSlides();

  return (
    <main className="min-h-screen relative overflow-x-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-linear-to-br from-white via-[#FEFEFE] to-[#F3F8FE] dark:from-black dark:via-[#050505] dark:to-[#0A0A0A] -z-10" />

      {/* Hero Section */}
      <Hero initialSlides={heroSlides} />
      {/*Category Showcase*/}
      <CategoryShowcase />
      <Benefits/>
      <ImageGallery/>
      <VideoShowcaseSection/>
      <Testimonials/>
      <Newsletter/>
      <Footer/>
      
      
    </main>
  );
}