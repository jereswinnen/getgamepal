"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import GameCover from "@/components/GameCover";

interface Game {
  id: number;
  name: string;
  cover?: {
    id: number;
    url: string;
  };
  platforms?: {
    id: number;
    name: string;
  }[];
  first_release_date?: number;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastGameRef = useCallback(
    (node: HTMLAnchorElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setOffset((prev) => prev + 20);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  // Handle initial search from URL parameter
  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      handleSearch(query, 0);
    }
  }, [searchParams]);

  const handleSearch = async (query: string, currentOffset: number) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch("/api/v4/games", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: `search "${query}"; fields name, cover.url, platforms.name, first_release_date; limit 20; offset ${currentOffset};`,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }

      const data = await response.json();

      if (currentOffset === 0) {
        setSearchResults(data);
      } else {
        setSearchResults((prev) => [...prev, ...data]);
      }

      // If we got less than 20 results, we've reached the end
      setHasMore(data.length === 20);
    } catch (err) {
      console.error("Search error:", err);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to handle offset changes
  useEffect(() => {
    const query = searchParams.get("q");
    if (query && offset > 0) {
      handleSearch(query, offset);
    }
  }, [offset]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Results</h1>

      <div className="space-y-2">
        {isLoading && offset === 0 && (
          <div className="text-center py-8">
            <div
              className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
              role="status"
            >
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
              </span>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Searching...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg">
            {error}
          </div>
        )}

        {!isLoading && !error && hasSearched && searchResults.length === 0 && (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <p>No results found. Try a different search term.</p>
          </div>
        )}

        {!isLoading && !hasSearched && (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <p>Use the search bar in the header to find games</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {searchResults.map((game, index) => (
              <Link
                key={game.id}
                href={`/game/${game.id}`}
                className="group"
                ref={
                  index === searchResults.length - 1 ? lastGameRef : undefined
                }
              >
                <div className="bg-black/[.03] dark:bg-white/[.03] rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full">
                  <GameCover
                    coverUrl={game.cover?.url}
                    gameName={game.name}
                    aspectRatio="3/4"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                    className="w-full"
                  />
                  <div className="p-3">
                    <h3 className="font-medium text-sm truncate">
                      {game.name}
                    </h3>
                    {game.first_release_date && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(game.first_release_date * 1000).getFullYear()}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {isLoading && offset > 0 && (
          <div className="text-center py-4">
            <div
              className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
              role="status"
            >
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading more...
              </span>
            </div>
          </div>
        )}

        {!hasMore && searchResults.length > 0 && (
          <div className="text-center py-4 text-gray-600 dark:text-gray-400">
            No more results
          </div>
        )}
      </div>
    </div>
  );
}
