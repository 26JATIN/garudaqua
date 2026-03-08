"use client";
import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/AdminLayout";
import { toast } from "sonner";

// ===== Types =====
interface HeroVideo {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    order: number;
    isActive: boolean;
    duration: number;
    linkedProductId: string;
    createdAt: string;
}

export default function AdminHeroVideosPage() {
    const [videos, setVideos] = useState<HeroVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [toggling, setToggling] = useState<string | null>(null);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingVideo, setEditingVideo] = useState<HeroVideo | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        videoUrl: "",
        thumbnailUrl: "",
        order: 0,
        isActive: true,
        duration: 0,
        linkedProductId: "",
    });

    const fetchVideos = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/hero-videos");
            if (!res.ok) {
                throw new Error("Failed to fetch hero videos");
            }
            const data = await res.json();
            setVideos(Array.isArray(data) ? data : data.videos ?? []);
        } catch (err) {
            console.error("Error fetching hero videos:", err);
            toast.error("Failed to load hero videos");
            setVideos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) { toast.error("Title is required"); return; }
        if (!formData.videoUrl) { toast.error("Please upload a video"); return; }

        setSubmitting(true);
        try {
            if (editingVideo) {
                const res = await fetch(`/api/admin/hero-videos/${editingVideo.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || "Failed to update video");
                }
                toast.success("Video updated");
            } else {
                const res = await fetch("/api/admin/hero-videos", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || "Failed to add video");
                }
                toast.success("Video added");
            }
            resetForm();
            await fetchVideos();
        } catch (err) {
            console.error("Error saving video:", err);
            toast.error(err instanceof Error ? err.message : "Failed to save video");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (video: HeroVideo) => {
        setEditingVideo(video);
        setFormData({
            title: video.title,
            description: video.description,
            videoUrl: video.videoUrl,
            thumbnailUrl: video.thumbnailUrl,
            order: video.order,
            isActive: video.isActive,
            duration: video.duration,
            linkedProductId: video.linkedProductId,
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this video?")) return;

        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/hero-videos/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to delete video");
            }
            toast.success("Video deleted");
            await fetchVideos();
        } catch (err) {
            console.error("Error deleting video:", err);
            toast.error(err instanceof Error ? err.message : "Failed to delete video");
        } finally {
            setDeleting(null);
        }
    };

    const toggleActive = async (video: HeroVideo) => {
        setToggling(video.id);
        try {
            const res = await fetch(`/api/admin/hero-videos/${video.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !video.isActive }),
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to update video status");
            }
            await fetchVideos();
        } catch (err) {
            console.error("Error toggling video status:", err);
            toast.error(err instanceof Error ? err.message : "Failed to update video status");
        } finally {
            setToggling(null);
        }
    };

    const resetForm = () => {
        setFormData({ title: "", description: "", videoUrl: "", thumbnailUrl: "", order: 0, isActive: true, duration: 0, linkedProductId: "" });
        setEditingVideo(null);
        setShowForm(false);
    };

    const handleVideoUpload = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "video/mp4,video/webm,video/mov";

        input.onchange = async (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            if (file.size > 50 * 1024 * 1024) { toast.error("Video must be under 50MB"); return; }

            setUploadingVideo(true);
            try {
                const uploadFormData = new FormData();
                uploadFormData.append("file", file);
                uploadFormData.append("folder", "garudaqua/videos");

                const res = await fetch("/api/admin/upload", {
                    method: "POST",
                    body: uploadFormData,
                });

                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || "Failed to upload video");
                }

                const { url, duration } = await res.json();
                setFormData((prev) => ({
                    ...prev,
                    videoUrl: url,
                    duration: duration ? Math.round(duration) : prev.duration,
                }));
                toast.success("Video uploaded");
            } catch (err) {
                console.error("Error uploading video:", err);
                toast.error(err instanceof Error ? err.message : "Failed to upload video");
            } finally {
                setUploadingVideo(false);
            }
        };
        input.click();
    };

    const handleThumbnailUpload = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/jpeg,image/png,image/webp";

        input.onchange = async (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            if (file.size > 10 * 1024 * 1024) { toast.error("Thumbnail must be under 10MB"); return; }

            setUploadingThumbnail(true);
            try {
                const uploadFormData = new FormData();
                uploadFormData.append("file", file);
                uploadFormData.append("folder", "garudaqua/videos");

                const res = await fetch("/api/admin/upload", {
                    method: "POST",
                    body: uploadFormData,
                });

                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || "Failed to upload thumbnail");
                }

                const { url } = await res.json();
                setFormData((prev) => ({ ...prev, thumbnailUrl: url }));
                toast.success("Thumbnail uploaded");
            } catch (err) {
                console.error("Error uploading thumbnail:", err);
                toast.error(err instanceof Error ? err.message : "Failed to upload thumbnail");
            } finally {
                setUploadingThumbnail(false);
            }
        };
        input.click();
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-gray-200 rounded"></div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="rounded-xl overflow-hidden">
                                <div className="aspect-9/16 bg-gray-200"></div>
                                <div className="p-3 space-y-2">
                                    <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Hero Videos</h1>
                        <p className="text-gray-600 mt-1">Manage portrait videos showcasing products on the homepage</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-5 py-2 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0369A1] transition text-sm font-medium"
                    >
                        {showForm ? "Cancel" : "+ Add Video"}
                    </button>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-1">Video Guidelines</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>Use portrait/vertical videos (9:16 aspect ratio)</li>
                                <li>Keep videos short (10-30 seconds) for optimal engagement</li>
                                <li>Maximum file size: 50MB</li>
                                <li>Supported formats: MP4, WebM, MOV</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">{editingVideo ? "Edit Video" : "Add New Video"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Video Upload *</label>
                                    <div className="flex items-center gap-4">
                                        <button type="button" onClick={handleVideoUpload} disabled={uploadingVideo}
                                            className="px-5 py-2.5 bg-[#0369A1] text-white rounded-lg hover:bg-[#045178] transition text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                            {uploadingVideo ? "Uploading..." : "Upload Video"}
                                        </button>
                                        {uploadingVideo && (
                                            <span className="text-blue-600 flex items-center text-sm">
                                                <svg className="animate-spin w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Uploading video...
                                            </span>
                                        )}
                                        {formData.videoUrl && !uploadingVideo && (
                                            <span className="text-green-600 flex items-center text-sm">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Video uploaded
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Upload</label>
                                    <div className="flex items-center gap-4">
                                        <button type="button" onClick={handleThumbnailUpload} disabled={uploadingThumbnail}
                                            className="px-5 py-2.5 bg-[#0369A1] text-white rounded-lg hover:bg-[#045178] transition text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                            {uploadingThumbnail ? "Uploading..." : "Upload Thumbnail"}
                                        </button>
                                        {uploadingThumbnail && (
                                            <span className="text-blue-600 flex items-center text-sm">
                                                <svg className="animate-spin w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Uploading thumbnail...
                                            </span>
                                        )}
                                        {formData.thumbnailUrl && !uploadingThumbnail && (
                                            <span className="text-green-600 flex items-center text-sm">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Thumbnail uploaded
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                    <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                                        placeholder="e.g., 3-Layer Tank Showcase" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                                        placeholder="Brief description of the video..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                                    <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent" min="0" />
                                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select value={String(formData.isActive)} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent">
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2 border-t">
                                <button type="submit" disabled={submitting || uploadingVideo || uploadingThumbnail}
                                    className="px-5 py-2 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0369A1] transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                    {submitting ? "Saving..." : editingVideo ? "Update" : "Add Video"}
                                </button>
                                <button type="button" onClick={resetForm} disabled={submitting}
                                    className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm disabled:opacity-50">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Video Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.sort((a, b) => a.order - b.order).map((video) => (
                        <div key={video.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="relative aspect-9/16 bg-gray-100">
                                {video.videoUrl ? (
                                    <video className="w-full h-full object-cover" loop muted playsInline preload="metadata" controls>
                                        <source src={video.videoUrl} />
                                    </video>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                        <svg className="w-12 h-12 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-gray-900 text-sm">{video.title}</h3>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${video.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                        {video.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                {video.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>}
                                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                    <span>Order: {video.order}</span>
                                    {video.duration > 0 && <span>{video.duration}s</span>}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(video)} disabled={submitting}
                                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50">Edit</button>
                                    <button onClick={() => toggleActive(video)} disabled={toggling === video.id}
                                        className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm disabled:opacity-50">
                                        {toggling === video.id ? "..." : video.isActive ? "Deactivate" : "Activate"}
                                    </button>
                                    <button onClick={() => handleDelete(video.id)} disabled={deleting === video.id}
                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-50">
                                        {deleting === video.id ? "..." : "Delete"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {videos.length === 0 && !showForm && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No videos</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by adding a new hero video.</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
