export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="h-4 w-48 bg-gray-200 dark:bg-white/10 rounded mb-8 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 dark:bg-white/10 rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-white/10 rounded-lg w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/3 animate-pulse" />
            <div className="space-y-2 pt-4">
              <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-full animate-pulse" />
              <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-5/6 animate-pulse" />
              <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-2/3 animate-pulse" />
            </div>
            <div className="h-12 bg-gray-200 dark:bg-white/10 rounded-xl w-48 mt-6 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
