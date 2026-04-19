"use client";

import React, { useState, useEffect } from "react";
import NavigationLink from "./NavigationLink";

export default function Footer() {
    const [blogCategories, setBlogCategories] = useState<any[]>([]);

    useEffect(() => {
        const load = () => {
            fetch("/api/blog-categories")
                .then(res => res.json())
                .then(data => Array.isArray(data) && setBlogCategories(data))
                .catch(() => {});
        };
        if (typeof requestIdleCallback !== "undefined") {
            const id = requestIdleCallback(load);
            return () => cancelIdleCallback(id);
        }
        const t = setTimeout(load, 200);
        return () => clearTimeout(t);
    }, []);
    return (
        <footer className="bg-[#2C2C2C] dark:bg-black text-white border-t border-transparent dark:border-white/6" style={{ viewTransitionName: 'footer-section' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
                    <div className="sm:col-span-2 lg:col-span-1 space-y-6">
                        <h3 className="text-2xl font-light tracking-widest">Garud Aqua Solutions</h3>
                        <p className="text-gray-400 font-light leading-relaxed">
                            A Bond of Trust & Quality — your reliable partner for water tanks, pipes & fittings.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://www.facebook.com/garudtank/" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook" className="w-10 h-10 rounded-full border border-gray-700 hover:border-[#0EA5E9] flex items-center justify-center transition-colors">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-light text-lg mb-6 text-[#0EA5E9]">Explore</h4>
                        <ul className="space-y-1">
                            <li><NavigationLink href="/" className="inline-block py-1.5 text-gray-400 hover:text-[#0EA5E9] transition-colors font-light link-hover-slide">Home</NavigationLink></li>
                            <li><NavigationLink href="/products" className="inline-block py-1.5 text-gray-400 hover:text-[#0EA5E9] transition-colors font-light link-hover-slide">Products</NavigationLink></li>
                            <li><NavigationLink href="/blogs" className="inline-block py-1.5 text-gray-400 hover:text-[#0EA5E9] transition-colors font-light link-hover-slide">Blog</NavigationLink></li>
                            <li><NavigationLink href="/about" className="inline-block py-1.5 text-gray-400 hover:text-[#0EA5E9] transition-colors font-light link-hover-slide">About Us</NavigationLink></li>
                            <li><NavigationLink href="/contact" className="inline-block py-1.5 text-gray-400 hover:text-[#0EA5E9] transition-colors font-light link-hover-slide">Contact</NavigationLink></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-light text-lg mb-6 text-[#0EA5E9]">Our Categories</h4>
                        <ul className="space-y-1">
                            <li><NavigationLink href="/categories/blow-mould-tank" className="inline-block py-1.5 text-gray-400 hover:text-[#0EA5E9] transition-colors font-light link-hover-slide">Blow Mould Tanks</NavigationLink></li>
                            <li><NavigationLink href="/categories/roto-mould-tank" className="inline-block py-1.5 text-gray-400 hover:text-[#0EA5E9] transition-colors font-light link-hover-slide">Roto Mould Tanks</NavigationLink></li>
                            <li><NavigationLink href="/categories/agriculture-sprayer-tank" className="inline-block py-1.5 text-gray-400 hover:text-[#0EA5E9] transition-colors font-light link-hover-slide">Agriculture Sprayer Tanks</NavigationLink></li>
                            <li><NavigationLink href="/categories/cpvc-pipes-and-fittings" className="inline-block py-1.5 text-gray-400 hover:text-[#0EA5E9] transition-colors font-light link-hover-slide">CPVC Pipes & Fittings</NavigationLink></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-light text-lg mb-6 text-[#0EA5E9]">Blog Topics</h4>
                        <ul className="space-y-1">
                            <li><NavigationLink href="/blogs" className="inline-block py-1.5 text-gray-400 hover:text-[#0EA5E9] transition-colors font-light link-hover-slide">All Articles</NavigationLink></li>
                            {blogCategories.map((cat: any) => (
                                <li key={cat.id}>
                                    <NavigationLink href={`/blogs/category/${cat.slug}`} className="inline-block py-1.5 text-gray-400 hover:text-[#0EA5E9] transition-colors font-light">
                                        {cat.name}
                                    </NavigationLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="font-light text-lg mb-6 text-[#0EA5E9]">Contact Us</h4>
                        <ul className="space-y-4 text-gray-400 font-light text-sm">
                            <li className="flex items-start gap-3">
                                <svg className="w-4 h-4 text-[#0EA5E9] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <a href="tel:+919462594603" className="hover:text-[#0EA5E9] transition-colors leading-relaxed">+91 94625 94603</a>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-4 h-4 text-[#0EA5E9] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <a href="mailto:contact@garudaqua.in" className="hover:text-[#0EA5E9] transition-colors">contact@garudaqua.in</a>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-4 h-4 text-[#0EA5E9] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="leading-relaxed">
                                    Ground, Murraba No. 62, Killa No. 2,<br />
                                    Sihagawali To Akkawali Road, 23 SDS,<br />
                                    Sadulshahar, Ganganagar  335062<br />
                                    Rajasthan, India<br />
                                    <a href="https://maps.app.goo.gl/LH69FP4CLybZSRAX7" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-[#0EA5E9] hover:underline font-medium">View on Google Maps</a>
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
                
                <div className="mt-16 pt-8 border-t border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 font-light text-sm">
                            © 2026 Garud Aqua Solutions. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}