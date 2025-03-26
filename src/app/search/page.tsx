"use client";

import { useState, useEffect } from "react";
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

  // Handle initial search from URL parameter
  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      handleSearch(query);
    }
  }, [searchParams]);

  const handleSearch = async (query: string) => {
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
        body: `search "${query}"; fields name, cover.url, platforms.name, first_release_date; limit 20;`,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search error:", err);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Results</h1>

      <div className="space-y-2">
        {isLoading && (
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
            {searchResults.map((game) => (
              <Link key={game.id} href={`/game/${game.id}`} className="group">
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
      </div>
    </div>
  );
}
