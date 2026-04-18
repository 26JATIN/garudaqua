export default function CategoriesLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-black py-8 md:py-12 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="h-3 w-28 mx-auto mb-2 skeleton-shimmer" />
          <div className="h-10 w-72 mx-auto mb-3 skeleton-shimmer rounded-lg" />
          <div className="h-4 w-96 mx-auto skeleton-shimmer" />
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/6 bg-white dark:bg-[#0A0A0A]">
              <div className="aspect-[4/3] skeleton-shimmer rounded-none" />
              <div className="p-5 space-y-3">
                <div className="h-6 skeleton-shimmer w-2/3" />
                <div className="space-y-1.5">
                  <div className="h-3 skeleton-shimmer w-full" />
                  <div className="h-3 skeleton-shimmer w-3/4" />
                </div>
                <div className="flex gap-2 pt-2">
                  <div className="h-7 w-16 skeleton-shimmer rounded-full" />
                  <div className="h-7 w-20 skeleton-shimmer rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
