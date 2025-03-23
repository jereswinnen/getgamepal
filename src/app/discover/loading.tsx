export default function DiscoverLoading() {
  return (
    <div>
      <div className="mb-16 text-center">
        <div className="h-10 w-64 bg-black/5 dark:bg-white/5 rounded-lg mx-auto mb-6 animate-pulse"></div>
        <div className="h-6 w-3/4 max-w-2xl bg-black/5 dark:bg-white/5 rounded-lg mx-auto animate-pulse"></div>
        <div className="h-6 w-1/2 max-w-xl bg-black/5 dark:bg-white/5 rounded-lg mx-auto mt-2 animate-pulse"></div>
      </div>

      {/* Skeleton for sections */}
      {[1, 2, 3].map((section) => (
        <div key={section} className="mb-16">
          <div className="mb-6">
            <div className="flex items-baseline justify-between">
              <div className="h-8 w-48 bg-black/5 dark:bg-white/5 rounded-lg animate-pulse"></div>
              <div className="h-4 w-20 bg-black/5 dark:bg-white/5 rounded-lg animate-pulse"></div>
            </div>
            <div className="h-5 w-96 bg-black/5 dark:bg-white/5 rounded-lg mt-2 animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-black/[.03] dark:bg-white/[.03] rounded-lg overflow-hidden animate-pulse"
              >
                <div className="relative aspect-[3/4] bg-black/5 dark:bg-white/5"></div>
                <div className="p-4">
                  <div className="h-6 bg-black/5 dark:bg-white/5 rounded-lg w-3/4 mb-3"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-black/5 dark:bg-white/5 rounded-lg w-24"></div>
                    <div className="h-4 bg-black/5 dark:bg-white/5 rounded-lg w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="text-center py-4 text-sm text-foreground/50">
        <p>Loading game discovery data...</p>
        <p className="mt-1">This might take a few moments</p>
      </div>
    </div>
  );
}
