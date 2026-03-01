"use client";
import { motion } from "framer-motion";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

export default function Testimonials() {
    const testimonials = [
        {
            id: 1,
            name: "Rajesh Gupta",
            role: "Dealer",
            location: "Delhi",
            text: "We've been sourcing water tanks from Garud Aqua for over 3 years. Consistent quality, on-time deliveries, and excellent dealer margins. Our go-to brand for water storage.",
            rating: 5,
            image: "RG",
            purchase: "3-Layer Water Tanks",
        },
        {
            id: 2,
            name: "Sunil Patel",
            role: "Plumbing Contractor",
            location: "Ahmedabad",
            text: "The CPVC pipes from Garud Aqua are top-notch. Easy to install, great pressure handling, and ISI certified. My clients are always satisfied with the quality.",
            rating: 5,
            image: "SP",
            purchase: "CPVC Pipes & Fittings",
        },
        {
            id: 3,
            name: "Anand Sharma",
            role: "Builder",
            location: "Jaipur",
            text: "For our housing projects, we exclusively use Garud Aqua tanks and pipes. Reliable products, competitive bulk pricing, and their technical support team is always responsive.",
            rating: 5,
            image: "AS",
            purchase: "Overhead Tanks + PVC Pipes",
        },
        {
            id: 4,
            name: "Manoj Tiwari",
            role: "Distributor",
            location: "Lucknow",
            text: "Garud Aqua's dealer program is excellent. Good margins, strong brand presence, and the product range covers everything our customers need. Sales have grown 40% since we partnered.",
            rating: 5,
            image: "MT",
            purchase: "Full Product Range",
        },
        {
            id: 5,
            name: "Dinesh Reddy",
            role: "Civil Engineer",
            location: "Hyderabad",
            text: "I recommend Garud Aqua for all my residential projects. The loft tanks fit perfectly in tight spaces, and the underground tanks have excellent durability against soil pressure.",
            rating: 5,
            image: "DR",
            purchase: "Loft & Underground Tanks",
        },
        {
            id: 6,
            name: "Vikram Singh",
            role: "Dealer",
            location: "Chandigarh",
            text: "What sets Garud Aqua apart is their after-sales support. Any issues are resolved quickly. The ISI certification gives customers confidence, and the products practically sell themselves.",
            rating: 5,
            image: "VS",
            purchase: "Water Tanks",
        },
        {
            id: 7,
            name: "Amit Deshmukh",
            role: "Plumber",
            location: "Pune",
            text: "I've worked with many pipe brands but Garud Aqua's PVC pipes are the easiest to work with. Clean cuts, strong joints, and zero leakage issues even after years of use.",
            rating: 5,
            image: "AD",
            purchase: "PVC Pipes",
        },
        {
            id: 8,
            name: "Harish Kumar",
            role: "Hardware Store Owner",
            location: "Chennai",
            text: "Garud Aqua products move fast in our store. Customers trust the brand for quality, and the competitive pricing helps us maintain healthy margins. Great partnership overall.",
            rating: 5,
            image: "HK",
            purchase: "Tanks & Fittings",
        },
        {
            id: 9,
            name: "Pradeep Joshi",
            role: "Builder",
            location: "Mumbai",
            text: "We've used Garud Aqua in over 20 residential complexes. The 3-layer tanks keep water cool even in Mumbai summers. Pan-India delivery means we get stock anywhere we need it.",
            rating: 5,
            image: "PJ",
            purchase: "3-Layer Overhead Tanks",
        },
        {
            id: 10,
            name: "Ravi Agarwal",
            role: "Distributor",
            location: "Kolkata",
            text: "Partnering with Garud Aqua was the best business decision. Their product quality is unmatched in this price segment, and the supply chain is reliable across all seasons.",
            rating: 5,
            image: "RA",
            purchase: "Complete Product Line",
        },
        {
            id: 11,
            name: "Sanjay Mishra",
            role: "Contractor",
            location: "Bhopal",
            text: "From large overhead tanks to small fittings, everything from Garud Aqua fits perfectly and lasts long. Their technical team even helped us plan the plumbing layout for a complex project.",
            rating: 5,
            image: "SM",
            purchase: "Pipes & Fittings",
        },
        {
            id: 12,
            name: "Karthik Nair",
            role: "Dealer",
            location: "Kochi",
            text: "Garud Aqua's products are perfect for the Kerala climate. The tanks resist UV and heat well. Customers keep coming back, and the dealer support is fantastic.",
            rating: 5,
            image: "KN",
            purchase: "UV-Resistant Tanks",
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

    return (
        <section className="py-20 lg:py-32 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-linear-to-br from-[#FAFAFA] via-white to-[#F0F9FF] dark:from-black dark:via-[#050505] dark:to-[#0A0A0A]" />

            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-96 h-96 bg-linear-to-br from-[#0EA5E9] to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-linear-to-tl from-[#0369A1] to-transparent rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 lg:mb-20"
                >
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
                </motion.div>

                {/* Stats Row */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="text-center group"
                        >
                            <h3 className="text-3xl lg:text-4xl font-light text-[#0EA5E9] mb-2 group-hover:scale-110 transition-transform duration-300">
                                {stat.number}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 font-light">{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Infinite Moving Cards - Testimonials */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="mb-12"
                >
                    <InfiniteMovingCards items={formattedTestimonials} direction="left" speed="slow" pauseOnHover={true} />
                </motion.div>
            </div>
        </section>
    );
}
