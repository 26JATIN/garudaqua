"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import VariantManager from "./VariantManager";
import { toast } from "sonner";

// ===== Types =====
interface VariantOption {
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
}

interface Variant {
    sku: string;
    optionCombination: Record<string, string>;
    isActive: boolean;
}

interface ProductData {
    _id?: string;
    name: string;
    description: string;
    category: string;
    subcategory: string;
    image: string;
    images: string[];
    isActive: boolean;
    tags: string[];
    hasVariants: boolean;
    variantOptions: VariantOption[];
    variants: Variant[];
}

interface Category {
    _id: string;
    name: string;
}

interface ProductFormProps {
    product: ProductData | null;
    onSubmit: (data: ProductData) => void;
    onCancel: () => void;
    categories?: Category[];
}

const STATIC_CATEGORIES: Category[] = [
    { _id: "cat-1", name: "Water Tanks" },
    { _id: "cat-2", name: "Pipes & Fittings" },
    { _id: "cat-3", name: "Bathroom Fittings" },
];

export default function ProductForm({
    product,
    onSubmit,
    onCancel,
    categories = STATIC_CATEGORIES,
}: ProductFormProps) {
    const [formData, setFormData] = useState<ProductData>({
        name: "",
        description: "",
        category: "",
        subcategory: "",
        image: "",
        images: [],
        isActive: true,
        tags: [],
        hasVariants: false,
        variantOptions: [],
        variants: [],
    });

    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState("");
    const [tagInput, setTagInput] = useState("");

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || "",
                description: product.description || "",
                category: product.category || "",
                subcategory: product.subcategory || "",
                image: product.image || "",
                images: product.images || [],
                isActive: product.isActive !== undefined ? product.isActive : true,
                tags: product.tags || [],
                hasVariants: product.hasVariants || false,
                variantOptions: product.variantOptions || [],
                variants: product.variants || [],
            });
            setImagePreview(product.image || "");
        }
    }, [product]);

    const handleImageSelect = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/jpeg,image/jpg,image/png,image/webp";

        input.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            const file = target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (ev) => {
                const dataUrl = ev.target?.result as string;
                setImagePreview(dataUrl);
                setFormData((prev) => ({ ...prev, image: dataUrl }));
            };
            reader.readAsDataURL(file);
        };

        input.click();
    };

    const handleAddTag = () => {
        const tag = tagInput.trim();
        if (tag && !formData.tags.includes(tag)) {
            setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
            setTagInput("");
        }
    };

    const handleRemoveTag = (tag: string) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.filter((t) => t !== tag),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error("Product name is required");
            return;
        }
        if (!formData.category) {
            toast.error("Please select a category");
            return;
        }
        setLoading(true);
        onSubmit(formData);
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Product Name *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                        placeholder="e.g., 3 Layer Water Tank 1000L"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                        placeholder="Describe your product features, material, certifications..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Category *
                    </label>
                    <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                    >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat.name}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Subcategory
                    </label>
                    <input
                        type="text"
                        value={formData.subcategory}
                        onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                        placeholder="e.g., Overhead Tanks, CPVC Pipes"
                    />
                </div>
            </div>

            {/* Product Image */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Product Image
                </label>
                <div className="flex items-start gap-4">
                    <button
                        type="button"
                        onClick={handleImageSelect}
                        className="px-5 py-2.5 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0369A1] transition text-sm"
                    >
                        Upload Image
                    </button>
                    {imagePreview && (
                        <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                                src={imagePreview}
                                alt="Preview"
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Tags */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tags
                </label>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddTag();
                            }
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent text-sm"
                        placeholder="Add a tag and press Enter"
                    />
                    <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                        Add
                    </button>
                </div>
                {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-[#0EA5E9]/10 text-[#0EA5E9] text-sm rounded-full"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="hover:text-red-500 ml-1"
                                >
                                    &times;
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-[#0EA5E9] border-gray-300 rounded focus:ring-[#0EA5E9]"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                    Active (visible on website)
                </label>
            </div>

            {/* Variant Manager */}
            <VariantManager
                productData={{ name: formData.name }}
                onVariantsChange={(hasVariants: boolean, variants: Variant[]) => {
                    setFormData((prev) => ({ ...prev, hasVariants, variants }));
                }}
                onOptionsChange={(options: VariantOption[]) => {
                    setFormData((prev) => ({ ...prev, variantOptions: options }));
                }}
                hasVariants={formData.hasVariants}
                variantOptions={formData.variantOptions}
                variants={formData.variants}
            />

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0369A1] transition font-medium disabled:opacity-50"
                >
                    {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
