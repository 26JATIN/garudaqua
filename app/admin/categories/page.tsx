"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import AdminLayout from "../../components/AdminLayout";
import { toast } from "sonner";

// ===== Types =====
interface Category {
    _id: string;
    name: string;
    description: string;
    image: string;
    sortOrder: number;
    isActive: boolean;
}

interface Subcategory {
    _id: string;
    name: string;
    description: string;
    image: string;
    categoryId: string;
    order: number;
    isActive: boolean;
}

// ===== Initial static data =====
const INITIAL_CATEGORIES: Category[] = [
    { _id: "cat-1", name: "Water Tanks", description: "Multi-layer and single-layer water storage tanks", image: "", sortOrder: 1, isActive: true },
    { _id: "cat-2", name: "Pipes & Fittings", description: "PVC, CPVC, and uPVC pipes with fittings", image: "", sortOrder: 2, isActive: true },
    { _id: "cat-3", name: "Bathroom Fittings", description: "Taps, showers, and bathroom accessories", image: "", sortOrder: 3, isActive: true },
];

const INITIAL_SUBCATEGORIES: Subcategory[] = [
    { _id: "sub-1", name: "Overhead Tanks", description: "Roof-mounted water tanks", image: "", categoryId: "cat-1", order: 1, isActive: true },
    { _id: "sub-2", name: "Underground Tanks", description: "Below-ground water storage", image: "", categoryId: "cat-1", order: 2, isActive: true },
    { _id: "sub-3", name: "CPVC Pipes", description: "Hot & cold water CPVC pipes", image: "", categoryId: "cat-2", order: 1, isActive: true },
    { _id: "sub-4", name: "PVC Pipes", description: "Cold water PVC pipes", image: "", categoryId: "cat-2", order: 2, isActive: true },
    { _id: "sub-5", name: "Pipe Fittings", description: "Elbows, tees, couplings", image: "", categoryId: "cat-2", order: 3, isActive: true },
];

const CAT_STORAGE = "garudaqua_admin_categories";
const SUBCAT_STORAGE = "garudaqua_admin_subcategories";

