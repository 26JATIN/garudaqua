export default function CategoriesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="h-10 w-72 bg-gray-200 dark:bg-white/10 rounded-lg mb-8 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/8 bg-white dark:bg-[#0A0A0A]">
              <div className="aspect-[4/3] bg-gray-200 dark:bg-white/10 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-6 bg-gray-200 dark:bg-white/10 rounded w-2/3 animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
