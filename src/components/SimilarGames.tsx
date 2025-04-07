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
  similarityReason?: string;
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
    const fetchSimilarGames = async () => {
      if (!gameId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`Fetching similar games for gameId ${gameId}`);

        // Use the dedicated endpoint
        const response = await fetch(`/api/game/${gameId}/similar-games`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Similar games API error:", {
            status: response.status,
            statusText: response.statusText,
            data: errorData,
          });
          throw new Error(
            `Failed to fetch similar games: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log(`Received ${data.length} similar games`);
        setSimilarGames(data);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching similar games:", err);
        setError(err.message || "Unable to load similar games");
        setLoading(false);
      }
    };

    // Clear any existing data
    setSimilarGames([]);

    // Check if we have initial data that are complete Game objects
    if (
      initialSimilarGames &&
      initialSimilarGames.length > 0 &&
      typeof initialSimilarGames[0] !== "number"
    ) {
      // Already have complete game objects
      console.log("Using provided similar games data");
      setSimilarGames(initialSimilarGames as Game[]);
      setLoading(false);
    } else if (gameId) {
      // Fetch using the dedicated endpoint
      fetchSimilarGames();
    } else {
      setLoading(false);
    }
  }, [gameId, initialSimilarGames]);

  if (loading) {
    return <SimilarGamesSkeleton />;
  }

  if (error) {
    console.error("Similar games error:", error);
    return (
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-6">Similar Games</h2>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-600 dark:text-red-400">
            Unable to load similar games. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!similarGames.length) {
    return null; // Don't show anything if there are no similar games
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {similarGames.map((game) => (
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
              <h3 className="font-medium text-sm truncate">{game.name}</h3>
              <div className="text-xs opacity-70 mt-1">
                {formatDate(game.first_release_date)}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function SimilarGamesSkeleton() {
  return (
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
  );
}
