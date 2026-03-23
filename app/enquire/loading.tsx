export default function EnquireLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="h-10 w-56 bg-gray-200 dark:bg-white/10 rounded-lg mx-auto mb-3 animate-pulse" />
          <div className="h-4 w-80 bg-gray-200 dark:bg-white/10 rounded mx-auto animate-pulse" />
        </div>
        <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl border border-gray-100 dark:border-white/10 p-8 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="h-12 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
            <div className="h-12 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="h-12 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
            <div className="h-12 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="h-12 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
            <div className="h-12 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
          </div>
          <div className="h-24 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
          <div className="h-14 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
