export default function AboutLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-8">
          <div className="space-y-4">
            <div className="h-3 w-48 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            <div className="h-16 w-80 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse" />
            <div className="h-4 w-96 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-72 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            <div className="flex gap-3 pt-4">
              <div className="h-12 w-36 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
              <div className="h-12 w-36 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-40 bg-gray-200 dark:bg-white/10 rounded-2xl animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-24 bg-gray-200 dark:bg-white/10 rounded-2xl animate-pulse" />
              <div className="h-24 bg-gray-200 dark:bg-white/10 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
