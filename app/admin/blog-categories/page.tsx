"use client";
import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/AdminLayout";
import { toast } from "sonner";

interface BlogCategory {
    id: string;
    name: string;
    slug: string;
    order: number;
    isActive: boolean;
    _count?: { posts: number };
}

export default function AdminBlogCategoriesPage() {
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
    const [formData, setFormData] = useState({ name: "", slug: "", order: 0, isActive: true });

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/blog-categories");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setCategories(data);
        } catch {
            toast.error("Failed to load blog categories");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const generateSlug = (name: string) =>
        name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) { toast.error("Category name is required"); return; }

        const slug = formData.slug || generateSlug(formData.name);

        try {
            if (editingCategory) {
                const res = await fetch(`/api/admin/blog-categories/${editingCategory.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...formData, slug }),
                });
                if (!res.ok) throw new Error("Failed to update");
                toast.success("Category updated");
            } else {
                const res = await fetch("/api/admin/blog-categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...formData, slug }),
                });
                if (!res.ok) throw new Error("Failed to create");
                toast.success("Category created");
            }
            resetForm();
            fetchCategories();
        } catch {
            toast.error("Failed to save category");
        }
    };

    const handleEdit = (cat: BlogCategory) => {
        setEditingCategory(cat);
        setFormData({ name: cat.name, slug: cat.slug, order: cat.order, isActive: cat.isActive });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this category? Posts using it will be set to 'Other'.")) return;
        try {
            const res = await fetch(`/api/admin/blog-categories/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            setCategories(categories.filter((c) => c.id !== id));
            toast.success("Category deleted");
        } catch {
            toast.error("Failed to delete category");
        }
    };

    const resetForm = () => {
        setFormData({ name: "", slug: "", order: 0, isActive: true });
        setEditingCategory(null);
        setShowForm(false);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Blog Categories</h1>
                        <p className="text-gray-600 mt-1">Manage blog post categories</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowForm(!showForm); }}
                        className="px-5 py-2 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0369A1] transition text-sm font-medium"
                    >
                        {showForm ? "Cancel" : "+ Add Category"}
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">
                            {editingCategory ? "Edit Category" : "Add New Category"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                                        placeholder="e.g. Water Tank Guide"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent font-mono text-sm"
                                        placeholder="auto-generated"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-4 h-4 text-[#0EA5E9] border-gray-300 rounded focus:ring-[#0EA5E9]"
                                        />
                                        <span className="text-sm text-gray-700">Active</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="px-5 py-2 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0369A1] transition text-sm font-medium">
                                    {editingCategory ? "Update" : "Create"}
                                </button>
                                <button type="button" onClick={resetForm} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Categories Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : categories.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-500">No blog categories yet. Add your first one!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                        <table className="w-full min-w-120">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Name</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">Slug</th>
                                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Posts</th>
                                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">Order</th>
                                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono hidden sm:table-cell">{cat.slug}</td>
                                        <td className="px-6 py-4 text-center text-sm text-gray-600">{cat._count?.posts ?? 0}</td>
                                        <td className="px-6 py-4 text-center text-sm text-gray-600 hidden sm:table-cell">{cat.order}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${cat.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                {cat.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(cat)} className="text-[#0EA5E9] hover:text-[#0369A1] text-sm font-medium">Edit</button>
                                                <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-500 text-sm font-medium">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
