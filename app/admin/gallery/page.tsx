"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import AdminLayout from "../../components/AdminLayout";
import { toast } from "sonner";

interface GalleryItem {
    id: string;
    title: string;
    description: string;
    mediaType: "IMAGE" | "VIDEO";
    mediaUrl: string;
    thumbnailUrl: string;
    alt: string;
    order: number;
    isActive: boolean;
    tags: string[];
}

export default function AdminGalleryPage() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        mediaType: "IMAGE" as "IMAGE" | "VIDEO",
        mediaUrl: "",
        thumbnailUrl: "",
        alt: "",
        order: 0,
        isActive: true,
        tags: [] as string[],
    });

    const fetchItems = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/gallery");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setItems(data);
        } catch {
            toast.error("Failed to load gallery items");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) { toast.error("Title is required"); return; }
        if (!formData.mediaUrl) { toast.error("Media file is required"); return; }

        try {
            if (editingItem) {
                const res = await fetch(`/api/admin/gallery/${editingItem.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                if (!res.ok) throw new Error("Failed to update");
                toast.success("Item updated");
            } else {
                const res = await fetch("/api/admin/gallery", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                if (!res.ok) throw new Error("Failed to create");
                toast.success("Item added");
            }
            resetForm();
            fetchItems();
        } catch {
            toast.error("Failed to save item");
        }
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

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this item?")) return;
        try {
            const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            setItems(items.filter((i) => i.id !== id));
            toast.success("Item deleted");
        } catch {
            toast.error("Failed to delete item");
        }
    };

    const resetForm = () => {
        setFormData({ title: "", description: "", mediaType: "IMAGE", mediaUrl: "", thumbnailUrl: "", alt: "", order: 0, isActive: true, tags: [] });
        setEditingItem(null);
        setShowForm(false);
    };

    const handleMediaSelect = (field: "mediaUrl" | "thumbnailUrl") => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = field === "mediaUrl" && formData.mediaType === "VIDEO"
            ? "video/mp4,video/webm"
            : "image/jpeg,image/jpg,image/png,image/webp";

        input.onchange = async (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            setUploading(true);
            try {
                const fd = new FormData();
                fd.append("file", file);
                fd.append("folder", "garudaqua/gallery");
                const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                if (!res.ok) throw new Error("Upload failed");
                const { url } = await res.json();
                setFormData((prev) => ({ ...prev, [field]: url, alt: prev.alt || file.name.replace(/\.[^/.]+$/, "") }));
                toast.success("File uploaded");
            } catch {
                toast.error("Failed to upload file");
            } finally {
                setUploading(false);
            }
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
                                    <select value={formData.mediaType} onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as "IMAGE" | "VIDEO" })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent">
                                        <option value="IMAGE">Image</option>
                                        <option value="VIDEO">Video</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Media File *</label>
                                    <div className="flex items-center gap-3">
                                        <button type="button" onClick={() => handleMediaSelect("mediaUrl")} disabled={uploading}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50">
                                            {uploading ? "Uploading..." : `Upload ${formData.mediaType === "VIDEO" ? "Video" : "Image"}`}
                                        </button>
                                        {formData.mediaUrl && <span className="text-green-600 text-sm">File uploaded</span>}
                                    </div>
                                    {formData.mediaUrl && formData.mediaType === "IMAGE" && (
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
                            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                                <div className="relative aspect-4/5 bg-gray-100">
                                    {item.mediaType === "IMAGE" && item.mediaUrl ? (
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
                                        <span className="capitalize">{item.mediaType.toLowerCase()}</span>
                                        <span>Order: {item.order}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(item)} className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm">Edit</button>
                                        <button onClick={() => handleDelete(item.id)} className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm">Delete</button>
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
