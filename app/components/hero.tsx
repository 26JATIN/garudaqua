import Image, { getImageProps } from "next/image";
import HeroClient from "./HeroClient";

interface HeroSlide {
    id: string;
    image: string;
    mobileImage: string;
    title: string;
    order: number;
    isActive: boolean;
}

interface HeroProps {
    initialSlides?: HeroSlide[];
}

export default function Hero({ initialSlides = [] }: HeroProps) {
    if (initialSlides.length === 0) {
        return <HeroClient initialSlides={initialSlides} />;
    }

    const slide = initialSlides[0];

    // Priority props for LCP
    const common = {
        style: { width: '100%', height: 'auto' } as const,
        priority: true,
        fetchPriority: "high" as const,
        loading: "eager" as const,
    };

    // Generate tiny Cloudinary blur placeholder for perceived instant load
    function blurUrl(src: string): string {
        if (!src || !src.includes("res.cloudinary.com")) return "";
        return src
            .replace("/upload/", "/upload/w_20,q_10,e_blur:1000,f_webp/")
            .replace("https://res.cloudinary.com", "/cdn-img");
    }

    const responsiveSizes = "(max-width: 640px) 640px, (max-width: 1024px) 1024px, 100vw";

    let LCPImage = null;
    if (!slide.mobileImage) {
        const { props: { srcSet } } = getImageProps({
            ...common,
            alt: slide.title || "Garud",
            src: slide.image,
            sizes: responsiveSizes,
            quality: 85,
            width: 1920,
            height: 1080,
        });

        LCPImage = (
            <>
                <link rel="preload" as="image" imageSrcSet={srcSet} imageSizes={responsiveSizes} fetchPriority="high" />
                <Image
                    src={slide.image}
                    alt={slide.title || "Garud"}
                    {...common}
                    width={1920}
                    height={1080}
                    sizes={responsiveSizes}
                    quality={85}
                    decoding="async"
                    className="w-full h-auto"
                    placeholder="blur"
                    blurDataURL={blurUrl(slide.image)}
                />
            </>
        );
    } else {
        const {
            props: { srcSet: desktopSrcSet, width: desktopWidth, height: desktopHeight },
        } = getImageProps({
            ...common,
            alt: slide.title || "Garud",
            src: slide.image,
            sizes: responsiveSizes,
            quality: 85,
            width: 1920,
            height: 1080,
        });

        const {
            props: { srcSet: mobileSrcSet, width: mobileWidth, height: mobileHeight, ...rest },
        } = getImageProps({
            ...common,
            alt: slide.title || "Garud",
            src: slide.mobileImage,
            sizes: "100vw",
            quality: 50,
            width: 1080,
            height: 1920,
        });

        LCPImage = (
            <>
                <link rel="preload" as="image" imageSrcSet={desktopSrcSet} media="(min-width: 641px)" fetchPriority="high" />
                <link rel="preload" as="image" imageSrcSet={mobileSrcSet} media="(max-width: 640px)" fetchPriority="high" />
                <picture>
                    <source media="(min-width: 641px)" srcSet={desktopSrcSet} width={desktopWidth as number} height={desktopHeight as number} />
                    <source media="(max-width: 640px)" srcSet={mobileSrcSet} width={mobileWidth as number} height={mobileHeight as number} />
                    <img
                        {...rest}
                        alt={slide.title || "Garud"}
                        decoding="async"
                        className="w-full h-auto"
                    />
                </picture>
            </>
        );
    }

    return (
        <section className="relative w-full overflow-hidden bg-black text-white lg:mt-4.25">
            <h1 className="sr-only">Garud Aqua Solutions — Premium Water Tanks, Agriculture Sprayer Tanks, and CPVC Pipes & Fittings Supplier in India</h1>
            
            {/* STAGE 1: Guaranteed Static LCP Image. Renders instantly without React JS */}
            <div className="relative w-full z-0">
                {LCPImage}
            </div>

            {/* STAGE 2: Hydrate only the slider interactivity (dots, looping, crossfades) */}
            {initialSlides.length > 1 && (
                <div className="absolute inset-0 z-10">
                    <HeroClient initialSlides={initialSlides} />
                </div>
            )}
        </section>
    );
}
