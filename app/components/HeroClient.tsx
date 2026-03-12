"use client";
import dynamic from "next/dynamic";

// Loaded client-side only — its JS chunk is NOT in the critical render path,
// so it does not delay LCP. HeroStaticShell in page.tsx paints slide 0 from
// the SSR HTML stream while this chunk downloads in the background.
const Hero = dynamic(() => import("./hero"), { ssr: false });

interface HeroSlide {
    id: string;
    image: string;
    mobileImage: string;
    title: string;
    order: number;
    isActive: boolean;
}

export default function HeroClient({ initialSlides }: { initialSlides: HeroSlide[] }) {
    return <Hero initialSlides={initialSlides} />;
}
