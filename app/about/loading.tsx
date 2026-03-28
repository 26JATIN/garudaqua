export default function AboutLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-black py-8 md:py-12 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center pt-4 md:pt-8 mb-16 md:mb-20">
          <div className="space-y-4">
            <div className="h-3 w-32 skeleton-shimmer" />
            <div className="h-12 w-80 skeleton-shimmer rounded-lg" />
            <div className="h-6 w-72 skeleton-shimmer" />
            <div className="space-y-2 pt-2">
              <div className="h-4 skeleton-shimmer w-full" />
              <div className="h-4 skeleton-shimmer w-5/6" />
              <div className="h-4 skeleton-shimmer w-3/4" />
            </div>
            <div className="flex gap-3 pt-4">
              <div className="h-12 w-36 skeleton-shimmer rounded-full" />
              <div className="h-12 w-36 skeleton-shimmer rounded-full" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-48 md:h-64 skeleton-shimmer rounded-2xl" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-28 skeleton-shimmer rounded-2xl" />
              <div className="h-28 skeleton-shimmer rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center space-y-2 py-6">
              <div className="h-10 w-20 mx-auto skeleton-shimmer rounded-lg" />
              <div className="h-4 w-24 mx-auto skeleton-shimmer" />
            </div>
          ))}
        </div>

        {/* Values section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 rounded-2xl border border-gray-100 dark:border-white/6 space-y-3">
              <div className="h-12 w-12 skeleton-shimmer rounded-xl" />
              <div className="h-6 w-2/3 skeleton-shimmer" />
              <div className="h-3 skeleton-shimmer w-full" />
              <div className="h-3 skeleton-shimmer w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
