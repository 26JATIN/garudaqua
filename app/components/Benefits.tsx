"use client";
import React from "react";
import { useAnimateOnView } from "@/lib/useAnimateOnView";

export default function Benefits() {
    const ref = useAnimateOnView();

    const benefits: { id: number; title: string; description: string; details: string; icon: React.ReactNode; color: string }[] = [
        {
            id: 1,
            title: "ISI Certified",
            description: "Every product meets BIS standards",
            details: "Quality you can trust for safe water storage and plumbing",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            color: "from-[#0EA5E9] to-[#0369A1]",
        },
        {
            id: 2,
            title: "Pan-India Delivery",
            description: "Nationwide distribution network",
            details: "Fast and reliable supply chain across all states",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h1l2-6h12l2 6h1m-1 0a2 2 0 012 2v5a1 1 0 01-1 1h-1a2 2 0 01-4 0H9a2 2 0 01-4 0H4a1 1 0 01-1-1v-5a2 2 0 012-2z" />
                </svg>
            ),
            color: "from-emerald-500 to-teal-600",
        },
        {
            id: 3,
            title: "B2B Pricing",
            description: "Competitive bulk order rates",
            details: "Volume discounts and flexible payment terms for dealers",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: "from-purple-500 to-violet-600",
        },
        {
            id: 4,
            title: "Expert Support",
            description: "Dedicated technical assistance",
            details: "From product selection to after-sales service, we&apos;re here to help",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            color: "from-blue-500 to-indigo-600",
        },
    ];

    return (
        <section ref={ref as React.RefObject<HTMLElement>} className="py-20 lg:py-32 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-linear-to-br from-white via-[#FAFAFA] to-[#F0F9FF] dark:from-black dark:via-[#050505] dark:to-[#0A0A0A]" />

            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-linear-to-br from-[#0EA5E9] to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-linear-to-tl from-[#0369A1] to-transparent rounded-full blur-3xl" />
            </div>

            <div className="max-w-screen-2xl mx-auto px-4 relative z-10">
                {/* Section Header */}
                <div className="animate-on-view text-center mb-16 lg:mb-20">
                    <div className="inline-block mb-6">
                        <div className="text-sm md:text-base text-[#0EA5E9] font-light tracking-[0.2em] uppercase relative">
                            Why Choose Garud
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-px bg-linear-to-r from-transparent via-[#0EA5E9] to-transparent" />
                        </div>
                    </div>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-light text-[#2C2C2C] dark:text-gray-100 tracking-tight mb-6">
                        Built for Reliability
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-light max-w-3xl mx-auto leading-relaxed">
                        Trusted water storage and plumbing solutions backed by quality, service, and expertise.
                    </p>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {benefits.map((benefit, index) => (
                        <div
                            key={benefit.id}
                            className={`animate-on-view group relative`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="relative bg-white dark:bg-[#0A0A0A] rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-white/6 group-hover:border-[#0EA5E9]/30 h-full card-interactive">
                                {/* Icon */}
                                <div className="relative mb-6">
                                    <div className={`w-20 h-20 rounded-2xl bg-linear-to-br ${benefit.color} flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                                        {benefit.icon}
                                    </div>
                                    <div className={`absolute inset-0 w-20 h-20 rounded-2xl bg-linear-to-br ${benefit.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`} />
                                </div>

                                {/* Content */}
                                <div className="space-y-4">
                                    <h3 className="text-xl lg:text-2xl font-light text-[#2C2C2C] dark:text-gray-100 group-hover:text-[#0EA5E9] transition-colors duration-300">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                                        {benefit.description}
                                    </p>
                                    <p className="text-sm text-gray-500 font-light leading-relaxed">
                                        {benefit.details}
                                    </p>
                                </div>

                                {/* Hover Arrow */}
                                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                    <div className="w-8 h-8 bg-[#0EA5E9] rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="animate-on-view text-center mt-16" style={{ animationDelay: '0.6s' }}>
                    <p className="text-lg text-gray-600 dark:text-gray-400 font-light mb-6">
                        Join hundreds of dealers and builders who rely on Garud for quality products
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <div className="flex -space-x-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-linear-to-br from-[#0EA5E9] to-[#0369A1] border-2 border-white dark:border-black flex items-center justify-center text-white text-xs font-light">
                                    {String.fromCharCode(65 + i)}
                                </div>
                            ))}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-light ml-3">
                            Trusted by 500+ dealers nationwide
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
