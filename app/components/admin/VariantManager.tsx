"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ===== Types =====
interface OptionValue {
    name: string;
    displayName: string;
    colorCode: string | null;
    isAvailable: boolean;
}

interface VariantOption {
    name: string;
    displayName: string;
    type: string;
    required: boolean;
    values: OptionValue[];
}

interface Variant {
    sku: string;
    optionCombination: Record<string, string>;
    isActive: boolean;
}

interface ProductData {
    name?: string;
    [key: string]: unknown;
}

interface VariantManagerProps {
    productData: ProductData;
    onVariantsChange?: (hasVariants: boolean, variants: Variant[]) => void;
    onOptionsChange?: (options: VariantOption[]) => void;
    hasVariants?: boolean;
    variantOptions?: VariantOption[];
    variants?: Variant[];
}

// Common variant options for water tanks & pipes
const commonOptionTypes = [
    {
        name: "Capacity",
        displayName: "Tank Capacity",
        type: "select",
        commonValues: ["200L", "500L", "750L", "1000L", "1500L", "2000L", "3000L", "5000L"],
    },
    {
        name: "Size",
        displayName: "Pipe Size",
        type: "select",
        commonValues: ['1/2"', '3/4"', '1"', '1-1/4"', '1-1/2"', '2"', '3"', '4"'],
    },
    {
        name: "Color",
        displayName: "Color",
        type: "color",
        commonValues: [
            { name: "Black", colorCode: "#1a1a1a" },
            { name: "Blue", colorCode: "#2563EB" },
            { name: "White", colorCode: "#F5F5F5" },
            { name: "Green", colorCode: "#16A34A" },
            { name: "Grey", colorCode: "#6B7280" },
        ],
    },
    {
        name: "Material",
        displayName: "Material",
        type: "select",
        commonValues: ["HDPE", "PVC", "CPVC", "uPVC", "LLDPE", "FRP"],
    },
];

