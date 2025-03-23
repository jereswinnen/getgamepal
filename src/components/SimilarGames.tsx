"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import GameCover from "./GameCover";

interface Game {
  id: number;
  name: string;
  cover?: {
    url: string;
  };
  first_release_date?: number;
}

interface SimilarGamesProps {
  gameId?: number;
  similarGames?: number[] | Game[];
}

function formatDate(timestamp?: number): string {
  if (!timestamp) return "TBA";
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

export default function SimilarGames({
  gameId,
  similarGames: initialSimilarGames,
}: SimilarGamesProps) {
  const [similarGames, setSimilarGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Function to fetch game details by IDs
    const fetchGamesByIds = async (ids: number[]) => {
      try {
        setLoading(true);
        // Limit to 6 games max for UI
        const limitedIds = ids.slice(0, 6);
        const response = await fetch("/api/v4/games", {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
          },
          body: `fields name, cover.url, first_release_date;
            where id = (${limitedIds.join(",")}) & cover != null;
            limit ${limitedIds.length};`,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch similar games");
        }

        const data = await response.json();
        setSimilarGames(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching similar games by IDs:", err);
        setError("Unable to load similar games");
        setLoading(false);
      }
    };

    // Function to fetch similar games by gameId
    const fetchSimilarGamesByGameId = async (id: number) => {
      try {
        setLoading(true);
        const response = await fetch("/api/v4/games", {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
          },
          body: `fields name, cover.url, first_release_date;
            where similar_games = ${id} & cover != null;
            limit 6;`,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch similar games");
        }

        const data = await response.json();
        setSimilarGames(data);
      } catch (err) {
        console.error("Error fetching similar games:", err);
        setError("Unable to load similar games");
      } finally {
        setLoading(false);
      }
    };

    // Main logic
    if (initialSimilarGames && initialSimilarGames.length > 0) {
      // Check if initialSimilarGames is array of numbers (IDs) or objects
      if (typeof initialSimilarGames[0] === "number") {
        // It's an array of IDs, fetch the complete data
        fetchGamesByIds(initialSimilarGames as number[]);
      } else {
        // It's already an array of game objects
        setSimilarGames(initialSimilarGames as Game[]);
        setLoading(false);
      }
    } else if (gameId) {
      // No initialSimilarGames, fetch by gameId relation
      fetchSimilarGamesByGameId(gameId);
    } else {
      // No data and no gameId
      setLoading(false);
    }
  }, [gameId, initialSimilarGames]);

  if (loading) {
    return <SimilarGamesSkeleton />;
  }

  if (error || !similarGames.length) {
    return null; // Don't show anything if there are no similar games
  }

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-6">Similar Games</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {similarGames.map((game) => (
          <Link key={game.id} href={`/games/${game.id}`} className="group">
            <div className="bg-black/[.03] dark:bg-white/[.03] rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full">
              <GameCover
                coverUrl={game.cover?.url}
                gameName={game.name}
                aspectRatio="3/4"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                className="w-full"
              />
              <div className="p-3">
                <h3 className="font-medium text-sm truncate">{game.name}</h3>
                <div className="text-xs opacity-70 mt-1">
                  {formatDate(game.first_release_date)}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SimilarGamesSkeleton() {
  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-6">Similar Games</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-black/[.03] dark:bg-white/[.03] rounded-lg overflow-hidden h-full animate-pulse"
          >
            <div className="relative aspect-[3/4] bg-gray-200 dark:bg-gray-700"></div>
            <div className="p-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
