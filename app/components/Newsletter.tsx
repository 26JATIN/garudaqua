"use client";
import "@/app/styles/animations.css";
import React, { useState } from "react";
import { useAnimateOnView } from "@/lib/useAnimateOnView";

export default function Newsletter() {
    const [email, setEmail] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const ref = useAnimateOnView();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsLoading(true);

        setTimeout(() => {
            setIsSubscribed(true);
            setIsLoading(false);
            setEmail("");
        }, 1500);
    };

    const benefits = [
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
            title: "New Product Launches",
            description: "Be the first to know about new tanks & pipes",
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
            ),
            title: "Dealer Pricing Updates",
            description: "Latest bulk pricing and seasonal offers",
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            ),
            title: "Industry Insights",
            description: "Expert tips on water storage & plumbing",
        },
    ];

    // Icons that orbit the circles
    const orbitIcons = [
        <svg key="drop" className="w-5 h-5 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21c-4-4-8-7.5-8-11a8 8 0 1116 0c0 3.5-4 7-8 11z" /></svg>,
        <svg key="wrench" className="w-5 h-5 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></svg>,
        <svg key="shield" className="w-5 h-5 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
        <svg key="cube" className="w-5 h-5 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    ];

    return (
        <section ref={ref as React.RefObject<HTMLElement>} className="py-20 lg:py-32 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-linear-to-br from-[#2C2C2C] via-[#1A1A1A] to-black" />

            {/* CSS-only particles (no JS animation) */}
            <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-[#0EA5E9] rounded-full"
                        style={{
                            left: `${12 + i * 12}%`,
                            top: `${10 + (i % 3) * 30}%`,
                            animation: `particle-pulse ${4 + (i % 3)}s ease-in-out infinite`,
                            animationDelay: `${i * 0.4}s`,
                        }}
                    />
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                    {/* Content Side */}
                    <div className="animate-on-view-left text-white">
                        <div className="mb-8">
                            <div className="animate-on-view inline-block mb-6">
                                <div className="text-sm md:text-base text-[#0EA5E9] font-light tracking-[0.2em] uppercase relative">
                                    Stay Updated
                                    <div className="absolute -bottom-2 left-0 w-full h-px bg-linear-to-r from-[#0EA5E9] to-transparent" />
                                </div>
                            </div>

                            <h2 className="animate-on-view text-4xl md:text-6xl lg:text-7xl font-light tracking-tight mb-6 leading-tight" style={{ animationDelay: '0.1s' }}>
                                Never Miss
                                <br />
                                <span className="text-[#0EA5E9]">An Update</span>
                            </h2>

                            <p className="animate-on-view text-xl md:text-2xl font-light leading-relaxed text-gray-300 mb-8" style={{ animationDelay: '0.2s' }}>
                                Subscribe to our newsletter for the latest product launches, dealer pricing updates, and expert insights on water storage and plumbing solutions.
                            </p>
                        </div>

                        {/* Benefits */}
                        <div className="animate-on-view grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12" style={{ animationDelay: '0.3s' }}>
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="text-center group"
                                >
                                    <div className="w-12 h-12 mx-auto mb-3 bg-[#0EA5E9]/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-[#0EA5E9] group-hover:bg-[#0EA5E9] group-hover:text-white transition-all duration-300">
                                        {benefit.icon}
                                    </div>
                                    <h3 className="font-light mb-1 group-hover:text-[#0EA5E9] transition-colors duration-300">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm font-light">{benefit.description}</p>
                                </div>
                            ))}
                        </div>

                        {/* Newsletter Form */}
                        <div className="animate-on-view" style={{ animationDelay: '0.5s' }}>
                            {!isSubscribed ? (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter your email address"
                                                className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#0EA5E9] transition-colors duration-300"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="px-8 py-4 bg-linear-to-r from-[#0EA5E9] to-[#0369A1] text-white rounded-xl font-light tracking-wide hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Subscribing...
                                                </>
                                            ) : (
                                                <>
                                                    Subscribe
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                    </svg>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-gray-400 text-sm font-light">
                                        By subscribing, you agree to receive product updates from Garud Aqua. Unsubscribe at any time.
                                    </p>
                                </form>
                            ) : (
                                <div className="animate-scaleIn text-center p-8 bg-[#0EA5E9]/20 backdrop-blur-sm rounded-2xl border border-[#0EA5E9]/30">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-[#0EA5E9] rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-light mb-2">You&apos;re In!</h3>
                                    <p className="text-gray-300 font-light">
                                        Thank you for subscribing. You&apos;ll receive our latest product updates and dealer offers.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Visual Side — pure CSS orbiting */}
                    <div className="animate-on-view-right relative hidden lg:block">
                        <div className="relative w-80 h-80 mx-auto">
                            {/* Outer orbiting circle */}
                            <div className="absolute inset-0 border border-[#0EA5E9]/20 rounded-full" style={{ animation: 'orbit-cw 20s linear infinite' }}>
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20" style={{ animation: 'orbit-ccw 20s linear infinite' }}>
                                    {orbitIcons[0]}
                                </div>
                                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20" style={{ animation: 'orbit-ccw 20s linear infinite' }}>
                                    {orbitIcons[1]}
                                </div>
                            </div>

                            {/* Inner orbiting circle (reverse) */}
                            <div className="absolute top-10 left-10 right-10 bottom-10 border border-[#0369A1]/20 rounded-full" style={{ animation: 'orbit-ccw 15s linear infinite' }}>
                                <div className="absolute top-1/2 -right-5 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20" style={{ animation: 'orbit-cw 15s linear infinite' }}>
                                    {orbitIcons[2]}
                                </div>
                                <div className="absolute top-1/2 -left-5 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20" style={{ animation: 'orbit-cw 15s linear infinite' }}>
                                    {orbitIcons[3]}
                                </div>
                            </div>

                            {/* Central Icon */}
                            <div className="animate-on-view-scale absolute inset-0 flex items-center justify-center z-10" style={{ animationDelay: '0.4s' }}>
                                <div className="w-32 h-32 bg-linear-to-br from-[#0EA5E9] to-[#0369A1] rounded-full flex items-center justify-center shadow-2xl">
                                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
