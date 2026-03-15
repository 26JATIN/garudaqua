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
        fill: true,
        priority: true,
        fetchPriority: "high" as const,
        loading: "eager" as const,
        quality: 60,
    };

    let LCPImage = null;
    if (!slide.mobileImage) {
        LCPImage = (
            <Image
                src={slide.image}
                alt={slide.title || "Garud Aqua"}
                {...common}
                sizes="100vw"
                decoding="sync"
                className="object-cover object-top"
            />
        );
    } else {
        const {
            props: { srcSet: desktopSrcSet },
        } = getImageProps({
            ...common,
            alt: slide.title || "Garud Aqua",
            src: slide.image,
            sizes: "100vw",
        });

        const {
            props: { srcSet: mobileSrcSet, ...rest },
        } = getImageProps({
            ...common,
            alt: slide.title || "Garud Aqua",
            src: slide.mobileImage,
            sizes: "100vw",
        });

        LCPImage = (
            <picture>
                <source media="(min-width: 641px)" srcSet={desktopSrcSet} />
                <source media="(max-width: 640px)" srcSet={mobileSrcSet} />
                <img
                    {...rest}
                    alt={slide.title || "Garud Aqua"}
                    decoding="sync"
                    className="w-full h-full object-cover object-top"
                    style={{ position: 'absolute', height: '100%', width: '100%', inset: 0, objectFit: 'cover' }}
                />
            </picture>
        );
    }

    return (
        <section className="relative w-full h-[80vh] min-h-100 max-h-200 lg:h-screen lg:max-h-none overflow-hidden bg-black text-white">
            {/* STAGE 1: Guaranteed Static LCP Image. Renders instantly without React JS */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
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
