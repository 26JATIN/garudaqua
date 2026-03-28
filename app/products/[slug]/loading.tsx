export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-black py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 md:mb-8">
          <div className="h-3 w-16 skeleton-shimmer" />
          <div className="h-3 w-3 skeleton-shimmer rounded-full" />
          <div className="h-3 w-24 skeleton-shimmer" />
          <div className="h-3 w-3 skeleton-shimmer rounded-full" />
          <div className="h-3 w-32 skeleton-shimmer" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
          {/* Image gallery */}
          <div className="space-y-3">
            <div className="aspect-square skeleton-shimmer rounded-2xl" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-16 h-16 md:w-20 md:h-20 skeleton-shimmer rounded-lg" />
              ))}
            </div>
          </div>

          {/* Product details */}
          <div className="space-y-4 md:space-y-6">
            {/* Category badge */}
            <div className="h-6 w-28 skeleton-shimmer rounded-full" />
            {/* Title */}
            <div className="space-y-2">
              <div className="h-8 md:h-10 skeleton-shimmer w-4/5 rounded-lg" />
              <div className="h-6 skeleton-shimmer w-2/3" />
            </div>
            {/* Description */}
            <div className="space-y-2 pt-2">
              <div className="h-4 skeleton-shimmer w-full" />
              <div className="h-4 skeleton-shimmer w-11/12" />
              <div className="h-4 skeleton-shimmer w-4/5" />
              <div className="h-4 skeleton-shimmer w-3/4" />
            </div>
            {/* Specs */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 skeleton-shimmer rounded-xl" />
              ))}
            </div>
            {/* CTA */}
            <div className="flex gap-3 pt-4">
              <div className="h-12 flex-1 skeleton-shimmer rounded-xl" />
              <div className="h-12 w-12 skeleton-shimmer rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
