"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RefreshCcw, SearchCode } from "lucide-react";

export default function SeoMetaGeneratorButton() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (
      !window.confirm(
        "Are you sure you want to generate SEO Meta Tags? This will safely fill any empty Meta Title and Description fields for Products, Categories, and Subcategories in the database."
      )
    ) {
      return;
    }

    setIsGenerating(true);
    const toastId = toast.loading("Generating precise SEO Meta Tags...");

    try {
      const res = await fetch("/api/admin/system/generate-meta-tags", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Generation failed.");

      if (data.summary.total === 0) {
          toast.success("Perfectly SEO Optimized! No empty tags were found.", { id: toastId });
      } else {
          toast.success(
            `Generated ${data.summary.total} Tags (${data.summary.products} Products, ${data.summary.categories} Categories, ${data.summary.subcategories} Subcategories).`,
            { id: toastId }
          );
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-800/50">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <SearchCode className="w-4 h-4 text-blue-500" />
            AI Meta Tag Generator
          </h4>
          <p className="text-sm text-gray-500 mt-1">
            Fill in missing SEO titles and descriptions.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {isGenerating ? (
            <RefreshCcw className="w-4 h-4 animate-spin" />
          ) : (
             "Generate Tags"
          )}
        </button>
      </div>
    </div>
  );
}
