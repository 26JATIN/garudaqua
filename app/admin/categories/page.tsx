"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import AdminLayout from "../../components/AdminLayout";
import { toast } from "sonner";
import { uploadToCloudinaryDirect } from "@/lib/cloudinary-upload";

// ===== Types =====
interface Category {
    id: string;
    name: string;
    description: string;
    image: string;
    sortOrder: number;
    isActive: boolean;
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

    const [catForm, setCatForm] = useState({ name: "", description: "", image: "", sortOrder: 0, isActive: true });
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
            const { url } = await uploadToCloudinaryDirect(file, folder);
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
        setCatForm({ name: cat.name, description: cat.description, image: cat.image, sortOrder: cat.sortOrder, isActive: cat.isActive });
        setShowForm(true);
    };

    const resetCatForm = () => {
        setCatForm({ name: "", description: "", image: "", sortOrder: 0, isActive: true });
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">{editingCat ? "Edit Category" : "New Category"}</h2>
                        <form onSubmit={handleCatSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                    <input type="text" required value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent" placeholder="e.g., Water Tanks" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                                    <input type="number" value={catForm.sortOrder} onChange={(e) => setCatForm({ ...catForm, sortOrder: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} rows={2}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent" placeholder="Brief description..." />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button type="button" disabled={uploading} onClick={() => pickImage((url) => setCatForm((prev) => ({ ...prev, image: url })))}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                    {uploading ? "Uploading..." : "Upload Image"}
                                </button>
                                {catForm.image && <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100"><Image src={catForm.image} alt="Preview" fill className="object-cover" /></div>}
                                <label className="flex items-center gap-2 ml-auto">
                                    <input type="checkbox" checked={catForm.isActive} onChange={(e) => setCatForm({ ...catForm, isActive: e.target.checked })}
                                        className="w-4 h-4 text-[#0EA5E9] border-gray-300 rounded focus:ring-[#0EA5E9]" />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={saving || uploading} className="px-5 py-2 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0369A1] transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                    {saving ? "Saving..." : editingCat ? "Update" : "Create"}
                                </button>
                                <button type="button" onClick={resetCatForm} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ===== Subcategory Form ===== */}
                {showSubForm && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">{editingSub ? "Edit Subcategory" : "New Subcategory"}</h2>
                        <form onSubmit={handleSubSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                    <input type="text" required value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent" placeholder="e.g., Overhead Tanks" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category *</label>
                                    <select required value={subForm.categoryId} onChange={(e) => setSubForm({ ...subForm, categoryId: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent">
                                        <option value="">Select Category</option>
                                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea value={subForm.description} onChange={(e) => setSubForm({ ...subForm, description: e.target.value })} rows={2}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                                    <input type="number" value={subForm.order} onChange={(e) => setSubForm({ ...subForm, order: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button type="button" disabled={uploading} onClick={() => pickImage((url) => setSubForm((prev) => ({ ...prev, image: url })))}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                    {uploading ? "Uploading..." : "Upload Image"}
                                </button>
                                {subForm.image && <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100"><Image src={subForm.image} alt="Preview" fill className="object-cover" /></div>}
                                <label className="flex items-center gap-2 ml-auto">
                                    <input type="checkbox" checked={subForm.isActive} onChange={(e) => setSubForm({ ...subForm, isActive: e.target.checked })}
                                        className="w-4 h-4 text-[#0EA5E9] border-gray-300 rounded focus:ring-[#0EA5E9]" />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={saving || uploading} className="px-5 py-2 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0369A1] transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                    {saving ? "Saving..." : editingSub ? "Update" : "Create"}
                                </button>
                                <button type="button" onClick={resetSubForm} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm">Cancel</button>
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
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
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
