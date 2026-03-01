"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";

// ===== Types =====
interface BlogPost {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    tags: string[];
    featuredImage: { url: string; alt: string };
    isPublished: boolean;
    readTime: number;
    author: string;
    publishedAt: string;
}

const CATEGORIES = [
    "water-tank-guide",
    "plumbing-tips",
    "maintenance",
    "industry-news",
    "other",
];

const CATEGORY_LABELS: Record<string, string> = {
    "water-tank-guide": "Water Tank Guide",
    "plumbing-tips": "Plumbing Tips",
    maintenance: "Maintenance",
    "industry-news": "Industry News",
    other: "Other",
};

const INITIAL_BLOGS: BlogPost[] = [
    {
        _id: "b1",
        title: "How to Choose the Right Water Tank for Your Home",
        slug: "how-to-choose-right-water-tank",
        excerpt: "Selecting the perfect water tank involves considering capacity, material, placement, and budget.",
        content: "<h2>Choosing the Right Water Tank</h2><p>When selecting a water tank for your home, consider these key factors...</p>",
        category: "water-tank-guide",
        tags: ["Water Tanks", "Buying Guide"],
        featuredImage: { url: "", alt: "" },
        isPublished: true,
        readTime: 6,
        author: "Garud Aqua Team",
        publishedAt: "2025-03-15",
    },
    {
        _id: "b2",
        title: "PVC vs CPVC Pipes: Which One Should You Use?",
        slug: "pvc-vs-cpvc-pipes-comparison",
        excerpt: "Understanding the differences between PVC and CPVC pipes for your plumbing needs.",
        content: "<h2>PVC vs CPVC</h2><p>Both PVC and CPVC are popular piping materials, but they serve different purposes...</p>",
        category: "plumbing-tips",
        tags: ["PVC Pipes", "CPVC Pipes"],
        featuredImage: { url: "", alt: "" },
        isPublished: true,
        readTime: 5,
        author: "Garud Aqua Team",
        publishedAt: "2025-03-01",
    },
    {
        _id: "b3",
        title: "5 Essential Tips to Maintain Your Water Tank",
        slug: "water-tank-maintenance-tips",
        excerpt: "Regular maintenance ensures clean water and extends your tank lifespan.",
        content: "<h2>Tank Maintenance</h2><p>Keeping your water tank clean is essential for your family's health...</p>",
        category: "maintenance",
        tags: ["Maintenance", "Water Tanks"],
        featuredImage: { url: "", alt: "" },
        isPublished: true,
        readTime: 4,
        author: "Garud Aqua Team",
        publishedAt: "2025-02-20",
    },
];

const STORAGE_KEY = "garudaqua_admin_blogs_full";

