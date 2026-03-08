"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import AdminLayout from "../../components/AdminLayout";
import { toast } from "sonner";

interface HeroSlide {
    id: string;
    image: string;
    mobileImage: string;
    title: string;
    order: number;
    isActive: boolean;
}

export default function AdminHeroSlidesPage() {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
    const [uploading, setUploading] = useState<"desktop" | "mobile" | null>(null);
    const [bulkUploading, setBulkUploading] = useState(false);
    const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
    const [formData, setFormData] = useState({
        image: "",
        mobileImage: "",
        title: "",
        order: 0,
        isActive: true,
    });

    const fetchSlides = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/hero-slides");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setSlides(data);
        } catch {
            toast.error("Failed to load hero slides");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSlides();
    }, [fetchSlides]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.image) { toast.error("Desktop image is required"); return; }

        try {
            if (editingSlide) {
                const res = await fetch(`/api/admin/hero-slides/${editingSlide.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                if (!res.ok) throw new Error("Failed to update");
                toast.success("Slide updated");
            } else {
                const res = await fetch("/api/admin/hero-slides", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                if (!res.ok) throw new Error("Failed to create");
                toast.success("Slide added");
            }
            resetForm();
            fetchSlides();
        } catch {
            toast.error("Failed to save slide");
        }
    };

    const handleEdit = (slide: HeroSlide) => {
        setEditingSlide(slide);
        setFormData({
            image: slide.image,
            mobileImage: slide.mobileImage || "",
            title: slide.title || "",
            order: slide.order,
            isActive: slide.isActive,
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this slide?")) return;
        try {
            const res = await fetch(`/api/admin/hero-slides/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            setSlides(slides.filter((s) => s.id !== id));
            toast.success("Slide deleted");
        } catch {
            toast.error("Failed to delete slide");
        }
    };

    const resetForm = () => {
        setFormData({ image: "", mobileImage: "", title: "", order: 0, isActive: true });
        setEditingSlide(null);
        setShowForm(false);
    };

    const handleImageUpload = (field: "image" | "mobileImage") => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/jpeg,image/jpg,image/png,image/webp";

        input.onchange = async (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            setUploading(field === "image" ? "desktop" : "mobile");
            try {
                const fd = new FormData();
                fd.append("file", file);
                fd.append("folder", "garudaqua/hero-slides");
                const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                if (!res.ok) throw new Error("Upload failed");
                const { url } = await res.json();
                setFormData((prev) => ({ ...prev, [field]: url }));
                toast.success(`${field === "image" ? "Desktop" : "Mobile"} image uploaded`);
            } catch {
                toast.error("Failed to upload image");
            } finally {
                setUploading(null);
            }
        };
        input.click();
    };

    const handleBulkUpload = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/jpeg,image/jpg,image/png,image/webp";
        input.multiple = true;

        input.onchange = async (e: Event) => {
            const files = (e.target as HTMLInputElement).files;
            if (!files || files.length === 0) return;

            const fileArray = Array.from(files);
            setBulkUploading(true);
            setBulkProgress({ current: 0, total: fileArray.length });

            const maxOrder = slides.length > 0 ? Math.max(...slides.map((s) => s.order)) : -1;
            let successCount = 0;

            for (let i = 0; i < fileArray.length; i++) {
                setBulkProgress({ current: i + 1, total: fileArray.length });
                try {
                    // Upload image to Cloudinary
                    const fd = new FormData();
                    fd.append("file", fileArray[i]);
                    fd.append("folder", "garudaqua/hero-slides");
                    const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
                    if (!uploadRes.ok) throw new Error("Upload failed");
                    const { url } = await uploadRes.json();

                    // Create hero slide
                    const slideRes = await fetch("/api/admin/hero-slides", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            image: url,
                            mobileImage: "",
                            title: "",
                            order: maxOrder + 1 + i,
                            isActive: true,
                        }),
                    });
                    if (!slideRes.ok) throw new Error("Failed to create slide");
                    successCount++;
                } catch {
                    toast.error(`Failed to upload image ${i + 1}`);
                }
            }

            setBulkUploading(false);
            setBulkProgress({ current: 0, total: 0 });
            if (successCount > 0) {
                toast.success(`${successCount} slide${successCount > 1 ? "s" : ""} added`);
                fetchSlides();
            }
        };
        input.click();
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Hero Slides</h1>
                        <p className="text-gray-600 mt-1">Manage homepage hero banner slides</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleBulkUpload}
                            disabled={bulkUploading}
                            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50"
                        >
                            {bulkUploading
                                ? `Uploading ${bulkProgress.current}/${bulkProgress.total}...`
                                : "Bulk Upload"}
                        </button>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="px-5 py-2 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0369A1] transition text-sm font-medium"
                        >
                            {showForm ? "Cancel" : "+ Add Slide"}
                        </button>
                    </div>
                </div>

                {showForm && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">{editingSlide ? "Edit Slide" : "Add New Slide"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Desktop Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Desktop Image *</label>
                                    <div className="flex items-center gap-3">
                                        <button type="button" onClick={() => handleImageUpload("image")} disabled={uploading !== null}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50">
                                            {uploading === "desktop" ? "Uploading..." : "Upload Desktop Image"}
                                        </button>
                                        {formData.image && <span className="text-green-600 text-sm">Uploaded</span>}
                                    </div>
                                    {formData.image && (
                                        <div className="mt-3 relative w-full h-36 bg-gray-100 rounded-lg overflow-hidden">
                                            <Image src={formData.image} alt="Desktop preview" fill className="object-cover" />
                                        </div>
                                    )}
                                </div>

                                {/* Mobile Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Image</label>
                                    <div className="flex items-center gap-3">
                                        <button type="button" onClick={() => handleImageUpload("mobileImage")} disabled={uploading !== null}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50">
                                            {uploading === "mobile" ? "Uploading..." : "Upload Mobile Image"}
                                        </button>
                                        {formData.mobileImage && <span className="text-green-600 text-sm">Uploaded</span>}
                                    </div>
                                    {formData.mobileImage && (
                                        <div className="mt-3 relative w-32 h-52 bg-gray-100 rounded-lg overflow-hidden">
                                            <Image src={formData.mobileImage} alt="Mobile preview" fill className="object-cover" />
                                        </div>
                                    )}
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent" placeholder="Optional label for this slide" />
                                </div>

                                {/* Order */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                                    <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent" />
                                </div>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-[#0EA5E9] border-gray-300 rounded focus:ring-[#0EA5E9]" />
                                <label className="text-sm text-gray-700">Active (Display on website)</label>
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="px-5 py-2 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0369A1] transition text-sm font-medium">{editingSlide ? "Update" : "Create"}</button>
                                <button type="button" onClick={resetForm} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Slides Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="aspect-video bg-gray-200 animate-pulse"></div>
                                <div className="p-4 space-y-2">
                                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse"></div>
                                </div>
                            </div>
                        ))
                    ) : slides.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No hero slides yet. Add your first one!
                        </div>
                    ) : (
                        slides.sort((a, b) => a.order - b.order).map((slide) => (
                            <div key={slide.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
                                <div className="relative aspect-video bg-gray-100">
                                    {slide.image ? (
                                        <Image src={slide.image} alt={slide.title || "Hero slide"} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    {!slide.isActive && (
                                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Inactive</div>
                                    )}
                                    {slide.isActive && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">Active</div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 mb-1">{slide.title || "Untitled Slide"}</h3>
                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                        <span>Order: {slide.order}</span>
                                        {slide.mobileImage && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Has mobile image</span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(slide)} className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm">Edit</button>
                                        <button onClick={() => handleDelete(slide.id)} className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm">Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