export default function VariantManager({
    productData,
    onVariantsChange,
    onOptionsChange,
    hasVariants = false,
    variantOptions = [],
    variants = [],
}: VariantManagerProps) {
    const [localHasVariants, setLocalHasVariants] = useState(hasVariants);
    const [localOptions, setLocalOptions] = useState<VariantOption[]>(variantOptions);
    const [localVariants, setLocalVariants] = useState<Variant[]>(variants);

    useEffect(() => {
        setLocalHasVariants(hasVariants);
        setLocalOptions(variantOptions || []);
        setLocalVariants(variants || []);
    }, [hasVariants, variantOptions, variants]);

    useEffect(() => {
        onVariantsChange?.(localHasVariants, localVariants);
        onOptionsChange?.(localOptions);
    }, [localHasVariants, localVariants, localOptions, onVariantsChange, onOptionsChange]);

    const handleEnableVariants = (enabled: boolean) => {
        setLocalHasVariants(enabled);
        if (!enabled) {
            setLocalOptions([]);
            setLocalVariants([]);
        }
    };

    const addVariantOption = () => {
        const newOption: VariantOption = {
            name: "",
            displayName: "",
            type: "select",
            required: true,
            values: [],
        };
        setLocalOptions([...localOptions, newOption]);
    };

    const updateVariantOption = (index: number, field: keyof VariantOption, value: string | boolean) => {
        const updated = [...localOptions];
        updated[index] = { ...updated[index], [field]: value };
        setLocalOptions(updated);
    };

    const addOptionValue = (optionIndex: number) => {
        const updated = [...localOptions];
        updated[optionIndex].values.push({
            name: "",
            displayName: "",
            colorCode: null,
            isAvailable: true,
        });
        setLocalOptions(updated);
    };

    const updateOptionValue = (optionIndex: number, valueIndex: number, field: keyof OptionValue, value: string | boolean | null) => {
        const updated = [...localOptions];
        updated[optionIndex].values[valueIndex] = {
            ...updated[optionIndex].values[valueIndex],
            [field]: value,
        };
        setLocalOptions(updated);
    };

    const removeOptionValue = (optionIndex: number, valueIndex: number) => {
        const updated = [...localOptions];
        updated[optionIndex].values.splice(valueIndex, 1);
        setLocalOptions(updated);
    };

    const removeVariantOption = (index: number) => {
        const updated = [...localOptions];
        updated.splice(index, 1);
        setLocalOptions(updated);
        regenerateVariants(updated);
    };

    const generateCombinations = (options: VariantOption[]): Record<string, string>[] => {
        const optionsWithValues = options.filter((opt) => opt.values.length > 0);
        if (optionsWithValues.length === 0) return [];

        const combinations: Record<string, string>[] = [];
        const generate = (current: Record<string, string>, depth: number) => {
            if (depth === optionsWithValues.length) {
                combinations.push({ ...current });
                return;
            }
            const option = optionsWithValues[depth];
            option.values.forEach((value) => {
                current[option.name] = value.name;
                generate(current, depth + 1);
            });
        };
        generate({}, 0);
        return combinations;
    };

    const regenerateVariants = (options: VariantOption[] = localOptions) => {
        if (options.length === 0) {
            setLocalVariants([]);
            return;
        }

        const combinations = generateCombinations(options);
        const newVariants: Variant[] = combinations.map((combo, index) => {
            const existing = localVariants.find(
                (v) => JSON.stringify(v.optionCombination) === JSON.stringify(combo)
            );
            if (existing) return existing;

            const productName = productData.name || "PROD";
            const skuBase = String(productName).replace(/\s+/g, "-").substring(0, 10).toUpperCase();
            return {
                sku: `${skuBase}-V${index + 1}`,
                optionCombination: combo,
                isActive: true,
            };
        });

        setLocalVariants(newVariants);
    };

    const updateVariant = (index: number, field: keyof Variant, value: string | boolean) => {
        const updated = [...localVariants];
        updated[index] = { ...updated[index], [field]: value };
        setLocalVariants(updated);
    };

    const removeVariant = (index: number) => {
        const updated = [...localVariants];
        updated.splice(index, 1);
        setLocalVariants(updated);
    };

    const addCommonOption = (common: (typeof commonOptionTypes)[number]) => {
        const newOption: VariantOption = {
            name: common.name,
            displayName: common.displayName,
            type: common.type,
            required: true,
            values: common.commonValues.map((val) =>
                typeof val === "string"
                    ? { name: val, displayName: val, colorCode: null, isAvailable: true }
                    : { name: val.name, displayName: val.name, colorCode: val.colorCode, isAvailable: true }
            ),
        };
        setLocalOptions([...localOptions, newOption]);
    };

    return (
        <div className="space-y-4 sm:space-y-6 border-t pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Product Variants
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        Add variants for different sizes, capacities, colors, or materials
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="hasVariants"
                        checked={localHasVariants}
                        onChange={(e) => handleEnableVariants(e.target.checked)}
                        className="w-4 h-4 text-[#0EA5E9] border-gray-300 rounded focus:ring-[#0EA5E9]"
                    />
                    <label htmlFor="hasVariants" className="text-xs sm:text-sm text-gray-700">
                        Enable variants
                    </label>
                </div>
            </div>

            <AnimatePresence>
                {localHasVariants && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-6"
                    >
                        {/* Variant Options Section */}
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
                                <h4 className="text-sm sm:text-base font-medium text-gray-900">
                                    Variant Options
                                </h4>
                                <button
                                    type="button"
                                    onClick={addVariantOption}
                                    className="flex items-center justify-center sm:justify-start space-x-1 text-xs sm:text-sm text-[#0EA5E9] hover:text-[#0369A1] py-2 sm:py-0"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Add Option</span>
                                </button>
                            </div>

                            {/* Quick Add Common Options */}
                            <div className="mb-4">
                                <p className="text-xs text-gray-600 mb-2">Quick add common options:</p>
                                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                                    {commonOptionTypes.map((option, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => addCommonOption(option)}
                                            className="text-xs px-2 py-1.5 sm:py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                                        >
                                            {option.displayName}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {localOptions.map((option, optionIndex) => (
                                <div key={optionIndex} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 mb-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Option Name</label>
                                                <input
                                                    type="text"
                                                    value={option.name}
                                                    onChange={(e) => updateVariantOption(optionIndex, "name", e.target.value)}
                                                    placeholder="e.g., Capacity, Size"
                                                    className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Display Name</label>
                                                <input
                                                    type="text"
                                                    value={option.displayName}
                                                    onChange={(e) => updateVariantOption(optionIndex, "displayName", e.target.value)}
                                                    placeholder="e.g., Tank Capacity"
                                                    className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                                                <select
                                                    value={option.type}
                                                    onChange={(e) => updateVariantOption(optionIndex, "type", e.target.value)}
                                                    className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5"
                                                >
                                                    <option value="select">Select</option>
                                                    <option value="color">Color</option>
                                                    <option value="size">Size</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeVariantOption(optionIndex)}
                                            className="ml-0 sm:ml-2 self-start sm:self-auto text-red-600 hover:text-red-700 p-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Option Values */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs font-medium text-gray-700">Available Values</label>
                                            <button
                                                type="button"
                                                onClick={() => addOptionValue(optionIndex)}
                                                className="text-xs text-blue-600 hover:text-blue-700"
                                            >
                                                Add Value
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {option.values.map((value, valueIndex) => (
                                                <div key={valueIndex} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={value.name}
                                                        onChange={(e) => updateOptionValue(optionIndex, valueIndex, "name", e.target.value)}
                                                        placeholder="e.g., 1000L"
                                                        className="flex-1 text-sm border border-gray-300 rounded px-2 py-1.5"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={value.displayName}
                                                        onChange={(e) => updateOptionValue(optionIndex, valueIndex, "displayName", e.target.value)}
                                                        placeholder="e.g., 1000 Liters"
                                                        className="flex-1 text-sm border border-gray-300 rounded px-2 py-1.5"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        {option.type === "color" && (
                                                            <input
                                                                type="color"
                                                                value={value.colorCode || "#000000"}
                                                                onChange={(e) => updateOptionValue(optionIndex, valueIndex, "colorCode", e.target.value)}
                                                                className="w-10 h-9 border border-gray-300 rounded"
                                                            />
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeOptionValue(optionIndex, valueIndex)}
                                                            className="text-red-600 hover:text-red-700 p-1"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {localOptions.length > 0 && (
                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={() => regenerateVariants()}
                                        className="w-full bg-[#0EA5E9] text-white px-4 py-2.5 rounded-md hover:bg-[#0369A1] transition-colors text-sm sm:text-base"
                                    >
                                        Generate Variants (
                                        {localOptions.reduce((acc, opt) => acc * Math.max(opt.values.length, 1), 1)}{" "}
                                        combinations)
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Generated Variants */}
                        {localVariants.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-4">
                                    Generated Variants ({localVariants.length})
                                </h4>
                                <div className="space-y-3">
                                    {localVariants.map((variant, index) => (
                                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
                                                    <input
                                                        type="text"
                                                        value={variant.sku}
                                                        onChange={(e) => updateVariant(index, "sku", e.target.value)}
                                                        className="w-full text-sm border border-gray-300 rounded px-2 py-1.5"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Combination</label>
                                                    <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded min-h-8.5 flex items-center">
                                                        {Object.entries(variant.optionCombination || {})
                                                            .map(([key, value]) => `${key}: ${value}`)
                                                            .join(", ")}
                                                    </div>
                                                </div>
                                                <div className="flex items-end gap-2">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={variant.isActive}
                                                            onChange={(e) => updateVariant(index, "isActive", e.target.checked)}
                                                            className="w-4 h-4 text-[#0EA5E9] border-gray-300 rounded"
                                                        />
                                                        <span className="ml-2 text-xs sm:text-sm text-gray-700">Active</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariant(index)}
                                                        className="text-red-600 hover:text-red-700 p-1.5"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
