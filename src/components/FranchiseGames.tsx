"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import GameCover from "./GameCover";
import { format } from "date-fns";

interface Game {
  id: number;
  name: string;
  cover?: {
    url: string;
  };
  first_release_date?: number;
  total_rating?: number;
}

interface FranchiseGamesProps {
  gameId: number;
  franchiseId?: number; // Now optional since we'll get it from the API
}

// Function to format date
function formatDate(timestamp?: number) {
  if (!timestamp) return "TBA";
  return format(new Date(timestamp * 1000), "yyyy");
}

export default function FranchiseGames({ gameId }: FranchiseGamesProps) {
  const [franchiseGames, setFranchiseGames] = useState<Game[]>([]);
  const [franchiseName, setFranchiseName] = useState<string>("");
  const [franchiseId, setFranchiseId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFranchiseGames = async () => {
      try {
        setLoading(true);
        console.log(`Fetching franchise games for game ID ${gameId}`);

        // Use the dedicated game-specific endpoint
        const response = await fetch(`/api/games/${gameId}/franchise-games`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Franchise games API error:", {
            status: response.status,
            statusText: response.statusText,
            data: errorData,
          });
          throw new Error(
            `Failed to fetch franchise games: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log(`Received franchise data:`, data);

        // Check if the API response has valid data
        if (!data || !data.franchise) {
          console.log("API response missing franchise data");
          setLoading(false);
          return;
        }

        // Set franchise information
        setFranchiseId(data.franchise.id);
        setFranchiseName(data.franchise.name || "");

        // Set games from the response
        if (data.games && data.games.length > 0) {
          console.log(`Setting ${data.games.length} franchise games`);
          setFranchiseGames(data.games);
        } else {
          console.log("No franchise games received");
        }

        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching franchise games:", err);
        setError(err.message || "Unable to load franchise games");
        setLoading(false);
      }
    };

    // Clear any existing data
    setFranchiseGames([]);
    setFranchiseName("");
    setFranchiseId(null);

    if (gameId) {
      fetchFranchiseGames();
    } else {
      console.log("No game ID provided");
      setLoading(false);
    }
  }, [gameId]);

  // Log state for debugging
  useEffect(() => {
    console.log("FranchiseGames component state:", {
      loading,
      error,
      franchiseId,
      gameId,
      franchiseGamesCount: franchiseGames.length,
      franchiseName,
    });
  }, [
    loading,
    error,
    franchiseId,
    gameId,
    franchiseGames.length,
    franchiseName,
  ]);

  if (loading) {
    return <FranchiseGamesSkeleton />;
  }

  if (error) {
    console.error("Franchise games error:", error);
    return null; // Don't show an error, just hide the section
  }

  if (!franchiseGames.length || !franchiseId) {
    console.log("No franchise games to display");
    return null; // Don't show anything if there are no franchise games
  }

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{franchiseName} Series</h2>
        {franchiseId && (
          <Link
            href={`/franchises/${franchiseId}`}
            className="text-sm hover:underline text-blue-600 dark:text-blue-400"
          >
            See all
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {franchiseGames.slice(0, 6).map((game) => (
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
                <div className="flex justify-between items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatDate(game.first_release_date)}</span>
                  {game.total_rating && (
                    <span
                      className={`font-medium ${
                        game.total_rating >= 75
                          ? "text-green-600 dark:text-green-400"
                          : game.total_rating >= 50
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {Math.round(game.total_rating)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function FranchiseGamesSkeleton() {
  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-6">Franchise</h2>
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
