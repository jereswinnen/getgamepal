"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function DiscoverError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Discover page error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h2 className="text-3xl font-bold mb-4">Something went wrong</h2>
      <p className="text-xl mb-8 max-w-md mx-auto">
        We couldn't load the game discovery data at this time. This could be due
        to API rate limits or a temporary issue.
      </p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => reset()}
          className="rounded-full bg-foreground text-background px-6 py-3 font-medium hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] px-6 py-3 font-medium hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
