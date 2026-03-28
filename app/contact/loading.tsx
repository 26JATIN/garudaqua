export default function ContactLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-black py-8 md:py-12 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <div className="h-3 w-24 mx-auto mb-2 skeleton-shimmer" />
          <div className="h-10 w-48 mx-auto mb-3 skeleton-shimmer rounded-lg" />
          <div className="h-4 w-72 mx-auto skeleton-shimmer" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-gray-100 dark:border-white/6 p-6 space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full skeleton-shimmer shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-20 skeleton-shimmer" />
                    <div className="h-3 skeleton-shimmer w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-gray-100 dark:border-white/6 p-6 md:p-8 space-y-5">
              <div className="h-6 w-48 skeleton-shimmer" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-12 skeleton-shimmer rounded-xl" />
                <div className="h-12 skeleton-shimmer rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-12 skeleton-shimmer rounded-xl" />
                <div className="h-12 skeleton-shimmer rounded-xl" />
              </div>
              <div className="h-32 skeleton-shimmer rounded-xl" />
              <div className="h-14 skeleton-shimmer rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
