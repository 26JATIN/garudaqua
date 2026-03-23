export default function ContactLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="h-10 w-48 bg-gray-200 dark:bg-white/10 rounded-lg mx-auto mb-3 animate-pulse" />
          <div className="h-4 w-72 bg-gray-200 dark:bg-white/10 rounded mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-gray-100 dark:border-white/10 p-6 space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-20 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-full bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-gray-100 dark:border-white/10 p-8 space-y-5">
              <div className="h-6 w-48 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              <div className="grid grid-cols-2 gap-5">
                <div className="h-12 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
                <div className="h-12 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="h-12 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
                <div className="h-12 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
              </div>
              <div className="h-32 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
              <div className="h-14 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
