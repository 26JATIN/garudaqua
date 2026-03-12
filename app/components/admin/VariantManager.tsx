"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// ===== Types =====
interface OptionValue {
    name: string;
    displayName: string;
    colorCode: string | null;
    isAvailable: boolean;
    imageUrl?: string | null;
}

interface VariantOption {
    name: string;
    displayName: string;
    type: string;
    required: boolean;
    values: OptionValue[];
}

interface VariantManagerProps {
    onOptionsChange?: (hasVariants: boolean, options: VariantOption[]) => void;
    hasVariants?: boolean;
    variantOptions?: VariantOption[];
    productImages?: string[];
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
    onOptionsChange,
    hasVariants = false,
    variantOptions = [],
    productImages = [],
}: VariantManagerProps) {
    const [localHasVariants, setLocalHasVariants] = useState(hasVariants);
    const [localOptions, setLocalOptions] = useState<VariantOption[]>(variantOptions);

    useEffect(() => {
        setLocalHasVariants(hasVariants);
        setLocalOptions(variantOptions || []);
    }, [hasVariants, variantOptions]);

    const onOptionsChangeRef = useRef(onOptionsChange);
    onOptionsChangeRef.current = onOptionsChange;

    useEffect(() => {
        onOptionsChangeRef.current?.(localHasVariants, localOptions);
    }, [localHasVariants, localOptions]);

    const handleEnableVariants = (enabled: boolean) => {
        setLocalHasVariants(enabled);
        if (!enabled) {
            setLocalOptions([]);
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
    };

    const addCommonOption = (common: (typeof commonOptionTypes)[number]) => {
        const newOption: VariantOption = {
            name: common.name,
            displayName: common.displayName,
            type: common.type,
            required: true,
            values: common.commonValues.map((val) =>
                typeof val === "string"
                    ? { name: val, displayName: val, colorCode: null, isAvailable: true, imageUrl: null }
                    : { name: val.name, displayName: val.name, colorCode: val.colorCode, isAvailable: true, imageUrl: null }
            ),
        };
        setLocalOptions([...localOptions, newOption]);
    };

    // Image picker state: key = "optionIndex-valueIndex", value = open/closed
    const [pickerOpen, setPickerOpen] = useState<string | null>(null);

    const openPicker = (optionIndex: number, valueIndex: number) => {
        setPickerOpen(`${optionIndex}-${valueIndex}`);
    };

    const closePicker = () => setPickerOpen(null);

    const selectImageForColor = (optionIndex: number, valueIndex: number, url: string) => {
        updateOptionValue(optionIndex, valueIndex, "imageUrl", url);
        closePicker();
    };

    return (
        <div className="space-y-4 sm:space-y-6 border-t pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Available Options
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        Add available options like colors, capacities, sizes, or materials
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
                        Enable options
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
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
                                <h4 className="text-sm sm:text-base font-medium text-gray-900">
                                    Option Types
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
                                            {option.values.map((value, valueIndex) => {
                                                const pickerKey = `${optionIndex}-${valueIndex}`;
                                                const isPickerOpen = pickerOpen === pickerKey;
                                                return (
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
                                                            <>
                                                                <input
                                                                    type="color"
                                                                    value={value.colorCode || "#000000"}
                                                                    onChange={(e) => updateOptionValue(optionIndex, valueIndex, "colorCode", e.target.value)}
                                                                    className="w-10 h-9 border border-gray-300 rounded cursor-pointer"
                                                                    title="Pick color"
                                                                />
                                                                {/* Color image link — pick from product images */}
                                                                <div className="relative">
                                                                    {value.imageUrl ? (
                                                                        <div className="flex items-center gap-1">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => openPicker(optionIndex, valueIndex)}
                                                                                className="relative w-9 h-9 rounded border-2 border-[#0EA5E9] overflow-hidden shrink-0 hover:opacity-80 transition-opacity"
                                                                                title="Change linked image"
                                                                            >
                                                                                <Image
                                                                                    src={value.imageUrl}
                                                                                    alt={value.displayName}
                                                                                    fill
                                                                                    className="object-cover"
                                                                                    sizes="36px"
                                                                                />
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => updateOptionValue(optionIndex, valueIndex, "imageUrl", null)}
                                                                                className="w-5 h-5 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors shrink-0"
                                                                                title="Unlink image"
                                                                            >
                                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => productImages.length > 0 ? openPicker(optionIndex, valueIndex) : undefined}
                                                                            disabled={productImages.length === 0}
                                                                            className={`w-9 h-9 border border-dashed rounded flex items-center justify-center transition-colors shrink-0 ${
                                                                                productImages.length > 0
                                                                                    ? "border-gray-400 hover:border-[#0EA5E9] hover:bg-[#0EA5E9]/5 cursor-pointer"
                                                                                    : "border-gray-200 cursor-not-allowed opacity-40"
                                                                            }`}
                                                                            title={productImages.length > 0 ? "Link a product image to this color" : "Upload product images first"}
                                                                        >
                                                                            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                            </svg>
                                                                        </button>
                                                                    )}

                                                                    {/* Image picker modal — rendered via portal-like fixed overlay */}
                                                                    <AnimatePresence>
                                                                        {isPickerOpen && (
                                                                            <>
                                                                                {/* Backdrop */}
                                                                                <div
                                                                                    className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
                                                                                    onClick={closePicker}
                                                                                />
                                                                                {/* Modal — centered, responsive */}
                                                                                <motion.div
                                                                                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                                                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                                                                                    transition={{ duration: 0.18 }}
                                                                                    className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl w-[90vw] max-w-sm"
                                                                                >
                                                                                    {/* Header */}
                                                                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                                                                        <div className="flex items-center gap-2">
                                                                                            {value.colorCode && (
                                                                                                <span
                                                                                                    className="w-4 h-4 rounded-full border border-gray-200 shrink-0"
                                                                                                    style={{ backgroundColor: value.colorCode }}
                                                                                                />
                                                                                            )}
                                                                                            <p className="text-sm font-semibold text-gray-800">
                                                                                                Link image to{" "}
                                                                                                <span className="text-[#0EA5E9]">{value.displayName || "this color"}</span>
                                                                                            </p>
                                                                                        </div>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={closePicker}
                                                                                            className="w-7 h-7 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 flex items-center justify-center transition-colors"
                                                                                        >
                                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                                            </svg>
                                                                                        </button>
                                                                                    </div>

                                                                                    {/* Image grid */}
                                                                                    <div className="p-3 grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[55vh] overflow-y-auto">
                                                                                        {productImages.map((imgUrl, imgIdx) => {
                                                                                            const isSelected = value.imageUrl === imgUrl;
                                                                                            return (
                                                                                                <button
                                                                                                    key={imgIdx}
                                                                                                    type="button"
                                                                                                    onClick={() => selectImageForColor(optionIndex, valueIndex, imgUrl)}
                                                                                                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                                                                                                        isSelected
                                                                                                            ? "border-[#0EA5E9] ring-2 ring-[#0EA5E9]/30"
                                                                                                            : "border-gray-100 hover:border-[#0EA5E9]/60 hover:shadow-sm"
                                                                                                    }`}
                                                                                                    title={`Image ${imgIdx + 1}`}
                                                                                                >
                                                                                                    <Image
                                                                                                        src={imgUrl}
                                                                                                        alt={`Product image ${imgIdx + 1}`}
                                                                                                        fill
                                                                                                        className="object-cover"
                                                                                                        sizes="(max-width: 640px) 28vw, 80px"
                                                                                                    />
                                                                                                    {isSelected && (
                                                                                                        <div className="absolute inset-0 bg-[#0EA5E9]/20 flex items-center justify-center">
                                                                                                            <div className="w-5 h-5 rounded-full bg-[#0EA5E9] shadow flex items-center justify-center">
                                                                                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                                                                </svg>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </button>
                                                                                            );
                                                                                        })}
                                                                                    </div>

                                                                                    {/* Footer hint */}
                                                                                    <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                                                                                        <p className="text-xs text-gray-400">Tap an image to link it · tap again to change</p>
                                                                                    </div>
                                                                                </motion.div>
                                                                            </>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </div>
                                                            </>
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
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
