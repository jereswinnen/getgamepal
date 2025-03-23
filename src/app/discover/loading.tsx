export default function DiscoverLoading() {
  return (
    <div>
      <div className="mb-16 text-center">
        <div className="h-12 w-48 bg-black/5 dark:bg-white/5 rounded-lg mx-auto mb-6 animate-pulse" />
        <div className="h-6 w-3/4 max-w-lg bg-black/5 dark:bg-white/5 rounded-lg mx-auto animate-pulse" />
      </div>

      {/* Skeleton for sections */}
      {[1, 2, 3].map((section) => (
        <div key={section} className="mb-16">
          <div className="mb-6">
            <div className="h-8 w-48 bg-black/5 dark:bg-white/5 rounded-lg mb-2 animate-pulse" />
            <div className="h-4 w-64 bg-black/5 dark:bg-white/5 rounded-lg animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden">
                  <div className="aspect-[3/4] bg-black/10 dark:bg-white/10" />
                  <div className="p-4">
                    <div className="h-5 bg-black/5 dark:bg-white/5 rounded mb-2" />
                    <div className="flex justify-between">
                      <div className="h-4 w-1/3 bg-black/5 dark:bg-white/5 rounded" />
                      <div className="h-4 w-1/4 bg-black/5 dark:bg-white/5 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
