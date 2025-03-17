"use client";

import { useState } from "react";
import SearchInput from "@/components/SearchInput";
import GameSearchResult from "@/components/GameSearchResult";

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
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Games</h1>

      <div className="mb-8">
        <SearchInput
          onSearch={handleSearch}
          placeholder="Search for games..."
        />
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Enter a game title and press Search or hit Enter
        </p>
      </div>

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
            <p>Enter a search term and press Search to find games</p>
          </div>
        )}

        {searchResults.map((game) => (
          <GameSearchResult key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
