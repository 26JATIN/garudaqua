"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import VariantManager from "./VariantManager";
import { toast } from "sonner";
import { uploadDirect } from "@/lib/upload-direct";

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
        imageUrl?: string | null;
    }>;
}

interface Spec {
    label: string;
    value: string;
}

interface ProductData {
    id?: string;
    name: string;
    description: string;
    category: { id: string; name: string } | string;
    subcategory: { id: string; name: string } | string;
    image: string;
    images: string[];
    isActive: boolean;
    tags: string[];
    specs?: Spec[];
    guarantee?: string;
    hasVariants: boolean;
    variantOptions: VariantOption[];
    pricingOptions?: PricingOption[];
    metaTitle?: string;
    metaDesc?: string;
}

interface PricingOption {
    unit: "litre" | "kg" | "piece";
    label: string;
    price: string;
    isAvailable: boolean;
}

interface Category {
    id: string;
    name: string;
}

interface Subcategory {
    id: string;
    name: string;
}

interface FormState {
    name: string;
    description: string;
    categoryId: string;
    subcategoryId: string;
    image: string;
    images: string[];
    isActive: boolean;
    tags: string[];
    specs: Spec[];
    guarantee: string;
    hasVariants: boolean;
    variantOptions: VariantOption[];
    pricingOptions: PricingOption[];
    metaTitle: string;
    metaDesc: string;
}

interface ProductFormProps {
    product: ProductData | null;
    onSubmit: (data: Record<string, unknown>) => void;
    onCancel: () => void;
    categories?: Category[];
}

const defaultPricingOptions = [
    { unit: "litre" as const, label: "Price per Litre", price: "", isAvailable: true },
    { unit: "kg" as const, label: "Price per Kg", price: "", isAvailable: true },
    { unit: "piece" as const, label: "Price per Piece", price: "", isAvailable: true },
];

function normalizePricingOptions(options?: Array<{ unit: string; label?: string; price?: number | string | null; isAvailable?: boolean }>): PricingOption[] {
    const source = options && options.length > 0 ? options : defaultPricingOptions;
    return source.map((option) => ({
        unit: option.unit === "kg" || option.unit === "piece" || option.unit === "litre" ? option.unit : "piece",
        label: option.label || (option.unit === "kg" ? "Price per Kg" : option.unit === "piece" ? "Price per Piece" : "Price per Litre"),
        price: option.price === null || option.price === undefined ? "" : String(option.price),
        isAvailable: option.isAvailable ?? true,
    }));
}

