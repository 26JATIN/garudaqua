export default function BlogsLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-black py-8 md:py-12 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="h-3 w-24 mx-auto mb-2 skeleton-shimmer" />
          <div className="h-10 w-52 mx-auto mb-3 skeleton-shimmer rounded-lg" />
          <div className="h-4 w-72 mx-auto skeleton-shimmer" />
        </div>

        {/* Category filter chips */}
        <div className="flex gap-2 mb-8 justify-center flex-wrap">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-20 skeleton-shimmer rounded-full" />
          ))}
        </div>

        {/* Blog grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/6 bg-white dark:bg-[#0A0A0A]">
              <div className="aspect-video skeleton-shimmer rounded-none" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-20 skeleton-shimmer rounded-full" />
                <div className="h-6 skeleton-shimmer w-5/6" />
                <div className="space-y-1.5">
                  <div className="h-3 skeleton-shimmer w-full" />
                  <div className="h-3 skeleton-shimmer w-4/5" />
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-white/6">
                  <div className="h-3 w-16 skeleton-shimmer" />
                  <div className="h-3 w-12 skeleton-shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
