export default function EnquireLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-black py-8 md:py-12 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <div className="h-3 w-20 mx-auto mb-2 skeleton-shimmer" />
          <div className="h-10 w-56 mx-auto mb-3 skeleton-shimmer rounded-lg" />
          <div className="h-4 w-80 mx-auto skeleton-shimmer" />
        </div>

        {/* Form card */}
        <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-gray-100 dark:border-white/6 p-6 md:p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 skeleton-shimmer rounded-xl" />
            <div className="h-12 skeleton-shimmer rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 skeleton-shimmer rounded-xl" />
            <div className="h-12 skeleton-shimmer rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 skeleton-shimmer rounded-xl" />
            <div className="h-12 skeleton-shimmer rounded-xl" />
          </div>
          <div className="h-24 skeleton-shimmer rounded-xl" />
          <div className="h-14 skeleton-shimmer rounded-xl" />
        </div>
      </div>
    </div>
  );
}
