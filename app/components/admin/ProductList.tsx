"use client";
import { useState } from "react";
import Image from "next/image";

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

interface ProductListProps {
    products?: Product[];
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
}

function getCategoryName(cat: { id: string; name: string } | string | undefined): string {
    if (!cat) return "";
    if (typeof cat === "string") return cat;
    return cat.name || "";
}

function getSubcategoryName(sub: { id: string; name: string } | string | undefined): string {
    if (!sub) return "";
    if (typeof sub === "string") return sub;
    return sub.name || "";
}

export default function ProductList({ products = [], onEdit, onDelete }: ProductListProps) {
    const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

    const safeProducts: Product[] = Array.isArray(products) ? products : [];

    const toggleVariantDisplay = (productId: string) => {
        const newExpanded = new Set(expandedProducts);
        if (newExpanded.has(productId)) {
            newExpanded.delete(productId);
        } else {
            newExpanded.add(productId);
        }
        setExpandedProducts(newExpanded);
    };

    return (
        <div>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Variants
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {safeProducts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="text-gray-500">
                                        <p className="text-lg font-medium mb-2">No products found</p>
                                        <p className="text-sm">
                                            Add your first product using the &apos;Add Product&apos; button above.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            safeProducts.flatMap((product) => {
                                const categoryDisplay = getCategoryName(product.category);
                                const subcategoryDisplay = getSubcategoryName(product.subcategory);

                                const rows = [
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-14 w-14 shrink-0">
                                                    {product.image ? (
                                                        <Image
                                                            src={product.image}
                                                            alt={product.name}
                                                            width={56}
                                                            height={56}
                                                            className="h-14 w-14 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-14 w-14 bg-gray-200 rounded-lg flex items-center justify-center">
                                                            <span className="text-gray-400 text-xs">No Img</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">
                                                        {product.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {categoryDisplay}
                                            {subcategoryDisplay && (
                                                <span className="text-gray-400 ml-1">/ {subcategoryDisplay}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {product.hasVariants ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {product.variantOptions?.length || 0} options
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-500">None</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    product.isActive
                                                        ? "text-green-800 bg-green-100"
                                                        : "text-red-800 bg-red-100"
                                                }`}
                                            >
                                                {product.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => onEdit(product)}
                                                        className="text-[#0EA5E9] hover:text-[#0369A1] transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete(product.id)}
                                                        className="text-red-600 hover:text-red-500 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                                {product.hasVariants && (
                                                    <button
                                                        onClick={() => toggleVariantDisplay(product.id)}
                                                        className="text-xs text-blue-600 hover:text-blue-500 transition-colors flex items-center"
                                                    >
                                                        {expandedProducts.has(product.id) ? "Hide" : "View"} Variants
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>,
                                ];

                                if (product.hasVariants && expandedProducts.has(product.id)) {
                                    rows.push(
                                        <tr key={`${product.id}-variants`} className="bg-gray-50">
                                            <td colSpan={5} className="px-6 py-4">
                                                <div className="bg-white rounded-lg border p-4">
                                                    <h4 className="font-medium text-gray-900 mb-3">
                                                        Options ({product.variantOptions?.length || 0})
                                                    </h4>
                                                    {product.variantOptions && product.variantOptions.length > 0 ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                            {product.variantOptions.map((option, index) => (
                                                                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                                                                    <div className="font-medium text-sm text-gray-900 mb-2">
                                                                        {option.displayName || option.name}
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {option.values.map((val, vi) => (
                                                                            <span
                                                                                key={vi}
                                                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${
                                                                                    val.isAvailable
                                                                                        ? "bg-white border-gray-300 text-gray-700"
                                                                                        : "bg-gray-100 border-gray-200 text-gray-400 line-through"
                                                                                }`}
                                                                            >
                                                                                {option.type === "color" && val.colorCode && (
                                                                                    <span
                                                                                        className="w-3 h-3 rounded-full inline-block border border-gray-300"
                                                                                        style={{ background: val.colorCode }}
                                                                                    />
                                                                                )}
                                                                                {val.displayName || val.name}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-center py-4 text-gray-500 text-sm">
                                                            No options configured
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }

                                return rows;
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-200">
                {safeProducts.length === 0 ? (
                    <div className="px-4 py-12 text-center">
                        <div className="text-gray-500">
                            <p className="text-lg font-medium mb-2">No products found</p>
                            <p className="text-sm">Add your first product.</p>
                        </div>
                    </div>
                ) : (
                    safeProducts.map((product) => {
                        const categoryDisplay = getCategoryName(product.category);

                        return (
                            <div key={product.id} className="p-4 bg-white hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="h-16 w-16 shrink-0">
                                        {product.image ? (
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                width={64}
                                                height={64}
                                                className="h-16 w-16 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <span className="text-gray-400 text-xs">No Img</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                                            {product.name}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="text-xs text-gray-500">{categoryDisplay}</span>
                                            {product.hasVariants && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {product.variantOptions?.length || 0} options
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            product.isActive
                                                ? "text-green-800 bg-green-100"
                                                : "text-red-800 bg-red-100"
                                        }`}
                                    >
                                        {product.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onEdit(product)}
                                        className="flex-1 bg-[#0EA5E9] text-white px-3 py-2 rounded-lg hover:bg-[#0369A1] transition-colors text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onDelete(product.id)}
                                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                    {product.hasVariants && (
                                        <button
                                            onClick={() => toggleVariantDisplay(product.id)}
                                            className="px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                                        >
                                            {expandedProducts.has(product.id) ? "Hide" : "Variants"}
                                        </button>
                                    )}
                                </div>

                                {product.hasVariants && expandedProducts.has(product.id) && (
                                    <div className="mt-3 bg-gray-50 rounded-lg p-3">
                                        <h4 className="font-medium text-gray-900 mb-2 text-sm">
                                            Options ({product.variantOptions?.length || 0})
                                        </h4>
                                        {product.variantOptions && product.variantOptions.length > 0 ? (
                                            <div className="space-y-2">
                                                {product.variantOptions.map((option, index) => (
                                                    <div key={index} className="border rounded-lg p-2 bg-white">
                                                        <div className="font-medium text-xs text-gray-900 mb-1">
                                                            {option.displayName || option.name}
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {option.values.map((val, vi) => (
                                                                <span
                                                                    key={vi}
                                                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border ${
                                                                        val.isAvailable
                                                                            ? "bg-white border-gray-300 text-gray-700"
                                                                            : "bg-gray-100 border-gray-200 text-gray-400 line-through"
                                                                    }`}
                                                                >
                                                                    {option.type === "color" && val.colorCode && (
                                                                        <span
                                                                            className="w-2.5 h-2.5 rounded-full inline-block border border-gray-300"
                                                                            style={{ background: val.colorCode }}
                                                                        />
                                                                    )}
                                                                    {val.displayName || val.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-center py-4 text-gray-500 text-xs">
                                                No options configured
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Summary */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t bg-gray-50">
                <div className="text-xs sm:text-sm text-gray-600">
                    Showing {safeProducts.length} products
                </div>
            </div>
        </div>
    );
}