export default function CategoriesAdmin() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"categories" | "subcategories">("categories");
    const [showForm, setShowForm] = useState(false);
    const [showSubForm, setShowSubForm] = useState(false);
    const [editingCat, setEditingCat] = useState<Category | null>(null);
    const [editingSub, setEditingSub] = useState<Subcategory | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [catForm, setCatForm] = useState({ name: "", description: "", image: "", sortOrder: 0, isActive: true });
    const [subForm, setSubForm] = useState({ name: "", description: "", image: "", categoryId: "", order: 0, isActive: true });

    useEffect(() => {
        try {
            const storedCats = localStorage.getItem(CAT_STORAGE);
            const storedSubs = localStorage.getItem(SUBCAT_STORAGE);
            setCategories(storedCats ? JSON.parse(storedCats) : INITIAL_CATEGORIES);
            setSubcategories(storedSubs ? JSON.parse(storedSubs) : INITIAL_SUBCATEGORIES);
            if (!storedCats) localStorage.setItem(CAT_STORAGE, JSON.stringify(INITIAL_CATEGORIES));
            if (!storedSubs) localStorage.setItem(SUBCAT_STORAGE, JSON.stringify(INITIAL_SUBCATEGORIES));
        } catch {
            setCategories(INITIAL_CATEGORIES);
            setSubcategories(INITIAL_SUBCATEGORIES);
        }
        setLoading(false);
    }, []);

    const saveCats = (updated: Category[]) => {
        setCategories(updated);
        localStorage.setItem(CAT_STORAGE, JSON.stringify(updated));
    };

    const saveSubs = (updated: Subcategory[]) => {
        setSubcategories(updated);
        localStorage.setItem(SUBCAT_STORAGE, JSON.stringify(updated));
    };

    // ===== Category CRUD =====
    const handleCatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!catForm.name.trim()) { toast.error("Name is required"); return; }

        if (editingCat) {
            const updated = categories.map((c) => c._id === editingCat._id ? { ...editingCat, ...catForm } : c);
            saveCats(updated);
            toast.success("Category updated");
        } else {
            const newCat: Category = { _id: `cat-${Date.now()}`, ...catForm };
            saveCats([...categories, newCat]);
            toast.success("Category created");
        }
        resetCatForm();
    };

    const handleDeleteCat = (id: string) => {
        if (!confirm("Delete this category? Subcategories under it will be orphaned.")) return;
        saveCats(categories.filter((c) => c._id !== id));
        toast.success("Category deleted");
    };

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
    const handleSubSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subForm.name.trim() || !subForm.categoryId) { toast.error("Name and category are required"); return; }

        if (editingSub) {
            const updated = subcategories.map((s) => s._id === editingSub._id ? { ...editingSub, ...subForm } : s);
            saveSubs(updated);
            toast.success("Subcategory updated");
        } else {
            const newSub: Subcategory = { _id: `sub-${Date.now()}`, ...subForm };
            saveSubs([...subcategories, newSub]);
            toast.success("Subcategory created");
        }
        resetSubForm();
    };

    const handleDeleteSub = (id: string) => {
        if (!confirm("Delete this subcategory?")) return;
        saveSubs(subcategories.filter((s) => s._id !== id));
        toast.success("Subcategory deleted");
    };

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

    const pickImage = (onPicked: (dataUrl: string) => void) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => onPicked(ev.target?.result as string);
            reader.readAsDataURL(file);
        };
        input.click();
    };

    const filteredCats = categories.filter((c) => !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredSubs = subcategories.filter((s) => !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const getCatName = (catId: string) => categories.find((c) => c._id === catId)?.name || "Unknown";

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
                                <button type="button" onClick={() => pickImage((url) => setCatForm((prev) => ({ ...prev, image: url })))}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm">Upload Image</button>
                                {catForm.image && <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100"><Image src={catForm.image} alt="Preview" fill className="object-cover" /></div>}
                                <label className="flex items-center gap-2 ml-auto">
                                    <input type="checkbox" checked={catForm.isActive} onChange={(e) => setCatForm({ ...catForm, isActive: e.target.checked })}
                                        className="w-4 h-4 text-[#0EA5E9] border-gray-300 rounded focus:ring-[#0EA5E9]" />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="px-5 py-2 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0369A1] transition text-sm font-medium">{editingCat ? "Update" : "Create"}</button>
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
                                        {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
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
                                <button type="button" onClick={() => pickImage((url) => setSubForm((prev) => ({ ...prev, image: url })))}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm">Upload Image</button>
                                {subForm.image && <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100"><Image src={subForm.image} alt="Preview" fill className="object-cover" /></div>}
                                <label className="flex items-center gap-2 ml-auto">
                                    <input type="checkbox" checked={subForm.isActive} onChange={(e) => setSubForm({ ...subForm, isActive: e.target.checked })}
                                        className="w-4 h-4 text-[#0EA5E9] border-gray-300 rounded focus:ring-[#0EA5E9]" />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="px-5 py-2 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0369A1] transition text-sm font-medium">{editingSub ? "Update" : "Create"}</button>
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
                                    <div key={cat._id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
                                        <div className="w-14 h-14 shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                            {cat.image ? (
                                                <Image src={cat.image} alt={cat.name} width={56} height={56} className="object-cover w-full h-full" />
                                            ) : (
                                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-semibold text-gray-900">{cat.name}</h3>
                                            <p className="text-xs text-gray-500 line-clamp-1">{cat.description}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-400">Order: {cat.sortOrder}</span>
                                                <span className="text-xs text-gray-400">|</span>
                                                <span className="text-xs text-gray-400">{subcategories.filter((s) => s.categoryId === cat._id).length} subcategories</span>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${cat.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                            {cat.isActive ? "Active" : "Inactive"}
                                        </span>
                                        <div className="flex gap-2">
                                            <button onClick={() => startEditCat(cat)} className="text-[#0EA5E9] hover:text-[#0369A1] text-sm font-medium">Edit</button>
                                            <button onClick={() => handleDeleteCat(cat._id)} className="text-red-600 hover:text-red-500 text-sm font-medium">Delete</button>
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
                                    <div key={sub._id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition">
                                        <div className="w-14 h-14 shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                            {sub.image ? (
                                                <Image src={sub.image} alt={sub.name} width={56} height={56} className="object-cover w-full h-full" />
                                            ) : (
                                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-semibold text-gray-900">{sub.name}</h3>
                                            <p className="text-xs text-gray-500 line-clamp-1">{sub.description}</p>
                                            <span className="text-xs text-[#0EA5E9] mt-1 inline-block">{getCatName(sub.categoryId)}</span>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${sub.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                            {sub.isActive ? "Active" : "Inactive"}
                                        </span>
                                        <div className="flex gap-2">
                                            <button onClick={() => startEditSub(sub)} className="text-[#0EA5E9] hover:text-[#0369A1] text-sm font-medium">Edit</button>
                                            <button onClick={() => handleDeleteSub(sub._id)} className="text-red-600 hover:text-red-500 text-sm font-medium">Delete</button>
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
