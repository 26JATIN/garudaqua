"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function EnquirePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center text-gray-500">Loading...</div>}>
            <EnquireForm />
        </Suspense>
    );
}

function EnquireForm() {
    const searchParams = useSearchParams();
    const productFromUrl = searchParams.get("product") || "";

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        product: productFromUrl,
        quantity: "",
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (productFromUrl) {
            setFormData((prev) => ({ ...prev, product: productFromUrl }));
        }
    }, [productFromUrl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.phone.trim()) {
            toast.error("Name and phone number are required");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/enquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error("Failed to submit enquiry");
            }

            toast.success("Enquiry submitted successfully!");
            setSubmitted(true);
        } catch {
            toast.error("Failed to submit enquiry. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-xl dark:shadow-none dark:border dark:border-white/10 p-8 text-center animate-[fadeIn_0.3s_ease-out]">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Enquiry Submitted!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Thank you for your interest. Our team will get back to you within 24 hours.
                    </p>
                    <a href="https://maps.app.goo.gl/LH69FP4CLybZSRAX7" target="_blank" rel="noopener noreferrer" className="inline-block mb-6 text-[#0369A1] dark:text-[#0EA5E9] hover:underline font-medium">View Our Location on Google Maps</a>
                    <div className="flex gap-3 justify-center">
                        <Link href="/products" className="px-6 py-2.5 bg-[#0369A1] text-white rounded-full hover:bg-[#0284C7] transition text-sm font-medium">
                            Browse Products
                        </Link>
                        <button
                            onClick={() => {
                                setSubmitted(false);
                                setFormData({ name: "", email: "", phone: "", company: "", product: "", quantity: "", message: "" });
                            }}
                            className="px-6 py-2.5 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition text-sm"
                        >
                            New Enquiry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-light text-gray-900 dark:text-gray-100 mb-3">
                        Product <span className="text-[#0369A1] dark:text-[#0EA5E9]">Enquiry</span>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                        Fill in your details and we&apos;ll get back to you with pricing and availability information.
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-lg dark:shadow-none border border-gray-100 dark:border-white/10 p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name & Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-white/20 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition"
                                    placeholder="Your full name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number *</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-white/20 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition"
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>
                        </div>

                        {/* Email & Company */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-white/20 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition"
                                    placeholder="you@company.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company / Business Name</label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-white/20 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition"
                                    placeholder="Your company name"
                                />
                            </div>
                        </div>

                        {/* Product & Quantity */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Product of Interest</label>
                                <input
                                    type="text"
                                    value={formData.product}
                                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-white/20 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition"
                                    placeholder="e.g., 500L Water Tank"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Quantity Required</label>
                                <input
                                    type="text"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-white/20 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition"
                                    placeholder="e.g., 50 units"
                                />
                            </div>
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Additional Details</label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-white/20 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition-colors resize-none"
                                placeholder="Tell us about your requirements, preferred delivery timeline, etc."
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3.5 bg-linear-to-r from-[#0EA5E9] to-[#0369A1] text-white rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
                        >
                            {submitting ? "Submitting..." : "Submit Enquiry"}
                        </button>

                        <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                            By submitting, you agree to be contacted by our sales team regarding your enquiry.
                        </p>
                    </form>
                </div>

                {/* Back link */}
                <div className="text-center mt-6">
                    <Link href="/products" className="text-sm text-[#0369A1] dark:text-[#0EA5E9] hover:text-[#0284C7] transition">
                        &larr; Back to Products
                    </Link>
                </div>
            </div>
        </div>
    );
}
