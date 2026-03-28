export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-black py-8 md:py-12 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="text-center mb-6 md:mb-8 lg:mb-10">
          <div className="h-3 w-32 mx-auto mb-2 skeleton-shimmer" />
          <div className="h-10 w-64 mx-auto mb-3 skeleton-shimmer rounded-lg" />
          <div className="h-4 w-80 mx-auto skeleton-shimmer" />
        </div>

        {/* Category badges skeleton */}
        <div className="flex gap-3 md:gap-4 lg:gap-6 overflow-hidden py-2 mb-6 md:mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 min-w-16 md:min-w-19">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full skeleton-shimmer" />
              <div className="h-3 w-12 skeleton-shimmer" />
            </div>
          ))}
        </div>

        {/* Filter bar skeleton */}
        <div className="mb-6 md:mb-8 flex items-center justify-between bg-white dark:bg-[#0A0A0A] rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-100 dark:border-white/6">
          <div className="h-4 w-32 skeleton-shimmer" />
          <div className="flex gap-2">
            <div className="h-9 w-24 skeleton-shimmer rounded-lg" />
            <div className="h-9 w-20 skeleton-shimmer rounded-lg" />
          </div>
        </div>

        {/* Products grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl md:rounded-2xl overflow-hidden border border-gray-100 dark:border-white/6 bg-white dark:bg-[#0A0A0A]">
              <div className="aspect-4/5 skeleton-shimmer rounded-none" />
              <div className="p-3 md:p-4 lg:p-6 space-y-2 md:space-y-3">
                <div className="h-4 w-16 skeleton-shimmer rounded-full" />
                <div className="h-5 skeleton-shimmer w-4/5" />
                <div className="h-3 skeleton-shimmer w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
