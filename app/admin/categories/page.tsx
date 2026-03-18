"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import AdminLayout from "../../components/AdminLayout";
import { toast } from "sonner";
import { uploadDirect } from "@/lib/upload-direct";
import dynamic from 'next/dynamic';

const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

// ===== Types =====
interface Category {
    id: string;
    name: string;
    slug?: string;
    description: string;
    image: string;
    sortOrder: number;
    isActive: boolean;
    hasSeoPage?: boolean;
    seoContent?: string;
    seoHeroImage?: string;
    metaTitle?: string;
    metaDesc?: string;
    _count?: { subcategories: number; products: number };
}

interface Subcategory {
    id: string;
    name: string;
    description: string;
    image: string;
    categoryId: string;
    order: number;
    isActive: boolean;
    category?: { id: string; name: string };
}

export default function CategoriesAdmin() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState<"categories" | "subcategories">("categories");
    const [showForm, setShowForm] = useState(false);
    const [showSubForm, setShowSubForm] = useState(false);
    const [editingCat, setEditingCat] = useState<Category | null>(null);
    const [editingSub, setEditingSub] = useState<Subcategory | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const joditConfig = useMemo(() => ({
        readonly: false, 
        height: 400, 
        uploader: { insertImageAsBase64URI: true },
        askBeforePasteHTML: false,
        askBeforePasteFromWord: false,
        defaultActionOnPaste: 'insert_as_html' as const,
        image: {
            editSrc: true,
            editTitle: true,
            editAlt: true,
            editLink: true,
            editSize: true,
            editMargins: true,
            editAlign: true
        },
        buttons: [
            'source', '|',
            'bold', 'strikethrough', 'underline', 'italic', '|',
            'ul', 'ol', '|',
            'outdent', 'indent',  '|',
            'font', 'fontsize', 'brush', 'paragraph', '|',
            'image', 'link', 'video', 'table', '|',
            'align', 'undo', 'redo', '|',
            'hr', 'eraser', 'copyformat', '|',
            'symbol', 'fullsize'
        ]
    }), []);

    const [catForm, setCatForm] = useState({ name: "", description: "", image: "", sortOrder: 0, isActive: true, hasSeoPage: false, seoContent: "", seoHeroImage: "", metaTitle: "", metaDesc: "" });
    const [subForm, setSubForm] = useState({ name: "", description: "", image: "", categoryId: "", order: 0, isActive: true });

    // ===== Fetch Categories =====
    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/categories");
            if (!res.ok) throw new Error("Failed to fetch categories");
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Failed to load categories");
        }
    }, []);

    // ===== Fetch Subcategories =====
    const fetchSubcategories = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/subcategories");
            if (!res.ok) throw new Error("Failed to fetch subcategories");
            const data = await res.json();
            setSubcategories(data);
        } catch (error) {
            console.error("Error fetching subcategories:", error);
            toast.error("Failed to load subcategories");
        }
    }, []);

    // ===== Initial Load =====
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchCategories(), fetchSubcategories()]);
            setLoading(false);
        };
        loadData();
    }, [fetchCategories, fetchSubcategories]);

    // ===== Image Upload via Cloudinary =====
    const uploadImage = useCallback(async (file: File, folder: string): Promise<string | null> => {
        setUploading(true);
        try {
            const { url } = await uploadDirect(file, folder);
            return url;
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Failed to upload image");
            return null;
        } finally {
            setUploading(false);
        }
    }, []);

    const pickImage = useCallback((onPicked: (url: string) => void) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const url = await uploadImage(file, "garudaqua/categories");
            if (url) onPicked(url);
        };
        input.click();
    }, [uploadImage]);

    // ===== Category CRUD =====
    const handleCatSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!catForm.name.trim()) { toast.error("Name is required"); return; }

        setSaving(true);
        try {
            if (editingCat) {
                const res = await fetch(`/api/admin/categories/${editingCat.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(catForm),
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error || "Failed to update category");
                }
                toast.success("Category updated");
            } else {
                const res = await fetch("/api/admin/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(catForm),
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error || "Failed to create category");
                }
                toast.success("Category created");
            }
            await fetchCategories();
            resetCatForm();
        } catch (error) {
            console.error("Error saving category:", error);
            toast.error(error instanceof Error ? error.message : "Failed to save category");
        } finally {
            setSaving(false);
        }
    }, [catForm, editingCat, fetchCategories]);

    const handleDeleteCat = useCallback(async (id: string) => {
        if (!confirm("Delete this category? Subcategories under it will be orphaned.")) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || "Failed to delete category");
            }
            toast.success("Category deleted");
            await Promise.all([fetchCategories(), fetchSubcategories()]);
        } catch (error) {
            console.error("Error deleting category:", error);
            toast.error(error instanceof Error ? error.message : "Failed to delete category");
        } finally {
            setSaving(false);
        }
    }, [fetchCategories, fetchSubcategories]);

    const startEditCat = (cat: Category) => {
        setEditingCat(cat);
        setCatForm({ 
            name: cat.name, 
            description: cat.description, 
            image: cat.image, 
            sortOrder: cat.sortOrder, 
            isActive: cat.isActive,
            hasSeoPage: cat.hasSeoPage ?? false,
            seoContent: cat.seoContent || "",
            seoHeroImage: cat.seoHeroImage || "",
            metaTitle: cat.metaTitle || "",
            metaDesc: cat.metaDesc || ""
        });
        setShowForm(true);
    };

    const resetCatForm = () => {
        setCatForm({ name: "", description: "", image: "", sortOrder: 0, isActive: true, hasSeoPage: false, seoContent: "", seoHeroImage: "", metaTitle: "", metaDesc: "" });
        setEditingCat(null);
        setShowForm(false);
    };

    // ===== Subcategory CRUD =====
    const handleSubSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subForm.name.trim() || !subForm.categoryId) { toast.error("Name and category are required"); return; }

        setSaving(true);
        try {
            if (editingSub) {
                const res = await fetch(`/api/admin/subcategories/${editingSub.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(subForm),
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error || "Failed to update subcategory");
                }
                toast.success("Subcategory updated");
            } else {
                const res = await fetch("/api/admin/subcategories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(subForm),
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error || "Failed to create subcategory");
                }
                toast.success("Subcategory created");
            }
            await fetchSubcategories();
            resetSubForm();
        } catch (error) {
            console.error("Error saving subcategory:", error);
            toast.error(error instanceof Error ? error.message : "Failed to save subcategory");
        } finally {
            setSaving(false);
        }
    }, [subForm, editingSub, fetchSubcategories]);

    const handleDeleteSub = useCallback(async (id: string) => {
        if (!confirm("Delete this subcategory?")) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/admin/subcategories/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || "Failed to delete subcategory");
            }
            toast.success("Subcategory deleted");
            await Promise.all([fetchCategories(), fetchSubcategories()]);
        } catch (error) {
            console.error("Error deleting subcategory:", error);
            toast.error(error instanceof Error ? error.message : "Failed to delete subcategory");
        } finally {
            setSaving(false);
        }
    }, [fetchCategories, fetchSubcategories]);

    const startEditSub = (sub: Subcategory) => {
        setEditingSub(sub);
        setSubForm({ name: sub.name, description: sub.description, image: sub.image, categoryId: sub.categoryId, order: sub.order, isActive: sub.isActive });
        setShowSubForm(true);
    };

    const resetSubForm = () => {
        setSubForm({ name: "", description: "", image: "", categoryId: "", order: 0, isActive: true });
        setEditingSub(null);
        setShowSubForm(false);
    };

    const filteredCats = categories.filter((c) => !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredSubs = subcategories.filter((s) => !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const getCatName = (catId: string) => categories.find((c) => c.id === catId)?.name || "Unknown";

    if (loading) {
        return (
            <AdminLayout>
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-gray-200 rounded"></div>
                    <div className="h-64 bg-gray-200 rounded-xl"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                        <p className="text-gray-600 mt-1">Manage product categories and subcategories</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setActiveTab("categories"); resetSubForm(); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "categories" ? "bg-[#0EA5E9] text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}
                        >
                            Categories ({categories.length})
                        </button>
                        <button
                            onClick={() => { setActiveTab("subcategories"); resetCatForm(); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "subcategories" ? "bg-[#0EA5E9] text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}
                        >
                            Subcategories ({subcategories.length})
                        </button>
                    </div>
                </div>

                {/* Search + Add */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                    />
                    <button
                        onClick={() => activeTab === "categories" ? setShowForm(true) : setShowSubForm(true)}
                        className="px-5 py-2 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0369A1] transition text-sm font-medium"
                    >
                        + Add {activeTab === "categories" ? "Category" : "Subcategory"}
                    </button>
                </div>

                {/* ===== Category Form ===== */}
                {showForm && (
                    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 sm:p-8 transition-all duration-300">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-50">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-[#0EA5E9]/10 flex items-center justify-center text-[#0EA5E9]">
                                    {editingCat ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    )}
                                </span>
                                {editingCat ? "Edit Category Configuration" : "New Category Setup"}
                            </h2>
                            <button type="button" onClick={resetCatForm} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleCatSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                                {/* Left Side: Basic Info */}
                                <div className="space-y-5">
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Basic Information</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Name *</label>
                                        <input type="text" required value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] transition-all" placeholder="e.g., Water Tanks" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort Order</label>
                                        <input type="number" value={catForm.sortOrder} onChange={(e) => setCatForm({ ...catForm, sortOrder: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Description</label>
                                        <textarea value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} rows={3}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] transition-all resize-none" placeholder="Brief overview for internal use..." />
                                    </div>
                                    
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Category Catalog Image</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Used in standard grid views</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {catForm.image && (
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                                    <Image src={catForm.image} alt="Preview" fill className="object-cover" />
                                                </div>
                                            )}
                                            <button type="button" disabled={uploading} onClick={() => pickImage((url) => setCatForm((prev) => ({ ...prev, image: url })))}
                                                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                                {uploading ? "Uploading..." : "Upload Cover"}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                                        <label className="flex items-center gap-3 w-full cursor-pointer">
                                            <div className="relative flex items-center">
                                                <input type="checkbox" checked={catForm.isActive} onChange={(e) => setCatForm({ ...catForm, isActive: e.target.checked })}
                                                    className="sr-only peer" />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0EA5E9]"></div>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-900 block">Active Status</span>
                                                <span className="text-xs text-gray-500">Enable to make category visible</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Right Side: SEO Configuration */}
                                <div className="space-y-5">
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                                        SEO & Marketing
                                        <label className="flex items-center gap-2 cursor-pointer bg-[#0EA5E9]/5 px-3 py-1.5 rounded-lg border border-[#0EA5E9]/10">
                                            <input type="checkbox" checked={catForm.hasSeoPage} onChange={(e) => setCatForm({ ...catForm, hasSeoPage: e.target.checked })}
                                                className="w-4 h-4 text-[#0EA5E9] border-gray-300 rounded focus:ring-[#0EA5E9]" />
                                            <span className="text-xs font-bold text-[#0EA5E9]">Enable SEO Page</span>
                                        </label>
                                    </h3>
                                    
                                    <div className={`transition-all duration-300 ${catForm.hasSeoPage ? 'opacity-100' : 'opacity-50 pointer-events-none grayscale-50'}`}>
                                        <div className="space-y-4 p-5 rounded-2xl border border-[#0EA5E9]/20 bg-linear-to-br from-[#0EA5E9]/2 to-transparent">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Title</label>
                                                <input type="text" value={catForm.metaTitle} onChange={(e) => setCatForm({ ...catForm, metaTitle: e.target.value })} disabled={!catForm.hasSeoPage}
                                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] transition-all disabled:bg-gray-100" placeholder="Optimized Page Title" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Description (150 chars)</label>
                                                <textarea value={catForm.metaDesc} onChange={(e) => setCatForm({ ...catForm, metaDesc: e.target.value })} rows={2} disabled={!catForm.hasSeoPage}
                                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] transition-all resize-none disabled:bg-gray-100" placeholder="Captivating search engine summary..." />
                                            </div>
                                            <div className="p-4 bg-white rounded-xl border border-gray-100 flex flex-col gap-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Dedicated SEO Hero Image</label>
                                                    <p className="text-xs text-gray-500 mt-0.5">High-quality full-width banner for the SEO page header.</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {catForm.seoHeroImage && (
                                                        <div className="relative w-20 h-10 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                                            <Image src={catForm.seoHeroImage} alt="SEO Hero" fill className="object-cover" />
                                                        </div>
                                                    )}
                                                    <button type="button" disabled={uploading || !catForm.hasSeoPage} onClick={() => pickImage((url) => setCatForm((prev) => ({ ...prev, seoHeroImage: url })))}
                                                        className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                                        {uploading ? "Uploading..." : "Upload Hero Banner"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Full Width SEO Content Editor */}
                            {catForm.hasSeoPage && (
                                <div className="mt-8 pt-6 border-t border-gray-100 fade-in animate-in">
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-[#0EA5E9]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        Rich SEO Content Editor
                                    </h3>
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm lg:col-span-2">
                                        <JoditEditor
                                            value={catForm.seoContent}
                                            config={joditConfig}
                                            onBlur={(newContent) => setCatForm(prev => ({ ...prev, seoContent: newContent }))}
                                            onChange={(newContent) => setCatForm(prev => ({ ...prev, seoContent: newContent }))}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-6 border-t border-gray-100 mt-6 justify-end">
                                <button type="button" onClick={resetCatForm} className="px-6 py-2.5 bg-gray-50 text-gray-700 font-medium rounded-xl hover:bg-gray-100 border border-gray-200 transition">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving || uploading} className="px-8 py-2.5 bg-[#0EA5E9] text-white font-medium rounded-xl hover:bg-[#0369A1] shadow-lg shadow-[#0EA5E9]/20 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                    {saving ? "Saving..." : editingCat ? "Save Changes" : "Publish Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ===== Subcategory Form ===== */}
                {showSubForm && (
                    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 sm:p-8 transition-all duration-300">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-50">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-[#0EA5E9]/10 flex items-center justify-center text-[#0EA5E9]">
                                    {editingSub ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    )}
                                </span>
                                {editingSub ? "Edit Subcategory Configuration" : "New Subcategory Setup"}
                            </h2>
                            <button type="button" onClick={resetSubForm} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Subcategory Name *</label>
                                    <input type="text" required value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] transition-all" placeholder="e.g., Overhead Tanks" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Parent Category *</label>
                                    <select required value={subForm.categoryId} onChange={(e) => setSubForm({ ...subForm, categoryId: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] transition-all">
                                        <option value="">Select Category</option>
                                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                                    <textarea value={subForm.description} onChange={(e) => setSubForm({ ...subForm, description: e.target.value })} rows={3}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] transition-all resize-none" placeholder="Brief overview for internal use..." />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort Order</label>
                                    <input type="number" value={subForm.order} onChange={(e) => setSubForm({ ...subForm, order: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0EA5E9]/20 focus:border-[#0EA5E9] transition-all" />
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between col-span-1 md:col-span-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Subcategory Image</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Used in standard grid views</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {subForm.image && (
                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                                <Image src={subForm.image} alt="Preview" fill className="object-cover" />
                                            </div>
                                        )}
                                        <button type="button" disabled={uploading} onClick={() => pickImage((url) => setSubForm((prev) => ({ ...prev, image: url })))}
                                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                            {uploading ? "Uploading..." : "Upload Cover"}
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="flex items-center p-4 border border-gray-100 rounded-xl bg-gray-50/50 col-span-1 md:col-span-2">
                                    <label className="flex items-center gap-3 w-full cursor-pointer">
                                        <div className="relative flex items-center">
                                            <input type="checkbox" checked={subForm.isActive} onChange={(e) => setSubForm({ ...subForm, isActive: e.target.checked })}
                                                className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0EA5E9]"></div>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-900 block">Active Status</span>
                                            <span className="text-xs text-gray-500">Enable to make subcategory visible</span>
                                        </div>
                                    </label>
                                </div>

                            </div>
                            
                            <div className="flex gap-3 pt-6 border-t border-gray-100 mt-6 justify-end">
                                <button type="button" onClick={resetSubForm} className="px-6 py-2.5 bg-gray-50 text-gray-700 font-medium rounded-xl hover:bg-gray-100 border border-gray-200 transition">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving || uploading} className="px-8 py-2.5 bg-[#0EA5E9] text-white font-medium rounded-xl hover:bg-[#0369A1] shadow-lg shadow-[#0EA5E9]/20 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                    {saving ? "Saving..." : editingSub ? "Save Changes" : "Publish Subcategory"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ===== Categories List ===== */}
                {activeTab === "categories" && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="divide-y divide-gray-200">
                            {filteredCats.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No categories found</div>
                            ) : (
                                filteredCats.sort((a, b) => a.sortOrder - b.sortOrder).map((cat) => (
                                    <div key={cat.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                            {cat.image ? (
                                                <Image src={cat.image} alt={cat.name} width={56} height={56} className="object-cover w-full h-full" />
                                            ) : (
                                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 002-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-semibold text-gray-900 truncate">{cat.name}</h3>
                                            <p className="text-xs text-gray-500 line-clamp-1">{cat.description}</p>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <span className="text-xs text-gray-400">Order: {cat.sortOrder}</span>
                                                <span className="text-xs text-gray-400">|</span>
                                                <span className="text-xs text-gray-400">{cat._count?.subcategories ?? 0} subcategories</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                    {cat.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => startEditCat(cat)} disabled={saving} className="text-[#0EA5E9] hover:text-[#0369A1] text-sm font-medium disabled:opacity-50">Edit</button>
                                            <button onClick={() => handleDeleteCat(cat.id)} disabled={saving} className="text-red-600 hover:text-red-500 text-sm font-medium disabled:opacity-50">Delete</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* ===== Subcategories List ===== */}
                {activeTab === "subcategories" && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="divide-y divide-gray-200">
                            {filteredSubs.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No subcategories found</div>
                            ) : (
                                filteredSubs.sort((a, b) => a.order - b.order).map((sub) => (
                                    <div key={sub.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                            {sub.image ? (
                                                <Image src={sub.image} alt={sub.name} width={56} height={56} className="object-cover w-full h-full" />
                                            ) : (
                                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-semibold text-gray-900 truncate">{sub.name}</h3>
                                            <p className="text-xs text-gray-500 line-clamp-1">{sub.description}</p>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <span className="text-xs text-[#0EA5E9]">{sub.category?.name || getCatName(sub.categoryId)}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sub.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                    {sub.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => startEditSub(sub)} disabled={saving} className="text-[#0EA5E9] hover:text-[#0369A1] text-sm font-medium disabled:opacity-50">Edit</button>
                                            <button onClick={() => handleDeleteSub(sub.id)} disabled={saving} className="text-red-600 hover:text-red-500 text-sm font-medium disabled:opacity-50">Delete</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
