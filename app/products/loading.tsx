export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="h-10 w-64 bg-gray-200 dark:bg-white/10 rounded-lg mb-8 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/8 bg-white dark:bg-[#0A0A0A]">
              <div className="aspect-square bg-gray-200 dark:bg-white/10 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
