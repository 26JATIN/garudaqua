"use client";

import NavigationLink from "@/app/components/NavigationLink";
import { WobbleCard } from "@/components/ui/wobble-card";
import { Timeline } from "@/components/ui/timeline";
import { useAnimateOnView } from "@/lib/useAnimateOnView";

export default function AboutPage() {
    const ref = useAnimateOnView();

    return (
        <main ref={ref as React.RefObject<HTMLElement>} className="min-h-screen bg-white dark:bg-[#0A0A0A] overflow-x-clip">
            <section className="about-hero max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-4 sm:pt-18 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left — headline */}
                    <div className="animate-on-view-left">
                        <p className="text-[#0369A1] dark:text-[#38BDF8] text-sm font-medium tracking-wide mb-5">
                            GARUD AQUA SOLUTIONS · SRIGANGANAGAR, INDIA
                        </p>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-gray-900 dark:text-white leading-[1.06] tracking-tight mb-3">
                            Garud Aqua
                            <br />
                            Solutions
                        </h1>

                        <div className="w-16 h-0.5 bg-[#0EA5E9] mb-6" />

                        <p className="text-gray-600 dark:text-white/50 text-lg leading-relaxed max-w-md mb-3">
                            Trusted manufacturer, retailer, and wholesale supplier of water storage tanks, sprayer tanks, and CPVC/PVC piping systems.
                        </p>

                        <p className="text-gray-500 dark:text-white/30 text-xs font-medium tracking-widest uppercase mb-8">
                            Since 2014 · Rajasthan, India
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <NavigationLink href="/products"
                                className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-semibold rounded-full hover:bg-gray-800 dark:hover:bg-white/90 transition-colors"
                            >
                                View Products
                            </NavigationLink>
                            <NavigationLink href="/contact"
                                className="px-6 py-3 bg-gray-100 dark:bg-white/8 border border-gray-200 dark:border-white/15 text-gray-900 dark:text-white text-sm font-medium rounded-full hover:bg-gray-200 dark:hover:bg-white/12 transition-colors"
                            >
                                Contact Us
                            </NavigationLink>
                        </div>
                    </div>

                    {/* Right — wobble cards grid */}
                    <div className="animate-on-view-right grid grid-cols-1 gap-3">
                        {/* Top card — company card */}
                        <WobbleCard containerClassName="bg-[#1a237e]">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <p className="text-white font-bold text-xl mb-1">Garud Aqua Solutions</p>
                                    <p className="text-white/60 text-sm flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                        </svg>
                                        Sriganganagar, Rajasthan, India
                                    </p>
                                    <a href="https://maps.app.goo.gl/LH69FP4CLybZSRAX7" target="_blank" rel="noopener noreferrer" className="text-[#38BDF8] hover:underline font-medium text-xs mt-1 inline-flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        View on Google Maps
                                    </a>
                                </div>
                                <span className="w-2.5 h-2.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                    GA
                                </div>
                                <div>
                                    <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">Water Solutions</p>
                                    <p className="text-white font-semibold text-sm">Since 2014</p>
                                </div>
                            </div>
                        </WobbleCard>

                        {/* Middle row — two stat cards */}
                        <div className="grid grid-cols-2 gap-3">
                            <WobbleCard containerClassName="bg-[#1b5e20]">
                                <p className="text-white font-bold text-4xl mb-1">25+</p>
                                <p className="text-white/70 text-sm">Years of experience</p>
                            </WobbleCard>

                            <WobbleCard containerClassName="bg-[#283593]">
                                <p className="text-white font-bold text-4xl mb-1">10k+</p>
                                <p className="text-white/70 text-sm">Customers served</p>
                            </WobbleCard>
                        </div>

                        {/* Bottom card — products */}
                        <WobbleCard containerClassName="bg-[#880e4f]">
                            <p className="text-white/60 text-sm mb-5">Our product lines</p>
                            <div className="space-y-3">
                                {[
                                    { label: "Water Storage Tanks", abbr: "WT" },
                                    { label: "Sprayer Tanks", abbr: "ST" },
                                    { label: "CPVC / PVC Pipes & Fittings", abbr: "CP" },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                            {item.abbr}
                                        </div>
                                        <span className="text-white text-sm">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </WobbleCard>
                    </div>
                </div>
            </section>

            {/* Mission statement — full-width teal card */}
            <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pb-6">
                <div className="animate-on-view">
                    <WobbleCard containerClassName="bg-[linear-gradient(135deg,#0a7c6e,#0e7490,#0e6fa5)] w-full">
                        <p className="text-white font-bold text-2xl sm:text-3xl lg:text-[2.6rem] leading-[1.2] max-w-4xl">
                            Our mission is to deliver reliable, high-quality water management
                            solutions that empower farmers, businesses, and households across India.
                        </p>
                    </WobbleCard>
                </div>
            </section>

            {/* How We Help — left heading + right service cards */}
            <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-14">
                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 items-start">

                    {/* Left heading */}
                    <div className="animate-on-view lg:sticky lg:top-32">
                        <h2 className="text-gray-900 dark:text-white font-bold text-4xl sm:text-5xl leading-[1.1]">
                            How Can We<br />Help You?
                        </h2>
                    </div>

                    {/* Right — service cards grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            {
                                iconBg: "#3730a3",
                                icon: (
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4" />
                                    </svg>
                                ),
                                title: "Water Storage Tanks",
                                desc: "Durable, food-grade polyethylene tanks engineered for long-term storage in residential, agricultural, and industrial settings. Available in multiple capacities.",
                                link: "/categories/blow-mould-tank",
                                cta: "Browse Tanks",
                            },
                            {
                                iconBg: "#3730a3",
                                icon: (
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7c0 0 2-2 5-2s5 2 8 2 5-2 5-2v13s-2 2-5 2-5-2-8-2-5 2-5 2V7z" />
                                    </svg>
                                ),
                                title: "Sprayer Tanks",
                                desc: "High-performance sprayer tanks built for agricultural use. Corrosion-resistant, UV-stabilised, and compatible with leading pump systems for effective crop protection.",
                                link: "/categories/agriculture-sprayer-tank",
                                cta: "Explore Sprayers",
                            },
                            {
                                iconBg: "#3730a3",
                                icon: (
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="9" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" />
                                    </svg>
                                ),
                                title: "CPVC / PVC Pipes & Fittings",
                                desc: "Complete range of CPVC and PVC pipes, fittings, and accessories for plumbing, irrigation, and industrial fluid conveyance. Precision-fit and pressure-rated.",
                                link: "/categories/cpvc-pipes-and-fittings",
                                cta: "View Piping Systems",
                            },
                            {
                                iconBg: "#3730a3",
                                icon: (
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ),
                                title: "Wholesale & Bulk Supply",
                                desc: "We partner with distributors, contractors, and institutional buyers for bulk procurement. Competitive pricing, reliable logistics, and consistent quality across large orders.",
                                link: "/contact",
                                cta: "Get a Quote",
                            },
                        ].map((item, i) => (
                            <div
                                key={item.title}
                                className="animate-on-view bg-gray-50 dark:bg-[#111111] border border-gray-100 dark:border-transparent rounded-2xl p-6 flex flex-col gap-5 min-h-65"
                                style={{ animationDelay: `${i * 0.08}s` }}
                            >
                                {/* Icon */}
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: item.iconBg }}
                                >
                                    {item.icon}
                                </div>

                                {/* Text */}
                                <div className="flex-1">
                                    <h3 className="text-gray-900 dark:text-white font-bold text-lg leading-snug mb-3">{item.title}</h3>
                                    <p className="text-gray-600 dark:text-[#888888] text-sm leading-relaxed">{item.desc}</p>
                                </div>

                                {/* Button — bottom right, white pill with × */}
                                <div className="flex justify-end">
                                    <NavigationLink
                                        href={item.link}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white shadow-sm border border-gray-200 dark:border-transparent text-black text-xs font-semibold hover:bg-gray-50 dark:hover:bg-white/90 transition-colors"
                                    >
                                        {item.cta}
                                        <span className="text-black/40 font-normal">✕</span>
                                    </NavigationLink>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Founder — Mr. Rajesh Gupta */}
            <Timeline
                heading="Meet Our Founder"
                subheading="The driving force behind Garud Aqua Solutions — 25+ years of expertise in water management."
                data={[
                    {
                        title: "Vision & Leadership",
                        content: (
                            <div>
                                <h3 className="text-neutral-800 dark:text-neutral-200 font-semibold text-base md:text-lg mb-2">Mr. Rajesh Gupta — Founder & MD</h3>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed mb-4">
                                    Mr. Rajesh Gupta brings a wealth of experience and a deep-rooted passion for innovation. His strategic insights and customer-centric approach have shaped Garud Aqua Solutions into a company known for quality, innovative solutions, and unwavering dedication to customer satisfaction since its inception in 2014.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {["Founded 2014", "Customer-centric", "Quality first"].map(t => (
                                        <span key={t} className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-white/8 border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-white/60 text-xs">{t}</span>
                                    ))}
                                </div>
                            </div>
                        ),
                    },
                    {
                        title: "25+ Years",
                        content: (
                            <div>
                                <h3 className="text-neutral-800 dark:text-neutral-200 font-semibold text-base md:text-lg mb-2">Unmatched Industry Expertise</h3>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed mb-4">
                                    With over 25 years of experience in pipe fitting and water tank retail, Mr. Gupta has a unique understanding of both customer needs and manufacturer capabilities. This depth of knowledge allows Garud Aqua Solutions to bridge the gap with innovative, market-ready solutions that truly serve the industry.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {["Pipe fittings", "Water tanks", "Retail expertise", "Manufacturer insight"].map(t => (
                                        <span key={t} className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-white/8 border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-white/60 text-xs">{t}</span>
                                    ))}
                                </div>
                            </div>
                        ),
                    },
                    {
                        title: "Sustainability",
                        content: (
                            <div>
                                <h3 className="text-neutral-800 dark:text-neutral-200 font-semibold text-base md:text-lg mb-2">Commitment to Excellence & Environment</h3>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed mb-4">
                                    Mr. Gupta&apos;s relentless pursuit of excellence is matched by his commitment to sustainable practices. Under his guidance, Garud Aqua Solutions continuously pushes the boundaries of innovation — making a positive impact on communities and the environment across Rajasthan and beyond.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {["Eco-friendly", "Innovation-driven", "Community impact", "Sustainable ops"].map(t => (
                                        <span key={t} className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-white/8 border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-white/60 text-xs">{t}</span>
                                    ))}
                                </div>
                            </div>
                        ),
                    },
                    {
                        title: "Today",
                        content: (
                            <div>
                                <h3 className="text-neutral-800 dark:text-neutral-200 font-semibold text-base md:text-lg mb-2">10,000+ Customers. One Vision.</h3>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed mb-4">
                                    From a single retail outlet in Sriganganagar to a pan-Rajasthan operation serving over 10,000 customers — Mr. Gupta&apos;s vision has been the constant driving force. His mission: to provide reliable and sustainable water management solutions for generations to come.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {["10,000+ customers", "Pan-Rajasthan", "Wholesale & retail", "15+ years"].map(t => (
                                        <span key={t} className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-white/8 border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-white/60 text-xs">{t}</span>
                                    ))}
                                </div>
                            </div>
                        ),
                    },
                ]}
            />

            {/* Our Infrastructure */}
            <Timeline
                heading="Our Infrastructure"
                subheading="State-of-the-art facilities built for quality, efficiency, and long-term sustainability."
                data={[
                    {
                        title: "Manufacturing",
                        content: (
                            <div>
                                <h3 className="text-neutral-800 dark:text-neutral-200 font-semibold text-base md:text-lg mb-2">Advanced Manufacturing Facility</h3>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed mb-4">
                                    Our manufacturing facility is equipped with advanced machinery and equipment, operated by skilled technicians and engineers. From water tank production lines to piping system assembly stations, every aspect of our manufacturing process is carefully designed to ensure precision, consistency, and reliability.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {["Advanced machinery", "Skilled engineers", "Production lines", "Quality consistency"].map(t => (
                                        <span key={t} className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-white/8 border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-white/60 text-xs">{t}</span>
                                    ))}
                                </div>
                            </div>
                        ),
                    },
                    {
                        title: "Quality",
                        content: (
                            <div>
                                <h3 className="text-neutral-800 dark:text-neutral-200 font-semibold text-base md:text-lg mb-2">Testing & Quality Assurance</h3>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed mb-4">
                                    We have dedicated testing and quality assurance laboratories where our products undergo rigorous testing and inspection. Our quality control experts use cutting-edge equipment and techniques to verify the performance, durability, and safety of our products — ensuring they meet or exceed industry standards.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {["QA labs", "Rigorous testing", "Durability checks", "Industry standards"].map(t => (
                                        <span key={t} className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-white/8 border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-white/60 text-xs">{t}</span>
                                    ))}
                                </div>
                            </div>
                        ),
                    },
                    {
                        title: "Logistics",
                        content: (
                            <div>
                                <h3 className="text-neutral-800 dark:text-neutral-200 font-semibold text-base md:text-lg mb-2">Warehousing & Logistics</h3>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed mb-4">
                                    Our spacious warehouses are strategically located to facilitate efficient storage and distribution. With ample storage capacity and modern logistics infrastructure, we fulfill orders quickly and accurately — ensuring timely delivery to customers across Rajasthan and beyond.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {["Strategic warehouses", "Fast fulfillment", "Pan-Rajasthan delivery", "Modern logistics"].map(t => (
                                        <span key={t} className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-white/8 border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-white/60 text-xs">{t}</span>
                                    ))}
                                </div>
                            </div>
                        ),
                    },
                    {
                        title: "R&D",
                        content: (
                            <div>
                                <h3 className="text-neutral-800 dark:text-neutral-200 font-semibold text-base md:text-lg mb-2">Research & Development</h3>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed mb-4">
                                    Innovation is at the heart of everything we do. Our dedicated R&D team focuses on creating new products and improving existing ones. Equipped with advanced technology and resources, our R&D facility supports continuous innovation across our entire product range.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {["Product innovation", "Advanced R&D", "Continuous improvement", "New solutions"].map(t => (
                                        <span key={t} className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-white/8 border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-white/60 text-xs">{t}</span>
                                    ))}
                                </div>
                            </div>
                        ),
                    },
                    {
                        title: "Green Ops",
                        content: (
                            <div>
                                <h3 className="text-neutral-800 dark:text-neutral-200 font-semibold text-base md:text-lg mb-2">Environmental Sustainability</h3>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed mb-4">
                                    We are committed to minimising our environmental footprint. From energy-efficient manufacturing processes to eco-friendly packaging materials, we strive to incorporate sustainable practices into our infrastructure — promoting responsibility at every level of our operations.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {["Energy efficiency", "Eco packaging", "Reduced footprint", "Sustainable ops"].map(t => (
                                        <span key={t} className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-white/8 border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-white/60 text-xs">{t}</span>
                                    ))}
                                </div>
                            </div>
                        ),
                    },
                    {
                        title: "Support",
                        content: (
                            <div>
                                <h3 className="text-neutral-800 dark:text-neutral-200 font-semibold text-base md:text-lg mb-2">Customer Support Centre</h3>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm md:text-base leading-relaxed mb-4">
                                    Our infrastructure includes a customer support centre staffed by knowledgeable and friendly professionals dedicated to exceptional service. Whether you have questions about our products or need assistance with an order, our team is always here to help.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {["Product queries", "Order assistance", "Expert support", "Friendly service"].map(t => (
                                        <span key={t} className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-white/8 border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-white/60 text-xs">{t}</span>
                                    ))}
                                </div>
                                <NavigationLink
                                    href="/contact"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-semibold hover:bg-gray-800 dark:hover:bg-white/90 transition-colors"
                                >
                                    Get in Touch →
                                </NavigationLink>
                            </div>
                        ),
                    },
                ]}
            />

            {/* Final CTA */}
            <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pb-24">

                {/* Eyebrow + heading */}
                <div className="animate-on-view text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 dark:bg-white/8 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 text-xs font-medium tracking-widest uppercase mb-8">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
                        Get in Touch
                    </div>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                        Get in{" "}
                        <span className="bg-linear-to-r from-[#38BDF8] via-[#818CF8] to-[#a78bfa] bg-clip-text text-transparent">
                            touch
                        </span>{" "}
                        with us
                    </h2>
                    <p className="mt-5 text-gray-600 dark:text-white/50 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                        Whether you need bulk pricing, product advice, or simply want to know more about what we do —{" "}
                        <span className="text-gray-900 dark:text-white/80 font-semibold">we&apos;d love to hear from you.</span>
                    </p>
                </div>

                {/* CTA card */}
                <div className="animate-on-view" style={{ animationDelay: '0.1s' }}>
                    <WobbleCard containerClassName="bg-[linear-gradient(135deg,#3730a3,#4f46e5,#6d28d9)] w-full">
                        <div className="flex flex-col items-center text-center gap-6 py-4">
                            <p className="text-white font-bold text-2xl sm:text-3xl">
                                Ready to work with us?
                            </p>
                            <p className="text-white/70 text-sm sm:text-base max-w-lg leading-relaxed">
                                Whether you&apos;re a farmer, contractor, distributor, or household customer — our team is ready to help you find the right water management solution.
                            </p>
                            <div className="flex flex-wrap gap-3 justify-center">
                                <NavigationLink
                                    href="/contact"
                                    className="px-7 py-3 rounded-full bg-white dark:bg-white text-black dark:text-black text-sm font-semibold hover:bg-white/90 transition-colors shadow-sm"
                                >
                                    Contact Us →
                                </NavigationLink>
                                <NavigationLink
                                    href="/products"
                                    className="px-7 py-3 rounded-full bg-white/10 dark:bg-white/15 border border-white/20 dark:border-white/25 text-white dark:text-white text-sm font-medium hover:bg-white/20 dark:hover:bg-white/25 transition-colors"
                                >
                                    Browse Products
                                </NavigationLink>
                            </div>
                        </div>
                    </WobbleCard>
                </div>
            </section>
        </main>
    );
}

    