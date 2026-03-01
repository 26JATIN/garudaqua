"use client";
import { useState, useEffect } from "react";
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
    _id: string;
    name: string;
    description: string;
    category: string;
    subcategory: string;
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

// ===== Static categories for water tanks & pipes =====
const STATIC_CATEGORIES = [
    { _id: "cat-1", name: "Water Tanks" },
    { _id: "cat-2", name: "Pipes & Fittings" },
    { _id: "cat-3", name: "Bathroom Fittings" },
];

// ===== Static initial products =====
const INITIAL_PRODUCTS: Product[] = [
    {
        _id: "p1",
        name: "3 Layer Water Tank - 500L",
        description: "Premium 3-layer water tank with food-grade inner layer",
        category: "Water Tanks",
        subcategory: "",
        image: "/products/tank-500l.jpg",
        images: ["/products/tank-500l.jpg"],
        isActive: true,
        tags: ["Water Tank", "3 Layer", "500L"],
        hasVariants: false,
        variantOptions: [],
        variants: [],
    },
    {
        _id: "p2",
        name: "CPVC Pipe - 1 inch",
        description: "Hot & cold water supply CPVC pipe, ISI certified",
        category: "Pipes & Fittings",
        subcategory: "",
        image: "/products/cpvc-pipe.jpg",
        images: ["/products/cpvc-pipe.jpg"],
        isActive: true,
        tags: ["CPVC", "Pipe", "1 inch"],
        hasVariants: true,
        variantOptions: [
            {
                name: "Length",
                displayName: "Pipe Length",
                type: "select",
                required: true,
                values: [
                    { name: "3m", displayName: "3 Meters", colorCode: null, isAvailable: true },
                    { name: "6m", displayName: "6 Meters", colorCode: null, isAvailable: true },
                ],
            },
        ],
        variants: [
            { sku: "CPVC-1IN-3M", optionCombination: { Length: "3m" }, isActive: true },
            { sku: "CPVC-1IN-6M", optionCombination: { Length: "6m" }, isActive: true },
        ],
    },
];

const STORAGE_KEY = "garudaqua_admin_products";

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"list" | "new">("list");
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [mounted, setMounted] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    useEffect(() => {
        setMounted(true);
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setProducts(JSON.parse(stored));
            } else {
                setProducts(INITIAL_PRODUCTS);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
            }
        } catch {
            setProducts(INITIAL_PRODUCTS);
        }
        setLoading(false);
    }, []);

    const saveProducts = (updated: Product[]) => {
        setProducts(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const handleCreateProduct = (formData: Omit<Product, "_id">) => {
        const newProduct: Product = {
            ...formData,
            _id: `p-${Date.now()}`,
        };
        const updated = [newProduct, ...products];
        saveProducts(updated);
        setActiveTab("list");
        toast.success("Product created successfully");
    };

    const handleUpdateProduct = (formData: Omit<Product, "_id">) => {
        if (!editingProduct) return;
        const updated = products.map((p) =>
            p._id === editingProduct._id ? { ...formData, _id: editingProduct._id } : p
        );
        saveProducts(updated);
        setEditingProduct(null);
        setActiveTab("list");
        toast.success("Product updated successfully");
    };

    const handleDeleteProduct = (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        const updated = products.filter((p) => p._id !== id);
        saveProducts(updated);
        toast.success("Product deleted");
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setActiveTab("new");
    };

    const filteredProducts = products.filter((p) => {
        const matchesSearch =
            !searchTerm ||
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    if (!mounted) return null;

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
                                {STATIC_CATEGORIES.map((cat) => (
                                    <option key={cat._id} value={cat.name}>
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
                            categories={STATIC_CATEGORIES}
                        />
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
