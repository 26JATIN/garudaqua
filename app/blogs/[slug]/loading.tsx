export default function BlogPostLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="h-4 w-48 bg-gray-200 dark:bg-white/10 rounded mb-6 animate-pulse" />
        <div className="h-10 bg-gray-200 dark:bg-white/10 rounded-lg w-4/5 mb-4 animate-pulse" />
        <div className="flex items-center gap-4 mb-8">
          <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-24 animate-pulse" />
          <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-20 animate-pulse" />
        </div>
        <div className="aspect-video bg-gray-200 dark:bg-white/10 rounded-2xl mb-8 animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-white/10 rounded animate-pulse" style={{ width: `${70 + Math.random() * 30}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