export default function BlogManagement() {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [imagePreview, setImagePreview] = useState("");
    const editorRef = useRef<HTMLDivElement>(null);
    const savedSelectionRef = useRef<Range | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        category: "other",
        tags: "",
        featuredImage: { url: "", alt: "" },
        isPublished: false,
        readTime: 5,
        author: "Garud Aqua Team",
    });

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            setBlogs(stored ? JSON.parse(stored) : INITIAL_BLOGS);
            if (!stored) localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BLOGS));
        } catch {
            setBlogs(INITIAL_BLOGS);
        }
        setLoading(false);
    }, []);

    const saveBlogs = (updated: BlogPost[]) => {
        setBlogs(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    // ===== Editor helpers =====
    const syncEditorContent = useCallback(() => {
        if (editorRef.current) {
            setFormData((prev) => ({ ...prev, content: editorRef.current!.innerHTML }));
        }
    }, []);

    const saveSelection = useCallback(() => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
            savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
        }
    }, []);

    const restoreSelection = useCallback(() => {
        if (savedSelectionRef.current) {
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(savedSelectionRef.current);
        }
    }, []);

    // Get the block-level tag wrapping the current selection
    const getCurrentBlockTag = useCallback((): string => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return "p";
        let node: Node | null = sel.anchorNode;
        while (node && node !== editorRef.current) {
            if (node.nodeType === 1) {
                const tag = (node as Element).tagName.toLowerCase();
                if (["p", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "div"].includes(tag)) {
                    return tag;
                }
            }
            node = node.parentNode;
        }
        return "p";
    }, []);

    const execFormat = useCallback(
        (command: string, value: string | null = null) => {
            // Focus the editor so execCommand targets it
            editorRef.current?.focus();
            restoreSelection();

            if (command === "formatBlock" && value) {
                // Toggle: if already this block type, revert to <p>
                const current = getCurrentBlockTag();
                const target = value.replace(/[<>]/g, "").toLowerCase();
                if (current === target) {
                    document.execCommand("formatBlock", false, "<p>");
                } else {
                    document.execCommand("formatBlock", false, value);
                }
            } else {
                document.execCommand(command, false, value ?? undefined);
            }

            saveSelection();
            syncEditorContent();
        },
        [restoreSelection, saveSelection, syncEditorContent, getCurrentBlockTag]
    );

    const preventFocusLoss = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
    }, []);

    // ===== CRUD =====
    const generateSlug = (title: string) =>
        title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editorRef.current) {
            formData.content = editorRef.current.innerHTML;
        }
        if (!formData.title.trim()) { toast.error("Title is required"); return; }

        const tags = formData.tags.split(",").map((t) => t.trim()).filter(Boolean);
        const slug = formData.slug || generateSlug(formData.title);

        if (editingBlog) {
            const updated = blogs.map((b) =>
                b._id === editingBlog._id
                    ? { ...editingBlog, ...formData, slug, tags }
                    : b
            );
            saveBlogs(updated);
            toast.success("Blog updated");
        } else {
            const newBlog: BlogPost = {
                _id: `blog-${Date.now()}`,
                ...formData,
                slug,
                tags,
                publishedAt: new Date().toISOString().split("T")[0],
            };
            saveBlogs([newBlog, ...blogs]);
            toast.success("Blog created");
        }
        setShowForm(false);
        setEditingBlog(null);
        resetForm();
    };

    const handleEdit = (blog: BlogPost) => {
        setEditingBlog(blog);
        setFormData({
            title: blog.title,
            slug: blog.slug,
            excerpt: blog.excerpt,
            content: blog.content,
            category: blog.category,
            tags: blog.tags?.join(", ") || "",
            featuredImage: blog.featuredImage || { url: "", alt: "" },
            isPublished: blog.isPublished,
            readTime: blog.readTime || 5,
            author: blog.author || "Garud Aqua Team",
        });
        setImagePreview(blog.featuredImage?.url || "");
        setShowForm(true);
        setTimeout(() => {
            if (editorRef.current) {
                editorRef.current.innerHTML = blog.content || "";
            }
        }, 50);
    };

    const handleDelete = (id: string) => {
        if (!confirm("Delete this blog post?")) return;
        saveBlogs(blogs.filter((b) => b._id !== id));
        toast.success("Blog deleted");
    };

    const resetForm = () => {
        setFormData({
            title: "",
            slug: "",
            excerpt: "",
            content: "",
            category: "other",
            tags: "",
            featuredImage: { url: "", alt: "" },
            isPublished: false,
            readTime: 5,
            author: "Garud Aqua Team",
        });
        setImagePreview("");
        if (editorRef.current) editorRef.current.innerHTML = "";
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { toast.error("Please upload an image"); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }

        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            setFormData((prev) => ({
                ...prev,
                featuredImage: { ...prev.featuredImage, url: dataUrl },
            }));
            setImagePreview(dataUrl);
            toast.success("Image selected");
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setFormData((prev) => ({
            ...prev,
            featuredImage: { ...prev.featuredImage, url: "" },
        }));
        setImagePreview("");
    };

    // ===== Filtering =====
    const filteredBlogs = blogs.filter((b) => {
        if (statusFilter === "published" && !b.isPublished) return false;
        if (statusFilter === "draft" && b.isPublished) return false;
        if (categoryFilter !== "all" && b.category !== categoryFilter) return false;
        if (searchTerm && !b.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    // ===== Form View =====
    if (showForm) {
        return (
            <div className="max-w-5xl mx-auto px-2 sm:px-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                    <h2 className="text-2xl sm:text-3xl font-light tracking-wide text-gray-900">
                        {editingBlog ? "Edit Article" : "Create New Article"}
                    </h2>
                    <button
                        onClick={() => { setShowForm(false); setEditingBlog(null); resetForm(); }}
                        className="px-6 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:border-[#0EA5E9] hover:text-[#0EA5E9] transition"
                    >
                        Cancel
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-xl border border-gray-100">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) })}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Slug</label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent font-mono text-sm"
                        />
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Excerpt *</label>
                        <textarea
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            rows={3}
                            maxLength={500}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">{formData.excerpt.length}/500</p>
                    </div>

                    {/* WYSIWYG Editor */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Content *</label>
                        <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#0EA5E9] focus-within:border-transparent">
                            {/* Toolbar */}
                            <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
                                <button type="button" onMouseDown={preventFocusLoss} onClick={() => execFormat("bold")} className="p-1.5 rounded hover:bg-gray-200 font-bold text-sm" title="Bold">B</button>
                                <button type="button" onMouseDown={preventFocusLoss} onClick={() => execFormat("italic")} className="p-1.5 rounded hover:bg-gray-200 italic text-sm" title="Italic">I</button>
                                <button type="button" onMouseDown={preventFocusLoss} onClick={() => execFormat("underline")} className="p-1.5 rounded hover:bg-gray-200 underline text-sm" title="Underline">U</button>
                                <span className="w-px h-5 bg-gray-300 mx-1"></span>
                                <button type="button" onMouseDown={preventFocusLoss} onClick={() => execFormat("formatBlock", "<h2>")} className="p-1.5 rounded hover:bg-gray-200 text-sm font-semibold" title="Heading 2">H2</button>
                                <button type="button" onMouseDown={preventFocusLoss} onClick={() => execFormat("formatBlock", "<h3>")} className="p-1.5 rounded hover:bg-gray-200 text-sm font-semibold" title="Heading 3">H3</button>
                                <button type="button" onMouseDown={preventFocusLoss} onClick={() => execFormat("formatBlock", "<p>")} className="p-1.5 rounded hover:bg-gray-200 text-sm" title="Paragraph">P</button>
                                <span className="w-px h-5 bg-gray-300 mx-1"></span>
                                <button type="button" onMouseDown={preventFocusLoss} onClick={() => execFormat("insertUnorderedList")} className="p-1.5 rounded hover:bg-gray-200 text-sm" title="Bullet List">UL</button>
                                <button type="button" onMouseDown={preventFocusLoss} onClick={() => execFormat("insertOrderedList")} className="p-1.5 rounded hover:bg-gray-200 text-sm" title="Numbered List">OL</button>
                                <button type="button" onMouseDown={preventFocusLoss} onClick={() => execFormat("formatBlock", "<blockquote>")} className="p-1.5 rounded hover:bg-gray-200 text-sm" title="Quote">Q</button>
                                <span className="w-px h-5 bg-gray-300 mx-1"></span>
                                <button type="button" onMouseDown={preventFocusLoss} onClick={() => {
                                    const url = prompt("Enter link URL:");
                                    if (url) execFormat("createLink", url);
                                }} className="p-1.5 rounded hover:bg-gray-200 text-sm" title="Link">Link</button>
                                <button type="button" onMouseDown={preventFocusLoss} onClick={() => execFormat("removeFormat")} className="p-1.5 rounded hover:bg-gray-200 text-sm text-gray-500" title="Clear Formatting">Clear</button>
                            </div>

                            {/* Editable area */}
                            <div
                                ref={editorRef}
                                contentEditable
                                suppressContentEditableWarning
                                onInput={syncEditorContent}
                                onMouseUp={saveSelection}
                                onKeyUp={saveSelection}
                                className="min-h-64 p-4 blog-content focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Category, Tags, Meta */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Tags (comma separated)</label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                                placeholder="Water Tanks, Tips, Guide"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Read Time (min)</label>
                            <input
                                type="number"
                                value={formData.readTime}
                                onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) || 5 })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                                min="1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Author</label>
                            <input
                                type="text"
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Featured Image</label>
                        {imagePreview ? (
                            <div className="relative inline-block">
                                <Image src={imagePreview} alt="Preview" width={300} height={200} className="rounded-xl object-cover max-h-48" />
                                <button type="button" onClick={removeImage}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600">
                                    &times;
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#0EA5E9] transition">
                                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span className="text-sm text-gray-500">Click to upload image</span>
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </label>
                        )}
                        {imagePreview && (
                            <div className="mt-2">
                                <input
                                    type="text"
                                    value={formData.featuredImage.alt}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, featuredImage: { ...prev.featuredImage, alt: e.target.value } }))}
                                    placeholder="Image alt text"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent text-sm"
                                />
                            </div>
                        )}
                    </div>

                    {/* Publish toggle */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isPublished"
                            checked={formData.isPublished}
                            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                            className="w-4 h-4 text-[#0EA5E9] border-gray-300 rounded focus:ring-[#0EA5E9]"
                        />
                        <label htmlFor="isPublished" className="text-sm text-gray-700">Publish immediately</label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                        <button type="submit" className="px-6 py-2.5 bg-[#0EA5E9] text-white rounded-xl hover:bg-[#0369A1] transition font-medium text-sm">
                            {editingBlog ? "Update Article" : "Create Article"}
                        </button>
                        <button type="button" onClick={() => { setShowForm(false); setEditingBlog(null); resetForm(); }}
                            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition text-sm">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // ===== List View =====
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Blog Articles</h2>
                    <p className="text-gray-600 mt-1">{blogs.length} articles total</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="px-5 py-2.5 bg-[#0EA5E9] text-white rounded-xl hover:bg-[#0369A1] transition font-medium text-sm flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Article
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Drafts</option>
                </select>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>
                    ))}
                </select>
            </div>

            {/* Blog List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-200">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : filteredBlogs.length === 0 ? (
                    <div className="p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500">No articles found</p>
                    </div>
                ) : (
                    filteredBlogs.map((blog) => (
                        <div key={blog._id} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition">
                            {/* Thumbnail */}
                            {blog.featuredImage?.url && (
                                <div className="w-20 h-14 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                    <Image src={blog.featuredImage.url} alt={blog.featuredImage.alt || blog.title} width={80} height={56} className="w-full h-full object-cover" />
                                </div>
                            )}
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{blog.title}</h3>
                                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{blog.excerpt}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className="text-xs px-2 py-0.5 bg-[#0EA5E9]/10 text-[#0EA5E9] rounded-full">
                                        {CATEGORY_LABELS[blog.category] || blog.category}
                                    </span>
                                    <span className="text-xs text-gray-400">{blog.readTime} min read</span>
                                    <span className="text-xs text-gray-400">{blog.publishedAt}</span>
                                    {blog.tags?.slice(0, 2).map((tag) => (
                                        <span key={tag} className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            {/* Status */}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${blog.isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                                {blog.isPublished ? "Published" : "Draft"}
                            </span>
                            {/* Actions */}
                            <div className="flex gap-2 shrink-0">
                                <button onClick={() => handleEdit(blog)} className="text-[#0EA5E9] hover:text-[#0369A1] text-sm font-medium">Edit</button>
                                <button onClick={() => handleDelete(blog._id)} className="text-red-600 hover:text-red-500 text-sm font-medium">Delete</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
