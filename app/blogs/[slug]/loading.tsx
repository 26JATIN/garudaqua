export default function BlogPostLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-black py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-3 w-12 skeleton-shimmer" />
          <div className="h-3 w-3 skeleton-shimmer rounded-full" />
          <div className="h-3 w-20 skeleton-shimmer" />
          <div className="h-3 w-3 skeleton-shimmer rounded-full" />
          <div className="h-3 w-40 skeleton-shimmer" />
        </div>

        {/* Category badge */}
        <div className="h-6 w-24 skeleton-shimmer rounded-full mb-4" />

        {/* Title */}
        <div className="space-y-2 mb-4">
          <div className="h-9 md:h-10 skeleton-shimmer w-full rounded-lg" />
          <div className="h-9 md:h-10 skeleton-shimmer w-3/4 rounded-lg" />
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-8 w-8 skeleton-shimmer rounded-full" />
          <div className="h-3 w-24 skeleton-shimmer" />
          <div className="h-3 w-1 skeleton-shimmer" />
          <div className="h-3 w-20 skeleton-shimmer" />
          <div className="h-3 w-1 skeleton-shimmer" />
          <div className="h-3 w-16 skeleton-shimmer" />
        </div>

        {/* Featured image */}
        <div className="aspect-video skeleton-shimmer rounded-2xl mb-8" />

        {/* Content lines */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, g) => (
            <div key={g} className="space-y-2 mb-6">
              {g === 0 && <div className="h-7 skeleton-shimmer w-1/3 rounded-lg mb-3" />}
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 skeleton-shimmer" style={{ width: `${75 + Math.random() * 25}%` }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
