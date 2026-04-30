import Image, { getImageProps } from "next/image";

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
        return null;
    }

    const N = initialSlides.length;
    const T = 5; // seconds per slide
    const F = 1; // fade duration
    const Total = N * T;

    const fadeP = (F / Total) * 100;
    const visibleP = (T / Total) * 100;
    const fadeOutP = ((T + F) / Total) * 100;

    const dynamicStyle = N > 1 ? `
        @keyframes dynamicHeroFade {
            0% { opacity: 0; }
            ${fadeP}% { opacity: 1; }
            ${visibleP}% { opacity: 1; }
            ${fadeOutP}% { opacity: 0; }
            100% { opacity: 0; }
        }
    ` : '';

    return (
        <section className="relative w-full overflow-hidden bg-black text-white lg:mt-4.25 aspect-[4/5] sm:aspect-[16/9]">
            <h1 className="sr-only">Garud Aqua Solutions — Premium Water Tanks, Agriculture Sprayer Tanks, and CPVC Pipes & Fittings Supplier in India</h1>
            
            {N > 1 && <style dangerouslySetInnerHTML={{ __html: dynamicStyle }} />}

            {initialSlides.map((slide, index) => {
                const isLcp = index === 0;

                const common = {
                    style: { width: '100%', height: '100%', objectFit: 'cover' } as const,
                    priority: isLcp,
                    fetchPriority: (isLcp ? "high" : "auto") as "high" | "auto",
                    ...(isLcp ? {} : { loading: "lazy" as const }),
                };

                const responsiveSizes = "(max-width: 640px) 640px, (max-width: 1024px) 1024px, 100vw";

                let SlideImage;
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

                    SlideImage = (
                        <>
                            {isLcp && <link rel="preload" as="image" imageSrcSet={srcSet} imageSizes={responsiveSizes} fetchPriority="high" />}
                            <Image
                                src={slide.image}
                                alt={slide.title || "Garud"}
                                {...common}
                                width={1920}
                                height={1080}
                                sizes={responsiveSizes}
                                quality={85}
                                decoding={isLcp ? "sync" : "async"}
                                className="w-full h-full object-cover"
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

                    SlideImage = (
                        <>
                            {isLcp && (
                                <>
                                    <link rel="preload" as="image" imageSrcSet={desktopSrcSet} media="(min-width: 641px)" fetchPriority="high" />
                                    <link rel="preload" as="image" imageSrcSet={mobileSrcSet} media="(max-width: 640px)" fetchPriority="high" />
                                </>
                            )}
                            <picture className="w-full h-full block">
                                <source media="(min-width: 641px)" srcSet={desktopSrcSet} width={desktopWidth as number} height={desktopHeight as number} />
                                <source media="(max-width: 640px)" srcSet={mobileSrcSet} width={mobileWidth as number} height={mobileHeight as number} />
                                <img
                                    {...rest}
                                    alt={slide.title || "Garud"}
                                    decoding={isLcp ? "sync" : "async"}
                                    className="w-full h-full object-cover"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </picture>
                        </>
                    );
                }

                const delay = index * T - F;
                const animStyle = N > 1 ? {
                    animation: `dynamicHeroFade ${Total}s infinite`,
                    animationDelay: `${delay}s`,
                    opacity: 0,
                } : { opacity: 1 };

                return (
                    <div 
                        key={slide.id} 
                        className="absolute inset-0 w-full h-full"
                        style={animStyle}
                    >
                        {SlideImage}
                    </div>
                );
            })}
        </section>
    );
}
