"use client";
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import AdminLayout from "../../components/AdminLayout";
import { toast } from "sonner";

const ProductForm = dynamic(() => import("../../components/admin/ProductForm"), {
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>,
});

const ProductList = dynamic(() => import("../../components/admin/ProductList"), {
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>,
});

// ===== Types =====
interface ProductVariant {
    sku: string;
    optionCombination: Record<string, string>;
    isActive: boolean;
}

interface Product {
    id: string;
    name: string;
    description: string;
    category: { id: string; name: string } | string;
    subcategory: { id: string; name: string } | string;
    image: string;
    images: string[];
    isActive: boolean;
    tags: string[];
    hasVariants: boolean;
    variantOptions: Array<{
        name: string;
        displayName: string;
        type: string;
        required: boolean;
        values: Array<{
            name: string;
            displayName: string;
            colorCode: string | null;
            isAvailable: boolean;
        }>;
    }>;
    variants: ProductVariant[];
}

interface Category {
    id: string;
    name: string;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"list" | "new">("list");
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const fetchProducts = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/products");
            if (!res.ok) throw new Error("Failed to fetch products");
            const data = await res.json();
            setProducts(data);
        } catch {
            toast.error("Failed to load products");
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/categories");
            if (!res.ok) throw new Error("Failed to fetch categories");
            const data = await res.json();
            setCategories(data);
        } catch {
            toast.error("Failed to load categories");
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchProducts(), fetchCategories()]);
            setLoading(false);
        };
        init();
    }, [fetchProducts, fetchCategories]);

    const handleCreateProduct = async (formData: Record<string, unknown>) => {
        try {
            const res = await fetch("/api/admin/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || "Failed to create product");
            }
            await fetchProducts();
            setActiveTab("list");
            toast.success("Product created successfully");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to create product";
            toast.error(message);
        }
    };

    const handleUpdateProduct = async (formData: Record<string, unknown>) => {
        if (!editingProduct) return;
        try {
            const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || "Failed to update product");
            }
            await fetchProducts();
            setEditingProduct(null);
            setActiveTab("list");
            toast.success("Product updated successfully");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to update product";
            toast.error(message);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || "Failed to delete product");
            }
            await fetchProducts();
            toast.success("Product deleted");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to delete product";
            toast.error(message);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setActiveTab("new");
    };

    const getCategoryName = (cat: { id: string; name: string } | string): string => {
        if (typeof cat === "string") return cat;
        return cat?.name || "";
    };

    const filteredProducts = products.filter((p) => {
        const matchesSearch =
            !searchTerm ||
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.tags?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
        const catName = getCategoryName(p.category);
        const matchesCategory = categoryFilter === "all" || catName === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                        <p className="text-gray-600 mt-1">
                            Manage your water tanks, pipes & fittings
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setActiveTab("list");
                                setEditingProduct(null);
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                activeTab === "list"
                                    ? "bg-[#0EA5E9] text-white"
                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                            All Products ({products.length})
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("new");
                                setEditingProduct(null);
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                activeTab === "new" && !editingProduct
                                    ? "bg-[#0EA5E9] text-white"
                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                            + Add Product
                        </button>
                    </div>
                </div>

                {/* List View */}
                {activeTab === "list" && (
                    <div className="space-y-4">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                            />
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                            >
                                <option value="all">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.name}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Product List */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            {loading ? (
                                <div className="p-8 text-center text-gray-500">Loading...</div>
                            ) : (
                                <ProductList
                                    products={filteredProducts}
                                    onEdit={handleEdit}
                                    onDelete={handleDeleteProduct}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Form View */}
                {activeTab === "new" && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                            {editingProduct ? "Edit Product" : "Add New Product"}
                        </h2>
                        <ProductForm
                            product={editingProduct}
                            onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
                            onCancel={() => {
                                setActiveTab("list");
                                setEditingProduct(null);
                            }}
                            categories={categories}
                        />
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
