"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import AdminLayout from "../../components/AdminLayout";
import { toast } from "sonner";

// ===== Types =====
interface GalleryItem {
    _id: string;
    title: string;
    description: string;
    mediaType: "image" | "video";
    mediaUrl: string;
    thumbnailUrl: string;
    alt: string;
    order: number;
    isActive: boolean;
    tags: string[];
}

const STORAGE_KEY = "garudaqua_admin_gallery";

const INITIAL_ITEMS: GalleryItem[] = [];

export default function AdminGalleryPage() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        mediaType: "image" as "image" | "video",
        mediaUrl: "",
        thumbnailUrl: "",
        alt: "",
        order: 0,
        isActive: true,
        tags: [] as string[],
    });

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            setItems(stored ? JSON.parse(stored) : INITIAL_ITEMS);
            if (!stored) localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ITEMS));
        } catch {
            setItems(INITIAL_ITEMS);
        }
        setLoading(false);
    }, []);

    const saveItems = (updated: GalleryItem[]) => {
        setItems(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) { toast.error("Title is required"); return; }

        if (editingItem) {
            const updated = items.map((i) => i._id === editingItem._id ? { ...editingItem, ...formData } : i);
            saveItems(updated);
            toast.success("Item updated");
        } else {
            const newItem: GalleryItem = { _id: `gal-${Date.now()}`, ...formData };
            saveItems([...items, newItem]);
            toast.success("Item added");
        }
        resetForm();
    };

    const handleEdit = (item: GalleryItem) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            description: item.description,
            mediaType: item.mediaType,
            mediaUrl: item.mediaUrl,
            thumbnailUrl: item.thumbnailUrl,
            alt: item.alt,
            order: item.order,
            isActive: item.isActive,
            tags: item.tags,
        });
        setShowForm(true);
    };

    const handleDelete = (id: string) => {
        if (!confirm("Delete this item?")) return;
        saveItems(items.filter((i) => i._id !== id));
        toast.success("Item deleted");
    };

    const resetForm = () => {
        setFormData({ title: "", description: "", mediaType: "image", mediaUrl: "", thumbnailUrl: "", alt: "", order: 0, isActive: true, tags: [] });
        setEditingItem(null);
        setShowForm(false);
    };

    const handleMediaSelect = (field: "mediaUrl" | "thumbnailUrl") => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = field === "mediaUrl" && formData.mediaType === "video"
            ? "video/mp4,video/webm"
            : "image/jpeg,image/jpg,image/png,image/webp";

        input.onchange = (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const dataUrl = ev.target?.result as string;
                setFormData((prev) => ({ ...prev, [field]: dataUrl, alt: prev.alt || file.name.replace(/\.[^/.]+$/, "") }));
                toast.success("File selected");
            };
            reader.readAsDataURL(file);
        };
        input.click();
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
                        <p className="text-gray-600 mt-1">Manage product and project images</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-5 py-2 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0369A1] transition text-sm font-medium"
                    >
                        {showForm ? "Cancel" : "+ Add Media"}
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">{editingItem ? "Edit Media" : "Add New Media"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                    <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Media Type *</label>
                                    <select value={formData.mediaType} onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as "image" | "video" })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent">
                                        <option value="image">Image</option>
                                        <option value="video">Video</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Media File *</label>
                                    <div className="flex items-center gap-3">
                                        <button type="button" onClick={() => handleMediaSelect("mediaUrl")}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                                            Upload {formData.mediaType === "video" ? "Video" : "Image"}
                                        </button>
                                        {formData.mediaUrl && <span className="text-green-600 text-sm">File selected</span>}
                                    </div>
                                    {formData.mediaUrl && formData.mediaType === "image" && (
                                        <div className="mt-3 relative w-40 h-52 bg-gray-100 rounded-lg overflow-hidden">
                                            <Image src={formData.mediaUrl} alt="Preview" fill className="object-cover" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
                                    <input type="text" value={formData.alt} onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent" placeholder="Descriptive text" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                                    <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent" />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-[#0EA5E9] border-gray-300 rounded focus:ring-[#0EA5E9]" />
                                <label className="text-sm text-gray-700">Active (Display on website)</label>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="px-5 py-2 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0369A1] transition text-sm font-medium">{editingItem ? "Update" : "Create"}</button>
                                <button type="button" onClick={resetForm} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="aspect-4/5 bg-gray-200 animate-pulse"></div>
                                <div className="p-4 space-y-2">
                                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse"></div>
                                </div>
                            </div>
                        ))
                    ) : items.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No media items yet. Add your first one!
                        </div>
                    ) : (
                        items.sort((a, b) => a.order - b.order).map((item) => (
                            <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                                <div className="relative aspect-4/5 bg-gray-100">
                                    {item.mediaType === "image" && item.mediaUrl ? (
                                        <Image src={item.mediaUrl} alt={item.alt || item.title} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                            </svg>
                                        </div>
                                    )}
                                    {!item.isActive && (
                                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Inactive</div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                        <span className="capitalize">{item.mediaType}</span>
                                        <span>Order: {item.order}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(item)} className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm">Edit</button>
                                        <button onClick={() => handleDelete(item._id)} className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm">Delete</button>
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
