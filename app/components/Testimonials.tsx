"use client";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { useAnimateOnView } from "@/lib/useAnimateOnView";

export default function Testimonials() {
    const testimonials = [
        // Rajasthan - city-specific testimonials
        {
            id: 1,
            name: "Suresh Verma",
            role: "Dealer",
            location: "Kota, Rajasthan",
            text: "Garud Aqua's tanks have been a game-changer in Kota. Durable materials, timely deliveries, and excellent dealer support — we've seen steady repeat orders from local customers.",
            rating: 5,
            image: "SV",
            purchase: "3-Layer Overhead Tanks",
        },
        {
            id: 2,
            name: "Ramesh Yadav",
            role: "Contractor",
            location: "Dausa, Rajasthan",
            text: "We installed Garud Aqua tanks and piping across several villages near Dausa. The build quality and fit-and-forget performance have impressed both homeowners and site engineers.",
            rating: 5,
            image: "RY",
            purchase: "Overhead & Underground Tanks",
        },
        {
            id: 3,
            name: "Kamla Devi",
            role: "Builder",
            location: "Sriganganagar, Rajasthan",
            text: "For our residential projects around the Ganganagar area, Garud Aqua supplies have been consistently reliable. The tanks withstand local conditions and customer satisfaction is high.",
            rating: 5,
            image: "KD",
            purchase: "Loft & Farm Tanks",
        },
        {
            id: 4,
            name: "Amit Bhandari",
            role: "Distributor",
            location: "Ajmer, Rajasthan",
            text: "Ajmer customers prefer Garud Aqua for its durability and UV resistance. Our orders keep growing and the brand trust is strong in the region.",
            rating: 5,
            image: "AB",
            purchase: "UV-Resistant Tanks & Pipes",
        },

        // Punjab - region level (no city specified)
        {
            id: 5,
            name: "Baldev Singh",
            role: "Dealer",
            location: "Punjab Region",
            text: "Across Punjab, Garud Aqua products are known for consistent quality and quick supply. Farmers and builders both appreciate the robust tanks and reliable fittings.",
            rating: 5,
            image: "BS",
            purchase: "Agriculture Tanks & Fittings",
        },
        {
            id: 6,
            name: "Simran Kaur",
            role: "Plumbing Contractor",
            location: "Punjab Region",
            text: "Working across several districts in Punjab, we choose Garud Aqua because their pipes and tanks handle varied water conditions well and the after-sales service is responsive.",
            rating: 5,
            image: "SK",
            purchase: "CPVC & PVC Pipes",
        },
    ];

    const stats = [
        { number: "500+", label: "Dealers Nationwide" },
        { number: "4.8", label: "Average Rating" },
        { number: "98%", label: "Reorder Rate" },
        { number: "24/7", label: "Dealer Support" },
    ];

    const formattedTestimonials = testimonials.map((testimonial) => ({
        quote: testimonial.text,
        name: testimonial.name,
        title: `${testimonial.role} • ${testimonial.location}`,
        rating: testimonial.rating,
        image: testimonial.image,
        purchase: testimonial.purchase,
    }));

    const ref = useAnimateOnView();

    return (
        <section ref={ref as React.RefObject<HTMLElement>} className="py-20 lg:py-32 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-linear-to-br from-[#FAFAFA] via-white to-[#F0F9FF] dark:from-black dark:via-[#050505] dark:to-[#0A0A0A]" />

            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-96 h-96 bg-linear-to-br from-[#0EA5E9] to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-linear-to-tl from-[#0369A1] to-transparent rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                {/* Section Header */}
                <div className="animate-on-view text-center mb-16 lg:mb-20">
                    <div className="inline-block mb-6">
                        <div className="text-sm md:text-base text-[#0EA5E9] font-light tracking-[0.2em] uppercase relative">
                            Testimonials
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-px bg-linear-to-r from-transparent via-[#0EA5E9] to-transparent" />
                        </div>
                    </div>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-[#2C2C2C] dark:text-gray-100 tracking-tight mb-6">
                        Trusted by Dealers & Builders
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-light max-w-3xl mx-auto leading-relaxed">
                        Hear from the contractors, dealers, and builders who rely on Garud Aqua for quality water storage and plumbing solutions.
                    </p>
                </div>

                {/* Stats Row */}
                <div className="animate-on-view grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16" style={{ animationDelay: '0.2s' }}>
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="text-center group"
                        >
                            <h3 className="text-3xl lg:text-4xl font-light text-[#0EA5E9] mb-2 group-hover:scale-110 transition-transform duration-300">
                                {stat.number}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 font-light">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Infinite Moving Cards - Testimonials */}
                <div className="animate-on-view mb-12" style={{ animationDelay: '0.4s' }}>
                    <InfiniteMovingCards items={formattedTestimonials} direction="left" speed="slow" pauseOnHover={true} />
                </div>
            </div>
        </section>
    );
}