export default function ProductForm({
    product,
    onSubmit,
    onCancel,
    categories = [],
}: ProductFormProps) {
    const [formData, setFormData] = useState<FormState>({
        name: "",
        description: "",
        categoryId: "",
        subcategoryId: "",
        image: "",
        images: [],
        isActive: true,
        tags: [],
        specs: [],
        guarantee: "",
        hasVariants: false,
        variantOptions: [],
        pricingOptions: defaultPricingOptions,
        metaTitle: "",
        metaDesc: "",
    });

    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [imagePreview, setImagePreview] = useState("");
    const [tagInput, setTagInput] = useState("");

    // Helper to extract id from a category/subcategory field that could be an object or string
    const extractId = (
        field: { id: string; name: string } | string | undefined,
        list: { id: string; name: string }[]
    ): string => {
        if (!field) return "";
        if (typeof field === "object" && field.id) return field.id;
        // If it's a string (name), try to find a matching entry by name
        if (typeof field === "string") {
            const match = list.find((item) => item.name === field);
            return match?.id || "";
        }
        return "";
    };

    useEffect(() => {
        if (product) {
            const catId = extractId(product.category, categories);
            setFormData({
                name: product.name || "",
                description: product.description || "",
                categoryId: catId,
                subcategoryId: "", // will be set after subcategories load
                image: product.image || "",
                images: product.images || [],
                isActive: product.isActive !== undefined ? product.isActive : true,
                tags: product.tags || [],
                specs: (product.specs as Spec[]) || [],
                guarantee: product.guarantee || "",
                hasVariants: product.hasVariants || false,
                variantOptions: product.variantOptions || [],
                pricingOptions: normalizePricingOptions(product.pricingOptions as Array<{ unit: string; label?: string; price?: number | string | null; isAvailable?: boolean }> | undefined),
                metaTitle: product.metaTitle || "",
                metaDesc: product.metaDesc || "",
            });
            setImagePreview(product.image || "");

            // Fetch subcategories for the product's category, then set subcategoryId
            if (catId) {
                fetch(`/api/admin/subcategories?categoryId=${catId}`)
                    .then((res) => res.json())
                    .then((subs: Subcategory[]) => {
                        setSubcategories(subs);
                        const subId = extractId(product.subcategory, subs);
                        setFormData((prev) => ({ ...prev, subcategoryId: subId }));
                    })
                    .catch(() => setSubcategories([]));
            }
        }
    }, [product, categories]);

    // Fetch subcategories when category changes
    useEffect(() => {
        if (!formData.categoryId) {
            setSubcategories([]);
            return;
        }
        fetch(`/api/admin/subcategories?categoryId=${formData.categoryId}`)
            .then((res) => res.json())
            .then((data: Subcategory[]) => setSubcategories(data))
            .catch(() => setSubcategories([]));
    }, [formData.categoryId]);

    const handleImageSelect = () => {
        if (!formData.categoryId) {
            toast.error("Please select a category first to name the image correctly");
            return;
        }
        if (!formData.name.trim()) {
            toast.error("Please enter a product name first to name the image correctly");
            return;
        }

        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/jpeg,image/jpg,image/png,image/webp";

        input.onchange = async (e: Event) => {
            const target = e.target as HTMLInputElement;
            const file = target.files?.[0];
            if (!file) return;

            // Show local preview immediately
            const localPreview = URL.createObjectURL(file);
            setImagePreview(localPreview);

            // Build publicId based on category and name, plus a short timestamp
            const catName = categories.find((c) => c.id === formData.categoryId)?.name || "";
            const subName = formData.subcategoryId ? subcategories.find((s) => s.id === formData.subcategoryId)?.name || "" : "";
            const baseStr = [catName, subName, formData.name].filter(Boolean).join(" ");
            const slugifiedStr = baseStr.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            const shortTimestamp = Math.floor(Date.now() / 1000).toString(36);
            const publicId = `${slugifiedStr}-${shortTimestamp}`;

            setUploading(true);
            try {
                const { url } = await uploadDirect(file, "garudaqua/products", publicId);
                setImagePreview(url);
                setFormData((prev) => ({ ...prev, image: url }));
                toast.success("Image uploaded successfully");
            } catch {
                toast.error("Failed to upload image");
                setImagePreview(formData.image || "");
            } finally {
                setUploading(false);
                URL.revokeObjectURL(localPreview);
            }
        };

        input.click();
    };

    const handleMultipleImageSelect = () => {
        if (!formData.categoryId) {
            toast.error("Please select a category first to name the images correctly");
            return;
        }
        if (!formData.name.trim()) {
            toast.error("Please enter a product name first to name the images correctly");
            return;
        }

        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/jpeg,image/jpg,image/png,image/webp";
        input.multiple = true;

        input.onchange = async (e: Event) => {
            const target = e.target as HTMLInputElement;
            const files = target.files;
            if (!files || files.length === 0) return;

            setUploadingImages(true);
            const newUrls: string[] = [];

            try {
                // Pre-compute naming base
                const catName = categories.find((c) => c.id === formData.categoryId)?.name || "";
                const subName = formData.subcategoryId ? subcategories.find((s) => s.id === formData.subcategoryId)?.name || "" : "";
                const baseStr = [catName, subName, formData.name].filter(Boolean).join(" ");
                const slugifiedStr = baseStr.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                
                const uploadPromises = Array.from(files).map(async (file, idx) => {
                    const shortTimestamp = Math.floor(Date.now() / 1000).toString(36);
                    const publicId = `${slugifiedStr}-${shortTimestamp}-${idx + 1}`;
                    const { url } = await uploadDirect(file, "garudaqua/products", publicId);
                    return url as string;
                });

                const urls = await Promise.all(uploadPromises);
                newUrls.push(...urls);

                setFormData((prev) => ({
                    ...prev,
                    images: [...prev.images, ...newUrls],
                }));
                toast.success(
                    `${newUrls.length} image${newUrls.length > 1 ? "s" : ""} uploaded successfully`
                );
            } catch {
                toast.error("Failed to upload one or more images");
            } finally {
                setUploadingImages(false);
            }
        };

        input.click();
    };

    const handleRemoveAdditionalImage = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
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
        if (!formData.categoryId) {
            toast.error("Please select a category");
            return;
        }
        setLoading(true);
        onSubmit({
            name: formData.name,
            description: formData.description,
            categoryId: formData.categoryId,
            subcategoryId: formData.subcategoryId || null,
            image: formData.image,
            images: formData.images,
            isActive: formData.isActive,
            tags: formData.tags,
            specs: formData.specs,
            guarantee: formData.guarantee,
            hasVariants: formData.hasVariants,
            variantOptions: formData.variantOptions,
            pricingOptions: formData.pricingOptions.map((option) => ({
                ...option,
                price: (() => {
                    const numeric = Number(option.price);
                    return option.price.trim() === "" || !Number.isFinite(numeric) ? null : numeric;
                })(),
            })),
            metaTitle: formData.metaTitle,
            metaDesc: formData.metaDesc,
        });
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

                <div className="md:col-span-2 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        Search Engine Optimization (SEO)
                    </h4>
                    <p className="text-xs text-gray-500 mb-4">Leave empty for Garud Aqua AI to automatically generate perfect tags.</p>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Meta Title
                            </label>
                            <input
                                type="text"
                                value={formData.metaTitle}
                                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                maxLength={60}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent text-sm"
                                placeholder={`e.g. Buy ${formData.name || 'Product'} Online | Top Quality...`}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Meta Description
                            </label>
                            <textarea
                                value={formData.metaDesc}
                                onChange={(e) => setFormData({ ...formData, metaDesc: e.target.value })}
                                maxLength={160}
                                rows={2}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent text-sm"
                                placeholder="Describe the product specifically for Google Search results..."
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Category *
                    </label>
                    <select
                        required
                        value={formData.categoryId}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                categoryId: e.target.value,
                                subcategoryId: "",
                            })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                    >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Subcategory
                    </label>
                    <select
                        value={formData.subcategoryId}
                        onChange={(e) =>
                            setFormData({ ...formData, subcategoryId: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                        disabled={!formData.categoryId || subcategories.length === 0}
                    >
                        <option value="">
                            {!formData.categoryId
                                ? "Select a category first"
                                : subcategories.length === 0
                                  ? "No subcategories available"
                                  : "Select Subcategory"}
                        </option>
                        {subcategories.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                                {sub.name}
                            </option>
                        ))}
                    </select>
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
                        disabled={uploading}
                        className="px-5 py-2.5 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0369A1] transition text-sm disabled:opacity-50"
                    >
                        {uploading ? "Uploading..." : "Upload Image"}
                    </button>
                    {imagePreview && (
                        <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                                src={imagePreview}
                                alt="Preview"
                                fill
                                className="object-cover"
                            />
                            {uploading && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Additional Product Images */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Additional Product Images
                </label>
                <div className="flex items-start gap-4">
                    <button
                        type="button"
                        onClick={handleMultipleImageSelect}
                        disabled={uploadingImages}
                        className="px-5 py-2.5 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0369A1] transition text-sm disabled:opacity-50"
                    >
                        {uploadingImages ? "Uploading..." : "Add Images"}
                    </button>
                    {uploadingImages && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="w-5 h-5 border-2 border-[#0EA5E9] border-t-transparent rounded-full animate-spin"></div>
                            Uploading images...
                        </div>
                    )}
                </div>
                {formData.images.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 mt-3">
                        {formData.images.map((url, index) => (
                            <div
                                key={index}
                                className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden group"
                            >
                                <Image
                                    src={url}
                                    alt={`Product image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveAdditionalImage(index)}
                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                )}
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

            {/* Specifications */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Specifications
                </label>
                <div className="space-y-2 mb-2">
                    {formData.specs.map((spec, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <input
                                type="text"
                                value={spec.label}
                                onChange={(e) => {
                                    const updated = [...formData.specs];
                                    updated[index] = { ...updated[index], label: e.target.value };
                                    setFormData((prev) => ({ ...prev, specs: updated }));
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                                placeholder="Label (e.g., Material)"
                            />
                            <input
                                type="text"
                                value={spec.value}
                                onChange={(e) => {
                                    const updated = [...formData.specs];
                                    updated[index] = { ...updated[index], value: e.target.value };
                                    setFormData((prev) => ({ ...prev, specs: updated }));
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                                placeholder="Value (e.g., Food-grade LLDPE)"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        specs: prev.specs.filter((_, i) => i !== index),
                                    }));
                                }}
                                className="p-2 text-red-500 hover:text-red-700 transition"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() =>
                        setFormData((prev) => ({
                            ...prev,
                            specs: [...prev.specs, { label: "", value: "" }],
                        }))
                    }
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                >
                    + Add Specification
                </button>
            </div>

            {/* Pricing */}
            <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2m-6 0a9 9 0 1112 0H6z" /></svg>
                        Pricing
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">Set any or all unit prices. Leave a price empty to hide that unit from the product page.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {formData.pricingOptions.map((option, index) => (
                        <div key={option.unit} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{option.label}</span>
                                <label className="inline-flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={option.isAvailable}
                                        onChange={(e) => {
                                            const updated = [...formData.pricingOptions];
                                            updated[index] = { ...updated[index], isAvailable: e.target.checked };
                                            setFormData((prev) => ({ ...prev, pricingOptions: updated }));
                                        }}
                                        className="w-4 h-4 text-[#0EA5E9] border-gray-300 rounded focus:ring-[#0EA5E9]"
                                    />
                                    Visible
                                </label>
                            </div>
                            <input
                                type="text"
                                value={option.price}
                                onChange={(e) => {
                                    const updated = [...formData.pricingOptions];
                                    updated[index] = { ...updated[index], price: e.target.value };
                                    setFormData((prev) => ({ ...prev, pricingOptions: updated }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                                placeholder="e.g., 1250"
                            />
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-xs text-gray-500">Unit: {option.unit}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const updated = [...formData.pricingOptions];
                                        updated[index] = { ...updated[index], price: "", isAvailable: false };
                                        setFormData((prev) => ({ ...prev, pricingOptions: updated }));
                                    }}
                                    className="text-xs text-[#0EA5E9] hover:text-[#0369A1]"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Guarantee / Warranty */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Guarantee / Warranty
                </label>
                <input
                    type="text"
                    value={formData.guarantee}
                    onChange={(e) => setFormData({ ...formData, guarantee: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
                    placeholder="e.g., 10 Year Guarantee on Tank Body"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Leave empty to hide the guarantee badge on the product page
                </p>
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
                onOptionsChange={(hasVariants: boolean, options: VariantOption[]) => {
                    setFormData((prev) => ({ ...prev, hasVariants, variantOptions: options }));
                }}
                hasVariants={formData.hasVariants}
                variantOptions={formData.variantOptions}
                productImages={formData.images}
            />

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                    type="submit"
                    disabled={loading || uploading || uploadingImages}
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
