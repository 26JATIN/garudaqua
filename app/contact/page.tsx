"use client";

import { useState } from "react";
import NavigationLink from "@/app/components/NavigationLink";
import { toast } from "sonner";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

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
                body: JSON.stringify({
                    ...formData,
                    product: "General Contact",
                    quantity: "",
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to submit");
            }

            toast.success("Message sent successfully!");
            setSubmitted(true);
        } catch {
            toast.error("Failed to send message. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center px-4">
                <div
                    className="max-w-md w-full bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-xl dark:shadow-none dark:border dark:border-white/10 p-8 text-center animate-[fadeInScale_0.3s_ease-out]"
                >
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Message Sent!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Thank you for reaching out. Our team will get back to you within 24 hours.
                    </p>
                    <a href="https://maps.app.goo.gl/LH69FP4CLybZSRAX7" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-[#0369A1] dark:text-[#0EA5E9] hover:underline font-medium">View Our Location on Google Maps</a>
                    <div className="flex gap-3 justify-center mt-6">
                        <NavigationLink href="/" className="px-6 py-2.5 bg-[#0369A1] text-white rounded-full hover:bg-[#0284C7] transition text-sm font-medium">
                            Back to Home
                        </NavigationLink>
                        <button
                            onClick={() => {
                                setSubmitted(false);
                                setFormData({ name: "", email: "", phone: "", company: "", message: "" });
                            }}
                            className="px-6 py-2.5 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition text-sm"
                        >
                            Send Another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 overflow-x-clip">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-light text-gray-900 dark:text-gray-100 mb-3">
                        Get in <span className="text-[#0369A1] dark:text-[#0EA5E9]">Touch</span>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                        Have questions or need assistance? We&apos;d love to hear from you.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Contact Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-lg dark:shadow-none border border-gray-100 dark:border-white/10 p-6 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#0EA5E9]/10 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Address</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                                        Ground, Murraba No. 62, Killa No. 2,<br />
                                        Garud Aqua Solutions,<br />
                                        Sihagawali To Akkawali Road, 23 SDS,<br />
                                        Sadulshahar, Ganganagar – 335062<br />
                                        Rajasthan, India
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#0EA5E9]/10 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Phone</p>
                                    <a href="tel:+919462594603" className="text-sm text-gray-600 dark:text-gray-400 font-light hover:text-[#0EA5E9] transition-colors">
                                        +91 94625 94603
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#0EA5E9]/10 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Email</p>
                                    <a href="mailto:rkg210@gmail.com" className="text-sm text-gray-600 dark:text-gray-400 font-light hover:text-[#0EA5E9] transition-colors">
                                        rkg210@gmail.com
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#0EA5E9]/10 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Business Hours</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-light">
                                        Mon - Sat: 9:00 AM - 6:00 PM
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-lg dark:shadow-none border border-gray-100 dark:border-white/10 p-6">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Looking for something specific?</p>
                            <div className="space-y-2">
                                <NavigationLink href="/products" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#0EA5E9] transition-colors font-light">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    Browse our Products
                                </NavigationLink>
                                <NavigationLink href="/enquire" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#0EA5E9] transition-colors font-light">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    Product Enquiry Form
                                </NavigationLink>
                                <NavigationLink href="/blogs" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#0EA5E9] transition-colors font-light">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    Read our Blog
                                </NavigationLink>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-lg dark:shadow-none border border-gray-100 dark:border-white/10 p-6 md:p-8">
                            <h2 className="text-xl font-light text-gray-900 dark:text-gray-100 mb-6">Send Us a Message</h2>
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
                                            placeholder="you@email.com"
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

                                {/* Message */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message *</label>
                                    <textarea
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        rows={5}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-white/20 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition-colors resize-none"
                                        placeholder="How can we help you?"
                                    />
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3.5 bg-linear-to-r from-[#0EA5E9] to-[#0369A1] text-white rounded-xl font-medium text-lg shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {submitting ? "Sending..." : "Send Message"}
                                </button>

                                <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                                    By submitting, you agree to be contacted by our team regarding your message.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Back link */}
                <div className="text-center mt-6">
                    <NavigationLink href="/" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full hover:border-[#0EA5E9] hover:text-[#0EA5E9] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Home
                    </NavigationLink>
                </div>
            </div>
        </div>
    );
}
