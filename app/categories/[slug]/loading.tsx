export default function CategoryDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060606]">
      <div className="relative min-h-72 sm:min-h-96 lg:min-h-[55vh] bg-gray-300 dark:bg-white/10 animate-pulse" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="h-6 w-48 bg-gray-200 dark:bg-white/10 rounded mb-8 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-gray-100 dark:border-white/8 bg-white dark:bg-[#111]">
              <div className="aspect-square bg-gray-200 dark:bg-white/10 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
