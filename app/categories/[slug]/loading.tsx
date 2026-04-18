export default function CategoryDetailLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero banner */}
      <div className="relative min-h-72 sm:min-h-96 lg:min-h-[55vh] skeleton-shimmer rounded-none" />

      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 lg:py-14">
        {/* Category title & description */}
        <div className="mb-8 space-y-3">
          <div className="h-8 w-56 skeleton-shimmer rounded-lg" />
          <div className="h-4 w-96 skeleton-shimmer" />
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-gray-100 dark:border-white/6 bg-white dark:bg-[#0A0A0A]">
              <div className="aspect-square skeleton-shimmer rounded-none" />
              <div className="p-3 space-y-2">
                <div className="h-4 skeleton-shimmer w-3/4" />
                <div className="h-3 skeleton-shimmer w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
