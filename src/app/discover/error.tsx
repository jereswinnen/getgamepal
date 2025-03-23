"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DiscoverError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Discovery page error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <div className="w-full max-w-md p-8 rounded-xl bg-white/90 dark:bg-gray-900/90 shadow-lg">
        <div className="text-red-500 dark:text-red-400 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="mx-auto"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M12 8v4M12 16h.01"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>

        <p className="mb-6 text-foreground/70">
          We're having trouble loading the game discovery data. This could be
          due to API rate limits or a temporary issue with our service.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 bg-black/5 dark:bg-white/10 rounded-lg hover:bg-black/10 dark:hover:bg-white/15 transition-colors font-medium"
          >
            Go to Home
          </Link>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-foreground/60">
            If this problem persists, try refreshing the cache by visiting the{" "}
            <code className="px-2 py-1 bg-black/5 dark:bg-white/5 rounded-md">
              /api/discovery/refresh
            </code>{" "}
            endpoint.
          </p>
        </div>
      </div>
    </div>
  );
}
